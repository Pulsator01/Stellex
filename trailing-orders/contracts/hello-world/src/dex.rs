use soroban_sdk::{contractclient, Address, Env, Vec};

#[contractclient(name = "SoroswapRouterClient")]
pub trait SoroswapRouterTrait {
    fn swap_exact_tokens_for_tokens(e: Env, amount_in: i128, amount_out_min: i128, path: Vec<Address>, to: Address, deadline: u64) -> Vec<i128>;
}
