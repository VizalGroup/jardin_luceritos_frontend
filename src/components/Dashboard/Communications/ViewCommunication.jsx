import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { FaEye, FaUser, FaUsers, FaMapMarkerAlt, FaSchool, FaCalendarAlt, FaCalendarPlus } from "react-icons/fa";
import { useSelector } from "react-redux";
import { capitalizeName, formatDateTime, getLocationName, getRoomName } from "../../../utils";

export default function ViewCommunication({ communication }) {
  const [showModal, setShowModal] = useState(false);
  const communicationRecipients = useSelector((state) => state.communication_recipients);

  return (
    <>
      <Button
        variant="primary"
        className="button-custom"
        size="sm"
        onClick={() => setShowModal(true)}
        
        title="Ver comunicación completa"
      >
        <FaEye />
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ backgroundColor: "#213472", color: "#FFF5ED" }}>
          <Modal.Title>
            {communication.message_title || <em>Sin título</em>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Información del remitente */}
          <div style={{ marginBottom: "20px", paddingBottom: "15px", borderBottom: "2px solid #e9ecef" }}>
            <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>
              <FaUser style={{ marginRight: "8px" }} />
              <strong>De:</strong> {capitalizeName(communication.sender.first_name)}{" "}
              {capitalizeName(communication.sender.lastname)}
            </div>
          </div>

          {/* Destinatarios */}
          <div style={{ marginBottom: "20px", paddingBottom: "15px", borderBottom: "2px solid #e9ecef" }}>
            <h6 style={{ color: "#213472", fontWeight: "600", marginBottom: "10px" }}>
              <FaUsers style={{ marginRight: "8px" }} />
              Destinatarios
            </h6>
            
            {parseInt(communication.target_type) === 0 && (
              <div style={{ fontSize: "0.95rem" }}>Todos los usuarios del sistema</div>
            )}

            {parseInt(communication.target_type) === 1 && (
              <div style={{ fontSize: "0.95rem" }}>
                {communication.target_location !== "" && communication.target_location !== null && (
                  <div style={{ marginBottom: "5px" }}>
                    <FaMapMarkerAlt style={{ marginRight: "8px" }} />
                    {getLocationName(parseInt(communication.target_location))}
                  </div>
                )}
                {communication.target_room !== "" && communication.target_room !== null && (
                  <div style={{ marginBottom: "5px" }}>
                    <FaSchool style={{ marginRight: "8px" }} />
                    {getRoomName(parseInt(communication.target_room))}
                  </div>
                )}
                {(communication.target_location === "" || communication.target_location === null) && 
                 (communication.target_room === "" || communication.target_room === null) && (
                  <div>Personal docente y dirección</div>
                )}
              </div>
            )}

            {parseInt(communication.target_type) === 2 && (
              <div style={{ fontSize: "0.95rem" }}>
                {communicationRecipients
                  .filter((r) => r.communication_id === communication.id)
                  .map((r) => (
                    <div key={r.id} style={{ marginBottom: "3px" }}>
                      <FaUser size={12} style={{ marginRight: "8px" }} />
                      {capitalizeName(r.recipient.lastname)}, {capitalizeName(r.recipient.first_name)}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Contenido del mensaje */}
          <div style={{ marginBottom: "20px", paddingBottom: "15px", borderBottom: "2px solid #e9ecef" }}>
            <h6 style={{ color: "#213472", fontWeight: "600", marginBottom: "10px" }}>
              Contenido
            </h6>
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "8px",
                whiteSpace: "pre-wrap",
                fontSize: "0.95rem",
                lineHeight: "1.6",
              }}
            >
              {communication.message_content}
            </div>
          </div>

          {/* Fechas */}
          <div>
            <h6 style={{ color: "#213472", fontWeight: "600", marginBottom: "10px" }}>
              Información de fechas
            </h6>
            <div style={{ fontSize: "0.9rem" }}>
              <div style={{ marginBottom: "5px" }}>
                <FaCalendarPlus style={{ marginRight: "8px", color: "#213472" }} />
                <strong>Creado:</strong> {formatDateTime(communication.created_at)}
              </div>
              <div style={{ marginBottom: "5px" }}>
                <FaCalendarAlt style={{ marginRight: "8px", color: "#213472" }} />
                <strong>Actualizado:</strong> {formatDateTime(communication.updated_at)}
              </div>
              {communication.scheduled_for && (
                <div style={{ color: "#6c757d" }}>
                  <strong>Programado para:</strong> {formatDateTime(communication.scheduled_for)}
                </div>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
