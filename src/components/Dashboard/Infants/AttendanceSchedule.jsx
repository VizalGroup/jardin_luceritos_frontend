import { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from "react-icons/fa";
import { capitalizeName, generateDynamicTimeSlots, normalizeText } from "../../../utils";

export default function AttendanceSchedule({ infants }) {
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dayNames = {
    Monday: "Lunes",
    Tuesday: "Martes",
    Wednesday: "Miércoles",
    Thursday: "Jueves",
    Friday: "Viernes",
  };

  const getCurrentDayIndex = () => {
    const day = new Date().getDay();
    const mapping = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 0: 0, 6: 0 };
    return mapping[day] ?? 0;
  };

  const [currentDayIndex, setCurrentDayIndex] = useState(getCurrentDayIndex());
  const [location, setLocation] = useState(0);

  const currentDay = daysOfWeek[currentDayIndex];

  const locationFilteredInfants = infants.filter(
    (infant) => parseInt(infant.location) === location
  );

  const countByLocation = (loc) =>
    infants.filter((infant) => parseInt(infant.location) === loc).length;

  const timeSlots = generateDynamicTimeSlots(locationFilteredInfants, currentDay);

  const getChildrenPresentAtTime = (time) => {
    const toMin = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    return locationFilteredInfants.filter((child) => {
      const day = child.schedule?.[currentDay];
      if (!day?.entry || !day?.exit) return false;
      const cur = toMin(time);
      return cur >= toMin(day.entry) && cur < toMin(day.exit);
    });
  };

  const getEventsAtTime = (time) => {
    const events = [];
    locationFilteredInfants.forEach((child) => {
      const day = child.schedule?.[currentDay];
      if (!day?.entry || !day?.exit) return;
      if (day.entry === time) events.push({ type: "entry", child });
      if (day.exit === time) events.push({ type: "exit", child });
    });
    return events;
  };

  const prevDay = () =>
    setCurrentDayIndex((p) => (p - 1 + daysOfWeek.length) % daysOfWeek.length);
  const nextDay = () =>
    setCurrentDayIndex((p) => (p + 1) % daysOfWeek.length);

  return (
    <div className="as-wrapper">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "4px" }}>
        <h3 className="module-title mb-0">
          <FaCalendarAlt className="me-2" />
          Cronograma de Asistencia
        </h3>
        <div style={{ display: "flex", gap: "8px" }}>
          {[{ label: "Sede Laplace", value: 0 }, { label: "Sede Docta", value: 1 }].map((sede) => (
            <button
              key={sede.value}
              onClick={() => setLocation(sede.value)}
              style={{
                padding: "6px 16px",
                borderRadius: "8px",
                border: "2px solid #213472",
                fontWeight: "600",
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                backgroundColor: location === sede.value ? "#213472" : "transparent",
                color: location === sede.value ? "#fff5ed" : "#213472",
              }}
            >
              {sede.label}{" "}
              <span style={{
                display: "inline-block",
                backgroundColor: location === sede.value ? "#fff5ed" : "#213472",
                color: location === sede.value ? "#213472" : "#fff5ed",
                borderRadius: "10px",
                padding: "0 7px",
                fontSize: "0.8rem",
                fontWeight: "700",
                marginLeft: "4px",
              }}>
                {countByLocation(sede.value)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Navegación de días */}
      <div className="as-day-nav">
        <button
          className="as-nav-btn"
          onClick={prevDay}
          disabled={currentDayIndex === 0}
        >
          <FaChevronLeft />
        </button>
        <span className="as-day-title">{dayNames[currentDay]}</span>
        <button
          className="as-nav-btn"
          onClick={nextDay}
          disabled={currentDayIndex === daysOfWeek.length - 1}
        >
          <FaChevronRight />
        </button>
      </div>

      {locationFilteredInfants.length === 0 ? (
        <p className="text-center text-muted py-3">No se encontraron niños.</p>
      ) : timeSlots.length === 0 ? (
        <p className="text-center text-muted py-3">
          No hay horarios programados para {dayNames[currentDay]}.
        </p>
      ) : (
        <div className="as-schedule-list">
          {timeSlots.map((time) => {
            const events = getEventsAtTime(time);
            const entryEvents = events.filter((e) => e.type === "entry");
            const exitEvents = events.filter((e) => e.type === "exit");
            const present = getChildrenPresentAtTime(time);

            return (
              <div key={time} className="as-time-row">
                <div className="as-time-label">
                  {time}
                  {present.length > 0 && (
                    <span className="as-count">({present.length})</span>
                  )}
                </div>
                <div className="as-children-list">
                  {events.length > 0 ? (
                    <>
                      {entryEvents.map((ev, i) => (
                        <span key={`entry-${ev.child.id}`} className="as-child-entry">
                          {capitalizeName(ev.child.lastname)},{" "}
                          {capitalizeName(ev.child.first_name)}
                          {i < entryEvents.length - 1 && ", "}
                        </span>
                      ))}
                      {entryEvents.length > 0 && exitEvents.length > 0 && "  "}
                      {exitEvents.map((ev, i) => (
                        <span key={`exit-${ev.child.id}`} className="as-child-exit">
                          {capitalizeName(ev.child.lastname)},{" "}
                          {capitalizeName(ev.child.first_name)}
                          {i < exitEvents.length - 1 && ", "}
                        </span>
                      ))}
                    </>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
