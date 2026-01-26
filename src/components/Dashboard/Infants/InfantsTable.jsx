import React, { useState } from "react";
import { Table, ButtonGroup, Button } from "react-bootstrap";
import {
  FaBirthdayCake,
  FaChild,
  FaIdCard,
  FaReceipt,
  FaUserEdit,
  // FaUsers,
  FaClock,
} from "react-icons/fa";
import Pagination from "../../Pagination";
import {
  calculateAge,
  capitalizeName,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDNI,
} from "../../../utils";
import EditInfant from "./EditInfant";
import LinkFamily from "./LinkFamily";

// Función para formatear números eliminando los .00
const formatNumber = (number) => {
  const num = parseFloat(number);

  if (
    num % 1 === 0 ||
    (num.toString().includes(".") && /\.0+$/.test(num.toString()))
  ) {
    return Math.floor(num);
  }

  return num;
};

// Función para calcular las horas de un día específico
const calculateDayHours = (entry, exit) => {
  if (!entry || !exit) return 0;

  const [entryHour, entryMinute] = entry.split(":").map(Number);
  const [exitHour, exitMinute] = exit.split(":").map(Number);

  const entryTotalMinutes = entryHour * 60 + entryMinute;
  const exitTotalMinutes = exitHour * 60 + exitMinute;

  const totalMinutes = exitTotalMinutes - entryTotalMinutes;
  return totalMinutes / 60;
};

// Función para calcular el total de horas semanales
const calculateWeeklyHours = (schedule) => {
  if (!schedule) return 0;

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  let totalHours = 0;

  daysOfWeek.forEach((day) => {
    if (schedule[day] && schedule[day].entry && schedule[day].exit) {
      totalHours += calculateDayHours(schedule[day].entry, schedule[day].exit);
    }
  });

  return totalHours;
};

// Función para calcular el total de horas mensuales (basado en 20 días hábiles)
const calculateMonthlyHours = (schedule) => {
  const weeklyHours = calculateWeeklyHours(schedule);
  return weeklyHours * 4;
};

// Función para formatear el horario semanal
const formatWeeklySchedule = (schedule) => {
  if (!schedule) return "Sin horario definido";

  const daysOfWeek = [
    { en: "Monday", es: "Lun" },
    { en: "Tuesday", es: "Mar" },
    { en: "Wednesday", es: "Mié" },
    { en: "Thursday", es: "Jue" },
    { en: "Friday", es: "Vie" },
  ];

  const activeDays = daysOfWeek.filter(
    (day) => schedule[day.en] && schedule[day.en].entry && schedule[day.en].exit
  );

  if (activeDays.length === 0) return "Sin horario definido";

  // Agrupar días con el mismo horario
  const scheduleGroups = {};
  activeDays.forEach((day) => {
    const timeSlot = `${schedule[day.en].entry}-${schedule[day.en].exit}`;
    if (!scheduleGroups[timeSlot]) {
      scheduleGroups[timeSlot] = [];
    }
    scheduleGroups[timeSlot].push(day.es);
  });

  // Formatear la salida
  const formattedSchedule = Object.entries(scheduleGroups)
    .map(([timeSlot, days]) => {
      return `${days.join(", ")}: ${timeSlot}`;
    })
    .join("\n");

  return formattedSchedule;
};

export default function InfantsTable({ infants, searchTerm }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("1");
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const familyLinks = useSelector((state) => state.family_relationships);

  // Función para normalizar texto (eliminar acentos)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Manejar el cambio de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Manejar el cambio en el filtro de estado
  const handleStatusChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  // Contar los registros por estado
  const countByStatus =
    infants && infants.length > 0
      ? {
          1: infants.filter((infant) => infant.current_state == 1).length,
          2: infants.filter((infant) => infant.current_state == 2).length,
          0: infants.filter((infant) => infant.current_state == 0).length,
        }
      : { 1: 0, 2: 0, 0: 0 };

  // Filtrar los infantes por término de búsqueda y estado
  const filtered =
    infants && infants.length > 0
      ? infants
          .filter((infant) => {
            const fullName = `${infant.first_name} ${infant.lastname}`;
            const normalizedFullName = normalizeText(fullName);
            const normalizedSearchTerm = normalizeText(searchTerm);
            return normalizedFullName.includes(normalizedSearchTerm);
          })
          .filter((infant) => {
            if (filterStatus === "1") return infant.current_state == 1;
            if (filterStatus === "2") return infant.current_state == 2;
            if (filterStatus === "0") return infant.current_state == 0;
            return true;
          })
      : [];

  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <>
      {/* Filtros */}
      <div className="row mb-4">
        <div className="col-12">
          <div
            style={{
              padding: "10px",
              borderRadius: "8px",
              overflowX: "auto",
            }}
          >
            <ButtonGroup className="w-100">
              <Button
                variant={filterStatus === "1" ? "success" : "outline-success"}
                onClick={() => handleStatusChange("1")}
              >
                Inscriptos ({countByStatus["1"]})
              </Button>
              <Button
                variant={filterStatus === "2" ? "primary" : "outline-primary"}
                onClick={() => handleStatusChange("2")}
              >
                Pendientes de validar ({countByStatus["2"]})
              </Button>
              <Button
                variant={filterStatus === "0" ? "danger" : "outline-danger"}
                onClick={() => handleStatusChange("0")}
              >
                Inactivos y/o Egresados ({countByStatus["0"]})
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </div>

      {/* Paginación */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <div style={{ overflowX: "auto" }}>
        <Table striped bordered hover style={{ textAlign: "center" }}>
          <thead>
            <tr>
              <th>
                <FaChild title="Apellido y nombre" />
              </th>
              <th>
                <FaIdCard title="Documento / Pasaporte" /> Documento / Pasaporte
              </th>
              <th>
                <FaBirthdayCake title="Fecha de Nacimiento" /> Fecha de
                Nacimiento
              </th>
              <th>
                <FaClock title="Horario Semanal" /> Horario Semanal
              </th>
              <th>
                <FaReceipt title="Tarifa (Horas y Costo)" /> Tarifa/hora
              </th>
              {/* <th>
                <FaUsers title="Padres/tutores" /> Padres/Tutores
              </th> */}
              <th>
                <FaUserEdit title="Última actualización" /> Última actualización
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((infant) => {
                const monthlyHours = calculateMonthlyHours(infant.schedule);
                const scheduleDisplay = formatWeeklySchedule(infant.schedule);

                return (
                  <tr key={infant.id}>
                    <td>{`${capitalizeName(infant.lastname)}, ${capitalizeName(
                      infant.first_name
                    )}`}</td>
                    <td>{formatDNI(infant.document_number) || "N/A"}</td>
                    <td>
                      {formatDate(infant.birthdate)}
                      <br />
                      <span style={{ fontSize: "0.9em", color: "gray" }}>
                        ({calculateAge(infant.birthdate)})
                      </span>
                    </td>
                    <td
                      style={{
                        fontSize: "0.85em",
                        whiteSpace: "pre-line",
                        lineHeight: "1.3",
                      }}
                    >
                      {scheduleDisplay}
                    </td>
                    <td
                      style={{
                        color:
                          infant.tariff &&
                          parseFloat(infant.tariff.number_of_hours) === 0
                            ? "green"
                            : "black",
                      }}
                    >
                      {infant.tariff &&
                      parseFloat(infant.tariff.number_of_hours) === 0 ? (
                        "Becado/a"
                      ) : (
                        <>
                          {formatCurrency(
                            infant.tariff ? infant.tariff.price : 0
                          )}{" "}
                          <br />
                          {infant.tariff && infant.tariff.number_of_hours > 1 && (
                            <span style={{ fontSize: "0.9em", color: "gray" }}>
                              (
                              {infant.tariff
                                ? formatNumber(infant.tariff.number_of_hours)
                                : "N/A"}{" "}
                              horas)
                            </span>
                          )}
                        </>
                      )}
                    </td>

                    {/* Columna de padres/tutores comentada temporalmente */}
                    {/* <td>
                      {familyLinks.some(
                        (link) => link.id_infant === infant.id
                      ) ? (
                        familyLinks
                          .filter((link) => link.id_infant === infant.id)
                          .map((link, index) => (
                            <span key={index}>
                              {capitalizeName(link.user.user_last_name)},{" "}
                              {capitalizeName(link.user.first_name)}
                              <br />
                            </span>
                          ))
                      ) : (
                        <span style={{ color: "red" }}>
                          Sin familiares vinculados
                        </span>
                      )}
                    </td> */}
                    
                    <td>
                      {`${infant.user ? capitalizeName(infant.user.first_name) : ""} ${
                        infant.user ? capitalizeName(infant.user.lastname) : ""
                      }`}
                      <br />
                      {formatDateTime(infant.last_update)}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <EditInfant infant={infant} />
                        <LinkFamily infant={infant} />
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7">No se encontraron registros</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Paginación inferior (solo si hay más de 1 página) */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
