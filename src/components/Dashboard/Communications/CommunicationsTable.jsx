import React, { useState, useEffect } from "react";
import { Table, Form, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import {
  FaEnvelope,
  FaUsers,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSchool,
  FaUser,
  FaCalendarPlus,
  FaEye,
  FaCheckCircle,
} from "react-icons/fa";
import Pagination from "../../Pagination";
import SearchBar from "../../SearchBar";
import RemoveCommunication from "./RemoveCommunication";
import ViewCommunication from "./ViewCommunication";
import EditCommunication from "./EditCommunication";
import {
  formatDateTime,
  capitalizeName,
  normalizeText,
  getLocationName,
  getRoomName,
  getTargetTypeInfo,
  canManageSystem,
} from "../../../utils";

export default function CommunicationsTable({ communications }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const itemsPerPage = 10;

  const communicationRecipients = useSelector(
    (state) => state.communication_recipients,
  );
  const authenticatedUser = useSelector((state) => state.authenticatedUser);

  // Verificar si es padre/madre/tutor (rol 3)
  const isParent = authenticatedUser?.user_role === 3;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, locationFilter, roomFilter]);

  // Filtrar comunicaciones
  const filteredCommunications = communications.filter((comm) => {
    // Si es padre, ocultar comunicaciones tipo 2 (personal del jardín) EXCEPTO las propias
    if (isParent && parseInt(comm.target_type) === 2) {
      // Si el padre es el emisor, mostrar el mensaje
      if (comm.sender_id !== authenticatedUser?.id) {
        return false;
      }
    }

    const searchNormalized = normalizeText(searchTerm);

    // Filtro por texto (título, remitente, contenido)
    const title = normalizeText(comm.message_title || "");
    const senderName = normalizeText(
      `${comm.sender.first_name} ${comm.sender.lastname}`,
    );
    const content = normalizeText(comm.message_content || "");

    const matchesSearch =
      !searchTerm ||
      title.includes(searchNormalized) ||
      senderName.includes(searchNormalized) ||
      content.includes(searchNormalized);

    // Filtro por sede - SOLO si no hay filtro O si cumple exactamente
    let matchesLocation = true;
    if (locationFilter) {
      matchesLocation =
        parseInt(comm.target_type) === 1 &&
        parseInt(comm.target_location) === parseInt(locationFilter);
    }

    // Filtro por sala - SOLO si no hay filtro O si cumple exactamente
    let matchesRoom = true;
    if (roomFilter) {
      matchesRoom =
        parseInt(comm.target_type) === 1 &&
        parseInt(comm.target_room) === parseInt(roomFilter);
    }

    return matchesSearch && matchesLocation && matchesRoom;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const totalPages = Math.ceil(filteredCommunications.length / itemsPerPage);
  const currentItems = filteredCommunications.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Función para obtener la fecha de lectura del usuario actual
  const getUserReadDate = (commId) => {
    const readRecord = communicationRecipients.find(
      (recipient) =>
        recipient.communication_id === commId &&
        recipient.recipient_id === authenticatedUser?.id &&
        parseInt(recipient.is_read) === 1,
    );
    return readRecord?.read_at || null;
  };

  // Función para contar vistas (usuarios que leyeron) - EXCLUYENDO al emisor
  const getReadCount = (commId, senderId) => {
    return communicationRecipients.filter(
      (recipient) =>
        recipient.communication_id === commId &&
        parseInt(recipient.is_read) === 1 &&
        recipient.recipient_id !== senderId // Excluir al emisor del conteo
    ).length;
  };

  return (
    <div
      style={{
        marginBottom: "12vh",
        backgroundColor: "#ffffffa9",
        padding: "20px",
        borderRadius: "20px",
      }}
    >
      {/* Barra de búsqueda */}
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        placeholder="Buscar por título, remitente, contenido o destinatario..."
      />

      {/* Filtros de sede y sala */}
      {!isParent && (
        <Row className="mb-3 mt-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ fontWeight: "600", color: "#213472" }}>
                <FaMapMarkerAlt /> Filtrar por Sede
              </Form.Label>
              <Form.Select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="">Todas las sedes</option>
                <option value="0">Solo Sede Laplace</option>
                <option value="1">Solo Sede Docta</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label style={{ fontWeight: "600", color: "#213472" }}>
                <FaSchool /> Filtrar por Sala
              </Form.Label>
              <Form.Select
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
              >
                <option value="">Todas las salas</option>
                <option value="1">Solo Semillitas (bebés)</option>
                <option value="2">Solo Primeros pasos (1 año)</option>
                <option value="3">Solo Exploradores (2 años)</option>
                <option value="4">Solo Pequeños expertos (3 años)</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {filteredCommunications.length === 0 ? (
        <div className="text-center p-4">
          <p style={{ color: "#213472" }}>
            No hay comunicaciones que coincidan con los filtros.
          </p>
        </div>
      ) : (
        <Table
          striped
          bordered
          hover
          responsive
          style={{ textAlign: "center" }}
        >
          <thead style={{ backgroundColor: "#213472" }}>
            <tr>
              <th>ID</th>
              <th>
                <FaEnvelope /> Título
              </th>
              <th>
                <FaUsers /> Destinatarios
              </th>
              <th>
                <FaCalendarAlt /> Fechas
              </th>
              {!isParent && (
                <th>
                  <FaCheckCircle /> Lecturas
                </th>
              )}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((comm) => {
              const userReadDate = getUserReadDate(comm.id);
              const readCount = getReadCount(comm.id, comm.sender_id); // Pasar sender_id
              const targetType = parseInt(comm.target_type);
              const targetInfo = getTargetTypeInfo(targetType);

              return (
                <tr key={comm.id}>
                  <td style={{ fontWeight: "600" }}>#{comm.id}</td>
                  <td>
                    <div style={{ fontWeight: "600", color: "#213472" }}>
                      {comm.message_title || (
                        <em style={{ color: "#6c757d" }}>Sin título</em>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#000",
                        marginTop: "5px",
                      }}
                    >
                      <FaUser size={10} style={{ marginRight: "5px" }} />
                      De: {capitalizeName(comm.sender.first_name)}{" "}
                      {capitalizeName(comm.sender.lastname)}
                    </div>
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "0.9rem", color: "#000" }}>
                      <div
                        style={{
                          fontWeight: "600",
                          color: "#213472",
                          marginBottom: "5px",
                        }}
                      >
                        {targetInfo.name}
                      </div>

                      {/* Detalles adicionales solo para tipo Grupo (1) */}
                      {targetType === 1 && (
                        <div style={{ fontSize: "0.85rem" }}>
                          {comm.target_location !== "" &&
                            comm.target_location !== null && (
                              <div style={{ marginBottom: "3px" }}>
                                <FaMapMarkerAlt
                                  style={{ marginRight: "5px" }}
                                />
                                {getLocationName(
                                  parseInt(comm.target_location),
                                )}
                              </div>
                            )}
                          {comm.target_room !== "" &&
                            comm.target_room !== null && (
                              <div style={{ marginBottom: "3px" }}>
                                <FaSchool style={{ marginRight: "5px" }} />
                                {getRoomName(parseInt(comm.target_room))}
                              </div>
                            )}
                          {(comm.target_location === "" ||
                            comm.target_location === null) &&
                            (comm.target_room === "" ||
                              comm.target_room === null) && (
                              <div>Para todo el grupo</div>
                            )}
                        </div>
                      )}

                      {/* Para tipo 2 (Personal del jardín), solo mostrar el texto descriptivo */}
                      {targetType === 2 && (
                        <div style={{ fontSize: "0.85rem", color: "#6c757d" }}>
                          Todo el personal docente y dirección
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.85rem", color: "#000" }}>
                      {isParent ? (
                        // Vista para padres: solo "Publicado"
                        <div style={{ marginBottom: "5px" }}>
                          <FaCalendarAlt
                            size={12}
                            style={{ marginRight: "5px", color: "#213472" }}
                          />
                          <strong style={{ color: "#213472" }}>Publicado:</strong>{" "}
                          {formatDateTime(comm.scheduled_for || comm.created_at)}
                        </div>
                      ) : (
                        // Vista para otros roles: fechas completas
                        <>
                          <div style={{ marginBottom: "5px" }}>
                            <FaCalendarPlus
                              size={12}
                              style={{ marginRight: "5px", color: "#213472" }}
                            />
                            <strong style={{ color: "#213472" }}>Creado:</strong>{" "}
                            {formatDateTime(comm.created_at)}
                          </div>
                          <div style={{ marginBottom: "5px" }}>
                            <FaCalendarAlt
                              size={12}
                              style={{ marginRight: "5px", color: "#213472" }}
                            />
                            <strong style={{ color: "#213472" }}>
                              Actualizado:
                            </strong>{" "}
                            {formatDateTime(comm.updated_at)}
                          </div>
                          {comm.scheduled_for && (
                            <div style={{ marginBottom: "5px", color: "#6c757d" }}>
                              <FaCalendarAlt
                                size={12}
                                style={{ marginRight: "5px" }}
                              />
                              <strong>Programado:</strong>{" "}
                              {formatDateTime(comm.scheduled_for)}
                            </div>
                          )}
                        </>
                      )}
                      {userReadDate && comm.sender_id !== authenticatedUser?.id && (
                        <div
                          style={{
                            marginTop: "8px",
                            paddingTop: "8px",
                            borderTop: "1px solid #dee2e6",
                            color: "#28a745",
                          }}
                        >
                          <FaCheckCircle
                            size={12}
                            style={{ marginRight: "5px" }}
                          />
                          <strong>Leído por ti:</strong>{" "}
                          {formatDateTime(userReadDate)}
                        </div>
                      )}
                    </div>
                  </td>
                  {!isParent && (
                    <td>
                      {readCount}
                      <div style={{ fontSize: "0.75rem", color: "#6c757d" }}>
                        {readCount === 1
                          ? "usuario lo leyó"
                          : "usuarios lo leyeron"}
                      </div>
                    </td>
                  )}
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "2px",
                        justifyContent: "center",
                      }}
                    >
                      <ViewCommunication communication={comm} />
                      {!isParent && (
                        <>
                          <EditCommunication communication={comm} />
                          <RemoveCommunication communication={comm} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
