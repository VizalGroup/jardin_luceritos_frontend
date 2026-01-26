import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatCurrency, formatHours, infantFormData } from "../../../utils";
import { GetInfants, PostInfant } from "../../../redux/actions";
import { Form, Button, Modal, Row, Col, Alert, Spinner } from "react-bootstrap";
import { AiOutlineUserAdd } from "react-icons/ai";
import {
  FaAddressCard,
  FaUser,
  FaUserEdit,
  FaCalendarAlt,
  FaClock,
  FaDoorOpen,
} from "react-icons/fa";
import { RiDoorClosedLine } from "react-icons/ri";
import { selectTariffs } from "../../../redux/selectors";

export default function AddInfant() {
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const tariffs = useSelector(selectTariffs);  
  const infants = useSelector((state) => state.infants);
  
  const [formData, setFormData] = useState({
    ...infantFormData,
    user_id: authenticatedUser?.id,
    schedule: {
      Monday: null,
      Tuesday: null,
      Wednesday: null,
      Thursday: null,
      Friday: null,
    },
  });
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [dniExists, setDniExists] = useState(false);

  // Días de la semana en inglés (para el JSON) y su equivalente en español (para mostrar)
  const daysOfWeek = [
    { en: "Monday", es: "Lunes" },
    { en: "Tuesday", es: "Martes" },
    { en: "Wednesday", es: "Miércoles" },
    { en: "Thursday", es: "Jueves" },
    { en: "Friday", es: "Viernes" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "document_number") {
      // Sanitizar DNI: solo permitir números y letras, sin puntos ni caracteres especiales
      const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "");
      setFormData({ ...formData, [name]: sanitizedValue });
      
      // Verificar si el DNI ya existe
      if (sanitizedValue.length > 0) {
        checkDniExists(sanitizedValue);
      } else {
        setDniExists(false);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const checkDniExists = (dni) => {
    const exists = infants.some(
      (infant) => infant.document_number && 
      infant.document_number.toLowerCase() === dni.toLowerCase()
    );
    setDniExists(exists);
  };

  const handleDayToggle = (day) => {
    setFormData((prevData) => {
      const updatedSchedule = { ...prevData.schedule };

      if (updatedSchedule[day]) {
        // Si ya existe, lo eliminamos (establecemos como null)
        updatedSchedule[day] = null;
      } else {
        // Si no existe, creamos un horario predeterminado
        updatedSchedule[day] = { entry: "08:00", exit: "12:00" };
      }

      return { ...prevData, schedule: updatedSchedule };
    });
  };

  const handleTimeChange = (day, type, value) => {
    setFormData((prevData) => {
      const updatedSchedule = { ...prevData.schedule };

      if (updatedSchedule[day]) {
        updatedSchedule[day] = {
          ...updatedSchedule[day],
          [type]: value,
        };
      }

      return { ...prevData, schedule: updatedSchedule };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowError(false);

    // Verificar si hay DNI duplicado antes de enviar
    if (dniExists) {
      setError("El DNI o pasaporte ya existe en la base de datos");
      setShowError(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(PostInfant(formData));
      await dispatch(GetInfants());
      
      // Resetear formulario
      setFormData({ 
        ...infantFormData, 
        user_id: authenticatedUser?.id,
        schedule: {
          Monday: null,
          Tuesday: null,
          Wednesday: null,
          Thursday: null,
          Friday: null,
        }
      });
      
      setDniExists(false);
      handleCloseModal();
    } catch (error) {
      console.error("Error al registrar infante:", error);
      let errorMessage = "Error desconocido al registrar el infante";

      if (error.response) {
        errorMessage = `Error del servidor: ${
          error.response.data?.message || error.response.statusText
        }`;
      } else if (error.request) {
        errorMessage = "Error de conexión. Verifique su conexión a internet.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError("");
    setShowError(false);
    setDniExists(false);
  };

  const handleShowModal = () => setShowModal(true);

  return (
    <>
      <Button
        variant="warning"
        onClick={handleShowModal}
        
        className="button-custom"
      >
        <AiOutlineUserAdd /> Registrar
      </Button>
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Registrar infante</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {showError && (
              <Alert
                variant="danger"
                onClose={() => setShowError(false)}
                dismissible
              >
                <strong>Error:</strong> {error}
              </Alert>
            )}

            <Row>
              <Form.Group as={Col} md="6" className="mb-3" controlId="document_number">
                <Form.Label>
                  <FaAddressCard /> Ingrese número de documento
                </Form.Label>
                <Form.Control
                  type="text"
                  name="document_number"
                  placeholder="Ingrese el DNI o pasaporte"
                  value={formData.document_number}
                  onChange={handleInputChange}
                  required
                  isInvalid={dniExists}
                />
                {dniExists && (
                  <Form.Control.Feedback type="invalid">
                    Este DNI o pasaporte ya existe en la base de datos
                  </Form.Control.Feedback>
                )}
                <Form.Text className="text-muted">
                  Solo números y letras, sin puntos ni caracteres especiales
                </Form.Text>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3" controlId="first_name">
                <Form.Label>
                  <FaUser /> Nombre
                </Form.Label>
                <Form.Control
                  type="text"
                  name="first_name"
                  placeholder="Ingrese el nombre del infante"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Row>

            <Row>
              <Form.Group as={Col} md="6" className="mb-3" controlId="lastname">
                <Form.Label>
                  <FaUserEdit /> Apellido
                </Form.Label>
                <Form.Control
                  type="text"
                  name="lastname"
                  placeholder="Ingrese el apellido del infante"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3" controlId="birthdate">
                <Form.Label>
                  <FaCalendarAlt /> Fecha de nacimiento
                </Form.Label>
                <Form.Control
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Row>

            <Form.Group className="mb-3" controlId="id_tariff">
              <Form.Label>
                <FaAddressCard /> Tarifa
              </Form.Label>
              <Form.Control
                as="select"
                name="id_tariff"
                value={formData.id_tariff}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccione una tarifa</option>
               
                {tariffs.map((tariff) => (
                  <option key={tariff.id} value={tariff.id}>
                    {formatHours(tariff.number_of_hours)} -{" "}
                    {formatCurrency(tariff.price)}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            {/* Días y Horarios */}
            <Form.Group className="mb-4">
              <Form.Label>
                <FaClock className="me-2" /> Horario semanal
              </Form.Label>

              {daysOfWeek.map((day) => (
                <div
                  key={day.en}
                  className="mb-3 p-3"
                  style={{ backgroundColor: "#f9f9f9", borderRadius: "8px" }}
                >
                  <Form.Check
                    type="checkbox"
                    id={`day-${day.en}`}
                    label={day.es}
                    checked={formData.schedule[day.en] !== null}
                    onChange={() => handleDayToggle(day.en)}
                    className="mb-2 fw-bold"
                    style={{ color: "#000000" }}
                  />

                  {formData.schedule[day.en] && (
                    <Row className="align-items-center mt-2">
                      <Col xs={6}>
                        <Form.Label style={{ color: "#000000" }}>
                          <RiDoorClosedLine title="Horario de Entrada" />{" "}
                          Entrada
                        </Form.Label>
                        <Form.Control
                          type="time"
                          value={formData.schedule[day.en].entry}
                          onChange={(e) =>
                            handleTimeChange(day.en, "entry", e.target.value)
                          }
                        />
                      </Col>
                      <Col xs={6}>
                        <Form.Label style={{ color: "#000000" }}>
                          <FaDoorOpen title="Horario de Salida" /> Salida
                        </Form.Label>
                        <Form.Control
                          type="time"
                          value={formData.schedule[day.en].exit}
                          onChange={(e) =>
                            handleTimeChange(day.en, "exit", e.target.value)
                          }
                        />
                      </Col>
                    </Row>
                  )}
                </div>
              ))}
            </Form.Group>

            <Modal.Footer>
              <Button
                variant="secondary"
                style={{ margin: "10px" }}
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                variant="warning"
                type="submit"
                className="button-custom"
                disabled={isSubmitting || dniExists}
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
                    Registrando...
                  </>
                ) : (
                  "Registrar"
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}