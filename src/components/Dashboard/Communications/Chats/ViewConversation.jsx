import { useState } from "react";
import { useSelector } from "react-redux";
import { Button, Modal } from "react-bootstrap";
import { FaEye } from "react-icons/fa";
import { selectMessagesByConversationId } from "../../../../redux/selectors";
import { capitalizeName, formatDateTime } from "../../../../utils";

export default function ViewConversation({ conversation }) {
  const [showModal, setShowModal] = useState(false);
  const messages = useSelector((state) =>
    selectMessagesByConversationId(state, conversation?.id)
  );

  const parentName = capitalizeName(
    `${conversation.parent?.first_name || ""} ${conversation.parent?.lastname || ""}`.trim()
  );
  const staffName = capitalizeName(
    `${conversation.staff?.first_name || ""} ${conversation.staff?.lastname || ""}`.trim()
  );

  return (
    <>
      <Button
        variant="primary"
        className="button-custom"
        onClick={() => setShowModal(true)}
        title="Ver conversacion"
        size="sm"
      >
        <FaEye />
      </Button>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Conversacion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "16px",
              color: "#213472",
              fontWeight: "600",
            }}
          >
            <div>Padre/Tutor: {parentName || "Sin datos"}</div>
            <div>Staff: {staffName || "Sin datos"}</div>
          </div>
          <div
            style={{
              maxHeight: "420px",
              overflowY: "auto",
              backgroundColor: "#f8f9fa",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            {messages.length === 0 ? (
              <div className="text-center" style={{ color: "#6c757d" }}>
                No hay mensajes en esta conversacion.
              </div>
            ) : (
              messages.map((message) => {
                const isParentSender =
                  Number(message.sender_id) === Number(conversation.parent_id);
                const alignment = isParentSender ? "flex-start" : "flex-end";
                const bubbleColor = isParentSender ? "#ffffff" : "#213472";
                const textColor = isParentSender ? "#213472" : "#FFF5ED";

                return (
                  <div
                    key={message.id}
                    style={{
                      display: "flex",
                      justifyContent: alignment,
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "10px 14px",
                        borderRadius: isParentSender
                          ? "15px 15px 15px 0"
                          : "15px 15px 0 15px",
                        backgroundColor: bubbleColor,
                        color: textColor,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div style={{ wordWrap: "break-word" }}>
                        {message.message_content}
                      </div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          opacity: 0.7,
                          marginTop: "5px",
                          textAlign: "right",
                        }}
                      >
                        {formatDateTime(message.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
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
