import { useState } from "react";
import { Table, Modal } from "react-bootstrap";
import { capitalizeName, formatDNI, formatTime } from "../../../utils";
import { FaUser } from "react-icons/fa";
import EditAuthorizedPersons from "./EditAuthorizedPersons";
import DeleteAuthorizedPersonComponent from "./DeleteAuthorizedPerson";
import Pagination from "../../Pagination";
import SearchBar from "../../SearchBar";

// Función para formatear el horario del niño
const formatInfantSchedule = (schedule) => {
  if (!schedule) return "Sin horario";

  const daysOfWeek = [
    { en: "Monday", es: "Lun" },
    { en: "Tuesday", es: "Mar" },
    { en: "Wednesday", es: "Mié" },
    { en: "Thursday", es: "Jue" },
    { en: "Friday", es: "Vie" },
  ];

  const activeDays = daysOfWeek.filter(
    (day) =>
      schedule[day.en] && schedule[day.en].entry && schedule[day.en].exit,
  );

  if (activeDays.length === 0) return "Sin horario";

  // Agrupar días con el mismo horario
  const scheduleGroups = {};
  activeDays.forEach((day) => {
    const timeSlot = `${formatTime(schedule[day.en].entry)}-${formatTime(schedule[day.en].exit)}`;
    if (!scheduleGroups[timeSlot]) {
      scheduleGroups[timeSlot] = [];
    }
    scheduleGroups[timeSlot].push(day.es);
  });

  // Formatear la salida
  return Object.entries(scheduleGroups).map(([timeSlot, days]) => {
    return (
      <div key={timeSlot} style={{ marginBottom: "5px" }}>
        <strong>{days.join(", ")}:</strong> {timeSlot}
      </div>
    );
  });
};

export default function AuthorizedPersonsTable({ authorizedPersons }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [searchTerm, setSearchTerm] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedPersonName, setSelectedPersonName] = useState("");

  // Filtrar personas autorizadas basado en el término de búsqueda
  const filteredAuthorizedPersons = authorizedPersons.filter((person) => {
    if (!searchTerm) return true;

    const searchTermLower = searchTerm.toLowerCase();

    // Buscar en el nombre y apellido de la persona autorizada
    const personName = `${person.first_name} ${person.lastname}`.toLowerCase();
    const personNameReversed =
      `${person.lastname} ${person.first_name}`.toLowerCase();

    // Buscar en el documento
    const personDni = person.dni?.toLowerCase() || "";

    // Buscar en los nombres de todos los infantes
    const infantsMatch =
      person.infants?.some((infant) => {
        const infantName =
          `${infant.first_name} ${infant.lastname}`.toLowerCase();
        const infantNameReversed =
          `${infant.lastname} ${infant.first_name}`.toLowerCase();
        return (
          infantName.includes(searchTermLower) ||
          infantNameReversed.includes(searchTermLower)
        );
      }) || false;

    return (
      personName.includes(searchTermLower) ||
      personNameReversed.includes(searchTermLower) ||
      personDni.includes(searchTermLower) ||
      infantsMatch
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAuthorizedPersons.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredAuthorizedPersons.length / itemsPerPage);

  // Abrir modal de imagen
  const handleImageClick = (imageUrl, personName) => {
    setSelectedImage(imageUrl);
    setSelectedPersonName(personName);
    setShowImageModal(true);
  };

  if (authorizedPersons.length === 0) {
    return (
      <div
        className="contrasting-background"
        style={{
          textAlign: "center",
        }}
      >
        <h5 className="title">No hay personas autorizadas registradas</h5>
        <p className="text-muted">
          Agrega una persona autorizada para comenzar
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="contrasting-background">
        <h3 className="text-center module-title">
          Personas Autorizadas a Retirar ({filteredAuthorizedPersons.length})
        </h3>

        {/* Buscador */}
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          placeholder="Buscar por nombre, documento del autorizado o nombre del niño..."
        />
        <br />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        <div style={{ overflowX: "auto" }}>
          <Table
            striped
            bordered
            hover
            responsive
            style={{ textAlign: "center" }}
          >
            <thead>
              <tr>
                <th>Foto</th>
                <th>Información Personal</th>
                <th>Teléfono</th>
                <th>Infante Autorizado / Horarios</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((person) => (
                  <tr key={person.id}>
                    <td>
                      {person.url_img ? (
                        <img
                          src={person.url_img}
                          alt={`${person.first_name} ${person.lastname}`}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "50%",
                            border: "2px solid #dee2e6",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            handleImageClick(
                              person.url_img,
                              `${capitalizeName(
                                person.first_name,
                              )} ${capitalizeName(person.lastname)}`,
                            )
                          }
                        />
                      ) : (
                        <div
                          style={{
                            width: "50px",
                            height: "50px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid #dee2e6",
                            margin: "0 auto",
                          }}
                        >
                          <FaUser color="#6c757d" />
                        </div>
                      )}
                    </td>
                    <td>
                      <div>
                        <strong>
                          {`${capitalizeName(person.lastname)}, ${capitalizeName(person.first_name)}`}
                        </strong>
                        <br />
                        <small style={{ color: "#6c757d" }}>
                          DNI: {formatDNI(person.dni)}
                        </small>
                      </div>
                    </td>
                    <td>
                      <a
                        href={`tel:${person.phone}`}
                        style={{
                          textDecoration: "none",
                          color: "#0066cc",
                          fontWeight: "bold",
                        }}
                      >
                        {person.phone}
                      </a>
                    </td>
                    <td>
                      <div>
                        {person.infants && person.infants.length > 0 ? (
                          person.infants.map((infant, index) => (
                            <div
                              key={infant.id_infant || index}
                              style={{
                                marginBottom:
                                  index < person.infants.length - 1
                                    ? "10px"
                                    : "0",
                              }}
                            >
                              <strong>
                                {`${capitalizeName(
                                  infant.lastname,
                                )} ${capitalizeName(infant.first_name)}`}
                              </strong>
                              <br />
                              <div
                                style={{
                                  fontSize: "0.85em",
                                  color: "#6c757d",
                                  marginTop: "5px",
                                }}
                              >
                                {formatInfantSchedule(infant.schedule)}
                              </div>
                              {index < person.infants.length - 1 && (
                                <hr
                                  style={{
                                    margin: "10px 0",
                                    borderTop: "1px solid #dee2e6",
                                  }}
                                />
                              )}
                            </div>
                          ))
                        ) : (
                          <span>No hay infantes asignados</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "2px",
                          justifyContent: "center",
                        }}
                      >
                        <EditAuthorizedPersons person={person} />
                        <DeleteAuthorizedPersonComponent person={person} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No se encontraron resultados</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Modal para ver imagen completa */}
      <Modal
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedPersonName}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: 0 }}>
          <img
            src={selectedImage}
            alt={selectedPersonName}
            style={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </Modal.Body>
      </Modal>
    </>
  );
}
