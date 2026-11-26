import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import { get, limitToFirst, orderByKey, query, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { database } from '../firebase/firebase';

type FirebaseOrder = {
    order_id: string;
    order_purchase_timestamp: string;
    order_status: string;
};

const statusLabels: Record<string, string> = {
    delivered: 'Entregado',
    shipped: 'Enviado',
    canceled: 'Cancelado',
    unavailable: 'No disponible',
    invoiced: 'Facturado',
    processing: 'En proceso',
    approved: 'Aprobado',
    created: 'Creado',
};

export default function FirebaseOrdersPreview() {
    const [orders, setOrders] = useState<FirebaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        const ordersQuery = query(
            ref(database, 'olist_orders'),
            orderByKey(),
            limitToFirst(5),
        );

        get(ordersQuery)
            .then((snapshot) => {
                const records: FirebaseOrder[] = [];

                snapshot.forEach((child) => {
                    records.push(child.val() as FirebaseOrder);
                });

                if (active) setOrders(records);
            })
            .catch((err: unknown) => {
                if (active) {
                    setError(err instanceof Error ? err.message : 'Error al leer Firebase');
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, []);

    if (loading) return <Typography>Cargando pedidos desde Firebase…</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (orders.length === 0) return <Typography>No se encontraron pedidos.</Typography>;

    return (
        <TableContainer>
            <Table size="small" aria-label="Muestra de pedidos de Firebase">
                <caption>Muestra de 5 pedidos de Firebase, sin aplicar los filtros del dashboard.</caption>
                <TableHead>
                    <TableRow>
                        <TableCell>Pedido</TableCell>
                        <TableCell>Fecha de compra</TableCell>
                        <TableCell>Situación</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders.map((order) => (
                        <TableRow key={order.order_id}>
                            <TableCell title={order.order_id}>{order.order_id.slice(0, 8)}</TableCell>
                            <TableCell>
                                {order.order_purchase_timestamp.slice(0, 10).split('-').reverse().join('/')}
                            </TableCell>
                            <TableCell>{statusLabels[order.order_status] ?? order.order_status}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}