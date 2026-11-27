
import type { Order } from '../types';

export function getOrderSummary(orders: Order[]) {
  return {
    totalOrders: orders.length,
    deliveredOrders: orders.filter(
      (order) => order.order_status === 'delivered'
    ).length,
    canceledOrders: orders.filter(
      (order) => order.order_status === 'canceled'
    ).length,
  };
}

export function getAverageDeliveryDays(
  orders: Order[]
): number | null {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  let totalDays = 0;
  let deliveryCount = 0;

  for (const order of orders) {
    if (
      order.order_status !== 'delivered' ||
      !order.order_delivered_customer_date
    ) continue;

    const purchase = Date.parse(order.order_purchase_timestamp);
    const delivery = Date.parse(order.order_delivered_customer_date);
    const elapsed = delivery - purchase;

    if (!Number.isFinite(elapsed) || elapsed < 0) continue;

    totalDays += elapsed / millisecondsPerDay;
    deliveryCount++;
  }

  return deliveryCount > 0 ? totalDays / deliveryCount : null;
}

export function getOrdersByStatus(orders: Order[]) {
  const countsByStatus = new Map<string, number>();

  for (const order of orders) {
    const status = order.order_status;
    countsByStatus.set(
      status,
      (countsByStatus.get(status) ?? 0) + 1
    );
  }

  return Array.from(countsByStatus, ([status, count]) => ({
    status,
    count,
  })).sort((a, b) => b.count - a.count);
}
