import { useSelector } from "react-redux";
import { Card } from "react-bootstrap";
import { 
  FaChild, 
  FaBirthdayCake, 
  FaIdCard, 
  FaClock, 
  FaCheckCircle, 
  FaHourglassHalf, 
  FaTimesCircle,
  FaCalendarAlt,
  FaDollarSign,
  FaSchool,
  FaMapMarkerAlt,
  FaFileInvoiceDollar,
} from "react-icons/fa";

import { capitalizeName, formatDate, calculateAge, formatDNI, formatCurrency, getRoomName, getLocationName } from "../../utils";
import { selectPendingChargesOrderedById } from "../../redux/selectors";

export default function MyChildren() {
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const infants = useSelector((state) => state.infants);
  const familyLinks = useSelector((state) => state.family_relationships);
  console.log(familyLinks);
  
  const charges = useSelector(selectPendingChargesOrderedById);

  // Filtrar los hijos del usuario actual
  const myChildren = familyLinks
    .filter((link) => link.user_id === authenticatedUser?.id)
    .map((link) => {
      const infant = infants.find((inf) => inf.id === link.infant_id);
      return infant;
    })
    .filter((infant) => infant !== undefined);

  // Función para obtener el badge según el estado
  const getStatusBadge = (status) => {
    switch (parseInt(status)) {
      case 1:
        return (
          <div className="d-flex align-items-center gap-1">
            <FaCheckCircle className="text-success" size={14} />
            <small className="text-success fw-bold">Verificado</small>
          </div>
        );
      case 2:
        return (
          <div className="d-flex align-items-center gap-1">
            <FaHourglassHalf className="text-dark" size={14} />
            <small className="text-dark fw-bold">Pendiente</small>
          </div>
        );
      case 0:
        return (
          <div className="d-flex align-items-center gap-1">
            <FaTimesCircle className="text-danger" size={14} />
            <small className="text-danger fw-bold">Inactivo</small>
          </div>
        );
      default:
        return null;
    }
  };

  const dayTranslations = {
    Monday: "Lunes",
    Tuesday: "Martes",
    Wednesday: "Miércoles",
    Thursday: "Jueves",
    Friday: "Viernes"
  };

  if (myChildren.length === 0) {
    return null;
  }

  return (
    <div style={{ width: "100%", marginTop: "10vh" }}>
      <h2 className="text-center module-title">Mis Hijos/as</h2>

      <div className="childCardsContainer">
        {myChildren.map((child) => (
          <Card
            key={child.id}
            className="shadow-sm border-0 m-2"
            style={{
              borderRadius: "12px",
              width: "300px",
              minWidth: "280px",
            }}
          >
            <Card.Header
              style={{
                borderRadius: "12px 12px 0 0",
                backgroundColor: "#FFF5ED",
                color: "#213472",
                borderBottom: "2px solid #213472"
              }}
              className="text-center py-2"
            >
              <div className="d-flex align-items-center justify-content-center gap-2">
                <FaChild size={20} />
                <h6 className="mb-0 fw-bold">
                  {capitalizeName(child.first_name)} {capitalizeName(child.lastname)}
                </h6>
              </div>
            </Card.Header>

            <Card.Body className="p-3" style={{ backgroundColor: "#ffffff" }}>
              <div className="row g-2">
                {/* Estado */}
                <div className="col-12 text-center mb-2">
                  {getStatusBadge(child.current_state)}
                </div>

                {/* Información Personal */}
                <div className="col-6">
                  <div className="d-flex align-items-center mb-1">
                    <FaIdCard style={{ color: "#213472" }} className="me-1" size={12} />
                    <small className="text-muted fw-semibold">DNI</small>
                  </div>
                  <small className="ms-2">{formatDNI(child.document_number)}</small>
                </div>

                <div className="col-6">
                  <div className="d-flex align-items-center mb-1">
                    <FaCalendarAlt style={{ color: "#213472" }} className="me-1" size={12} />
                    <small className="text-muted fw-semibold">Edad</small>
                  </div>
                  <small className="ms-2">{calculateAge(child.birthdate)}</small>
                </div>

                {/* Fecha de Nacimiento */}
                <div className="col-12">
                  <div className="d-flex align-items-center mb-1">
                    <FaBirthdayCake style={{ color: "#213472" }} className="me-1" size={12} />
                    <small className="text-muted fw-semibold">Fecha de Nacimiento</small>
                  </div>
                  <small className="ms-2">{formatDate(child.birthdate)}</small>
                </div>

                {/* Sala y Sede */}
                <div className="col-6">
                  <div className="d-flex align-items-center mb-1">
                    <FaSchool style={{ color: "#213472" }} className="me-1" size={12} />
                    <small className="text-muted fw-semibold">Sala</small>
                  </div>
                  <small className="ms-2">{getRoomName(child.room)}</small>
                </div>

                <div className="col-6">
                  <div className="d-flex align-items-center mb-1">
                    <FaMapMarkerAlt style={{ color: "#213472" }} className="me-1" size={12} />
                    <small className="text-muted fw-semibold">Sede</small>
                  </div>
                  <small className="ms-2">{getLocationName(child.location)}</small>
                </div>

                {/* Información de Tarifa */}
                <div className="col-12">
                  <div style={{ backgroundColor: "#FFF5ED" }} className="rounded p-2 mt-2">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <FaDollarSign style={{ color: "#213472" }} className="me-1" size={12} />
                        <small className="fw-semibold" style={{ color: "#213472" }}>Tarifa</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold" style={{ color: "#213472" }}>
                          {formatCurrency(child.tariff?.price || 0)}
                        </div>
                        {child.tariff && child.tariff.number_of_hours > 0 && (
                          <small className="text-muted">
                            {child.tariff.number_of_hours} horas
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Horarios */}
                {child.schedule && (
                  <div className="col-12">
                    <div className="d-flex align-items-center mb-1 mt-2">
                      <FaClock style={{ color: "#213472" }} className="me-1" size={12} />
                      <small className="text-muted fw-semibold">Horarios</small>
                    </div>
                    <div className="ms-2">
                      {Object.entries(child.schedule).map(([day, hours]) => {
                        if (!hours || !hours.entry || !hours.exit) return null;
                        return (
                          <div key={day} className="d-flex justify-content-between align-items-center">
                            <small className="fw-semibold" style={{ color: "#213472" }}>
                              {dayTranslations[day]}
                            </small>
                            <small className="text-muted">
                              {hours.entry} - {hours.exit}
                            </small>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cargos pendientes */}
                {(() => {
                  const pendingCharges = charges.filter(
                    (c) => c.id_infant === child.id
                  );
                  if (pendingCharges.length === 0) return null;
                  return (
                    <div className="col-12 mt-2">
                      <div className="d-flex align-items-center gap-1 mb-1">
                        <FaFileInvoiceDollar style={{ color: "#213472" }} size={12} />
                        <small className="text-muted fw-semibold">Cargos pendientes</small>
                        <span
                          className="badge rounded-pill ms-auto"
                          style={{ backgroundColor: "#dc3545", fontSize: "0.7rem" }}
                        >
                          {pendingCharges.length}
                        </span>
                      </div>
                      <div className="ms-1">
                        {pendingCharges.map((charge, idx) => (
                          <div
                            key={charge.id}
                            className="d-flex justify-content-between align-items-baseline py-1"
                            style={{
                              fontSize: "0.78rem",
                              borderBottom: idx < pendingCharges.length - 1 ? "1px solid #f0f0f0" : "none",
                            }}
                          >
                            <div>
                              <span className="fw-semibold text-dark">{charge.charge_title}</span>
                              <br />
                              <span className="text-muted">Vence: {formatDate(charge.due_date)}</span>
                            </div>
                            <span className="fw-bold  ms-2" style={{ whiteSpace: "nowrap" }}>
                              {formatCurrency(charge.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Alerta de pendiente */}
                {child.current_state === 2 && (
                  <div className="col-12">
                    <div
                      style={{
                        backgroundColor: "#FFF5ED",
                        fontSize: "15px",
                        border: "1px solid #FFF5ED"
                      }}
                      className="rounded p-2 mt-2"
                    >
                      <div className="d-flex align-items-center gap-2">
                        
                        <small className="text-dark fw-semibold">
                          La información está siendo validada por dirección.
                        </small>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>

            {/* Botones de acciones comentados para futuras funcionalidades */}
            {/* <Card.Footer className="d-flex justify-content-between">
              <AddMedicalDocumentation infant={child} />
              <DeclarePayment charges={[]} />
            </Card.Footer> */}
          </Card>
        ))}
      </div>
    </div>
  );
}
