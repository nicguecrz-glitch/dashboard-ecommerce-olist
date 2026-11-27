import { get, ref } from 'firebase/database';
import { database } from '../firebase/firebase';

import type {
    Order,
    Customer,
    Product,
    Payment,
    OrderItem,
    Review
} from '../types';

export interface DashboardData {
    orders: Order[];
    customers: Customer[];
    products: Product[];
    payments: Payment[];
    orderItems: OrderItem[];
    reviews: Review[];
}

function convertSnapshot<T>(value: unknown): T[] {
    if (Array.isArray(value)) {
        return value as T[];
    }

    if (!value || typeof value !== 'object') {
        return [];
    }

    return Object.values(value) as T[];
}

export async function getDashboardData(): Promise<DashboardData> {
    const paths = [
        'olist_orders',
        'olist_customers',
        'olist_products',
        'olist_order_payments',
        'olist_order_items',
        'olist_order_reviews'
    ];

    const snapshots = await Promise.all(
        paths.map(path => get(ref(database, path)))
    );

    return {
        orders: convertSnapshot<Order>(snapshots[0].val()),
        customers: convertSnapshot<Customer>(snapshots[1].val()),
        products: convertSnapshot<Product>(snapshots[2].val()),
        payments: convertSnapshot<Payment>(snapshots[3].val()),
        orderItems: convertSnapshot<OrderItem>(snapshots[4].val()),
        reviews: convertSnapshot<Review>(snapshots[5].val())
    };
}