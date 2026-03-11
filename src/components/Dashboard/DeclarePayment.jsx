import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Modal, Badge, Spinner, Form } from "react-bootstrap";
import {
  FaDollarSign,
  FaCalendarAlt,
  FaUniversity,
  FaExclamationTriangle,
  FaCopy,
  FaCheck,
  FaCheckCircle,
  FaUpload,
} from "react-icons/fa";
import { selectPendingChargesOrderedById } from "../../redux/selectors";
import { UpdateCharge, GetCharges } from "../../redux/actions";
import { capitalizeName, formatCurrency, formatDate, SaveFileToDrive, getCurrentSQLDate } from "../../utils";

const PAYMENT_INFO = {
  0: {
    sede: "Sede Laplace",
    alias: "Luceritos.laplace",
    titular: "Melanie Magariños",
    banco: "Banco Santander",
  },
  1: {
    sede: "Sede Docta",
    alias: "Luceritos.docta",
    titular: "Valentina Bruzzesi",
    banco: null,
  },
};

function CopyAliasButton({ alias }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(alias).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      title="Copiar alias"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "0 4px",
        color: copied ? "#28a745" : "#213472",
      }}
    >
      {copied ? <FaCheck size={13} /> : <FaCopy size={13} />}
    </button>
  );
}

export default function DeclarePayment() {
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const familyLinks = useSelector((state) => state.family_relationships);
  const charges = useSelector(selectPendingChargesOrderedById);
  const infants = useSelector((state) => state.infants);

  const [showModal, setShowModal] = useState(false);
  const [docUrl, setDocUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [declaredIds, setDeclaredIds] = useState([]);
  const [selectedChargeIds, setSelectedChargeIds] = useState([]);

  // IDs de los hijos del usuario autenticado
  const myInfantIds = familyLinks
    .filter((link) => link.user_id === authenticatedUser?.id)
    .map((link) => link.infant_id);

  // Cargos pendientes de los hijos del usuario
  const myPendingCharges = charges.filter((c) =>
    myInfantIds.includes(c.id_infant)
  );

  const hasPendingCharges = myPendingCharges.length > 0;

  // Inicializar selección con todos los cargos al abrir el modal
  useState(() => {
    if (showModal) {
      setSelectedChargeIds(myPendingCharges.map((c) => c.id));
    }
  }, [showModal]);

  const toggleCharge = (id) => {
    setSelectedChargeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedCharges = myPendingCharges.filter((c) =>
    selectedChargeIds.includes(c.id)
  );

  const total = selectedCharges.reduce(
    (sum, c) => sum + parseFloat(c.amount),
    0
  );

  // Sedes únicas con cargos pendientes
  const locationsWithCharges = [
    ...new Set(
      myPendingCharges
        .map((c) => {
          const infant = infants.find((inf) => inf.id === c.id_infant);
          return infant?.location;
        })
        .filter((loc) => loc !== undefined && loc !== null)
    ),
  ];

  // Agrupar cargos por infante
  const chargesByInfant = myInfantIds.reduce((acc, infantId) => {
    const infantCharges = myPendingCharges.filter(
      (c) => c.id_infant === infantId
    );
    if (infantCharges.length > 0) {
      acc[infantId] = infantCharges;
    }
    return acc;
  }, {});

  const handleFileChange = async (e) => {
    setUploading(true);
    setDocUrl(null);
    try {
      const fileUrl = await SaveFileToDrive(e);
      setDocUrl(fileUrl);
    } catch (error) {
      alert("Error al subir el archivo: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeclareAll = async () => {
    if (!docUrl) return;
    const pending = selectedCharges.filter((c) => !declaredIds.includes(c.id));
    if (pending.length === 0) return;

    setSubmitting(true);
    try {
      const paidAt = getCurrentSQLDate();
      await Promise.all(
        pending.map((charge) =>
          dispatch(
            UpdateCharge(charge.id, {
              ...charge,
              current_state: 1,
              paid_at: paidAt,
              paid_by: authenticatedUser?.id,
              payment_method: 2,
              url_payment_document: docUrl,
              id_user: authenticatedUser?.id,
            })
          )
        )
      );
      await dispatch(GetCharges());
      setDeclaredIds(pending.map((c) => c.id));
      handleClose();
    } catch (error) {
      alert("Error al declarar el pago: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setDocUrl(null);
    setUploading(false);
    setSubmitting(false);
    setDeclaredIds([]);
    setSelectedChargeIds(myPendingCharges.map((c) => c.id));
  };

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="dashboard-action-button"
        disabled={!hasPendingCharges}
        title={
          !hasPendingCharges
            ? "No tenés cargos pendientes"
            : "Declarar un pago"
        }
      >
        <FaDollarSign style={{ marginRight: "8px" }} />
        Declarar pago
        {hasPendingCharges && (
          <Badge
            bg="danger"
            pill
            className="ms-2"
            style={{ fontSize: "0.75rem" }}
          >
            {myPendingCharges.length}
          </Badge>
        )}
      </Button>

      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title style={{ color: "#213472", fontWeight: "700" }}>
            Declarar pago
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* Aviso */}
          <div
            className="d-flex align-items-start gap-2 p-3 mb-4 rounded"
            style={{ backgroundColor: "#fff8e1", border: "1px solid #ffe082" }}
          >
            <FaExclamationTriangle className="text-warning mt-1 flex-shrink-0" size={16} />
            <small style={{ color: "#555" }}>
              Acá podés declarar el pago de tus cargos pendientes. Subí el
              comprobante de transferencia y confirmá el pago. Si abonás en{" "}
              <strong>efectivo</strong>, entregá el dinero en un{" "}
              <strong>sobre cerrado y rotulado</strong> directamente en el jardín.
              Más abajo encontrás los datos para la transferencia.
            </small>
          </div>

          {/* Cargos pendientes por hijo */}
          <h6 style={{ color: "#213472", fontWeight: "700" }} className="mb-3">
            Cargos pendientes
          </h6>

          {Object.entries(chargesByInfant).map(([infantId, infantCharges]) => (
            <div key={infantId} className="mb-3">
              <small className="fw-bold d-block mb-1" style={{ color: "#213472" }}>
                {capitalizeName(infantCharges[0]?.infant?.lastname)},{" "}
                {capitalizeName(infantCharges[0]?.infant?.first_name)}
              </small>
              <div className="ms-2">
                {infantCharges.map((charge) => {
                  const isSelected = selectedChargeIds.includes(charge.id);
                  const isDeclared = declaredIds.includes(charge.id);
                  const isQuota = charge.charge_title?.toLowerCase().includes("cuota");
                  const discountedAmount = parseFloat(charge.amount) * 0.95;
                  return (
                    <div
                      key={charge.id}
                      className="py-2"
                      style={{ fontSize: "0.85rem", borderBottom: "1px solid #f0f0f0" }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex align-items-start gap-2">
                          <Form.Check
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCharge(charge.id)}
                            disabled={isDeclared}
                            style={{ marginTop: "2px" }}
                          />
                          <div>
                            {isDeclared ? (
                              <span className="text-success d-flex align-items-center gap-1">
                                <FaCheckCircle size={13} />
                                <span className="fw-semibold">{charge.charge_title}</span>
                              </span>
                            ) : (
                              <span className="fw-semibold text-dark">{charge.charge_title}</span>
                            )}
                            <div className="text-muted">
                              <FaCalendarAlt size={11} className="me-1" />
                              Vence: {formatDate(charge.due_date)}
                            </div>
                          </div>
                        </div>
                        <span className="fw-bold ms-3" style={{ whiteSpace: "nowrap" }}>
                          {formatCurrency(charge.amount)}
                        </span>
                      </div>
                      {isQuota && (
                        <div
                          className="mt-1 ms-4 px-2 py-1 rounded"
                          style={{ backgroundColor: "#e8f5e9", fontSize: "0.78rem", color: "#2e7d32" }}
                        >
                          <strong>Descuento por pago en efectivo:</strong> Si abona en efectivo entre el 1° y el 5° de cada mes, obtiene un 5% de descuento.{" "}
                          <strong>Valor con descuento: {formatCurrency(discountedAmount)}</strong>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Total */}
          <div
            className="d-flex justify-content-between align-items-center pt-2 mt-1"
            style={{ borderTop: "2px solid #213472" }}
          >
            <span className="fw-bold" style={{ color: "#213472" }}>
              Total ({selectedChargeIds.length} cargo{selectedChargeIds.length !== 1 ? "s" : ""} seleccionado{selectedChargeIds.length !== 1 ? "s" : ""})
            </span>
            <span className="fw-bold fs-5" style={{ color: "#213472" }}>
              {formatCurrency(total)}
            </span>
          </div>

          <hr />

          {/* Datos de pago por sede */}
          <h6 style={{ color: "#213472", fontWeight: "700" }} className="mb-3">
            Datos para la transferencia
          </h6>

          <div className="d-flex flex-column gap-3 mb-4">
            {locationsWithCharges.map((location) => {
              const info = PAYMENT_INFO[location];
              if (!info) return null;
              return (
                <div
                  key={location}
                  className="rounded p-3 text-center"
                  style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}
                >
                  <p className="fw-bold mb-2" style={{ color: "#213472", fontSize: "0.95rem" }}>
                    <FaUniversity className="me-2" />
                    {info.sede}
                  </p>
                  <div style={{ fontSize: "0.88rem" }}>
                    <div className="mb-1 d-flex justify-content-center align-items-center gap-1">
                      <span className="text-muted">Alias:</span>
                      <span className="fw-bold text-dark">{info.alias}</span>
                      <CopyAliasButton alias={info.alias} />
                    </div>
                    <div className="mb-1">
                      <span className="text-muted">A nombre de: </span>
                      <span className="fw-bold text-dark">{info.titular}</span>
                    </div>
                    {info.banco && (
                      <div>
                        <span className="text-muted">Banco: </span>
                        <span className="fw-bold text-dark">{info.banco}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comprobante único */}
          <div
            className="rounded p-3"
            style={{ backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}
          >
            <Form.Label className="fw-bold mb-2" style={{ color: "#213472" }}>
              <FaUpload className="me-2" size={13} />
              Comprobante de pago
            </Form.Label>
            <Form.Control
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              disabled={uploading || submitting || selectedChargeIds.length === 0 || declaredIds.length === selectedChargeIds.length}
            />
            {uploading && (
              <div className="mt-2 d-flex align-items-center gap-2">
                <Spinner animation="border" size="sm" />
                <small className="text-muted">Subiendo archivo...</small>
              </div>
            )}
            {docUrl && !uploading && (
              <div className="mt-2 d-flex align-items-center gap-1 text-success">
                <FaCheckCircle size={13} />
                <small>Archivo listo</small>
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cerrar
          </Button>
          {selectedChargeIds.length === 0 ? (
            <small className="text-muted">Seleccioná al menos un cargo para declarar</small>
          ) : declaredIds.length < selectedChargeIds.length ? (
            <Button
              style={{ backgroundColor: "#213472", border: "none" }}
              onClick={handleDeclareAll}
              disabled={!docUrl || uploading || submitting}
            >
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" />
                  Declarando...
                </>
              ) : (
                <>
                  <FaUpload className="me-1" size={13} />
                  Declarar pago
                </>
              )}
            </Button>
          ) : (
            <span className="d-flex align-items-center gap-2 text-success fw-semibold">
              <FaCheckCircle />
              Pago declarado correctamente
            </span>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}
