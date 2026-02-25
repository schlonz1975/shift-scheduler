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
  // State for add/edit member dialogs
  const [addMemberOpen, setAddMemberOpen] = React.useState(false);
  const [editMemberIdx, setEditMemberIdx] = React.useState(null);
  const [memberNameInput, setMemberNameInput] = React.useState("");

  // Add member handler
  const handleAddMember = () => {
    const name = memberNameInput.trim();
    if (name && !team.includes(name)) {
      setTeam([...team, name]);
      setMemberNameInput("");
      setAddMemberOpen(false);
    }
  };

  // Edit member handler
  const handleEditMember = () => {
    const name = memberNameInput.trim();
    if (name && !team.includes(name)) {
      setTeam(team.map((m, i) => (i === editMemberIdx ? name : m)));
      setEvents(
        events.map((e) =>
          e.member === team[editMemberIdx] ? { ...e, member: name } : e,
        ),
      );
      setMemberNameInput("");
      setEditMemberIdx(null);
    }
  };

  // Delete member handler
  const handleDeleteMember = (idx) => {
    const member = team[idx];
    setTeam(team.filter((_, i) => i !== idx));
    setEvents(events.filter((e) => e.member !== member));
  };
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
          {/* Add Member Dialog */}
          <Dialog open={addMemberOpen} onClose={() => setAddMemberOpen(false)}>
            <DialogTitle>Mitglied hinzufügen</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Name"
                fullWidth
                value={memberNameInput}
                onChange={(e) => setMemberNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddMember();
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAddMemberOpen(false)}>Abbrechen</Button>
              <Button onClick={handleAddMember} variant="contained">
                Hinzufügen
              </Button>
            </DialogActions>
          </Dialog>

          {/* Edit Member Dialog */}
          <Dialog
            open={editMemberIdx !== null}
            onClose={() => setEditMemberIdx(null)}
          >
            <DialogTitle>Mitglied bearbeiten</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Name"
                fullWidth
                value={memberNameInput}
                onChange={(e) => setMemberNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEditMember();
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditMemberIdx(null)}>Abbrechen</Button>
              <Button onClick={handleEditMember} variant="contained">
                Speichern
              </Button>
            </DialogActions>
          </Dialog>

          {/* Week Navigation & Add Member */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              mb: 2,
              mt: 2,
            }}
          >
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() =>
                  setSelectedWeek((prev) =>
                    moment(prev).subtract(1, "week").startOf("isoWeek"),
                  )
                }
              >
                Vorherige Woche
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setSelectedWeek(moment().startOf("isoWeek"))}
              >
                Diese Woche
              </Button>
              <Button
                variant="outlined"
                onClick={() =>
                  setSelectedWeek((prev) =>
                    moment(prev).add(1, "week").startOf("isoWeek"),
                  )
                }
              >
                Nächste Woche
              </Button>
            </Box>
            <Button
              variant="outlined"
              color="success"
              onClick={() => {
                setAddMemberOpen(true);
                setMemberNameInput("");
              }}
            >
              + Mitglied
            </Button>
          </Box>
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
              background: "#232936",
              borderRadius: 16,
              boxShadow: "0 4px 32px #000a",
              overflow: "hidden",
              border: "1px solid #232936",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    minWidth: 80,
                    maxWidth: 120,
                    width: 80,
                    background: "#232936",
                    color: "#bfc7d5",
                    border: "1px solid #232936",
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
                                    ? "#2d3a53"
                                    : "#232936",
                                  color: "#bfc7d5",
                                  border: "1px solid #232936",
                                  fontWeight: 700,
                                  fontSize: 16,
                                  padding: 12,
                                  letterSpacing: 1,
                                  textAlign: "center",
                                  boxShadow: snapshot.isDragging
                                    ? "0 2px 8px #23293688"
                                    : undefined,
                                  transition: "background 0.2s",
                                  position: "relative",
                                  ...provided.draggableProps.style,
                                }}
                              >
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 6,
                                  }}
                                >
                                  {member}
                                  <Button
                                    size="small"
                                    sx={{ minWidth: 0, color: "#fff", ml: 1 }}
                                    onClick={() => {
                                      setEditMemberIdx(idx);
                                      setMemberNameInput(member);
                                    }}
                                  >
                                    <span role="img" aria-label="edit">
                                      ✎
                                    </span>
                                  </Button>
                                  <Button
                                    size="small"
                                    sx={{ minWidth: 0, color: "#fff" }}
                                    onClick={() => handleDeleteMember(idx)}
                                  >
                                    <span role="img" aria-label="delete">
                                      🗑️
                                    </span>
                                  </Button>
                                </span>
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
                  style={{ background: idx % 2 === 0 ? "#232936" : "#181c24" }}
                >
                  <td
                    style={{
                      border: "1px solid #232936",
                      padding: 12,
                      fontWeight: 600,
                      background: "#232936",
                      minWidth: 80,
                      maxWidth: 120,
                      width: 80,
                      height: 48,
                      color: "#bfc7d5",
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
                          border: "1px solid #232936",
                          minWidth: colWidth,
                          maxWidth: colWidth,
                          width: colWidth,
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          height: 48,
                          background: isEditing ? "#2d3a53" : "#181c24",
                          color: "#bfc7d5",
                          fontSize: 15,
                          cursor: "pointer",
                          transition: "background 0.2s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.background = "#232936")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.background = isEditing
                            ? "#2d3a53"
                            : "#181c24")
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
                              color: "#bfc7d5",
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
                              <span style={{ color: "#444a" }}>–</span>
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
