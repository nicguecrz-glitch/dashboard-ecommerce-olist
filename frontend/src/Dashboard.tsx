
import { Container, Grid, Paper, Typography } from '@mui/material';
import type { Dayjs } from 'dayjs';
import { useState } from 'react';
import {
    Bar, BarChart, Legend, Line, LineChart, Pie, PieChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import DashboardFilters from './components/DashboardFilters';
import Header from './components/Header';

import {
    getCustomers,
    getOrderItems,
    getOrders,
    getProducts,
    getReviews
} from './services/dataService';

import {
    getAverageDeliveryDays,
    getOrderSummary
} from './services/orderService';

import { getAverageReviewScore } from './services/reviewService';
import { getProductRevenue } from './services/salesService';

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

    const deliveredOrderIds = new Set(
        filteredOrders
            .filter((order) => order.order_status === 'delivered')
            .map((order) => order.order_id)
    );

    const revenueByCategory = new Map<string, number>();

    for (const item of filteredItems) {
        if (!deliveredOrderIds.has(item.order_id)) continue;

        const categoryName = productCategoryMap.get(item.product_id) || 'Sin categoría';
        const currentRevenue = revenueByCategory.get(categoryName) ?? 0;

        revenueByCategory.set(categoryName, currentRevenue + item.price);
    }

    const categoryChartData = Array.from(
        revenueByCategory,
        ([categoryName, revenue]) => ({ categoryName, revenue })
    ).sort((a, b) => b.revenue - a.revenue);


    const purchaseMonthByOrder = new Map(
        filteredOrders
            .filter((order) => deliveredOrderIds.has(order.order_id))
            .map((order) => [
                order.order_id,
                order.order_purchase_timestamp.slice(0, 7),
            ] as const)
    );

    const revenueByMonth = new Map<string, number>();

    for (const item of filteredItems) {
        const month = purchaseMonthByOrder.get(item.order_id);
        if (!month) continue;

        revenueByMonth.set(month, (revenueByMonth.get(month) ?? 0) + item.price);
    }

    const monthlyChartData = Array.from(
        revenueByMonth,
        ([month, revenue]) => ({ month, revenue })
    ).sort((a, b) => a.month.localeCompare(b.month));

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

    const statusColors: Record<string, string> = {
        delivered: '#0877b5',
        shipped: '#3dbab5',
        canceled: '#ee6555',
        unavailable: '#aebbd1',
        invoiced: '#f4ad32',
        processing: '#7a57c2',
        approved: '#4e8f46',
        created: '#95654d',
    };

    const statusCounts = new Map<string, number>();

    for (const order of filteredOrders) {
        const status = order.order_status || 'unknown';
        statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
    }

    const statusChartData = Array.from(statusCounts, ([status, count]) => ({
        name: statusLabels[status] ?? 'Sin estado',
        count,
        fill: statusColors[status] ?? '#64748b',
    })).sort((a, b) => b.count - a.count);

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
                                {title === 'Ingresos por categoría' && (
                                    categoryChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={240}>
                                            <BarChart data={categoryChartData}>
                                                <XAxis dataKey="categoryName" tick={false} />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="revenue" name="Ingresos (BRL)" fill="#07364d" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <Typography sx={{ mt: 2 }}>Sin ingresos para estos filtros</Typography>
                                    )
                                )}

                                {title === 'Evolución mensual de ingresos' && (
                                    monthlyChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={240}>
                                            <LineChart data={monthlyChartData}>
                                                <XAxis dataKey="month" minTickGap={24} />
                                                <YAxis width={80} />
                                                <Tooltip />
                                                <Line
                                                    dataKey="revenue"
                                                    name="Ingresos (BRL)"
                                                    stroke="#07364d"
                                                    strokeWidth={2}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <Typography sx={{ mt: 2 }}>Sin ingresos para estos filtros</Typography>
                                    )
                                )}
                                {title === 'Distribución de pedidos por estado' && (
                                    statusChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={240}>
                                            <PieChart>
                                                <Pie
                                                    data={statusChartData}
                                                    dataKey="count"
                                                    nameKey="name"
                                                    innerRadius="45%"
                                                    outerRadius="78%"
                                                />
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <Typography sx={{ mt: 2 }}>Sin pedidos para estos filtros</Typography>
                                    )
                                )}
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </>
    );
}
