import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetInfants, UpdateInfant } from "../../../redux/actions";
import {
  Button,
  Form,
  Modal,
  OverlayTrigger,
  Tooltip,
  Row,
  Col,
} from "react-bootstrap";
import {
  FaAddressCard,
  FaCalendarAlt,
  FaClock,
  FaEdit,
  FaUser,
  FaUserEdit,
  FaDoorOpen,
  FaSchool,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { RiDoorClosedLine } from "react-icons/ri";
import { selectTariffs } from "../../../redux/selectors";
import { formatCurrency, formatHours, getCurrentDateTime } from "../../../utils";

export default function EditInfant({ infant }) {
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ...infant,
    schedule: infant.schedule || {
      Monday: null,
      Tuesday: null,
      Wednesday: null,
      Thursday: null,
      Friday: null,
    },
  });
  const tariffs = useSelector(selectTariffs);

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
    setFormData({ ...formData, [name]: value });
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
    try {
      const formdataToUpdate = {
        ...formData,
        user_id: authenticatedUser?.id,
        last_update: getCurrentDateTime(),
      };
      await dispatch(UpdateInfant(infant.id, formdataToUpdate));
      dispatch(GetInfants()); // Refrescar lista de infantes después del update
      setShowModal(false);
    } catch (error) {
      alert("Error actualizando infante: " + error);
    }
  };

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={`tooltip-edit-${infant.id}`}>Editar</Tooltip>}
      >
        <Button
          className="button-custom"
          variant="warning"
          onClick={() => setShowModal(true)}
        >
          <FaEdit />
        </Button>
      </OverlayTrigger>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Modificar Información</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Form.Group
                as={Col}
                md="6"
                className="mb-3"
                controlId="document_number"
              >
                <Form.Label>
                  <FaAddressCard /> DNI o pasaporte
                </Form.Label>
                <Form.Control
                  type="text"
                  name="document_number"
                  value={formData.document_number}
                  onChange={handleInputChange}
                  onWheel={(e) => e.target.blur()}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                      e.preventDefault();
                    }
                  }}
                  required
                />
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
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Row>

            <Row>
              <Form.Group
                as={Col}
                md="6"
                className="mb-3"
                controlId="lastname"
              >
                <Form.Label>
                  <FaUserEdit /> Apellido
                </Form.Label>
                <Form.Control
                  type="text"
                  name="lastname"
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
                  <FaCalendarAlt /> Fecha de Nacimiento
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

            <Row>
              <Form.Group as={Col} md="6" className="mb-3" controlId="id_tariff">
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
                      {formatHours
                        ? formatHours(tariff.number_of_hours)
                        : tariff.number_of_hours + " horas"}{" "}
                      - {formatCurrency(tariff.price)}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group as={Col} md="6" className="mb-3" controlId="current_state">
                <Form.Label>
                  <FaUserEdit /> Estado
                </Form.Label>
                <Form.Control
                  as="select"
                  name="current_state"
                  value={formData.current_state}
                  onChange={handleInputChange}
                  required
                >
                  <option value="1">Inscripto</option>
                  <option value="2">Pendiente de validar</option>
                  <option value="0">Inactivo y/o Egresado</option>
                </Form.Control>
              </Form.Group>
            </Row>

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
                  required
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
                  required
                >
                  <option value="0">Sede Laplace</option>
                  <option value="1">Sede Docta</option>
                </Form.Control>
              </Form.Group>
            </Row>

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
                    id={`day-${day.en}-${infant.id}`}
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
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" className="button-custom">
                Guardar Cambios
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
