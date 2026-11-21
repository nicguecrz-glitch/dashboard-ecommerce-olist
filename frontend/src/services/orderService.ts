import { getOrders } from './dataService';

export function getOrderSummary() {
  const orders = getOrders();

  return {
    totalOrders: orders.length,
    deliveredOrders: orders.filter((order) => order.order_status === 'delivered').length,
    canceledOrders: orders.filter((order) => order.order_status === 'canceled').length,
  };
}