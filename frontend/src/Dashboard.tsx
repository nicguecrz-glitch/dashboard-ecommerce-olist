import {
    Button, Container, Grid, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Typography
} from '@mui/material';
import type { Dayjs } from 'dayjs';
import {
    Bar, BarChart, Legend, Line, LineChart, Pie, PieChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import DashboardFilters from './components/DashboardFilters';
import Header from './components/Header';
import './Dashboard.css';

import { useEffect, useState } from 'react';
import { getDashboardData } from './services/dataService';
import type { DashboardData } from './services/dataService';

import {
    getAverageDeliveryDays,
    getOrderSummary
} from './services/orderService';

import { getAverageReviewScore } from './services/reviewService';
import { getProductRevenue } from './services/salesService';

export default function Dashboard() {
    // Datos recuperados de Firebase
    const [data, setData] = useState<DashboardData>({
        orders: [],
        customers: [],
        products: [],
        payments: [],
        orderItems: [],
        reviews: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Cargar los datos una sola vez desde Firebase
    useEffect(() => {
        let active = true;

        async function loadData() {
            try {
                const result = await getDashboardData();
                if (active) setData(result);
            } catch (err) {
                if (active) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Error al recuperar los datos de Firebase'
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        loadData();

        return () => {
            active = false;
        };
    }, []);

    // Estados de los filtros
    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);
    const [state, setState] = useState('all');
    const [category, setCategory] = useState('all');

    // Utilizar los datos recuperados de Firebase
    const orders = data.orders;
    const customers = data.customers;
    const products = data.products;
    const orderItems = data.orderItems;
    const reviews = data.reviews;

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

    const [orderSort, setOrderSort] = useState<'date' | 'state'>('date');
    const [ascending, setAscending] = useState(false);
    const [orderPage, setOrderPage] = useState(0);

    function changeOrderSort(column: 'date' | 'state') {
        setAscending(orderSort === column ? !ascending : column === 'state');
        setOrderSort(column);
        setOrderPage(0);
    }

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

    const orderValues = new Map<string, number>();

    for (const item of filteredItems) {
        const currentValue = orderValues.get(item.order_id) ?? 0;
        orderValues.set(item.order_id, currentValue + item.price);
    }

    const sortedOrders = [...filteredOrders].sort((a, b) => {
        const byDate = a.order_purchase_timestamp.localeCompare(b.order_purchase_timestamp);

        if (orderSort === 'date') {
            return ascending ? byDate : -byDate;
        }

        const stateA = customerStateMap.get(a.customer_id) ?? '';
        const stateB = customerStateMap.get(b.customer_id) ?? '';
        const byState = stateA.localeCompare(stateB);

        return (ascending ? byState : -byState) || -byDate;
    });

    const pageCount = Math.ceil(sortedOrders.length / 10);
    const currentPage = Math.min(orderPage, Math.max(0, pageCount - 1));
    const recentOrders = sortedOrders.slice(currentPage * 10, (currentPage + 1) * 10);

    const orderCurrency = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'BRL',
    });

    const [showFirebaseOrders, setShowFirebaseOrders] = useState(false);

    // Los retornos condicionales van después de declarar todos los hooks.
    if (loading) {
        return <Typography sx={{ p: 3 }}>Cargando información del dashboard...</Typography>;
    }

    if (error) {
        return <Typography color="error" sx={{ p: 3 }}>Error: {error}</Typography>;
    }

    return (
        <>
            {/* Header */}
            <Header />

            <Container component="main" maxWidth="lg" className="olist-dashboard" sx={{ py: 3 }}>
                <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                    Filtros
                </Typography>

                {/* Filtros del dashboard */}
                <Paper className="olist-card" variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <DashboardFilters
                        startDate={startDate}
                        setStartDate={setStartDate}
                        endDate={endDate}
                        setEndDate={setEndDate}
                        state={state}
                        setState={setState}
                        category={category}
                        setCategory={setCategory}
                        customers={customers}
                        products={products}
                    />
                </Paper>

                {/* Tarjetas KPI */}
                <Grid container spacing={2} sx={{ mb: 3 }}>

                    {/* Pedidos */}
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Paper className="olist-card olist-kpi" elevation={0} sx={{ p: 2 }}>
                            <Typography>Pedidos</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                {orderSummary.totalOrders.toLocaleString('es-ES')}
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Ingresos */}
                    <Grid size={{ xs: 6, md: 3 }}>
                        <Paper className="olist-card olist-kpi olist-kpi-revenue" elevation={0} sx={{ p: 2 }}>
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
                        <Paper className="olist-card olist-kpi" elevation={0} sx={{ p: 2 }}>
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
                        <Paper className="olist-card olist-kpi" elevation={0} sx={{ p: 2 }}>
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
                            <Paper className="olist-card" variant="outlined" sx={{ p: 2.5, minHeight: 280 }}>
                                <Typography
                                    component="h2"
                                    variant="h6"
                                    sx={{
                                        color: '#07364d',
                                        fontWeight: 800,
                                        fontSize: '1.15rem',
                                        mb: 2,
                                        pb: 1,
                                        borderBottom: '2px solid #07364d'
                                    }}
                                >
                                    {title}
                                </Typography>
                                {title === 'Detalle de pedidos' && !showFirebaseOrders && (
                                    recentOrders.length === 0 ? (
                                        <Typography sx={{ mt: 2 }}>
                                            Sin pedidos para estos filtros
                                        </Typography>
                                    ) : (
                                        <TableContainer sx={{ mt: 1, maxHeight: 280 }}>
                                            <Table size="small" stickyHeader aria-label="Detalle de pedidos">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Pedido</TableCell>
                                                        <TableCell sortDirection={orderSort === 'date' ? (ascending ? 'asc' : 'desc') : false}>
                                                            <TableSortLabel
                                                                active={orderSort === 'date'}
                                                                direction={ascending ? 'asc' : 'desc'}
                                                                onClick={() => changeOrderSort('date')}
                                                            >
                                                                Fecha
                                                            </TableSortLabel>
                                                        </TableCell>
                                                        <TableCell sortDirection={orderSort === 'state' ? (ascending ? 'asc' : 'desc') : false}>
                                                            <TableSortLabel
                                                                active={orderSort === 'state'}
                                                                direction={ascending ? 'asc' : 'desc'}
                                                                onClick={() => changeOrderSort('state')}
                                                            >
                                                                Estado BR
                                                            </TableSortLabel>
                                                        </TableCell>
                                                        <TableCell>Situación</TableCell>
                                                        <TableCell align="right">Valor</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {recentOrders.map((order) => {
                                                        const value = orderValues.get(order.order_id);

                                                        return (
                                                            <TableRow key={order.order_id}>
                                                                <TableCell title={order.order_id}>
                                                                    {order.order_id.slice(0, 8)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {order.order_purchase_timestamp
                                                                        .slice(0, 10)
                                                                        .split('-')
                                                                        .reverse()
                                                                        .join('/')}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {customerStateMap.get(order.customer_id) ?? '—'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {statusLabels[order.order_status] ?? order.order_status}
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    {value === undefined ? '—' : orderCurrency.format(value)}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                            <TablePagination
                                                component="div"
                                                count={sortedOrders.length}
                                                page={currentPage}
                                                rowsPerPage={10}
                                                rowsPerPageOptions={[10]}
                                                onPageChange={(_, nextPage) => setOrderPage(nextPage)}
                                                labelDisplayedRows={({ from, to, count }) =>
                                                    `${from}–${to} de ${count.toLocaleString('es-EC')}`
                                                }
                                            />
                                        </TableContainer>
                                    )
                                )}



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
