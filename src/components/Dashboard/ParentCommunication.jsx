import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  GetCommunications, 
  PostCommunication,
  PostCommunicationRecipient,
  GetCommunicationRecipients,
} from "../../redux/actions";
import { Form, Button, Modal, Alert, Spinner } from "react-bootstrap";
import { FaEnvelope, FaEdit, FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";
import { getCurrentDateTime, sanitizeText, capitalizeName, getLocationName, getRoomName } from "../../utils";

export default function ParentCommunication() {
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const familyLinks = useSelector((state) => state.family_relationships);
  const infants = useSelector((state) => state.infants);
  
  // Obtener las sedes únicas de los hijos del usuario
  const myChildrenLocations = Array.from(new Set(
    familyLinks
      .filter((link) => link.user_id === authenticatedUser?.id)
      .map((link) => {
        const infant = infants.find((inf) => inf.id === link.infant_id);
        return infant?.location;
      })
      .filter((location) => location !== undefined)
  ));

  const [formData, setFormData] = useState({
    message_title: "",
    message_content: "",
    sender_id: authenticatedUser?.id || "",
    target_type: "2", // Tipo 2: Personal del jardín
    target_location: "",
    target_room: "", // Vacío, no pueden elegir sala
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowSuccess(false);
    setShowError(false);
    setErrorMessage("");

    try {
      const currentDateTime = getCurrentDateTime();
      
      const communicationToSubmit = {
        ...formData,
        message_title: formData.message_title ? sanitizeText(formData.message_title) : "",
        message_content: sanitizeText(formData.message_content),
        created_at: currentDateTime,
        updated_at: currentDateTime,
        scheduled_for: "", // Los padres no pueden programar
      };

      // Crear la comunicación
      const communicationResult = await dispatch(PostCommunication(communicationToSubmit));
      
      // Marcar la comunicación como leída para el emisor
      if (communicationResult.payload?.id && authenticatedUser?.id) {
        const recipientData = {
          communication_id: communicationResult.payload.id,
          recipient_id: authenticatedUser.id,
          is_read: 1,
          read_at: currentDateTime,
        };
        
        await dispatch(PostCommunicationRecipient(recipientData));
        await dispatch(GetCommunicationRecipients());
      }
      
      await dispatch(GetCommunications());
      
      setFormData({
        message_title: "",
        message_content: "",
        sender_id: authenticatedUser?.id || "",
        target_type: "2",
        target_location: "",
        target_room: "",
      });
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowModal(false);
      }, 2000);
    } catch (error) {
      console.error("Error al crear comunicación:", error);
      setErrorMessage(error.message || "Error al crear la comunicación");
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowSuccess(false);
    setShowError(false);
    setErrorMessage("");
  };

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="dashboard-action-button"
      >
        <FaEnvelope style={{ marginRight: "8px" }} />
        Enviar mensaje al jardín
      </Button>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Enviar mensaje al personal del jardín</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Alert variant="info">
              <FaInfoCircle style={{ marginRight: "8px" }} />
              <strong>Mensaje al personal:</strong> Este mensaje será enviado a todo el personal (directores, maestras y auxiliares) del jardín. Se agregará automáticamente la información de su(s) hijo/a(s) al inicio del mensaje.
            </Alert>

            {showSuccess && (
              <Alert variant="success">
                ¡Mensaje enviado con éxito al personal del jardín!
              </Alert>
            )}
            {showError && (
              <Alert variant="danger">
                {errorMessage}
              </Alert>
            )}

            <Form.Group className="mb-3" controlId="target_location">
              <Form.Label>
                <FaMapMarkerAlt /> Sede relacionada con su mensaje
              </Form.Label>
              <Form.Control
                as="select"
                name="target_location"
                value={formData.target_location}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccione una sede</option>
                {myChildrenLocations.map((location) => (
                  <option key={location} value={location}>
                    {location === 0 ? "Sede Laplace" : "Sede Docta"}
                  </option>
                ))}
              </Form.Control>
              <Form.Text className="text-muted">
                Seleccione la sede relacionada con su consulta. Se agregará automáticamente la información de su(s) hijo/a(s) de esta sede.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="message_title">
              <Form.Label>
                <FaEnvelope /> Título del Mensaje (opcional)
              </Form.Label>
              <Form.Control
                type="text"
                name="message_title"
                placeholder="Ej: Consulta sobre horarios"
                value={formData.message_title}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="message_content">
              <Form.Label>
                <FaEdit /> Contenido del Mensaje
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                name="message_content"
                placeholder="Escribe tu mensaje aquí..."
                value={formData.message_content}
                onChange={handleInputChange}
                required
              />
              <Form.Text className="text-muted">
                Al enviar, se agregará automáticamente su información y la de su(s) hijo/a(s) al inicio del mensaje.
              </Form.Text>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              style={{
                backgroundColor: "#213472",
                borderColor: "#213472",
              }}
              type="submit"
              disabled={isSubmitting || !formData.target_location}
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Enviando...
                </>
              ) : (
                "Enviar Mensaje"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
