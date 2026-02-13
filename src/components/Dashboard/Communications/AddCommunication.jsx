import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  GetCommunications, 
  PostCommunication, 
  PostCommunicationRecipient,
  GetCommunicationRecipients,
} from "../../../redux/actions";
import { Form, Button, Modal, Row, Col, Alert, Spinner } from "react-bootstrap";
import { FaPlus, FaEnvelope, FaEdit, FaUsers, FaMapMarkerAlt, FaSchool, FaClock, FaImage } from "react-icons/fa";
import { getCurrentDateTime, sanitizeText, uploadImageToCloudinary } from "../../../utils";

export default function AddCommunication() {
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  
  const [formData, setFormData] = useState({
    message_title: "",
    message_content: "",
    sender_id: authenticatedUser?.id || "",
    target_type: "",
    target_location: "",
    target_room: "",
    scheduled_for: "",
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pictureUrl, setPictureUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = async (e) => {
    const { name, value, files } = e.target;
    
    if (name === "url_img") {
      const file = files[0];
      if (file) {
        try {
          setIsSubmitting(true);
          const uploadedUrl = await uploadImageToCloudinary(
            file,
            setUploadProgress,
          );
          setPictureUrl(uploadedUrl);
        } catch (error) {
          console.error("Error uploading image:", error);
          setErrorMessage("Error al subir la imagen");
          setShowError(true);
        } finally {
          setIsSubmitting(false);
          setUploadProgress(0);
        }
      }
    } else {
      setFormData({ ...formData, [name]: value });

      // Resetear campos según el tipo de destinatario
      if (name === "target_type") {
        setFormData({
          ...formData,
          target_type: value,
          target_location: "",
          target_room: "",
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowSuccess(false);
    setShowError(false);
    setErrorMessage("");

    try {
      const currentDateTime = getCurrentDateTime();
      
      // Sanitizar título y contenido antes de enviar
      const communicationToSubmit = {
        ...formData,
        message_title: formData.message_title ? sanitizeText(formData.message_title) : "",
        message_content: sanitizeText(formData.message_content),
        url_img: pictureUrl || "",
        // Enviar valores vacíos en lugar de null para location y room si no están seleccionados
        target_location: formData.target_location || "",
        target_room: formData.target_room || "",
        scheduled_for: formData.scheduled_for || "",
        created_at: currentDateTime,
        updated_at: currentDateTime,
      };

      console.log("📤 Datos a enviar:", communicationToSubmit);

      // Crear la comunicación
      const communicationResult = await dispatch(PostCommunication(communicationToSubmit));
      
      console.log("✅ Comunicación creada:", communicationResult);
      
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
        target_type: "",
        target_location: "",
        target_room: "",
        scheduled_for: "",
      });
      
      setPictureUrl(null);
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
    setPictureUrl(null);
    setUploadProgress(0);
  };

  return (
    <>
      <Button
        variant="warning"
        onClick={() => setShowModal(true)}
        className="button-custom"
      >
        <FaPlus /> Nueva Comunicación
      </Button>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Nueva Comunicación</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {showSuccess && (
              <Alert variant="success">
                ¡Comunicación creada con éxito!
              </Alert>
            )}
            {showError && (
              <Alert variant="danger">
                {errorMessage}
              </Alert>
            )}

            <Form.Group className="mb-3" controlId="message_title">
              <Form.Label>
                <FaEnvelope /> Título del Mensaje (opcional)
              </Form.Label>
              <Form.Control
                type="text"
                name="message_title"
                placeholder="Ej: Reunión de padres"
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
                rows={5}
                name="message_content"
                placeholder="Escribe el contenido de la comunicación..."
                value={formData.message_content}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="target_type">
              <Form.Label>
                <FaUsers /> Destinatarios
              </Form.Label>
              <Form.Control
                as="select"
                name="target_type"
                value={formData.target_type}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccione el tipo de destinatario</option>
                <option value="0">Todos</option>
                <option value="1">Dirigido a un grupo</option>
                <option value="2">Personal del jardín</option>
              </Form.Control>
            </Form.Group>

            {/* Selector de grupo: Sede y/o Sala */}
            {formData.target_type === "1" && (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="target_location">
                      <Form.Label>
                        <FaMapMarkerAlt /> Sede
                      </Form.Label>
                      <Form.Control
                        as="select"
                        name="target_location"
                        value={formData.target_location}
                        onChange={handleInputChange}
                      >
                        <option value="">Todas las sedes</option>
                        <option value="0">Sede Laplace</option>
                        <option value="1">Sede Docta</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="target_room">
                      <Form.Label>
                        <FaSchool /> Sala
                      </Form.Label>
                      <Form.Control
                        as="select"
                        name="target_room"
                        value={formData.target_room}
                        onChange={handleInputChange}
                      >
                        <option value="">Todas las salas</option>
                        <option value="1">Semillitas (bebés)</option>
                        <option value="2">Primeros pasos (1 año)</option>
                        <option value="3">Exploradores (2 años)</option>
                        <option value="4">Pequeños expertos (3 años)</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Text className="text-muted">
                  Debe seleccionar al menos una sede o una sala. Si no selecciona ninguna, use la opción "Todos" como destinatario.
                </Form.Text>
              </>
            )}

            <Form.Group className="mb-3" controlId="scheduled_for">
              <Form.Label>
                <FaClock /> Programar envío (opcional)
              </Form.Label>
              <Form.Control
                type="datetime-local"
                name="scheduled_for"
                value={formData.scheduled_for}
                onChange={handleInputChange}
              />
              <Form.Text className="text-muted">
                Dejar vacío para enviar inmediatamente
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="url_img">
              <Form.Label>
                <FaImage /> Imagen adjunta (opcional)
              </Form.Label>
              <Form.Control
                type="file"
                name="url_img"
                onChange={handleInputChange}
                accept="image/*"
                disabled={isSubmitting}
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      {uploadProgress}%
                    </div>
                  </div>
                </div>
              )}
              {pictureUrl && (
                <div className="mt-3">
                  <img
                    src={pictureUrl}
                    alt="Imagen adjunta"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "2px solid #dee2e6",
                    }}
                  />
                </div>
              )}
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
              variant="primary"
              type="submit"
              className="button-custom"
              disabled={
                isSubmitting || 
                (formData.target_type === "1" && !formData.target_location && !formData.target_room)
              }
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{" "}
                  Enviando...
                </>
              ) : (
                "Enviar Comunicación"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
