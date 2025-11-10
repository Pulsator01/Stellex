import OrderForm from "../../components/OrderForm";

export default function CreatePage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Order</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Simple Trigger or Trailing Stop‑Loss. Funds escrowed in OrderBook, outputs sent to you.
        </p>
      </div>
      <OrderForm />
    </div>
  );
}


