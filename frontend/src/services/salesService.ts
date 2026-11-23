
import {
  getOrderItems,
  getOrders
} from './dataService';

import type { Order, OrderItem } from '../types';

export function getProductRevenue(
  orders: Order[] = getOrders(),
  items: OrderItem[] = getOrderItems()
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
