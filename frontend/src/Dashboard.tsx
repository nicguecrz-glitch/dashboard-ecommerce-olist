
import Header from './components/Header';
import DashboardFilters from './components/DashboardFilters';
import { Container, Grid, Paper, Typography } from '@mui/material';
import { useState } from 'react';

export default function Dashboard() {
    const [date, setDate] = useState('all');
    const [state, setState] = useState('all');
    const [category, setCategory] = useState('all');

    return (
        <>
            {/*Header*/}
            <Header/>

            <Container component="main" maxWidth="lg" sx={{ py: 3 }}>
                <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                    Filtros
                </Typography>

                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <DashboardFilters
                        date={date}
                        setDate={setDate}
                        state={state}
                        setState={setState}
                        category={category}
                        setCategory={setCategory}
                    />
                </Paper>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {['Pedidos', 'Ingresos', 'Tiempo promedio', 'Calificación'].map((label) => (
                        <Grid key={label} size={{ xs: 6, md: 3 }}>
                            <Paper sx={{ bgcolor: '#ffeb82', p: 2, textAlign: 'center' }}>
                                <Typography>{label}</Typography>
                                <Typography variant="h6">—</Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                <Grid container spacing={2}>
                    {[
                        'Ingresos por categoría',
                        'Detalle de pedidos',
                        'Evolución mensual de ingresos',
                        'Distribución de pedidos por estado',
                    ].map((title) => (
                        <Grid key={title} size={{ xs: 12, md: 6 }}>
                            <Paper variant="outlined" sx={{ p: 2, minHeight: 180 }}>
                                <Typography component="h2" variant="h6">{title}</Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </>
    );
}
