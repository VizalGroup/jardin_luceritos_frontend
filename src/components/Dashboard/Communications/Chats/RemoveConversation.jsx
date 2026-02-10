import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Spinner } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import {
  DeleteChatMessage,
  DeleteConversation,
  GetChatMessages,
  GetConversations,
} from "../../../../redux/actions";
import { capitalizeName } from "../../../../utils";

export default function RemoveConversation({ conversation }) {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const chatMessages = useSelector((state) => state.chat_messages);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const messagesToDelete = chatMessages.filter(
        (message) => Number(message.conversation_id) === Number(conversation.id)
      );

      for (const message of messagesToDelete) {
        await dispatch(DeleteChatMessage(message.id));
      }

      await dispatch(DeleteConversation(conversation.id));
      await dispatch(GetChatMessages());
      await dispatch(GetConversations());

      setShowModal(false);
    } catch (error) {
      console.error("Error al eliminar conversacion:", error);
      alert(
        "Error al eliminar la conversacion. Por favor, intente nuevamente."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const parentName = capitalizeName(
    `${conversation.parent?.first_name || ""} ${conversation.parent?.lastname || ""}`.trim()
  );
  const staffName = capitalizeName(
    `${conversation.staff?.first_name || ""} ${conversation.staff?.lastname || ""}`.trim()
  );

  return (
    <>
      <Button
        variant="danger"
        className="button-custom"
        onClick={() => setShowModal(true)}
        title="Eliminar conversacion"
        size="sm"
      >
        <FaTrash />
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminacion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <h5>
              Esta seguro que quiere borrar la conversacion entre:
            </h5>
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "8px",
                marginTop: "15px",
              }}
            >
              <p className="mb-1">
                <strong>Padre/Tutor:</strong> {parentName || "Sin datos"}
              </p>
              <p className="mb-0">
                <strong>Staff:</strong> {staffName || "Sin datos"}
              </p>
            </div>
            <p className="text-danger mt-3 mb-0">
              <strong>Esta accion no se puede deshacer.</strong>
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Eliminando...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Eliminar
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
