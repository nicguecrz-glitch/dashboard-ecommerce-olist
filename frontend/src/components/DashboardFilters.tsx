import { Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { getProducts } from '../services/dataService';
import { getCustomers } from '../services/dataService';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

interface DashboardFiltersProps {
    startDate: Dayjs | null;
    setStartDate: (value: Dayjs | null) => void;
    endDate: Dayjs | null;
    setEndDate: (value: Dayjs | null) => void;
    state: string;
    setState: (value: string) => void;
    category: string;
    setCategory: (value: string) => void;
}

export default function DashboardFilters({
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    state,
    setState,
    category,
    setCategory
}: DashboardFiltersProps) {

    const categories = Array.from(
        new Set(
            getProducts()
                .map((product) => product.product_category_name)
                .filter((category): category is string => Boolean(category))
        )
    ).sort();


    const states = Array.from(
        new Set(
            getCustomers()
                .map((customer) => customer.customer_state)
                .filter((state): state is string => Boolean(state))
        )
    ).sort();

    return (
        <Grid container spacing={2}>
            {/*Rango de fechas*/}
            <Grid size={{ xs: 12, sm: 4 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Fecha inicial"
                        value={startDate}
                        onChange={setStartDate}
                        format="DD/MM/YYYY"
                        minDate={dayjs('2016-01-01')}
                        maxDate={endDate ?? dayjs('2018-12-31')}
                        slotProps={{
                            textField: { fullWidth: true }
                        }}
                    />
                </LocalizationProvider>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Fecha final"
                        value={endDate}
                        onChange={setEndDate}
                        format="DD/MM/YYYY"
                        minDate={startDate ?? dayjs('2016-01-01')}
                        maxDate={dayjs('2018-12-31')}
                        slotProps={{
                            textField: { fullWidth: true }
                        }}
                    />
                </LocalizationProvider>
            </Grid>

            {/*Estado de Brasil*/}
            <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                    <InputLabel>Estado de Brasil</InputLabel>
                    <Select
                        value={state}
                        label="Estado de Brasil"
                        onChange={(e) => setState(e.target.value)}
                    >

                        <MenuItem value="all">Todos los estados</MenuItem>

                        {states.map((state) => (
                            <MenuItem key={state} value={state}>
                                {state}
                            </MenuItem>
                        ))}

                    </Select>

                </FormControl>

            </Grid>

            {/*Categorias*/}
            <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                    <InputLabel>Categoría</InputLabel>
                    <Select
                        value={category}
                        label="Categoría"
                        onChange={(e) => setCategory(e.target.value)}
                    >

                        <MenuItem value="all">Todas las categorías</MenuItem>

                        {categories.map((category) => (
                            <MenuItem key={category} value={category}>
                                {category.replace(/_/g, ' ')}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
    );
}