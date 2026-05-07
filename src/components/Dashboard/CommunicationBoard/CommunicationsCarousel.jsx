import { Carousel, Card } from "react-bootstrap";
import { FaEnvelope, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaSchool, FaChild, FaThumbtack } from "react-icons/fa";
import { formatDateTime, capitalizeName, getLocationName, getRoomName } from "../../../utils";
import MarkAsReadButton from "./MarkAsReadButton";

export default function CommunicationsCarousel({ communications, isParent, familyLinks, infants, authenticatedUser, showMarkAsRead = true }) {

  const getTargetLabel = (comm) => {
    if (parseInt(comm.target_type) === 0) return "Para todos";

    if (parseInt(comm.target_type) === 1) {
      const hasLocation = comm.target_location !== "" && comm.target_location !== null;
      const hasRoom = comm.target_room !== "" && comm.target_room !== null;
      if (hasLocation && hasRoom) return `${getLocationName(parseInt(comm.target_location))} - ${getRoomName(parseInt(comm.target_room))}`;
      if (hasLocation) return getLocationName(parseInt(comm.target_location));
      if (hasRoom) return getRoomName(parseInt(comm.target_room));
      return "Para todo el grupo";
    }

    if (parseInt(comm.target_type) === 2) return "Personal del jardín";
    return "Dirigido";
  };

  const getSenderChildren = (senderId) => {
    return familyLinks
      .filter((link) => link.user_id === senderId)
      .map((link) => infants.find((inf) => inf.id === link.infant_id))
      .filter(Boolean);
  };

  return (
    <Carousel
      interval={5000}
      indicators={false}
      controls={communications.length > 1}
      className="dashboard-communications-carousel"
    >
      {communications.map((comm) => (
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
                <div style={{ fontSize: "1rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "10px" }}>
                  <FaEnvelope className="me-2" />
                  Comunicado #{comm.id}
                  {parseInt(comm.is_pinned) === 1 && (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#ffffff", borderRadius: "12px", padding: "2px 10px", fontSize: "0.8rem", fontWeight: "700" }}>
                      <FaThumbtack size={12} />
                      Fijado
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "5px" }}>
                  {parseInt(comm.target_type) === 1 && (
                    <>
                      {(comm.target_location !== "" && comm.target_location !== null) && <FaMapMarkerAlt size={12} />}
                      {(comm.target_room !== "" && comm.target_room !== null) && <FaSchool size={12} />}
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

              {comm.url_img && (
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "25px" }}>
                  <img
                    src={comm.url_img}
                    alt="Imagen del comunicado"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "400px",
                      objectFit: "contain",
                      borderRadius: "12px",
                      border: "4px solid #213472",
                      boxShadow: "0 4px 12px rgba(33, 52, 114, 0.3)",
                      backgroundColor: "#FFF5ED",
                      padding: "8px",
                    }}
                  />
                </div>
              )}

              <Card.Text
                style={{
                  color: "#000",
                  fontSize: "1.1rem",
                  lineHeight: "1.8",
                  textAlign: "justify",
                  minHeight: "150px",
                  whiteSpace: "pre-line",
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
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#213472",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                  gap: "15px",
                }}
              >
                <div>
                  <div className="mb-2">
                    <FaUser className="me-2" />
                    <strong>De:</strong>{" "}
                    {capitalizeName(comm.sender.first_name)}{" "}
                    {capitalizeName(comm.sender.lastname)}

                    {comm.sender.user_role === 3 && (() => {
                      const children = getSenderChildren(comm.sender_id);
                      if (children.length > 0) {
                        return (
                          <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #dee2e6", fontSize: "0.85rem" }}>
                            <FaChild className="me-2" style={{ color: "#28a745" }} />
                            <strong>Hijo/a{children.length > 1 ? "s" : ""}:</strong>
                            <div style={{ marginLeft: "24px", marginTop: "4px" }}>
                              {children.map((child) => (
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

                {showMarkAsRead && (
                  <div>
                    <MarkAsReadButton communicationId={comm.id} />
                  </div>
                )}
              </div>
            </Card.Footer>
          </Card>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}
