import OrderList from "../components/OrderList";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Active, Executed, and Cancelled orders from the OrderBook.
          </p>
        </div>
        <a className="btn btn-primary" href="/create">Create Order</a>
      </header>
      <OrderList />
    </div>
  );
}


