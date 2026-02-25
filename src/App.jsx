
import * as React from 'react';
import { AppBar, Toolbar, Typography, Container, Box, CssBaseline, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import 'moment/locale/de';

moment.locale('de');

const theme = createTheme({});

const defaultShifts = [
  { label: '08:00 bis 16:00', value: '8-16' },
  { label: '09:30 bis 18:00', value: '9_30-18' },
  { label: '08:00 bis 09:30', value: '8-9_30' },
  { label: '16:00 bis 18:00', value: '16-18' },
];

function App() {
  const [shiftList, setShiftList] = React.useState(defaultShifts);
  const [selectedShift, setSelectedShift] = React.useState('8-16');
  const [customShift, setCustomShift] = React.useState('');

  const handleAddCustomShift = () => {
    if (customShift && !shiftList.some(s => s.label === customShift)) {
      setShiftList([...shiftList, { label: customShift, value: customShift }]);
      setCustomShift('');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="de">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Schichtplaner
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="shift-select-label">Schicht auswählen</InputLabel>
              <Select
                labelId="shift-select-label"
                value={selectedShift}
                label="Schicht auswählen"
                onChange={e => setSelectedShift(e.target.value)}
              >
                {shiftList.map((shift, idx) => (
                  <MenuItem key={shift.value} value={shift.value}>
                    {shift.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel htmlFor="custom-shift">Eigene Schicht</InputLabel>
                <input
                  id="custom-shift"
                  type="text"
                  value={customShift}
                  onChange={e => setCustomShift(e.target.value)}
                  placeholder="z.B. 10:00 bis 15:00"
                  style={{ padding: 8, fontSize: 16, width: '100%', borderRadius: 4, border: '1px solid #ccc' }}
                />
              </FormControl>
              <Button variant="contained" sx={{ ml: 2 }} onClick={handleAddCustomShift}>
                Hinzufügen
              </Button>
            </Box>
          </Box>
          {/* Kalender-Placeholder */}
          <Box sx={{ border: '1px solid #ddd', borderRadius: 2, p: 2, minHeight: 400, bgcolor: '#fafafa' }}>
            <Typography variant="h5" align="center" color="text.secondary" sx={{ mt: 10 }}>
              Kalender wird hier angezeigt (nächster Schritt)
            </Typography>
          </Box>
        </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
