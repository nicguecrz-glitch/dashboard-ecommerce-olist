
import ordersData from "../../../data/json/olist_orders.json";
import customersData from "../../../data/json/olist_customers.json";
import productsData from "../../../data/json/olist_products.json";
import paymentsData from "../../../data/json/olist_order_payments.json";
import orderItemsData from "../../../data/json/olist_order_items.json";
import reviewsData from "../../../data/json/olist_order_reviews.json";

import type {
  Order,
  Customer,
  Product,
  Payment,
  OrderItem,
  Review
} from "../types";

export const getOrders = (): Order[] => ordersData as Order[];

export const getCustomers = (): Customer[] =>
  customersData as Customer[];

export const getProducts = (): Product[] =>
  productsData as Product[];

export const getPayments = (): Payment[] =>
  paymentsData as Payment[];

export const getOrderItems = (): OrderItem[] =>
  orderItemsData as OrderItem[];

export const getReviews = (): Review[] =>
  reviewsData as Review[];
