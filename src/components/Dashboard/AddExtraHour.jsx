import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Modal, InputGroup, Spinner } from "react-bootstrap";
import { FaChild, FaClock, FaDollarSign, FaRegClock, FaSearch } from "react-icons/fa";
import { capitalizeName, getCurrentSQLDate } from "../../utils";
import {
  selectActiveInfantsOrderedByLastName,
  selectExtraHour,
} from "../../redux/selectors";
import { GetCharges, PostCharge } from "../../redux/actions";

const chargeFormData = {
  id_infant: "",
  id_user: "",
  quantity: "",
  charge_title: "",
  amount: "",
  due_date: "",
  created_at: "",
  current_state: "",
  paid_at: "",
  payment_method: 0,
  paid_by: null,
  url_payment_document: null,
};

const getNextMonthDueDate = () => {
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 10);
  const year = nextMonth.getFullYear();
  const month = String(nextMonth.getMonth() + 1).padStart(2, "0");
  const day = String(nextMonth.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AddExtraHour() {
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const infants = useSelector(selectActiveInfantsOrderedByLastName);
  const extraHour = useSelector(selectExtraHour);

  const [formData, setFormData] = useState({
    ...chargeFormData,
    due_date: getNextMonthDueDate(),
  });
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      setFormData({ ...chargeFormData, due_date: getNextMonthDueDate() });
      setSearchQuery("");
      setFilteredInfants([]);
      setShowDropdown(false);
      setSelectedInfantName("");
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

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData({ ...formData, quantity: value });
    }
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
    if (isLoading) return;

    const quantity = parseFloat(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert("Por favor, ingrese una cantidad válida mayor que cero.");
      return;
    }

    setIsLoading(true);
    try {
      const formDataToSubmit = {
        ...formData,
        id_user: authenticatedUser.id,
        created_at: getCurrentSQLDate(),
        quantity,
        amount: extraHour.price * quantity,
        current_state: 0,
      };
      await dispatch(PostCharge(formDataToSubmit));
      await dispatch(GetCharges());
      setFormData({ ...chargeFormData, due_date: getNextMonthDueDate() });
      setSelectedInfantName("");
      setShowModal(false);
    } catch (error) {
      alert("Error al registrar hora extra: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button className="button-custom" onClick={() => setShowModal(true)}>
        <FaRegClock style={{ marginRight: "6px" }} />
        Agregar hora extra
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Hora Extra</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Buscador de infante */}
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
                <input type="hidden" name="id_infant" value={formData.id_infant} required />
              </div>
            </Form.Group>

            <br />

            <Form.Group>
              <Form.Label>
                <FaClock /> Cantidad de horas
              </Form.Label>
              <Form.Control
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleQuantityChange}
                placeholder="Ej: 0.5, 1, 1.5"
                required
              />
              <Form.Text className="text-muted">
                Puede ingresar valores decimales (ej: 0.5 para media hora)
              </Form.Text>
            </Form.Group>

            <br />

            {extraHour && (
              <>
                <Form.Group>
                  <Form.Label>
                    <FaDollarSign /> Costo Total
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={(extraHour.price * parseFloat(formData.quantity || 0)).toFixed(2)}
                    readOnly
                    disabled
                  />
                </Form.Group>
                <br />
              </>
            )}

            <Form.Group>
              <Form.Label>
                <FaRegClock /> Concepto/Cargo
              </Form.Label>
              <Form.Control
                type="text"
                name="charge_title"
                value={formData.charge_title}
                onChange={handleInputChange}
                placeholder="Retiro tardío, Hora extra programada, etc."
                required
              />
            </Form.Group>

            <br />

            <Form.Group>
              <Form.Label>
                <FaRegClock /> Fecha de vencimiento
              </Form.Label>
              <Form.Control
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                required
              />
              <Form.Text className="text-muted">
                Por defecto se establece al día 10 del próximo mes
              </Form.Text>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="button-custom"
              disabled={isLoading}
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
                "Guardar"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
