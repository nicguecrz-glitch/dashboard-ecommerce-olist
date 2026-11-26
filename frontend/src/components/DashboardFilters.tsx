import { FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { esES } from '@mui/x-date-pickers/locales';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { getCustomers, getProducts } from '../services/dataService';

const filterFont = '"DM Sans Variable", system-ui, sans-serif';

const calendarPaperSx = {
    fontFamily: filterFont,
    borderRadius: '16px',
    border: '1px solid #dce4ed',
    boxShadow: '0 12px 32px rgb(23 32 51 / 14%)',
    overflow: 'hidden',
    '& .MuiTypography-root, & button': {
        fontFamily: filterFont,
    },
    '& button.Mui-selected, & button.Mui-selected:hover': {
        backgroundColor: '#0f766e',
        color: '#fff',
    },
};

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
        <Grid
            container
            spacing={2}
            sx={{
                fontFamily: filterFont,
                '& .MuiInputLabel-root, & .MuiInputBase-root, & .MuiPickersInputBase-root, & .MuiSelect-select': {
                    fontFamily: filterFont,
                },
                '& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#f6f8fb',
                    color: '#172033',
                    minHeight: 52,
                    '& fieldset, & .MuiPickersOutlinedInput-notchedOutline': {
                        borderColor: '#dce4ed',
                    },
                    '&:hover fieldset, &:hover .MuiPickersOutlinedInput-notchedOutline': {
                        borderColor: '#93b8b2',
                    },
                    '&.Mui-focused fieldset, &.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
                        borderColor: '#0f766e',
                    },
                },
                '& .MuiSelect-select': {
                    textAlign: 'left',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: '#0f766e',
                },
            }}
        >
            {/* Rango de fechas */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale="es"
                    localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
                >
                    <DatePicker
                        label="Fecha inicial"
                        value={startDate}
                        onChange={setStartDate}
                        format="DD/MM/YYYY"
                        minDate={dayjs('2016-01-01')}
                        maxDate={endDate ?? dayjs('2018-12-31')}
                        slotProps={{
                            textField: { fullWidth: true },
                            desktopPaper: { sx: calendarPaperSx },
                            mobilePaper: { sx: calendarPaperSx },
                        }}
                    />
                </LocalizationProvider>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale="es"
                    localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
                >
                    <DatePicker
                        label="Fecha final"
                        value={endDate}
                        onChange={setEndDate}
                        format="DD/MM/YYYY"
                        minDate={startDate ?? dayjs('2016-01-01')}
                        maxDate={dayjs('2018-12-31')}
                        slotProps={{
                            textField: { fullWidth: true },
                            desktopPaper: { sx: calendarPaperSx },
                            mobilePaper: { sx: calendarPaperSx },
                        }}
                    />
                </LocalizationProvider>
            </Grid>

            {/*Estado de Brasil*/}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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