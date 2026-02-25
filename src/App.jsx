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
  Button,
  TextField,
} from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

import moment from "moment";
import "moment/locale/de";

moment.locale("de");

const theme = createTheme({});

// Helper to format shift values as HH:mm-HH:mm
function formatShiftValue(val) {
  // Accepts formats like "8-16", "9_30-18", "08:00-16:00", etc.
  if (!val) return "";
  // If already in HH:mm-HH:mm, return as is
  if (/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(val)) return val;
  // Parse e.g. 8-16, 9_30-18, 8-9_30, 16-18
  const [start, end] = val.split("-");
  function parseTime(t) {
    if (!t) return "";
    if (t.includes(":")) return t.padStart(5, "0");
    if (t.includes("_")) {
      const [h, m] = t.split("_");
      return `${h.padStart(2, "0")}:${m.padEnd(2, "0")}`;
    }
    return `${t.padStart(2, "0")}:00`;
  }
  return `${parseTime(start)}-${parseTime(end)}`;
}

const defaultShifts = [
  { label: "08:00-16:00", value: "8-16" },
  { label: "09:30-18:00", value: "9_30-18" },
  { label: "08:00-09:30", value: "8-9_30" },
  { label: "16:00-18:00", value: "16-18" },
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

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(team);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setTeam(reordered);
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
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              Team-Reihenfolge: (per Drag & Drop Spaltenkopf)
            </Typography>
          </Box>
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
            <DragDropContext onDragEnd={onDragEnd}>
              <Box
                component="table"
                sx={{
                  minWidth: team.length * 160 + 120,
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
                        minWidth: 140,
                        bgcolor: "#f0f0f0",
                        height: 48,
                      }}
                    >
                      Datum
                    </Box>
                    <Droppable
                      droppableId="team-droppable"
                      direction="horizontal"
                    >
                      {(provided) => [
                        ...team.map((member, idx) => (
                          <Draggable
                            key={member}
                            draggableId={member}
                            index={idx}
                          >
                            {(provided, snapshot) => (
                              <Box
                                component="th"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  border: "1px solid #ccc",
                                  p: 1,
                                  minWidth: 140,
                                  bgcolor: snapshot.isDragging
                                    ? "#e0e0e0"
                                    : "#f0f0f0",
                                  cursor: "grab",
                                  height: 48,
                                }}
                              >
                                {member}
                              </Box>
                            )}
                          </Draggable>
                        )),
                        provided.placeholder,
                      ]}
                    </Droppable>
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
                          height: 44,
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
                            key={member}
                            component="td"
                            sx={{
                              border: "1px solid #ccc",
                              p: 1,
                              minWidth: 140,
                              maxWidth: 160,
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis",
                              height: 44,
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
                                <FormControl
                                  size="small"
                                  sx={{ minWidth: 100 }}
                                >
                                  <Select
                                    value={
                                      shiftList.some(
                                        (s) => s.value === shiftValue,
                                      )
                                        ? shiftValue
                                        : shiftValue
                                          ? "__custom__"
                                          : ""
                                    }
                                    onChange={(e) => {
                                      if (e.target.value === "__custom__") {
                                        setShift(date, member, "");
                                      } else {
                                        setShift(date, member, e.target.value);
                                      }
                                    }}
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
                                    <MenuItem value="__custom__">
                                      Eigene Schicht...
                                    </MenuItem>
                                  </Select>
                                </FormControl>
                                {/* Custom shift input if needed */}
                                {!shiftList.some(
                                  (s) => s.value === shiftValue,
                                ) &&
                                (shiftValue ||
                                  (editCell.date ===
                                    date.format("YYYY-MM-DD") &&
                                    editCell.member === member)) ? (
                                  <TextField
                                    size="small"
                                    value={shiftValue}
                                    onChange={(e) =>
                                      setShift(date, member, e.target.value)
                                    }
                                    placeholder="Eigene Schicht"
                                    sx={{ minWidth: 80 }}
                                    autoFocus
                                  />
                                ) : null}
                                <Button
                                  color="error"
                                  size="small"
                                  onClick={() => deleteShift(date, member)}
                                  sx={{ minWidth: 0, px: 1 }}
                                >
                                  ×
                                </Button>
                                <Button
                                  size="small"
                                  onClick={() =>
                                    setEditCell({ date: null, member: null })
                                  }
                                  sx={{ minWidth: 0, px: 1 }}
                                >
                                  ✓
                                </Button>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  width: "100%",
                                  overflow: "hidden",
                                }}
                              >
                                <Typography
                                  sx={{
                                    flexGrow: 1,
                                    cursor: "pointer",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                  }}
                                  onClick={() =>
                                    setEditCell({
                                      date: date.format("YYYY-MM-DD"),
                                      member,
                                    })
                                  }
                                >
                                  {shiftValue ? (
                                    formatShiftValue(
                                      shiftList.find(
                                        (s) => s.value === shiftValue,
                                      )?.value || shiftValue,
                                    )
                                  ) : (
                                    <span style={{ color: "#bbb" }}>–</span>
                                  )}
                                </Typography>
                                {shiftValue && (
                                  <Button
                                    color="error"
                                    size="small"
                                    onClick={() => deleteShift(date, member)}
                                    sx={{ minWidth: 0, px: 1 }}
                                  >
                                    ×
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
            </DragDropContext>
          </Box>
        </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
