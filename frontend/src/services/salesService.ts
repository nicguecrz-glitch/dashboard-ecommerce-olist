import { getOrderItems, getOrders, getProducts } from './dataService';

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

export function getRevenueByCategory() {
  const deliveredOrderIds = new Set(
    getOrders()
      .filter((order) => order.order_status === 'delivered')
      .map((order) => order.order_id),
  );

  const categoriesByProduct = new Map(
    getProducts().map((product) => [
      product.product_id,
      product.product_category_name,
    ] as const),
  );

  const totalsByCategory = new Map<string, number>();

  for (const item of getOrderItems()) {
    if (!deliveredOrderIds.has(item.order_id)) {
      continue;
    }

    const category = categoriesByProduct.get(item.product_id) ?? 'Sin categoría';
    const currentTotal = totalsByCategory.get(category) ?? 0;
    totalsByCategory.set(category, currentTotal + item.price);
  }

  return Array.from(totalsByCategory, ([category, revenue]) => ({
    category,
    revenue,
  })).sort((first, second) => second.revenue - first.revenue);
}

export function getRevenueByMonth() {
  const monthByOrder = new Map<string, string>();

  for (const order of getOrders()) {
    if (order.order_status === 'delivered' && order.order_purchase_timestamp) {
      const month = order.order_purchase_timestamp.slice(0, 7);
      monthByOrder.set(order.order_id, month);
    }
  }

  const totalsByMonth = new Map<string, number>();

  for (const item of getOrderItems()) {
    const month = monthByOrder.get(item.order_id);

    if (month) {
      totalsByMonth.set(month, (totalsByMonth.get(month) ?? 0) + item.price);
    }
  }

  return Array.from(totalsByMonth, ([month, revenue]) => ({ month, revenue }))
    .sort((first, second) => first.month.localeCompare(second.month));
}