
import * as React from 'react';
import { AppBar, Toolbar, Typography, Container, Box, CssBaseline, Select, MenuItem, FormControl, InputLabel, Button, Grid, Autocomplete, TextField } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import deLocale from '@fullcalendar/core/locales/de';
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

const defaultTeam = [
  'Anna', 'Ben', 'Clara', 'David', 'Emma', 'Felix', 'Greta', 'Hans', 'Ines', 'Jonas', 'Klara', 'Lukas'
];


function App() {
  const [shiftList, setShiftList] = React.useState(defaultShifts);
  const [selectedShift, setSelectedShift] = React.useState('8-16');
  const [customShift, setCustomShift] = React.useState('');
  const [team, setTeam] = React.useState(defaultTeam);
  const [selectedMember, setSelectedMember] = React.useState(team[0]);
  const [events, setEvents] = React.useState([]);

  const handleAddCustomShift = () => {
    if (customShift && !shiftList.some(s => s.label === customShift)) {
      setShiftList([...shiftList, { label: customShift, value: customShift }]);
      setCustomShift('');
    }
  };

  // Handle date click to add/edit shift
  const handleDateClick = (info) => {
    // Only allow Monday-Friday
    const day = moment(info.date).isoWeekday();
    if (day > 5) return;
    // Add event for selected member and shift
    setEvents(prev => [
      ...prev.filter(ev => !(ev.start === info.dateStr && ev.title.startsWith(selectedMember))),
      {
        title: `${selectedMember}: ${shiftList.find(s => s.value === selectedShift)?.label || selectedShift}`,
        start: info.dateStr,
        allDay: true,
        extendedProps: { member: selectedMember, shift: selectedShift }
      }
    ]);
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
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={team}
                value={selectedMember}
                onChange={(_, value) => setSelectedMember(value)}
                renderInput={(params) => <TextField {...params} label="Teammitglied" />}
                disableClearable
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            </Grid>
            <Grid item xs={12}>
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
            </Grid>
          </Grid>
          <Box sx={{ border: '1px solid #ddd', borderRadius: 2, p: 2, minHeight: 500, bgcolor: '#fafafa' }}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={deLocale}
              firstDay={1}
              weekends={false}
              events={events}
              dateClick={handleDateClick}
              height={500}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: ''
              }}
              dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'short' }}
              dayMaxEvents={2}
            />
          </Box>
        </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
