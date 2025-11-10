import OrderDetail from "../../../components/OrderDetail";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return <OrderDetail orderId={Number(params.id)} />;
}


