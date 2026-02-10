import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button, Modal, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import { FaEdit, FaEnvelope, FaClock, FaMapMarkerAlt, FaSchool, FaUser } from "react-icons/fa";
import {
  UpdateCommunication,
  GetCommunications,
} from "../../../redux/actions";
import { getCurrentDateTime, sanitizeText } from "../../../utils";

export default function EditCommunication({ communication }) {
  const dispatch = useDispatch();
  
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    message_title: communication.message_title || "",
    message_content: communication.message_content || "",
    target_type: String(communication.target_type) || "0",
    target_location: communication.target_location || "",
    target_room: communication.target_room || "",
    scheduled_for: communication.scheduled_for || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "target_type") {
      // Limpiar campos según el tipo seleccionado
      if (value === "0" || value === "2") {
        // Tipo "Todos" o "Personal del jardín" - limpiar sede y sala
        setFormData({
          ...formData,
          [name]: value,
          target_location: "",
          target_room: "",
        });
      } else if (value === "1") {
        // Tipo "Grupo" - mantener campos de sede y sala
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
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

      // Validar grupo
      if (parseInt(formData.target_type) === 1) {
        if (!formData.target_location && !formData.target_room) {
          setErrorMessage("Debe seleccionar al menos una sede o sala para comunicación grupal");
          setShowError(true);
          setIsSubmitting(false);
          return;
        }
      }

      // Actualizar comunicación
      const updatedData = {
        ...communication,
        message_title: formData.message_title ? sanitizeText(formData.message_title) : "",
        message_content: sanitizeText(formData.message_content),
        target_type: formData.target_type,
        target_location: parseInt(formData.target_type) === 1 ? formData.target_location : "",
        target_room: parseInt(formData.target_type) === 1 ? formData.target_room : "",
        scheduled_for: formData.scheduled_for || null,
        updated_at: currentDateTime,
      };

      await dispatch(UpdateCommunication(communication.id, updatedData));
      await dispatch(GetCommunications());

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowModal(false);
      }, 2000);
    } catch (error) {
      console.error("Error al actualizar comunicación:", error);
      setErrorMessage(error.message || "Error al actualizar la comunicación");
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
    
    // Resetear formulario a valores originales
    setFormData({
      message_title: communication.message_title || "",
      message_content: communication.message_content || "",
      target_type: String(communication.target_type) || "0",
      target_location: communication.target_location || "",
      target_room: communication.target_room || "",
      scheduled_for: communication.scheduled_for || "",
    });
  };

  return (
    <>
      <Button
        variant="warning"
        size="sm"
        onClick={() => setShowModal(true)}
        title="Editar comunicación"
        className="button-custom"
      >
        <FaEdit />
      </Button>

      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Comunicación #{communication.id}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {showSuccess && (
              <Alert variant="success">
                ¡Comunicación actualizada con éxito!
              </Alert>
            )}
            {showError && (
              <Alert variant="danger">
                {errorMessage}
              </Alert>
            )}

            {/* Título */}
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

            {/* Contenido */}
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

            {/* Tipo de Comunicación */}
            <Form.Group className="mb-3" controlId="target_type">
              <Form.Label>
                <FaUser /> Tipo de Comunicación
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

            {/* Selectores de sede y sala para comunicación grupal */}
            {parseInt(formData.target_type) === 1 && (
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
                  Debe seleccionar al menos una sede o una sala
                </Form.Text>
              </>
            )}

            {/* Programar envío */}
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
                (parseInt(formData.target_type) === 1 && !formData.target_location && !formData.target_room)
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
                    className="me-2"
                  />
                  Guardando...
                </>
              ) : (
                <>
                  <FaEdit className="me-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
