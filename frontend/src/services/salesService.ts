import { getOrderItems, getOrders } from './dataService';

export function getProductRevenue(): number {
  const deliveredOrderIds = new Set(
    getOrders()
      .filter((order) => order.order_status === 'delivered')
      .map((order) => order.order_id),
  );

  return getOrderItems()
    .filter((item) => deliveredOrderIds.has(item.order_id))
    .reduce((total, item) => total + item.price, 0);
}