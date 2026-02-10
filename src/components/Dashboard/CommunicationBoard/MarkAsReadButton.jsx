import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Spinner } from "react-bootstrap";
import { FaCheck, FaCheckDouble } from "react-icons/fa";
import { 
  PostCommunicationRecipient, 
  GetCommunicationRecipients 
} from "../../../redux/actions";
import { getCurrentDateTime } from "../../../utils";

export default function MarkAsReadButton({ communicationId }) {
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const communicationRecipients = useSelector((state) => state.communication_recipients);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificar si el usuario ya marcó este comunicado como leído
  const isAlreadyRead = communicationRecipients.some(
    (recipient) =>
      recipient.communication_id === communicationId &&
      recipient.recipient_id === authenticatedUser?.id &&
      parseInt(recipient.is_read) === 1
  );

  const handleMarkAsRead = async () => {
    if (isAlreadyRead || !authenticatedUser) return;

    setIsSubmitting(true);
    try {
      const currentDateTime = getCurrentDateTime();
      
      await dispatch(
        PostCommunicationRecipient({
          communication_id: communicationId,
          recipient_id: authenticatedUser.id,
          is_read: 1,
          read_at: currentDateTime,
        })
      );

      await dispatch(GetCommunicationRecipients());
    } catch (error) {
      console.error("Error al marcar como leído:", error);
      alert("Error al marcar el comunicado como leído. Por favor, intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      variant={isAlreadyRead ? "success" : "outline-primary"}
      size="sm"
      onClick={handleMarkAsRead}
      disabled={isSubmitting || isAlreadyRead}
      style={{
        fontWeight: "600",
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "0.85rem",
        transition: "all 0.3s ease",
      }}
      title={isAlreadyRead ? "Ya leíste este comunicado" : "Marcar como leído"}
    >
      {isSubmitting ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            className="me-1"
          />
          Marcando...
        </>
      ) : (
        <>
          {isAlreadyRead ? (
            <>
              <FaCheckDouble className="me-1" />
              Leído
            </>
          ) : (
            <>
              <FaCheck className="me-1" />
              Marcar como leído
            </>
          )}
        </>
      )}
    </Button>
  );
}
