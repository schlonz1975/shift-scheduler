import * as React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  CssBaseline,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Autocomplete,
  TextField,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

import moment from "moment";
import "moment/locale/de";

moment.locale("de");

const theme = createTheme({});

const defaultShifts = [
  { label: "08:00 bis 16:00", value: "8-16" },
  { label: "09:30 bis 18:00", value: "9_30-18" },
  { label: "08:00 bis 09:30", value: "8-9_30" },
  { label: "16:00 bis 18:00", value: "16-18" },
];

const defaultTeam = [
  "Anna",
  "Ben",
  "Clara",
  "David",
  "Emma",
  "Felix",
  "Greta",
  "Hans",
  "Ines",
  "Jonas",
  "Klara",
  "Lukas",
];

function App() {
  const [shiftList, setShiftList] = React.useState(defaultShifts);
  const [selectedShift, setSelectedShift] = React.useState("8-16");
  const [customShift, setCustomShift] = React.useState("");
  const [team, setTeam] = React.useState(defaultTeam);
  const [selectedMember, setSelectedMember] = React.useState(team[0]);
  const [events, setEvents] = React.useState([]); // [{date, member, shift}]
  const [selectedWeek, setSelectedWeek] = React.useState(
    moment().startOf("isoWeek"),
  );
  const [editCell, setEditCell] = React.useState({ date: null, member: null });

  const handleAddCustomShift = () => {
    if (customShift && !shiftList.some((s) => s.label === customShift)) {
      setShiftList([...shiftList, { label: customShift, value: customShift }]);
      setCustomShift("");
    }
  };

  // Always use German weekdays, Monday to Friday
  const germanWeekdays = [
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
  ];
  // Get dates for Mon-Fri of selected week
  const weekDates = Array.from({ length: 5 }, (_, i) =>
    moment(selectedWeek).add(i, "days"),
  );

  // Get shift for a member on a date
  const getShift = (date, member) => {
    const found = events.find(
      (ev) => ev.date === date.format("YYYY-MM-DD") && ev.member === member,
    );
    return found ? found.shift : "";
  };

  // Set shift for a member on a date
  const setShift = (date, member, shift) => {
    setEvents((prev) => {
      const filtered = prev.filter(
        (ev) =>
          !(ev.date === date.format("YYYY-MM-DD") && ev.member === member),
      );
      if (!shift) return filtered;
      return [...filtered, { date: date.format("YYYY-MM-DD"), member, shift }];
    });
    setEditCell({ date: null, member: null });
  };

  // Delete shift for a member on a date
  const deleteShift = (date, member) => {
    setEvents((prev) =>
      prev.filter(
        (ev) =>
          !(ev.date === date.format("YYYY-MM-DD") && ev.member === member),
      ),
    );
    setEditCell({ date: null, member: null });
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
        <Container
          maxWidth={false}
          sx={{ mt: 4, width: "100vw", maxWidth: "100vw", p: 0 }}
        >
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={team}
                value={selectedMember}
                onChange={(_, value) => setSelectedMember(value)}
                renderInput={(params) => (
                  <TextField {...params} label="Teammitglied" />
                )}
                disableClearable
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="shift-select-label">
                  Schicht auswählen
                </InputLabel>
                <Select
                  labelId="shift-select-label"
                  value={selectedShift}
                  label="Schicht auswählen"
                  onChange={(e) => setSelectedShift(e.target.value)}
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
              <Box sx={{ display: "flex", mt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="custom-shift">Eigene Schicht</InputLabel>
                  <input
                    id="custom-shift"
                    type="text"
                    value={customShift}
                    onChange={(e) => setCustomShift(e.target.value)}
                    placeholder="z.B. 10:00 bis 15:00"
                    style={{
                      padding: 8,
                      fontSize: 16,
                      width: "100%",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                    }}
                  />
                </FormControl>
                <Button
                  variant="contained"
                  sx={{ ml: 2 }}
                  onClick={handleAddCustomShift}
                >
                  Hinzufügen
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Box
            sx={{
              border: "1px solid #ddd",
              borderRadius: 2,
              p: 2,
              minHeight: 300,
              bgcolor: "#fafafa",
              overflowX: "auto",
              width: "100vw",
              maxWidth: "100vw",
              height: "70vh",
              overflowY: "auto",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Schichtplan (Woche ab {moment(selectedWeek).format("DD.MM.YYYY")})
            </Typography>
            <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() =>
                  setSelectedWeek(moment(selectedWeek).subtract(1, "week"))
                }
              >
                Vorherige Woche
              </Button>
              <Button
                variant="outlined"
                onClick={() =>
                  setSelectedWeek(moment(selectedWeek).add(1, "week"))
                }
              >
                Nächste Woche
              </Button>
              <Button
                variant="outlined"
                onClick={() => setSelectedWeek(moment().startOf("isoWeek"))}
              >
                Diese Woche
              </Button>
            </Box>
            <Box
              component="table"
              sx={{
                minWidth: team.length * 140 + 120,
                borderCollapse: "collapse",
              }}
            >
              <Box component="thead">
                <Box component="tr">
                  <Box
                    component="th"
                    sx={{
                      border: "1px solid #ccc",
                      p: 1,
                      minWidth: 120,
                      bgcolor: "#f0f0f0",
                    }}
                  >
                    Datum
                  </Box>
                  {team.map((member) => (
                    <Box
                      component="th"
                      key={member}
                      sx={{
                        border: "1px solid #ccc",
                        p: 1,
                        minWidth: 120,
                        bgcolor: "#f0f0f0",
                      }}
                    >
                      {member}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {weekDates.map((date, idx) => (
                  <Box component="tr" key={date.format("YYYY-MM-DD")}>
                    <Box
                      component="td"
                      sx={{
                        border: "1px solid #ccc",
                        p: 1,
                        fontWeight: 600,
                        bgcolor: "#f9f9f9",
                        minWidth: 160,
                      }}
                    >
                      {germanWeekdays[idx]}, {date.format("DD.MM.YYYY")}
                    </Box>
                    {team.map((member) => {
                      const isEditing =
                        editCell.date === date.format("YYYY-MM-DD") &&
                        editCell.member === member;
                      const shiftValue = getShift(date, member);
                      return (
                        <Box
                          component="td"
                          key={member}
                          sx={{
                            border: "1px solid #ccc",
                            p: 1,
                            textAlign: "center",
                            bgcolor: isEditing ? "#e3f2fd" : undefined,
                          }}
                        >
                          {isEditing ? (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select
                                  value={shiftValue || ""}
                                  onChange={(e) =>
                                    setShift(date, member, e.target.value)
                                  }
                                  displayEmpty
                                >
                                  <MenuItem value="">
                                    <em>Keine</em>
                                  </MenuItem>
                                  {shiftList.map((shift) => (
                                    <MenuItem
                                      key={shift.value}
                                      value={shift.value}
                                    >
                                      {shift.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                              <Button
                                color="error"
                                size="small"
                                onClick={() => deleteShift(date, member)}
                              >
                                Löschen
                              </Button>
                              <Button
                                size="small"
                                onClick={() =>
                                  setEditCell({ date: null, member: null })
                                }
                              >
                                Abbrechen
                              </Button>
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                sx={{ flexGrow: 1, cursor: "pointer" }}
                                onClick={() =>
                                  setEditCell({
                                    date: date.format("YYYY-MM-DD"),
                                    member,
                                  })
                                }
                              >
                                {shiftValue ? (
                                  shiftList.find((s) => s.value === shiftValue)
                                    ?.label
                                ) : (
                                  <span style={{ color: "#bbb" }}>–</span>
                                )}
                              </Typography>
                              {shiftValue && (
                                <Button
                                  color="error"
                                  size="small"
                                  onClick={() => deleteShift(date, member)}
                                >
                                  Löschen
                                </Button>
                              )}
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
