import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { DeleteChatMessage, GetChatMessages } from "../../../../redux/actions";

const parseDateTime = (value) => {
  if (!value) return 0;
  const isoValue = value.includes("T") ? value : value.replace(" ", "T");
  const time = new Date(isoValue).getTime();
  return Number.isNaN(time) ? 0 : time;
};

export default function DeleteOldMessages() {
  const dispatch = useDispatch();
  const chatMessages = useSelector((state) => state.chat_messages);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date.toISOString().split("T")[0];
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const messagesToDelete = useMemo(() => {
    if (!selectedDate) return [];
    const cutoff = new Date(`${selectedDate}T00:00:00`).getTime();
    if (Number.isNaN(cutoff)) return [];

    return chatMessages.filter((message) => {
      const messageTime = parseDateTime(message.created_at);
      return messageTime > 0 && messageTime < cutoff;
    });
  }, [chatMessages, selectedDate]);

  const handleDeleteMessages = async () => {
    if (!selectedDate) return;
    setIsDeleting(true);
    try {
      for (const message of messagesToDelete) {
        await dispatch(DeleteChatMessage(message.id));
      }
      await dispatch(GetChatMessages());
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error al eliminar mensajes:", error);
      alert("Error al eliminar mensajes. Por favor, intente nuevamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        className="button-custom"
        onClick={() => setShowDeleteModal(true)}
      >
        <FaTrash /> Eliminar mensajes antiguos
        {selectedDate ? ` (${messagesToDelete.length})` : ""}
      </Button>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Eliminar mensajes antiguos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <h5>Seleccione una fecha limite</h5>
            <p className="mb-3" style={{ color: "#6c757d" }}>
              Se borraran todos los mensajes anteriores a esa fecha.
            </p>
          </div>
          <Form.Group>
            <Form.Label style={{ fontWeight: "600", color: "#213472" }}>
              Fecha
            </Form.Label>
            <Form.Control
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
            <Form.Text style={{ color: "#6c757d" }}>
              Por defecto se marcan los chats creados hace mas de 90 dias.
            </Form.Text>
          </Form.Group>
          {selectedDate && (
            <div className="text-center" style={{ marginTop: "16px" }}>
              <span style={{ color: "#6c757d" }}>
                Mensajes a eliminar: {messagesToDelete.length}
              </span>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteMessages}
            disabled={isDeleting || !selectedDate}
          >
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
