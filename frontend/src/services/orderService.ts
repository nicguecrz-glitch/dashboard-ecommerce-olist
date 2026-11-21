import { getOrders } from './dataService';

export function getOrderSummary() {
  const orders = getOrders();

  return {
    totalOrders: orders.length,
    deliveredOrders: orders.filter((order) => order.order_status === 'delivered').length,
    canceledOrders: orders.filter((order) => order.order_status === 'canceled').length,
  };
}

export function getAverageDeliveryDays(): number | null {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  let totalDays = 0;
  let deliveryCount = 0;

  for (const order of getOrders()) {
    if (order.order_status !== 'delivered' || !order.order_delivered_customer_date) {
      continue;
    }

    const purchase = Date.parse(order.order_purchase_timestamp);
    const delivery = Date.parse(order.order_delivered_customer_date);
    const elapsed = delivery - purchase;

    if (!Number.isFinite(elapsed) || elapsed < 0) {
      continue;
    }

    totalDays += elapsed / millisecondsPerDay;
    deliveryCount++;
  }

  return deliveryCount > 0 ? totalDays / deliveryCount : null;
}