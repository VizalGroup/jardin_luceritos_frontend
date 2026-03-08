import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectActiveInfantsOrderedByLastName } from "../../../redux/selectors";
import { capitalizeName, getCurrentSQLDate } from "../../../utils";
import { PostCharge, GetCharges } from "../../../redux/actions";
import { Button, Form, Modal, InputGroup, Spinner } from "react-bootstrap";
import {
  FaCalendarDay,
  FaChild,
  FaClock,
  FaDollarSign,
  FaTag,
  FaSearch,
} from "react-icons/fa";

const chargeFormData = {
  id_infant: "",
  id_user: "",
  quantity: "",
  charge_title: "",
  amount: "",
  due_date: "",
  created_at: "",
  current_state: "", // 0 = Pendiente 1 = Pendiente de verificar 2 = Verificado
  paid_at: "",
  payment_method: 0, // 0 = Desconocido 1 = Efectivo 2 = Transferencia
  paid_by: null,
  url_payment_document: null,
};

export default function AddCharge() {
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const infants = useSelector(selectActiveInfantsOrderedByLastName);
  const [formData, setFormData] = useState(chargeFormData);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forAll, setForAll] = useState(false);

  // Estados para el buscador
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInfants, setFilteredInfants] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedInfantName, setSelectedInfantName] = useState("");
  const searchInputRef = useRef(null);

  // Filtrar infantes basado en la búsqueda
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

  // Resetear al abrir el modal
  useEffect(() => {
    if (showModal) {
      setFormData(chargeFormData);
      setSearchQuery("");
      setFilteredInfants([]);
      setShowDropdown(false);
      setSelectedInfantName("");
      setForAll(false);
    }
  }, [showModal]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowDropdown(true);
  };

  const handleSelectInfant = (infant) => {
    setFormData({ ...formData, id_infant: infant.id });
    setSelectedInfantName(
      `${capitalizeName(infant.lastname)} ${capitalizeName(infant.first_name)}`
    );
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!forAll && (!formData.id_infant || formData.id_infant === "")) {
      alert("Debe seleccionar un infante o marcar 'Todos'");
      return;
    }

    setLoading(true);
    try {
      const baseData = {
        ...formData,
        id_user: authenticatedUser.id,
        created_at: getCurrentSQLDate(),
        current_state: 0,
      };

      if (forAll) {
        for (const infant of infants) {
          await dispatch(PostCharge({ ...baseData, id_infant: infant.id }));
        }
      } else {
        await dispatch(PostCharge({ ...baseData, id_infant: parseInt(formData.id_infant) }));
      }

      await dispatch(GetCharges());
      setShowModal(false);
      setFormData(chargeFormData);
      alert(
        forAll
          ? `Cargo generado para ${infants.length} infantes correctamente`
          : "Cargo generado correctamente"
      );
    } catch (error) {
      alert("Error al generar cargo: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button className="button-custom" onClick={() => setShowModal(true)}>
        <FaTag /> Generar cargo/s
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Generar Cargo/s</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Buscador de infante (oculto si es "Todos") */}
            {!forAll && (
              <Form.Group>
                <Form.Label>
                  <FaChild /> Infante
                </Form.Label>
                <div ref={searchInputRef} className="position-relative">
                  {!selectedInfantName ? (
                    <>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaSearch />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Buscar por nombre o apellido..."
                          value={searchQuery}
                          onChange={handleSearchChange}
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
                          <strong>{selectedInfantName}</strong>
                        </div>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => {
                            setSelectedInfantName("");
                            setFormData({ ...formData, id_infant: "" });
                          }}
                        >
                          Cambiar
                        </Button>
                      </div>
                    </div>
                  )}
                  <input type="hidden" name="id_infant" value={formData.id_infant} />
                </div>
              </Form.Group>
            )}

            {/* Checkbox Todos — debajo del buscador */}
            <Form.Group className="mt-2 mb-1">
              <Form.Check
                type="checkbox"
                label={`Todos (${infants.length})`}
                checked={forAll}
                onChange={(e) => {
                  setForAll(e.target.checked);
                  if (e.target.checked) {
                    setSelectedInfantName("");
                    setFormData({ ...formData, id_infant: "" });
                  }
                }}
              />
              {forAll && (
                <Form.Text className="text-muted">
                  Esto creará un cargo vinculado a todos los niños. Marcá esta opción para generar cargos únicos como matrículas, materiales didácticos, etc.
                </Form.Text>
              )}
            </Form.Group>

            <br />
            <Form.Group>
              <Form.Label>
                <FaTag /> Concepto
              </Form.Label>
              <Form.Control
                type="text"
                name="charge_title"
                value={formData.charge_title}
                onChange={handleInputChange}
                placeholder="Matrícula, materiales didácticos, etc..."
                required
              />
            </Form.Group>
            <br />
            <Form.Group>
              <Form.Label>
                <FaClock /> Cantidad
              </Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                step="1"
                placeholder="1"
                required
              />
            </Form.Group>
            <br />
            <Form.Group>
              <Form.Label>
                <FaDollarSign /> Costo Total
              </Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
            </Form.Group>
            <br />
            <Form.Group>
              <Form.Label>
                <FaCalendarDay /> Fecha de vencimiento
              </Form.Label>
              <Form.Control
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>
              Cerrar
            </Button>
            <Button variant="primary" type="submit" className="button" disabled={loading}>
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Generando...
                </>
              ) : (
                "Generar"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}


