import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Spinner } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import {
  DeleteCommunication,
  DeleteCommunicationRecipient,
  GetCommunications,
  GetCommunicationRecipients,
} from "../../../redux/actions";

export default function RemoveCommunication({ communication }) {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const communicationRecipients = useSelector(
    (state) => state.communication_recipients,
  );

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Primero eliminar todos los recipients asociados a esta comunicación
      const recipients = communicationRecipients.filter(
        (r) => r.communication_id === communication.id,
      );

      // Eliminar cada recipient
      for (const recipient of recipients) {
        await dispatch(DeleteCommunicationRecipient(recipient.id));
      }

      // Luego eliminar la comunicación
      await dispatch(DeleteCommunication(communication.id));

      // Actualizar las listas
      await dispatch(GetCommunications());
      await dispatch(GetCommunicationRecipients());

      setShowModal(false);
    } catch (error) {
      console.error("Error al eliminar comunicación:", error);
      alert(
        "❌ Error al eliminar la comunicación. Por favor, intente nuevamente.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="danger"
        className="button-custom"
        onClick={() => setShowModal(true)}
        title="Eliminar comunicación"
        size="sm"
      >
        <FaTrash />
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <h5>¿Está seguro de eliminar esta comunicación?</h5>
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "8px",
                marginTop: "15px",
              }}
            >
              <p className="mb-1">
                <strong>ID:</strong> #{communication.id}
              </p>
              <p className="mb-1">
                <strong>Título:</strong>{" "}
                {communication.message_title || (
                  <em style={{ color: "#6c757d" }}>Sin título</em>
                )}
              </p>
              <p className="mb-0">
                <strong>De:</strong> {communication.sender.first_name}{" "}
                {communication.sender.lastname}
              </p>
            </div>
            <p className="text-danger mt-3 mb-0">
              <strong>Esta acción no se puede deshacer.</strong>
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
