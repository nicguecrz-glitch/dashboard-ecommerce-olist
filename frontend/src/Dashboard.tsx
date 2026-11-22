import Header from './components/Header';
import { Container, Grid, Paper, Typography } from '@mui/material';

export default function Dashboard() {
    return (
        <>
            {/*Header*/}
            <Header/>

            <Container component="main" maxWidth="lg" sx={{ py: 3 }}>
                <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                    Filtros
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {['Fecha de compra', 'Estado de Brasil', 'Categoría'].map((label) => (
                        <Grid key={label} size={{ xs: 12, sm: 4 }}>
                            <Paper variant="outlined" sx={{ p: 2 }}>{label}</Paper>
                        </Grid>
                    ))}
                </Grid>

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