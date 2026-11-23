
import Header from './components/Header';
import DashboardFilters from './components/DashboardFilters';
import { Container, Grid, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import type { Dayjs } from 'dayjs';

import {
    getOrders,
    getCustomers,
    getProducts,
    getOrderItems,
    getReviews
} from './services/dataService';

import {
    getOrderSummary,
    getAverageDeliveryDays
} from './services/orderService';

import { getProductRevenue } from './services/salesService';
import { getAverageReviewScore } from './services/reviewService';

export default function Dashboard() {
    // Estados de los filtros
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    const [state, setState] = useState('all');
    const [category, setCategory] = useState('all');

    // Obtener datos originales
    const orders = getOrders();
    const customers = getCustomers();
    const products = getProducts();
    const orderItems = getOrderItems();
    const reviews = getReviews();

    // Relacionar clientes con sus estados
    const customerStateMap = new Map(
        customers.map((customer) => [
            customer.customer_id,
            customer.customer_state
        ])
    );

    // Relacionar productos con sus categorías
    const productCategoryMap = new Map(
        products.map((product) => [
            product.product_id,
            product.product_category_name
        ])
    );

    // 1. Filtrar pedidos por fecha y estado de Brasil
    const baseFilteredOrders = orders.filter((order) => {
        const purchaseDate = Date.parse(order.order_purchase_timestamp);

        const matchesStartDate =
            !startDate ||
            purchaseDate >= startDate.startOf('day').valueOf();

        const matchesEndDate =
            !endDate ||
            purchaseDate <= endDate.endOf('day').valueOf();

        const customerState = customerStateMap.get(order.customer_id);

        const matchesState =
            state === 'all' || customerState === state;

        return (
            Number.isFinite(purchaseDate) &&
            matchesStartDate &&
            matchesEndDate &&
            matchesState
        );
    });

    // 2. Identificar pedidos que contienen la categoría seleccionada
    const baseOrderIds = new Set(
        baseFilteredOrders.map((order) => order.order_id)
    );

    const matchingOrderIds = new Set(
        orderItems
            .filter((item) => {
                const matchesOrder = baseOrderIds.has(item.order_id);

                const matchesCategory =
                    category === 'all' ||
                    productCategoryMap.get(item.product_id) === category;

                return matchesOrder && matchesCategory;
            })
            .map((item) => item.order_id)
    );


    // 3. Obtener los pedidos que cumplen todos los filtros
    const filteredOrders = category === 'all'
        ? baseFilteredOrders
        : baseFilteredOrders.filter((order) =>
            matchingOrderIds.has(order.order_id)
        );

    // 4. Obtener los artículos correspondientes a esos pedidos
    const filteredOrderIds = new Set(
        filteredOrders.map((order) => order.order_id)
    );

    const filteredItems = orderItems.filter((item) => {
        const matchesOrder = filteredOrderIds.has(item.order_id);

        const matchesCategory =
            category === 'all' ||
            productCategoryMap.get(item.product_id) === category;

        return matchesOrder && matchesCategory;
    });

    // 5. Obtener las reseñas de los pedidos filtrados
    const filteredReviews = reviews.filter((review) =>
        filteredOrderIds.has(review.order_id)
    );

    // 6. Calcular KPI con los datos filtrados
    const orderSummary = getOrderSummary(filteredOrders);

    const revenue = getProductRevenue(
        filteredOrders,
        filteredItems
    );

    const averageDelivery = getAverageDeliveryDays(filteredOrders);

    const averageReview = getAverageReviewScore(filteredReviews);

    return (
        <>
            {/* Header */}
            <Header />

            <Container component="main" maxWidth="lg" sx={{ py: 3 }}>
                <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                    Filtros
                </Typography>

                {/* Filtros del dashboard */}
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <DashboardFilters
                        startDate={startDate}
                        setStartDate={setStartDate}
                        endDate={endDate}
                        setEndDate={setEndDate}
                        state={state}
                        setState={setState}
                        category={category}
                        setCategory={setCategory}
                    />
                </Paper>

                {/* Tarjetas KPI */}
                <Grid container spacing={2} sx={{ mb: 3 }}>

                    {/* Pedidos */}
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Paper sx={{ bgcolor: '#ffeb82', p: 2, textAlign: 'center' }}>
                            <Typography>Pedidos</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                {orderSummary.totalOrders.toLocaleString('es-ES')}
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Ingresos */}
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Paper sx={{ bgcolor: '#ffeb82', p: 2, textAlign: 'center' }}>
                            <Typography>Ingresos</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                {revenue.toLocaleString('es-ES', {
                                    style: 'currency',
                                    currency: 'BRL'
                                })}
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Tiempo promedio */}
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Paper sx={{ bgcolor: '#ffeb82', p: 2, textAlign: 'center' }}>
                            <Typography>Tiempo promedio</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                {averageDelivery !== null
                                    ? `${averageDelivery.toFixed(1)} días`
                                    : 'Sin datos'}
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Calificación */}
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Paper sx={{ bgcolor: '#ffeb82', p: 2, textAlign: 'center' }}>
                            <Typography>Calificación</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                {averageReview !== null
                                    ? `${averageReview.toFixed(1)} / 5`
                                    : 'Sin datos'}
                            </Typography>
                        </Paper>
                    </Grid>

                </Grid>

                {/* Espacios para gráficos */}
                <Grid container spacing={2}>
                    {[
                        'Ingresos por categoría',
                        'Detalle de pedidos',
                        'Evolución mensual de ingresos',
                        'Distribución de pedidos por estado',
                    ].map((title) => (
                        <Grid key={title} size={{ xs: 12, md: 6 }}>
                            <Paper variant="outlined" sx={{ p: 2, minHeight: 180 }}>
                                <Typography component="h2" variant="h6">
                                    {title}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </>
    );
}
