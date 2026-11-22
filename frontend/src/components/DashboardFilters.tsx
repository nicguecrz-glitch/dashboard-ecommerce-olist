import { Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';


interface DashboardFiltersProps {
    date: string;
    setDate: (value: string) => void;
    state: string;
    setState: (value: string) => void;
    category: string;
    setCategory: (value: string) => void;

}

export default function DashboardFilters({
    date, setDate, state, setState, category, setCategory
}: DashboardFiltersProps) {
    return (
        <Grid container spacing={2}>
            {/*Fecha de compra*/}
            <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                    <InputLabel>Fecha de Compra</InputLabel>
                    <Select
                        value={date}
                        label="Fecha de compra"
                        onChange={(e) => setDate(e.target.value)}>
                        <MenuItem value= "all">Todas las fechas</MenuItem>
                        <MenuItem value= "30">Últimos 30 días</MenuItem>
                        <MenuItem value= "90">Últimos 90 días</MenuItem>
                    </Select>
                </FormControl>

            </Grid>

            {/*Estado de Brazil*/}
        </Grid>
    );
}