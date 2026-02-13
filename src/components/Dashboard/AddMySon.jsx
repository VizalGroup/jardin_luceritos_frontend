import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { infantFormData } from "../../utils";
import {
  GetInfants,
  PostInfant,
  PostFamilyRelationship,
  GetFamilyRelationships,
} from "../../redux/actions";
import { Form, Button, Modal, Row, Col, Alert, Spinner } from "react-bootstrap";
import { AiOutlineUserAdd } from "react-icons/ai";
import {
  FaAddressCard,
  FaUser,
  FaUserEdit,
  FaCalendarAlt,
  FaClock,
  FaDoorOpen,
  FaInfoCircle,
  FaSchool,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { RiDoorClosedLine } from "react-icons/ri";
import { selectTariffs } from "../../redux/selectors";
import { formatCurrency, formatHours, getCurrentDateTime } from "../../utils";

export default function AddMySon() {
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const tariffs = useSelector(selectTariffs);
  const infants = useSelector((state) => state.infants);

  const [formData, setFormData] = useState({
    ...infantFormData,
    user_id: authenticatedUser?.id,
    current_state: 2, // Pendiente de validación
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
      const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "");
      setFormData({ ...formData, [name]: sanitizedValue });

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
      (infant) =>
        infant.document_number &&
        infant.document_number.toLowerCase() === dni.toLowerCase(),
    );
    setDniExists(exists);
  };

  const handleDayToggle = (day) => {
    setFormData((prevData) => {
      const updatedSchedule = { ...prevData.schedule };
      if (updatedSchedule[day]) {
        updatedSchedule[day] = null;
      } else {
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

    if (dniExists) {
      setError(
        "El DNI o pasaporte ya existe en la base de datos. Si este es su hijo/a, por favor contacte a dirección para que vinculen el niño/a a su cuenta.",
      );
      setShowError(true);
      return;
    }

    setIsSubmitting(true);
    try {
      // Crear el infante
      const infantResult = await dispatch(PostInfant(formData));

      // Obtener el ID del infante creado
      const infantId = infantResult.payload?.id;

      if (infantId) {
        // Crear la relación familiar automáticamente
        await dispatch(
          PostFamilyRelationship({
            infant_id: infantId,
            user_id: authenticatedUser.id,
          }),
        );

        // Actualizar las listas
        await dispatch(GetInfants());
        await dispatch(GetFamilyRelationships());
      }

      // Resetear formulario
      setFormData({
        ...infantFormData,
        user_id: authenticatedUser?.id,
        current_state: 2,
        schedule: {
          Monday: null,
          Tuesday: null,
          Wednesday: null,
          Thursday: null,
          Friday: null,
        },
      });

      setDniExists(false);
      handleCloseModal();
      alert(
        "✅ Su hijo/a ha sido registrado exitosamente. La información será validada por dirección lo antes posible.",
      );
    } catch (error) {
      console.error("Error al registrar infante:", error);
      setError(
        error.message ||
          "Error al registrar el infante. Por favor, intente nuevamente.",
      );
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
        onClick={handleShowModal}
        className="dashboard-action-button"
      >
        <AiOutlineUserAdd style={{ marginRight: "8px" }} />
        Registrar a mi hijo/a
      </Button>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Registrar a mi hijo/a</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <FaInfoCircle style={{ marginRight: "8px" }} />
            <strong>Importante:</strong>
            <ul style={{ marginBottom: 0, marginTop: "10px" }}>
              <li>
                <strong>
                  Este formulario es únicamente para niños/as que ya han sido
                  admitidos en el jardín.
                </strong>{" "}
                Si aún no ha sido admitido/a, por favor regístrese en la{" "}
                <a
                  href="/lista_de_espera"
                  style={{ fontWeight: "bold", textDecoration: "underline" }}
                >
                  lista de espera
                </a>
                .
              </li>
              <li>Complete todos los datos de su hijo/a.</li>
              <li>
                La información será <strong>validada por dirección</strong> lo
                antes posible
              </li>
              <li>
                <strong>Si su hijo/a ya está registrado en el sistema</strong>,
                no debe completar este formulario. En su lugar, contacte a
                dirección para que vinculen el niño/a a su cuenta (Ej: ya lo
                registró su padre/madre).
              </li>
            </ul>
          </Alert>

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
              <Form.Group
                as={Col}
                md="6"
                className="mb-3"
                controlId="document_number"
              >
                <Form.Label>
                  <FaAddressCard /> Número de documento/pasaporte
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
                    Este DNI ya existe. Contacte a dirección para vincular el
                    niño/a a su cuenta.
                  </Form.Control.Feedback>
                )}
                <Form.Text className="text-muted">
                  Solo números y letras, sin puntos ni caracteres especiales
                </Form.Text>
              </Form.Group>

              <Form.Group
                as={Col}
                md="6"
                className="mb-3"
                controlId="first_name"
              >
                <Form.Label>
                  <FaUser /> Nombre
                </Form.Label>
                <Form.Control
                  type="text"
                  name="first_name"
                  placeholder="Ingrese el nombre"
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
                  placeholder="Ingrese el apellido"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group
                as={Col}
                md="6"
                className="mb-3"
                controlId="birthdate"
              >
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
                    {tariff.infant_type == 1 && " (Sala de bebé)"}
                  </option>
                ))}
              </Form.Control>
              <Form.Text className="text-muted">
                Seleccione la tarifa en base al número de horas que asiste su
                hijo/a. Esta tarifa será confirmada por dirección.
              </Form.Text>
            </Form.Group>

            <Row>
              <Form.Group as={Col} md="6" className="mb-3" controlId="room">
                <Form.Label>
                  <FaSchool /> Sala
                </Form.Label>
                <Form.Control
                  as="select"
                  name="room"
                  value={formData.room || 0}
                  onChange={handleInputChange}
                >
                  <option value="0">Desconocida</option>
                  <option value="1">Semillitas (bebés)</option>
                  <option value="2">Primeros pasos (1 año)</option>
                  <option value="3">Exploradores (2 años)</option>
                  <option value="4">Pequeños expertos (3 años)</option>
                </Form.Control>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3" controlId="location">
                <Form.Label>
                  <FaMapMarkerAlt /> Sede
                </Form.Label>
                <Form.Control
                  as="select"
                  name="location"
                  value={formData.location || 0}
                  onChange={handleInputChange}
                >
                  <option value="0">Sede Laplace</option>
                  <option value="1">Sede Docta</option>
                </Form.Control>
              </Form.Group>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>
                <FaClock className="me-2" /> Horario semanal preferido
              </Form.Label>
              <Form.Text className="text-muted d-block mb-2">
                Seleccione los días y horarios deseados. Serán confirmados por
                dirección.
              </Form.Text>

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
