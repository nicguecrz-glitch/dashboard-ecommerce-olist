
import type { Order, OrderItem } from '../types';

export function getProductRevenue(
  orders: Order[],
  items: OrderItem[]
): number {
  const deliveredOrderIds = new Set(
    orders
      .filter((order) => order.order_status === 'delivered')
      .map((order) => order.order_id)
  );

  return items
    .filter((item) => deliveredOrderIds.has(item.order_id))
    .reduce((total, item) => total + item.price, 0);
}
