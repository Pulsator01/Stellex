#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, panic_with_error, symbol_short, token,
    Address, Bytes, Env, Map, Symbol, Vec,
};
mod dex;
mod reflector;
use dex::SoroswapRouterClient;
use reflector::{Asset as ReflectorAsset, ReflectorClient};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    Unauthorized = 2,
    OrderNotFound = 3,
    OrderNotActive = 4,
    InvalidParam = 5,
    PriceNotAvailable = 6,
    SwapFailed = 7,
}

#[derive(Clone, Copy, PartialEq)]
#[contracttype]
pub enum OrderType { SimpleTrigger, TrailingStopLoss }

#[derive(Clone, Copy, PartialEq)]
#[contracttype]
pub enum OrderStatus { Active, Executed, Cancelled }

#[derive(Clone)]
#[contracttype]
pub struct Order {
    pub id: u64,
    pub owner: Address,
    pub sell_asset: Address,
    pub buy_asset: Address,
    pub amount_to_sell: i128,
    pub order_type: OrderType,
    pub status: OrderStatus,
    pub trigger_price: i128,
    pub trail_bps: u32,
    pub peak_price: i128,
}

#[contracttype]
pub enum DataKey {
    Admin,
    OracleAddress,
    DexRouterAddress,
    Orders,
    NextOrderId,
    PriceScale,
}

fn pow10(mut n: u32) -> i128 {
    let mut v: i128 = 1;
    while n > 0 { v = v.saturating_mul(10); n -= 1; }
    v
}

#[contract]
pub struct OrderBook;

#[contractimpl]
impl OrderBook {
    pub fn initialize(env: Env, admin: Address, oracle_address: Address, dex_router_address: Address) {
        if env.storage().instance().has(&DataKey::Admin) { panic_with_error!(&env, Error::AlreadyInitialized); }
        let dec = ReflectorClient::new(&env, &oracle_address).decimals();
        let scale = pow10(dec);
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::OracleAddress, &oracle_address);
        env.storage().instance().set(&DataKey::DexRouterAddress, &dex_router_address);
        env.storage().instance().set(&DataKey::PriceScale, &scale);
        env.storage().instance().set(&DataKey::Orders, &Map::<u64, Order>::new(&env));
        env.storage().instance().set(&DataKey::NextOrderId, &0u64);
    }

    pub fn create_simple_trigger(env: Env, owner: Address, sell_asset: Address, buy_asset: Address, amount_to_sell: i128, trigger_price: i128) -> u64 {
        owner.require_auth();
        if amount_to_sell <= 0 || trigger_price <= 0 { panic_with_error!(&env, Error::InvalidParam); }
        let t = token::Client::new(&env, &sell_asset);
        t.transfer(&owner, &env.current_contract_address(), &amount_to_sell);
        let mut orders: Map<u64, Order> = env.storage().instance().get(&DataKey::Orders).unwrap();
        let id: u64 = env.storage().instance().get(&DataKey::NextOrderId).unwrap();
        let o = Order { id, owner: owner.clone(), sell_asset, buy_asset, amount_to_sell, order_type: OrderType::SimpleTrigger, status: OrderStatus::Active, trigger_price, trail_bps: 0, peak_price: 0 };
        orders.set(id, o);
        env.storage().instance().set(&DataKey::Orders, &orders);
        env.storage().instance().set(&DataKey::NextOrderId, &(id + 1));
        env.events().publish((symbol_short!("created"), owner), (id, Symbol::new(&env, "simple")));
        id
    }

    pub fn create_trailing_stop_loss(env: Env, owner: Address, sell_asset: Address, buy_asset: Address, amount_to_sell: i128, trail_bps: u32, oracle_ticker: ReflectorAsset) -> u64 {
        owner.require_auth();
        if amount_to_sell <= 0 || trail_bps == 0 || trail_bps >= 10_000 { panic_with_error!(&env, Error::InvalidParam); }
        let oracle: Address = env.storage().instance().get(&DataKey::OracleAddress).unwrap();
        let r = ReflectorClient::new(&env, &oracle);
        let p = r.lastprice(&oracle_ticker).unwrap_or_else(|| panic_with_error!(&env, Error::PriceNotAvailable)).price;
        let t = token::Client::new(&env, &sell_asset);
        t.transfer(&owner, &env.current_contract_address(), &amount_to_sell);
        let mut orders: Map<u64, Order> = env.storage().instance().get(&DataKey::Orders).unwrap();
        let id: u64 = env.storage().instance().get(&DataKey::NextOrderId).unwrap();
        let o = Order { id, owner: owner.clone(), sell_asset, buy_asset, amount_to_sell, order_type: OrderType::TrailingStopLoss, status: OrderStatus::Active, trigger_price: 0, trail_bps, peak_price: p };
        orders.set(id, o);
        env.storage().instance().set(&DataKey::Orders, &orders);
        env.storage().instance().set(&DataKey::NextOrderId, &(id + 1));
        env.events().publish((symbol_short!("created"), owner), (id, Symbol::new(&env, "trail")));
        id
    }

    pub fn cancel_order(env: Env, owner: Address, order_id: u64) {
        owner.require_auth();
        let mut orders: Map<u64, Order> = env.storage().instance().get(&DataKey::Orders).unwrap();
        let mut o = orders.get(order_id).unwrap_or_else(|| panic_with_error!(&env, Error::OrderNotFound));
        if o.owner != owner { panic_with_error!(&env, Error::Unauthorized); }
        if o.status != OrderStatus::Active { panic_with_error!(&env, Error::OrderNotActive); }
        let t = token::Client::new(&env, &o.sell_asset);
        t.transfer(&env.current_contract_address(), &o.owner, &o.amount_to_sell);
        o.status = OrderStatus::Cancelled;
        orders.set(order_id, o);
        env.storage().instance().set(&DataKey::Orders, &orders);
        env.events().publish((symbol_short!("cancelled"), owner), order_id);
    }

    pub fn trigger_one(env: Env, oracle_ticker: ReflectorAsset, order_id: u64, slip_bps: u32, deadline_secs: u64) {
        let oracle: Address = env.storage().instance().get(&DataKey::OracleAddress).unwrap();
        let r = ReflectorClient::new(&env, &oracle);
        let p = r.lastprice(&oracle_ticker).unwrap_or_else(|| panic_with_error!(&env, Error::PriceNotAvailable)).price;
        Self::settle(env, order_id, p, slip_bps, deadline_secs);
    }

    pub fn get_order(env: Env, order_id: u64) -> Order {
        let orders: Map<u64, Order> = env.storage().instance().get(&DataKey::Orders).unwrap();
        orders.get(order_id).unwrap_or_else(|| panic_with_error!(&env, Error::OrderNotFound))
    }
}

impl OrderBook {
    fn settle(env: Env, order_id: u64, px: i128, slip_bps: u32, deadline_secs: u64) {
        let scale: i128 = env.storage().instance().get(&DataKey::PriceScale).unwrap();
        if slip_bps >= 10_000 { panic_with_error!(&env, Error::InvalidParam); }
        let mut orders: Map<u64, Order> = env.storage().instance().get(&DataKey::Orders).unwrap();
        let mut o = orders.get(order_id).unwrap_or_else(|| panic_with_error!(&env, Error::OrderNotFound));
        if o.status != OrderStatus::Active { panic_with_error!(&env, Error::OrderNotActive); }
        let mut fire = false;
        match o.order_type {
            OrderType::SimpleTrigger => { if px <= o.trigger_price { fire = true; } }
            OrderType::TrailingStopLoss => {
                if px > o.peak_price { o.peak_price = px; }
                else {
                    let th = (o.peak_price * (10_000 - o.trail_bps) as i128) / 10_000;
                    if px <= th { fire = true; }
                }
            }
        }
        if !fire {
            orders.set(order_id, o);
            env.storage().instance().set(&DataKey::Orders, &orders);
            return;
        }
        let quoted = (o.amount_to_sell * px) / scale;
        let min_out = (quoted * (10_000 - slip_bps as i128)) / 10_000;
        let router: Address = env.storage().instance().get(&DataKey::DexRouterAddress).unwrap();
        let mut path = Vec::new(&env);
        path.push_back(o.sell_asset.clone());
        path.push_back(o.buy_asset.clone());
        let sell = token::Client::new(&env, &o.sell_asset);
        let from = env.current_contract_address();
        let exp_ledger = env.ledger().sequence() + 200;
        sell.approve(&from, &router, &o.amount_to_sell, &exp_ledger);
        let dex = SoroswapRouterClient::new(&env, &router);
        let res = dex.swap_exact_tokens_for_tokens(&o.amount_to_sell, &min_out, &path, &o.owner, &(env.ledger().timestamp() + deadline_secs));
        if res.len() == 0 { panic_with_error!(&env, Error::SwapFailed); }
        o.status = OrderStatus::Executed;
        orders.set(order_id, o.clone());
        env.storage().instance().set(&DataKey::Orders, &orders);
        env.events().publish((symbol_short!("executed"), o.owner.clone()), (o.id, px, min_out));
    }
}
