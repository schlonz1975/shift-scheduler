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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  if (!val) return "";
  if (val === "abwesend") return "Abwesend";
  if (/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(val)) return val;
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
  { label: "Abwesend", value: "abwesend" },
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
  // All useState hooks at the top
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
  const [editValue, setEditValue] = React.useState("");

  // Helper: get array of dates for the current week (Monday to Friday)
  const weekDates = React.useMemo(() => {
    return Array.from({ length: 5 }, (_, i) =>
      moment(selectedWeek).add(i, "days"),
    );
  }, [selectedWeek]);

  // Helper: get shift value for a given date and member
  function getShift(date, member) {
    const found = events.find(
      (e) => moment(e.date).isSame(date, "day") && e.member === member,
    );
    return found ? found.shift : "";
  }

  // Helper: delete shift for a given date and member
  function deleteShift(date, member) {
    setEvents((prev) =>
      prev.filter(
        (e) => !(moment(e.date).isSame(date, "day") && e.member === member),
      ),
    );
  }

  const handleAddCustomShift = () => {
    if (customShift && !shiftList.some((s) => s.label === customShift)) {
      setShiftList([...shiftList, { label: customShift, value: customShift }]);
      setCustomShift("");
    }
  };

  // Use German weekday abbreviations, Monday to Friday
  const germanWeekdays = ["Mo", "Di", "Mi", "Do", "Fr"];

  // Calculate the width needed for the longest team member name
  const longestNameLength = Math.max(...team.map((name) => name.length), 6); // at least 6 for header
  // Estimate width: 1ch = width of '0', add some padding
  const colWidth = Math.max(100, longestNameLength * 14 + 32); // 14px per char + 32px padding

  // ...existing code...

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="de">
        <Container>
          {/* Shift Edit Dialog */}
          <Dialog
            open={!!editCell.date}
            onClose={() => setEditCell({ date: null, member: null })}
          >
            <DialogTitle>Schicht bearbeiten</DialogTitle>
            <DialogContent>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <Select
                  value={editValue || ""}
                  onChange={(e) => setEditValue(e.target.value)}
                  displayEmpty
                >
                  {shiftList.map((shift) => (
                    <MenuItem key={shift.value} value={shift.value}>
                      {shift.label}
                    </MenuItem>
                  ))}
                  <MenuItem value="custom">Benutzerdefiniert…</MenuItem>
                </Select>
              </FormControl>
              {editValue === "custom" && (
                <TextField
                  autoFocus
                  margin="dense"
                  label="Eigene Schicht (z.B. 10-14)"
                  fullWidth
                  value={customShift}
                  onChange={(e) => setCustomShift(e.target.value)}
                  onBlur={handleAddCustomShift}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditCell({ date: null, member: null })}>
                Abbrechen
              </Button>
              <Button
                onClick={() => {
                  if (editCell.date && editCell.member) {
                    const valueToSave =
                      editValue === "custom" ? customShift : editValue;
                    setEvents((prev) => {
                      // Remove old event for this cell
                      const filtered = prev.filter(
                        (e) =>
                          !(
                            e.date === editCell.date &&
                            e.member === editCell.member
                          ),
                      );
                      // Add new if value is not empty
                      if (valueToSave) {
                        return [
                          ...filtered,
                          {
                            date: editCell.date,
                            member: editCell.member,
                            shift: valueToSave,
                          },
                        ];
                      }
                      return filtered;
                    });
                  }
                  setEditCell({ date: null, member: null });
                  setEditValue("");
                  setCustomShift("");
                }}
                variant="contained"
              >
                Speichern
              </Button>
            </DialogActions>
          </Dialog>

          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              background: "#f6f8fa",
              borderRadius: 12,
              boxShadow: "0 2px 12px #0001",
              overflow: "hidden",
              border: "1px solid #e0e4ea",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    minWidth: 80,
                    maxWidth: 120,
                    width: 80,
                    background: "#1976d2",
                    color: "#fff",
                    border: "1px solid #e0e4ea",
                    fontWeight: 700,
                    fontSize: 16,
                    padding: 12,
                    letterSpacing: 1,
                    textAlign: "left",
                  }}
                ></th>
                {/* Drag-and-drop team header */}
                <DragDropContext
                  onDragEnd={(result) => {
                    if (!result.destination) return;
                    const reordered = Array.from(team);
                    const [removed] = reordered.splice(result.source.index, 1);
                    reordered.splice(result.destination.index, 0, removed);
                    setTeam(reordered);
                  }}
                >
                  <Droppable
                    droppableId="team-droppable"
                    direction="horizontal"
                  >
                    {(provided) => (
                      <React.Fragment>
                        {team.map((member, idx) => (
                          <Draggable
                            key={member}
                            draggableId={member}
                            index={idx}
                          >
                            {(provided, snapshot) => (
                              <th
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  minWidth: colWidth,
                                  maxWidth: colWidth,
                                  width: colWidth,
                                  background: snapshot.isDragging
                                    ? "#1565c0"
                                    : "#2196f3",
                                  color: "#fff",
                                  border: "1px solid #e0e4ea",
                                  fontWeight: 700,
                                  fontSize: 16,
                                  padding: 12,
                                  letterSpacing: 1,
                                  textAlign: "center",
                                  boxShadow: snapshot.isDragging
                                    ? "0 2px 8px #1976d244"
                                    : undefined,
                                  transition: "background 0.2s",
                                  ...provided.draggableProps.style,
                                }}
                              >
                                {member}
                              </th>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </React.Fragment>
                    )}
                  </Droppable>
                </DragDropContext>
              </tr>
            </thead>
            <tbody>
              {weekDates.map((date, idx) => (
                <tr
                  key={date.format("YYYY-MM-DD")}
                  style={{ background: idx % 2 === 0 ? "#fff" : "#f6f8fa" }}
                >
                  <td
                    style={{
                      border: "1px solid #e0e4ea",
                      padding: 12,
                      fontWeight: 600,
                      background: "#e3eafc",
                      minWidth: 80,
                      maxWidth: 120,
                      width: 80,
                      height: 48,
                      color: "#222",
                      fontSize: 15,
                    }}
                  >
                    {germanWeekdays[idx]}, {date.format("DD.MM.YYYY")}
                  </td>
                  {team.map((member) => {
                    const isEditing =
                      editCell.date === date.format("YYYY-MM-DD") &&
                      editCell.member === member;
                    const shiftValue = getShift(date, member);
                    return (
                      <td
                        key={member}
                        style={{
                          border: "1px solid #e0e4ea",
                          minWidth: colWidth,
                          maxWidth: colWidth,
                          width: colWidth,
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          height: 48,
                          background: isEditing ? "#e3f2fd" : "#fff",
                          color: "#222",
                          fontSize: 15,
                          cursor: "pointer",
                          transition: "background 0.2s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.background = "#f0f7ff")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.background = isEditing
                            ? "#e3f2fd"
                            : "#fff")
                        }
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
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
                              color: "#222",
                              fontWeight: 500,
                            }}
                            onClick={() => {
                              setEditCell({
                                date: date.format("YYYY-MM-DD"),
                                member,
                              });
                              setEditValue(shiftValue || "");
                            }}
                          >
                            {shiftValue ? (
                              formatShiftValue(
                                shiftList.find((s) => s.value === shiftValue)
                                  ?.value || shiftValue,
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
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
