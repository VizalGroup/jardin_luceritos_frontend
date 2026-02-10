import { Button, Modal, Form } from "react-bootstrap";
import { useState } from "react";
import { selectActiveInfantsOrderedByLastName } from "../../../redux/selectors";
import {
  formatDate,
  formatDNI,
  calculateAge,
  capitalizeName,
  getRoomName,
  getLocationName,
} from "../../../utils";
import { FaFilePdf, FaPrint } from "react-icons/fa";
import { useSelector } from "react-redux";

export default function InfantListPDF() {
  const infants = useSelector(selectActiveInfantsOrderedByLastName);
  const familyLinks = useSelector((state) => state.family_relationships);

  const [showModal, setShowModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Todas");
  const [selectedRoom, setSelectedRoom] = useState("Todas");

  const locations = [
    { code: "Todas", name: "Todas las Sedes" },
    { code: 0, name: "Sede Laplace" },
    { code: 1, name: "Sede Docta" },
  ];

  const rooms = [
    { code: "Todas", name: "Todas las Salas" },
    { code: 0, name: "Desconocida" },
    { code: 1, name: "Semillitas (bebés)" },
    { code: 2, name: "Primeros pasos (1 año)" },
    { code: 3, name: "Exploradores (2 años)" },
    { code: 4, name: "Pequeños expertos (3 años)" },
  ];

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedLocation("Todas");
    setSelectedRoom("Todas");
  };

  const getParentNames = (infantId) => {
    const links = familyLinks.filter((link) => link.infant_id === infantId);
    console.log(links);

    if (links.length === 0) return "Sin familiares vinculados";
    return links
      .map(
        (link) =>
          `${capitalizeName(
            link.user.user_last_name,
          )}, ${capitalizeName(link.user.first_name)}`,
      )
      .join(" / ");
  };

  const getFilteredInfants = () => {
    let filtered = [...infants];

    // Filtrar por sede
    if (selectedLocation !== "Todas") {
      filtered = filtered.filter(
        (infant) => parseInt(infant.location) === selectedLocation,
      );
    }

    // Filtrar por sala
    if (selectedRoom !== "Todas") {
      filtered = filtered.filter(
        (infant) => parseInt(infant.room) === selectedRoom,
      );
    }

    // Ordenar alfabéticamente por apellido
    return filtered.sort((a, b) =>
      capitalizeName(a.lastname).localeCompare(capitalizeName(b.lastname)),
    );
  };

  const formatSchedule = (schedule) => {
    if (!schedule) return "Sin horario";

    const daysMap = {
      Monday: "Lun",
      Tuesday: "Mar",
      Wednesday: "Mié",
      Thursday: "Jue",
      Friday: "Vie",
    };

    // Agrupar días por el mismo horario
    const scheduleGroups = {};

    Object.entries(schedule).forEach(([day, hours]) => {
      if (hours && hours.entry && hours.exit) {
        const timeSlot = `${hours.entry}-${hours.exit}`;
        if (!scheduleGroups[timeSlot]) {
          scheduleGroups[timeSlot] = [];
        }
        scheduleGroups[timeSlot].push(daysMap[day]);
      }
    });

    if (Object.keys(scheduleGroups).length === 0) return "Sin horario";

    // Formatear la salida: "Días: horario"
    const formattedSchedule = Object.entries(scheduleGroups)
      .map(([timeSlot, days]) => `${days.join(", ")}: ${timeSlot}`)
      .join(" | ");

    return formattedSchedule;
  };

  const handlePrint = () => {
    const filteredInfants = getFilteredInfants();

    if (filteredInfants.length === 0) {
      alert("No hay infantes con los filtros seleccionados");
      return;
    }

    const printWindow = window.open("", "_blank");

    const locationText =
      selectedLocation === "Todas"
        ? "Todas las Sedes"
        : locations.find((l) => l.code === selectedLocation)?.name;

    const roomText =
      selectedRoom === "Todas"
        ? "Todas las Salas"
        : rooms.find((r) => r.code === selectedRoom)?.name;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lista de Infantes - ${locationText} - ${roomText}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            body { 
              padding: 20px; 
              font-family: Arial, sans-serif;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #213472;
              padding-bottom: 20px;
            }
            .header h2 {
              margin-bottom: 10px;
              color: #213472;
            }
            .header h4 {
              margin-bottom: 5px;
              color: #333;
            }
            table {
              width: 100%;
              margin-top: 20px;
              font-size: 10px;
            }
            th {
              background-color: #213472;
              color: #213472;
              padding: 10px 8px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #213472;
            }
            td {
              padding: 8px 8px;
              border: 1px solid #ccc;
            }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 2px solid #213472;
            }
            @media print {
              button { display: none; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              thead { display: table-header-group; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Jardín Luceritos</h2>
            <h4>Lista de Infantes</h4>
            <p style="margin: 5px 0; color: #666;">${locationText} - ${roomText}</p>
            <p style="margin: 5px 0; color: #666;">${new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
          
          <table class="table table-bordered">
            <thead>
              <tr>
                <th style="width: 20%;">Apellido y Nombre</th>
                <th style="width: 12%;">DNI</th>
                <th style="width: 15%;">Fecha de Nac. / Edad</th>
                <th style="width: 13%;">Sede / Sala</th>
                <th style="width: 15%;">Horario</th>
                <th style="width: 25%;">Padre/Madre/Tutor</th>
              </tr>
            </thead>
            <tbody>
              ${filteredInfants
                .map(
                  (infant) => `
                <tr>
                  <td>
                    <strong>${capitalizeName(infant.lastname)}, ${capitalizeName(infant.first_name)}</strong>
                  </td>
                  <td>${formatDNI(infant.document_number) || "Sin documento"}</td>
                  <td>
                    ${formatDate(infant.birthdate)}
                    <br/>
                    <small style="color: #666;">(${calculateAge(infant.birthdate)})</small>
                  </td>
                  <td>
                    ${getLocationName(infant.location)}
                    <br/>
                    <small style="color: #666;">${getRoomName(infant.room)}</small>
                  </td>
                  <td>
                    <small>${formatSchedule(infant.schedule)}</small>
                  </td>
                  <td>
                    <small>${getParentNames(infant.id)}</small>
                  </td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="footer">
            <p><strong>Total de infantes: ${filteredInfants.length}</strong></p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;" class="no-print">
            <button class="btn btn-primary" onclick="window.print()">Imprimir</button>
            <button class="btn btn-secondary ms-2" onclick="window.close()">Cerrar</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <>
      <Button className="button-custom" onClick={handleOpenModal} >
        <FaPrint style={{ marginRight: "5px" }} /> Descargar Lista de Infantes
      </Button>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Generar Lista de Infantes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">1. Seleccionar Sede</Form.Label>
              <div className="d-grid gap-2">
                {locations.map((location) => (
                  <Button
                    key={location.code}
                    className={
                      selectedLocation === location.code
                        ? "button-custom"
                        : "button-custom-outline"
                    }
                    onClick={() => setSelectedLocation(location.code)}
                  >
                    {location.name}
                  </Button>
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">2. Seleccionar Sala</Form.Label>
              <div className="d-grid gap-2">
                {rooms.map((room) => (
                  <Button
                    key={room.code}
                    className={
                      selectedRoom === room.code
                        ? "button-custom"
                        : "button-custom-outline"
                    }
                    onClick={() => setSelectedRoom(room.code)}
                  >
                    {room.name}
                  </Button>
                ))}
              </div>
            </Form.Group>

            <div className="alert alert-info mt-3">
              <small>
                <strong>Selección actual:</strong>
                <br />
                Sede: {locations.find((l) => l.code === selectedLocation)?.name}
                <br />
                Sala: {rooms.find((r) => r.code === selectedRoom)?.name}
                <br />
                Infantes a imprimir:{" "}
                <strong>{getFilteredInfants().length}</strong>
              </small>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handlePrint}
            disabled={getFilteredInfants().length === 0}
            className="button-custom"
          >
            <FaFilePdf style={{ marginRight: "5px" }} />
            Generar Lista
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
