import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Table, Form, Spinner } from "react-bootstrap";
import { FaExclamationTriangle } from "react-icons/fa";
import {
  selectPendingCharges,
  selectAllTariffs,
  selectAuthenticatedUserId,
} from "../../../redux/selectors";
import { UpdateCharge, GetCharges } from "../../../redux/actions";
import { capitalizeName, formatCurrency, formatDate } from "../../../utils";

export default function UpdateOverduePayments() {
  const dispatch = useDispatch();
  const allCharges = useSelector(selectPendingCharges);
  const allTariffs = useSelector(selectAllTariffs);
  const authenticatedUserId = useSelector(selectAuthenticatedUserId);
  
  const [showModal, setShowModal] = useState(false);
  const [newDueDate, setNewDueDate] = useState("");
  const [surchargeRate, setSurchargeRate] = useState(10);
  const [selectedCharges, setSelectedCharges] = useState({});
  const [loading, setLoading] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Solo cargos de cuota pendientes y vencidos (fecha anterior a hoy)
  const quotaCharges = allCharges.filter((charge) => {
    const isQuota = /cuota/i.test(charge.charge_title);
    const dueDate = new Date(charge.due_date);
    dueDate.setHours(0, 0, 0, 0);
    const isOverdue = dueDate < today;
    return isQuota && isOverdue;
  });

  const getTariffForInfant = (charge) => {
    const idTariff = charge.infant?.id_tariff;
    return allTariffs.find((t) => t.id === idTariff);
  };

  const getNewAmount = (charge) => {
    const tariff = getTariffForInfant(charge);
    if (!tariff) return parseFloat(charge.amount);
    return parseFloat(tariff.price) * (1 + surchargeRate / 100);
  };

  const handleOpen = () => {
    const initialSelection = {};
    quotaCharges.forEach((c) => {
      initialSelection[c.id] = false;
    });
    setSelectedCharges(initialSelection);
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    setNewDueDate(`${year}-${month}-20`);
    setSurchargeRate(10);
    setShowModal(true);
  };

  const handleChargeSelection = (chargeId, isSelected) => {
    setSelectedCharges((prev) => ({ ...prev, [chargeId]: isSelected }));
  };

  const handleSelectAll = (selectAll) => {
    const newSel = {};
    quotaCharges.forEach((c) => {
      newSel[c.id] = selectAll;
    });
    setSelectedCharges(newSel);
  };

  const getSelectedCharges = () =>
    quotaCharges.filter((c) => selectedCharges[c.id]);

  const handleUpdateCharges = async () => {
    if (!newDueDate) {
      alert("Debes seleccionar una nueva fecha de vencimiento.");
      return;
    }
    const chargesToUpdate = getSelectedCharges();
    if (chargesToUpdate.length === 0) {
      alert("Debes seleccionar al menos una cuota para actualizar.");
      return;
    }

    setLoading(true);
    try {
      for (const charge of chargesToUpdate) {
        const newAmount = getNewAmount(charge);
        const baseTitle = charge.charge_title.replace(/\s*\(\+\d+%\)/g, "").trim();
        const newTitle = `${baseTitle} (+${surchargeRate}%)`;
        await dispatch(
          UpdateCharge(charge.id, {
            id_infant: charge.id_infant,
            id_user: authenticatedUserId,
            quantity: charge.quantity,
            charge_title: newTitle,
            amount: newAmount.toFixed(2),
            due_date: newDueDate,
            created_at: charge.created_at,
            current_state: charge.current_state,
            paid_at: charge.paid_at || null,
            payment_method: charge.payment_method || null,
            paid_by: charge.paid_by || null,
            url_payment_document: charge.url_payment_document || null,
          })
        );
      }
      await dispatch(GetCharges());
      setShowModal(false);
      alert(`${chargesToUpdate.length} cuotas actualizadas correctamente`);
    } catch (error) {
      alert("Error al actualizar cargos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = getSelectedCharges().length;
  const allSelected =
    quotaCharges.length > 0 && quotaCharges.every((c) => selectedCharges[c.id]);
  const someSelected = quotaCharges.some((c) => selectedCharges[c.id]);

  return (
    <>
      <Button variant="warning" onClick={handleOpen} className="button-custom">
        <FaExclamationTriangle /> Actualizar cuotas vencidas ({quotaCharges.length})
      </Button>

      <Modal
        show={showModal}
        onHide={() => !loading && setShowModal(false)}
        size="xl"
      >
        <Modal.Header closeButton={!loading}>
          <Modal.Title>Actualizar Cuotas Vencidas</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Configuración */}
          <div className="row mb-4 g-3">
            <div className="col-md-6">
              <Form.Label className="fw-bold">
                Nueva fecha de vencimiento
              </Form.Label>
              <Form.Control
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="col-md-6">
              <Form.Label className="fw-bold">Recargo a aplicar</Form.Label>
              <div className="d-flex gap-3 mt-1">
                <Form.Check
                  type="radio"
                  label="10%"
                  name="surcharge"
                  checked={surchargeRate === 10}
                  onChange={() => setSurchargeRate(10)}
                  disabled={loading}
                />
                <Form.Check
                  type="radio"
                  label="20%"
                  name="surcharge"
                  checked={surchargeRate === 20}
                  onChange={() => setSurchargeRate(20)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Selección de cuotas */}
          {quotaCharges.length > 0 ? (
            <>
              <div className="mb-2">
                <Form.Check
                  type="checkbox"
                  label={`Seleccionar todos (${selectedCount} de ${quotaCharges.length} seleccionados)`}
                  checked={allSelected}
                  ref={(input) => {
                    if (input)
                      input.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="fw-bold"
                  disabled={loading}
                />
              </div>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>Sel.</th>
                    <th>Alumno</th>
                    <th>Concepto</th>
                    <th>Vencimiento actual</th>
                    <th>Monto actual</th>
                    <th>Nuevo monto (sobre tarifa)</th>
                  </tr>
                </thead>
                <tbody>
                  {quotaCharges.map((charge) => {
                    const tariff = getTariffForInfant(charge);
                    const newAmount = getNewAmount(charge);
                    return (
                      <tr
                        key={charge.id}
                        className={
                          selectedCharges[charge.id] ? "table-warning" : ""
                        }
                      >
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedCharges[charge.id] || false}
                            onChange={(e) =>
                              handleChargeSelection(charge.id, e.target.checked)
                            }
                            disabled={loading}
                          />
                        </td>
                        <td>
                          {charge.infant
                            ? `${capitalizeName(
                                charge.infant.lastname
                              )} ${capitalizeName(charge.infant.first_name)}`
                            : "N/A"}
                        </td>
                        <td>{capitalizeName(charge.charge_title)}</td>
                        <td>{formatDate(charge.due_date)}</td>
                        <td>{formatCurrency(charge.amount)}</td>
                        <td className="fw-bold text-danger">
                          {tariff ? (
                            formatCurrency(newAmount)
                          ) : (
                            <span className="text-muted">Sin tarifa</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </>
          ) : (
            <p className="text-muted">No hay cuotas pendientes de pago.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="warning"
            onClick={handleUpdateCharges}
            disabled={loading || selectedCount === 0 || !newDueDate}
            className="button-custom"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Actualizando...
              </>
            ) : (
              `Actualizar cuotas vencidas (${selectedCount})`
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}