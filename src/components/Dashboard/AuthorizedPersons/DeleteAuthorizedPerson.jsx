import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { capitalizeName } from "../../../utils";
import {
  DeleteAuthorizedPerson,
  DeleteAuthorizedPersonInfantLink,
  GetAuthorizedPersons,
  GetAuthorizedPersonInfantsLinks,
} from "../../../redux/actions";
import {
  Button,
  Modal,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { FaTrash, FaExclamationTriangle } from "react-icons/fa";

export default function DeleteAuthorizedPersonComponent({ person }) {
  const dispatch = useDispatch();
  const authorized_person_infant_links = useSelector(
    (state) => state.authorized_person_infant_links
  );
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // 1. Primero eliminar todas las relaciones de la tabla intermedia
      const personRelations = authorized_person_infant_links.filter(
        (link) => link.id_authorized_person === person.id
      );

      // Eliminar cada relación
      for (const relation of personRelations) {
        await dispatch(DeleteAuthorizedPersonInfantLink(relation.id));
      }

      // 2. Eliminar la persona autorizada
      await dispatch(DeleteAuthorizedPerson(person.id));
      
      // 3. Refrescar los datos
      await dispatch(GetAuthorizedPersons());
      await dispatch(GetAuthorizedPersonInfantsLinks());

      setTimeout(() => {
        setShowModal(false);
        setLoading(false);
      }, 500);

      alert("Persona autorizada y todas sus relaciones eliminadas correctamente");
    } catch (error) {
      alert("Error al eliminar persona autorizada: " + error.message);
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Función para formatear el horario del infante
  const formatInfantSchedule = (schedule) => {
    if (!schedule) return "Sin horario definido";

    const daysOfWeek = [
      { en: "Monday", es: "Lun" },
      { en: "Tuesday", es: "Mar" },
      { en: "Wednesday", es: "Mié" },
      { en: "Thursday", es: "Jue" },
      { en: "Friday", es: "Vie" },
    ];

    const activeDays = daysOfWeek.filter(
      (day) =>
        schedule[day.en] &&
        schedule[day.en].entry &&
        schedule[day.en].exit
    );

    if (activeDays.length === 0) return "Sin horario definido";

    // Agrupar días con el mismo horario
    const scheduleGroups = {};
    activeDays.forEach((day) => {
      const timeSlot = `${schedule[day.en].entry}-${schedule[day.en].exit}`;
      if (!scheduleGroups[timeSlot]) {
        scheduleGroups[timeSlot] = [];
      }
      scheduleGroups[timeSlot].push(day.es);
    });

    // Formatear la salida
    return Object.entries(scheduleGroups)
      .map(([timeSlot, days]) => {
        return `${days.join(", ")}: ${timeSlot}`;
      })
      .join(" | ");
  };

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>Eliminar autorización completa</Tooltip>}
      >
        <Button
          variant="danger"
          onClick={() => setShowModal(true)}
          className="button-custom"
        >
          <FaTrash />
        </Button>
      </OverlayTrigger>

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación Completa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <h5>¿Estás seguro que deseas eliminar completamente esta autorización?</h5>

            <div className="mt-3 p-3 bg-light rounded">
              <h6 className="mb-2">Persona autorizada:</h6>
              <p className="mb-1">
                <strong>
                  {capitalizeName(person.first_name)}{" "}
                  {capitalizeName(person.lastname)}
                </strong>
              </p>
              <p className="mb-1">
                <strong>Documento:</strong> {person.dni}
              </p>
              <p className="mb-1">
                <strong>Teléfono:</strong> {person.phone}
              </p>

              <hr />

              <h6 className="mb-2">Autorizado para retirar a:</h6>
              {person.infants && person.infants.length > 0 ? (
                <div>
                  {person.infants.map((infant, index) => (
                    <div key={infant.id_infant || index} className="mb-2">
                      <strong>
                        {`${capitalizeName(infant.lastname)} ${capitalizeName(infant.first_name)}`}
                      </strong>
                      {infant.schedule && (
                        <div>
                          <small className="text-muted">
                            {formatInfantSchedule(infant.schedule)}
                          </small>
                        </div>
                      )}
                      {index < person.infants.length - 1 && (
                        <hr style={{ margin: "8px 0" }} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mb-0 text-muted">Sin infantes asignados</p>
              )}
            </div>

            <div className="alert alert-danger mt-3" role="alert">
              <small>
                <FaExclamationTriangle className="me-1" />
                <strong>ATENCIÓN:</strong> Esta acción eliminará completamente:
                <ul className="mt-2 mb-0 text-start">
                  <li>La persona autorizada del sistema</li>
                  <li>Todas las relaciones con los infantes ({person.infants?.length || 0} relación{person.infants?.length === 1 ? '' : 'es'})</li>
                </ul>
                Esta acción <strong>NO SE PUEDE DESHACER</strong>.
              </small>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseModal}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading} className="button-custom">
            {loading && (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
            )}
            {loading ? "Eliminando..." : "Sí, Eliminar Completamente"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
