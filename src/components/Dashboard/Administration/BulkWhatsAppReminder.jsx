import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Button, Modal, ListGroup, Badge, Alert } from "react-bootstrap";
import { FaWhatsapp, FaExclamationTriangle } from "react-icons/fa";
import { selectChargesOrderedById } from "../../../redux/selectors";
import { capitalizeName, formatCurrency, formatDate, isOverdue } from "../../../utils";

export default function BulkWhatsAppReminder() {
  const charges = useSelector(selectChargesOrderedById);
  const familyLinks = useSelector((state) => state.family_relationships);
  const [showModal, setShowModal] = useState(false);
  const [selectedInfant, setSelectedInfant] = useState(null);

  const infantsWithOverdueCharges = useMemo(() => {
    const overdueCharges = charges.filter((c) =>
      isOverdue(c.due_date, c.current_state)
    );

    const infantsMap = new Map();
    overdueCharges.forEach((charge) => {
      const infantId = charge.id_infant;
      if (!infantsMap.has(infantId) && charge.infant) {
        infantsMap.set(infantId, {
          infant: charge.infant,
          infantId: infantId,
          overdueCharges: [],
          totalAmount: 0,
        });
      }
      if (infantsMap.has(infantId)) {
        const data = infantsMap.get(infantId);
        data.overdueCharges.push(charge);
        data.totalAmount += parseFloat(charge.amount);
      }
    });

    return Array.from(infantsMap.values()).sort((a, b) =>
      a.infant.lastname.localeCompare(b.infant.lastname)
    );
  }, [charges]);

  const getFamilyMembers = (infantId) =>
    familyLinks.filter((link) => link.infant_id == infantId);

  const generateMessage = (infantData, familyMember) => {
    const userName = capitalizeName(familyMember.user.first_name);
    const infantName = capitalizeName(infantData.infant.first_name);
    const infantLastName = capitalizeName(infantData.infant.lastname);

    let message = `Buen día ${userName}, ¿cómo estás?

Te escribo desde Jardín Luceritos para recordarte que hay pagos vencidos de ${infantName} ${infantLastName}.

DETALLE DE CARGOS VENCIDOS:
`;

    infantData.overdueCharges.forEach((charge, index) => {
      message += `
${index + 1}. ${charge.charge_title} (Cargo #${charge.id})
   - Monto: ${formatCurrency(charge.amount)}
   - Fecha de emisión: ${formatDate(charge.created_at)}
   - Fecha de vencimiento: ${formatDate(charge.due_date)}`;
    });

    message += `

TOTAL ADEUDADO: ${formatCurrency(infantData.totalAmount)}

Te agradeceríamos mucho si pudieras regularizar estos pagos a la brevedad.

Podés declarar el pago desde el portal de familias una vez realizado.

Quedo a disposición ante cualquier duda o dificultad. Muchas gracias por tu atención y acompañamiento.`;

    return encodeURIComponent(message);
  };

  const sendWhatsApp = (infantData, familyMember) => {
    const phone = familyMember.user.phone;
    if (!phone) {
      alert("El familiar no tiene número de teléfono registrado.");
      return;
    }
    const formattedPhone = `549${phone.replace(/\D/g, "")}`;
    const message = generateMessage(infantData, familyMember);
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank");
    setSelectedInfant(null);
    setShowModal(false);
  };

  return (
    <>
      <Button
        variant="success"
        onClick={() => setShowModal(true)}
        className="button-custom"
        disabled={infantsWithOverdueCharges.length === 0}
      >
        <FaWhatsapp className="me-1" />
        Reclamar vencidos ({infantsWithOverdueCharges.length})
      </Button>

      <Modal
        show={showModal}
        onHide={() => { setShowModal(false); setSelectedInfant(null); }}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaExclamationTriangle className="text-warning me-2" />
            Reclamar Pagos Vencidos
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!selectedInfant ? (
            <>
              <Alert variant="info">
                <strong>Seleccioná un niño</strong> para ver sus cargos vencidos
                y enviar un recordatorio a los familiares.
              </Alert>
              <ListGroup>
                {infantsWithOverdueCharges.map((infantData) => (
                  <ListGroup.Item
                    key={infantData.infant.id}
                    action
                    onClick={() => setSelectedInfant(infantData)}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>
                        {capitalizeName(infantData.infant.lastname)},{" "}
                        {capitalizeName(infantData.infant.first_name)}
                      </strong>
                      <br />
                      <small className="text-muted">
                        Total adeudado: {formatCurrency(infantData.totalAmount)}
                      </small>
                    </div>
                    <Badge bg="danger" pill>
                      {infantData.overdueCharges.length} cargo
                      {infantData.overdueCharges.length !== 1 ? "s" : ""} vencido
                      {infantData.overdueCharges.length !== 1 ? "s" : ""}
                    </Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          ) : (
            <>
              <div className="mb-3">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setSelectedInfant(null)}
                >
                  ← Volver a la lista
                </Button>
              </div>

              <div className="card mb-3">
                <div className="card-header bg-danger text-white">
                  <strong>
                    {capitalizeName(selectedInfant.infant.lastname)},{" "}
                    {capitalizeName(selectedInfant.infant.first_name)}
                  </strong>
                </div>
                <div className="card-body">
                  <h6>Cargos vencidos:</h6>
                  <ul>
                    {selectedInfant.overdueCharges.map((charge) => (
                      <li key={charge.id}>
                        <strong>{charge.charge_title}</strong> (#{charge.id})
                        <br />
                        Monto: {formatCurrency(charge.amount)}
                        <br />
                        Vencimiento: {formatDate(charge.due_date)}
                      </li>
                    ))}
                  </ul>
                  <hr />
                  <h5>
                    Total adeudado:{" "}
                    <span className="text-danger">
                      {formatCurrency(selectedInfant.totalAmount)}
                    </span>
                  </h5>
                </div>
              </div>

              <h6>Seleccioná a quién enviar el recordatorio:</h6>

              {getFamilyMembers(selectedInfant.infantId).length > 0 ? (
                getFamilyMembers(selectedInfant.infantId).map((link) => (
                  <div key={link.id} className="mb-2">
                    <Button
                      variant="success"
                      className="w-100"
                      onClick={() => sendWhatsApp(selectedInfant, link)}
                      disabled={!link.user.phone}
                    >
                      <FaWhatsapp className="me-2" />
                      {capitalizeName(link.user.first_name)}{" "}
                      {capitalizeName(link.user.user_last_name)}
                      {!link.user.phone && " (Sin teléfono)"}
                    </Button>
                  </div>
                ))
              ) : (
                <Alert variant="danger" className="mb-0">
                  No hay familiares registrados para este niño.
                </Alert>
              )}

              <Alert variant="info" className="mt-3 mb-0">
                <small>
                  <strong>Nota:</strong> Se enviará un mensaje detallado con
                  todos los cargos vencidos, incluyendo montos y fechas de
                  vencimiento.
                </small>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => { setShowModal(false); setSelectedInfant(null); }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
