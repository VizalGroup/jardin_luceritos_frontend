import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Modal, InputGroup, Spinner } from "react-bootstrap";
import {
  FaMoneyBillWave,
  FaChild,
  FaSearch,
  FaCheckCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import { capitalizeName, formatCurrency, formatDate, getCurrentSQLDate } from "../../utils";
import { selectActiveInfantsOrderedByLastName, selectChargesOrderedById } from "../../redux/selectors";
import { UpdateCharge, GetCharges } from "../../redux/actions";

export default function DeclareCashReceived() {
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const infants = useSelector(selectActiveInfantsOrderedByLastName);
  const allCharges = useSelector(selectChargesOrderedById);
  const familyRelationships = useSelector((state) => state.family_relationships);

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Buscador
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInfants, setFilteredInfants] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedInfant, setSelectedInfant] = useState(null);
  const searchInputRef = useRef(null);

  // Responsable del pago
  const [paidBy, setPaidBy] = useState("");

  // Cargos seleccionados
  const [selectedChargeIds, setSelectedChargeIds] = useState([]);

  // Familiares del infante seleccionado
  const infantFamilyLinks = selectedInfant
    ? familyRelationships.filter((link) => link.infant_id === selectedInfant.id)
    : [];

  // Cargos pendientes del infante seleccionado
  const pendingCharges = selectedInfant
    ? allCharges.filter(
        (c) => c.id_infant === selectedInfant.id && c.current_state === 0
      )
    : [];

  // Filtrar infantes por búsqueda
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredInfants([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = infants.filter((infant) => {
      const fullName = `${infant.lastname} ${infant.first_name}`.toLowerCase();
      const fullNameReversed = `${infant.first_name} ${infant.lastname}`.toLowerCase();
      return fullName.includes(query) || fullNameReversed.includes(query);
    });
    setFilteredInfants(filtered);
  }, [searchQuery, infants]);

  // Inicializar todos los cargos seleccionados al cambiar de infante
  useEffect(() => {
    if (selectedInfant) {
      setSelectedChargeIds(
        allCharges
          .filter((c) => c.id_infant === selectedInfant.id && c.current_state === 0)
          .map((c) => c.id)
      );
    }
  }, [selectedInfant, allCharges]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectInfant = (infant) => {
    setSelectedInfant(infant);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const toggleCharge = (id) => {
    setSelectedChargeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleClose = () => {
    setShowModal(false);
    setSearchQuery("");
    setFilteredInfants([]);
    setSelectedInfant(null);
    setSelectedChargeIds([]);
    setPaidBy("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedChargeIds.length === 0) return;

    setIsLoading(true);
    try {
      const paidAt = getCurrentSQLDate();
      await Promise.all(
        selectedChargeIds.map((chargeId) => {
          const charge = allCharges.find((c) => c.id === chargeId);
          return dispatch(
            UpdateCharge(chargeId, {
              ...charge,
              id_user: authenticatedUser.id,
              current_state: 1,
              payment_method: 1,
              paid_at: paidAt,
              paid_by: paidBy,
            })
          );
        })
      );
      await dispatch(GetCharges());
      handleClose();
    } catch (error) {
      alert("Error al declarar el efectivo: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const total = pendingCharges
    .filter((c) => selectedChargeIds.includes(c.id))
    .reduce((sum, c) => sum + parseFloat(c.amount), 0);

  return (
    <>
      <Button className="button-custom" onClick={() => setShowModal(true)}>
        <FaMoneyBillWave style={{ marginRight: "6px" }} />
        Declarar efectivo recibido
      </Button>

      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Declarar efectivo recibido</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Buscador de infante */}
            <Form.Group className="mb-3">
              <Form.Label>
                <FaChild /> Infante
              </Form.Label>
              <div ref={searchInputRef} className="position-relative">
                {!selectedInfant ? (
                  <>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaSearch />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Buscar por nombre o apellido..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowDropdown(true);
                        }}
                        onClick={() => setShowDropdown(true)}
                      />
                    </InputGroup>
                    {showDropdown && filteredInfants.length > 0 && (
                      <div
                        className="position-absolute w-100 bg-white border rounded shadow-sm"
                        style={{
                          zIndex: 1050,
                          maxHeight: "200px",
                          overflowY: "auto",
                          marginTop: "2px",
                        }}
                      >
                        {filteredInfants.map((infant) => (
                          <div
                            key={infant.id}
                            className="p-2 border-bottom"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleSelectInfant(infant)}
                          >
                            {`${capitalizeName(infant.lastname)} ${capitalizeName(infant.first_name)}`}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-3 bg-light rounded border">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <FaChild className="me-2" />
                        <strong>
                          {capitalizeName(selectedInfant.lastname)},{" "}
                          {capitalizeName(selectedInfant.first_name)}
                        </strong>
                      </div>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => {
                          setSelectedInfant(null);
                          setSelectedChargeIds([]);
                        }}
                      >
                        Cambiar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Form.Group>

            {/* Responsable del pago */}
            {selectedInfant && (
              <Form.Group className="mb-3">
                <Form.Label>¿Quién entregó el efectivo?</Form.Label>
                <Form.Select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  required
                >
                  <option value="">Seleccione un responsable</option>
                  {infantFamilyLinks.map((link) => (
                    <option key={link.id} value={link.user_id}>
                      {capitalizeName(link.user?.first_name)}{" "}
                      {capitalizeName(link.user?.user_last_name)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            {/* Cargos pendientes */}
            {selectedInfant && (
              <>
                <h6 style={{ color: "#213472", fontWeight: "700" }} className="mb-2">
                  Cargos pendientes
                </h6>

                {pendingCharges.length === 0 ? (
                  <p className="text-muted">
                    Este infante no tiene cargos pendientes.
                  </p>
                ) : (
                  <>
                    {pendingCharges.map((charge) => (
                      <div
                        key={charge.id}
                        className="d-flex align-items-start gap-2 py-2"
                        style={{ borderBottom: "1px solid #f0f0f0", fontSize: "0.88rem" }}
                      >
                        <Form.Check
                          type="checkbox"
                          checked={selectedChargeIds.includes(charge.id)}
                          onChange={() => toggleCharge(charge.id)}
                          style={{ marginTop: "2px" }}
                        />
                        <div className="flex-grow-1">
                          <span className="fw-semibold text-dark">{charge.charge_title}</span>
                          <div className="text-muted">
                            <FaCalendarAlt size={11} className="me-1" />
                            Vence: {formatDate(charge.due_date)}
                          </div>
                        </div>
                        <span className="fw-bold text-danger" style={{ whiteSpace: "nowrap" }}>
                          {formatCurrency(charge.amount)}
                        </span>
                      </div>
                    ))}

                    {/* Total */}
                    <div
                      className="d-flex justify-content-between align-items-center pt-2 mt-1"
                      style={{ borderTop: "2px solid #213472" }}
                    >
                      <span className="fw-bold" style={{ color: "#213472" }}>
                        Total ({selectedChargeIds.length} cargo{selectedChargeIds.length !== 1 ? "s" : ""})
                      </span>
                      <span className="fw-bold fs-5" style={{ color: "#213472" }}>
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              className="button-custom"
              type="submit"
              disabled={
                isLoading ||
                !selectedInfant ||
                !paidBy ||
                selectedChargeIds.length === 0 ||
                pendingCharges.length === 0
              }
            >
              {isLoading ? (
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
                  <FaCheckCircle className="me-2" />
                  Confirmar efectivo recibido
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
