import { useSelector } from "react-redux";
import { Carousel, Card, Button } from "react-bootstrap";
import { FaEnvelope, FaUser, FaCalendarAlt, FaBullhorn, FaMapMarkerAlt, FaSchool, FaHistory, FaChild } from "react-icons/fa";
import { formatDateTime, capitalizeName, isCommunicationVisibleForUser, getLocationName, getRoomName } from "../../../utils";
import { selectCommunicationsOrderedById } from "../../../redux/selectors";
import MarkAsReadButton from "./MarkAsReadButton";
import { useNavigate } from "react-router-dom";

export default function CommunicationBoard() {
  const navigate = useNavigate();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const userDetail = useSelector((state) => state.userDetail);
  const allCommunications = useSelector(selectCommunicationsOrderedById);
  const familyLinks = useSelector((state) => state.family_relationships);
  const infants = useSelector((state) => state.infants);
  const communicationRecipients = useSelector((state) => state.communication_recipients);

  // Verificar si es padre/madre/tutor (rol 3)
  const isParent = authenticatedUser?.user_role === 3;

  // Obtener sedes y salas de los hijos del usuario
  const userChildrenLocationsAndRooms = familyLinks
    .filter((link) => link.user_id === authenticatedUser?.id)
    .map((link) => {
      const infant = infants.find((inf) => inf.id === link.infant_id);
      return infant ? { location: infant.location, room: infant.room } : null;
    })
    .filter(Boolean);

  // Filtrar comunicados visibles para el usuario
  const publicCommunications = allCommunications.filter((comm) => {
    // Verificar si ya fue leído por el usuario
    const isRead = communicationRecipients.some(
      (recipient) =>
        recipient.communication_id === comm.id &&
        recipient.recipient_id === authenticatedUser?.id &&
        parseInt(recipient.is_read) === 1
    );
    
    // Si ya fue leído, no mostrar
    if (isRead) return false;

    // Verificar tipo "Todos" (target_type === 0)
    const isPublic = parseInt(comm.target_type) === 0;
    
    // Verificar tipo "Personal del jardín" (target_type === 2)
    const isStaffOnly = parseInt(comm.target_type) === 2;
    
    // Verificar tipo "Grupo" (target_type === 1) 
    let isTargetedGroup = false;
    if (parseInt(comm.target_type) === 1) {
      // Para usuarios administrativos (roles 0, 1, 2), mostrar todos los comunicados de grupo
      if (!isParent) {
        isTargetedGroup = true;
      } else {
        // Para padres (rol 3), verificar si el comunicado es para alguna sede/sala de sus hijos
        isTargetedGroup = userChildrenLocationsAndRooms.some((child) => {
          const commLocation = comm.target_location !== "" && comm.target_location !== null 
            ? parseInt(comm.target_location) 
            : null;
          const commRoom = comm.target_room !== "" && comm.target_room !== null 
            ? parseInt(comm.target_room) 
            : null;

          // Si el comunicado no especifica sede ni sala (ambos null o ""), es para todos en ese grupo
          if (commLocation === null && commRoom === null) {
            return true;
          }

          // Si especifica sede, verificar coincidencia
          const matchesLocation = commLocation === null || child.location === commLocation;
          
          // Si especifica sala, verificar coincidencia
          const matchesRoom = commRoom === null || child.room === commRoom;

          return matchesLocation && matchesRoom;
        });
      }
    }

    // Para roles administrativos (0, 1, 2), mostrar comunicados públicos, de grupo y de personal
    if (!isParent) {
      if (!isPublic && !isTargetedGroup && !isStaffOnly) return false;
    } else {
      // Para padres (rol 3), mostrar públicos, de grupo Y sus propios mensajes al personal
      const isMySentMessage = isStaffOnly && comm.sender_id === authenticatedUser?.id;
      if (!isPublic && !isTargetedGroup && !isMySentMessage) return false;
    }

    // Si tiene scheduled_for en el futuro, no mostrar (excepto para admins)
    if (comm.scheduled_for) {
      const scheduledDate = new Date(comm.scheduled_for);
      const now = new Date();
      
      if (isParent && scheduledDate > now) {
        return false;
      }
    }

    // Para roles administrativos (0, 1, 2), mostrar sin verificar fecha
    if (authenticatedUser && !isParent) {
      return true;
    }

    // Para padres/madres/tutores (rol 3), verificar la fecha
    if (authenticatedUser && userDetail) {
      return isCommunicationVisibleForUser(comm, userDetail.created_at || authenticatedUser.created_at);
    }

    return false;
  });

  if (!publicCommunications || publicCommunications.length === 0) {
    // Mostrar mensaje especial cuando no hay comunicados pendientes
    if (isParent) {
      return (
        <div style={{ marginBottom: "40px", maxWidth: "800px", width: "100%", margin: "0 auto" }}>
          <Card
            style={{
              border: "3px solid #213472",
              borderRadius: "15px",
              backgroundColor: "#fff5ed",
              padding: "40px",
              textAlign: "center"
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <FaEnvelope size={60} color="#213472" />
            </div>
            <h4 style={{ color: "#213472", marginBottom: "15px" }}>
              ¡Estás al día con las comunicaciones!
            </h4>
            <p style={{ color: "#666", fontSize: "1.1rem", marginBottom: "25px" }}>
              No hay comunicados nuevos por leer en este momento.
            </p>
            <Button
              variant="primary"
              className="button-custom"
              onClick={() => navigate("/autogestion/historial-comunicaciones")}
              style={{
                padding: "10px 30px",
                fontSize: "1rem",
                fontWeight: "600"
              }}
            >
              <FaHistory style={{ marginRight: "10px" }} />
              Ver Historial de Comunicaciones
            </Button>
          </Card>
        </div>
      );
    }
    
    return null;
  }

  const getTargetLabel = (comm) => {
    if (parseInt(comm.target_type) === 0) {
      return "Para todos";
    }
    
    if (parseInt(comm.target_type) === 1) {
      const hasLocation = comm.target_location !== "" && comm.target_location !== null;
      const hasRoom = comm.target_room !== "" && comm.target_room !== null;

      if (hasLocation && hasRoom) {
        return `${getLocationName(parseInt(comm.target_location))} - ${getRoomName(parseInt(comm.target_room))}`;
      } else if (hasLocation) {
        return getLocationName(parseInt(comm.target_location));
      } else if (hasRoom) {
        return getRoomName(parseInt(comm.target_room));
      } else {
        return "Para todo el grupo";
      }
    }

    if (parseInt(comm.target_type) === 2) {
      return "Personal del jardín";
    }

    return "Dirigido";
  };

  // Función para obtener los hijos del remitente
  const getSenderChildren = (senderId) => {
    return familyLinks
      .filter((link) => link.user_id === senderId)
      .map((link) => infants.find((inf) => inf.id === link.infant_id))
      .filter(Boolean);
  };

  return (
    <div style={{ marginBottom: "40px", maxWidth: "800px", width: "100%", margin: "0 auto" }}>
      <Carousel 
        interval={5000}
        indicators={false}
        className="dashboard-communications-carousel"
      >
        {publicCommunications.map((comm) => (
          <Carousel.Item key={comm.id}>
            <Card
              style={{
                border: "3px solid #213472",
                borderRadius: "15px",
                backgroundColor: "#fff5ed",
                minHeight: "400px",
              }}
            >
              <Card.Header
                style={{
                  backgroundColor: "#213472",
                  color: "#FFF5ED",
                  borderTopLeftRadius: "12px",
                  borderTopRightRadius: "12px",
                  padding: "15px 20px",
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div style={{ fontSize: "1rem", fontWeight: "600" }}>
                    <FaEnvelope className="me-2" />
                    Comunicado #{comm.id}
                  </div>
                  <div style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "5px" }}>
                    {parseInt(comm.target_type) === 1 && (
                      <>
                        {(comm.target_location !== "" && comm.target_location !== null) && (
                          <FaMapMarkerAlt size={12} />
                        )}
                        {(comm.target_room !== "" && comm.target_room !== null) && (
                          <FaSchool size={12} />
                        )}
                      </>
                    )}
                    {getTargetLabel(comm)}
                  </div>
                </div>
              </Card.Header>
              <Card.Body style={{ padding: "30px" }}>
                {comm.message_title && (
                  <Card.Title
                    style={{
                      color: "#213472",
                      fontWeight: "700",
                      fontSize: "1.5rem",
                      marginBottom: "20px",
                      textAlign: "center",
                    }}
                  >
                    {comm.message_title}
                  </Card.Title>
                )}
                <Card.Text
                  style={{
                    color: "#000",
                    fontSize: "1.1rem",
                    lineHeight: "1.8",
                    textAlign: "justify",
                    minHeight: "150px",
                    whiteSpace: "pre-line", // Esto respeta los saltos de línea
                  }}
                >
                  {comm.message_content}
                </Card.Text>
              </Card.Body>
              <Card.Footer
                style={{
                  backgroundColor: "transparent",
                  borderTop: "2px solid #213472",
                  padding: "15px 20px",
                }}
              >
                <div style={{ 
                  fontSize: "0.9rem", 
                  color: "#213472",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                  gap: "15px"
                }}>
                  <div>
                    <div className="mb-2">
                      <FaUser className="me-2" />
                      <strong>De:</strong>{" "}
                      {capitalizeName(comm.sender.first_name)}{" "}
                      {capitalizeName(comm.sender.lastname)}
                      
                      {/* Mostrar hijos si el remitente es un padre (rol 3) */}
                      {comm.sender.user_role === 3 && (() => {
                        const children = getSenderChildren(comm.sender_id);
                        if (children.length > 0) {
                          return (
                            <div style={{ 
                              marginTop: "8px", 
                              paddingTop: "8px",
                              borderTop: "1px solid #dee2e6",
                              fontSize: "0.85rem"
                            }}>
                              <FaChild className="me-2" style={{ color: "#28a745" }} />
                              <strong>Hijo/a{children.length > 1 ? "s" : ""}:</strong>
                              <div style={{ marginLeft: "24px", marginTop: "4px" }}>
                                {children.map((child, index) => (
                                  <div key={child.id} style={{ marginBottom: "3px" }}>
                                    • {capitalizeName(child.first_name)} {capitalizeName(child.lastname)} - {getRoomName(child.room)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <div>
                      <FaCalendarAlt className="me-2" />
                      <strong>
                        {!isParent && comm.scheduled_for ? "Programado para" : "Publicado"}:
                      </strong>{" "}
                      {formatDateTime(comm.scheduled_for || comm.created_at)}
                    </div>
                  </div>
                  
                  {/* Botón de marcar como leído para todos los usuarios */}
                  <div>
                    <MarkAsReadButton communicationId={comm.id} />
                  </div>
                </div>
              </Card.Footer>
            </Card>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}
