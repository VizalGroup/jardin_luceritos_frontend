import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Button, Alert, Modal, Spinner } from "react-bootstrap";
import {
  FaPlus,
  FaReceipt,
  FaDollarSign,
  FaBuilding,
  FaTag,
  FaCreditCard,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaStickyNote,
} from "react-icons/fa";
import {
  selectSortedExpenseCategories,
  selectSortedSuppliers,
} from "../../../redux/selectors";
import { capitalizeName, getCurrentDateTime } from "../../../utils";
import { PostExpense, GetExpenses } from "../../../redux/actions";
import SupplierModal from "../Suppliers/SupplierModal";

export default function AddExpenses() {
  const dispatch = useDispatch();
  const suppliers = useSelector(selectSortedSuppliers);
  const authenticatedUser = useSelector((state) => state.authenticatedUser);

  const expensesCategories = useSelector(selectSortedExpenseCategories);

  const [showModal, setShowModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [formData, setFormData] = useState({
    current_state: 0,
    id_category: "",
    id_supplier: "",
    payment_method: 0,
    notes: "",
    amount: "",
    debt: "",
    created_at: getCurrentDateTime(),
    created_by: authenticatedUser?.id,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSupplierChange = (e) => {
    if (e.target.value === "NEW") {
      setShowSupplierModal(true);
    } else {
      setFormData({ ...formData, id_supplier: e.target.value });
    }
  };

  const handleNewSupplierSuccess = (newSupplierId) => {
    if (newSupplierId) {
      setFormData((prev) => ({ ...prev, id_supplier: String(newSupplierId) }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validar que amount y debt sean números positivos
    if ((name === "amount" || name === "debt") && value !== "") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) return;
    }

    setFormData({ ...formData, [name]: value });

    // Si cambia el estado a algo diferente de "parcialmente pagado", limpiar deuda
    if (name === "current_state" && parseInt(value) !== 1) {
      setFormData((prev) => ({ ...prev, [name]: value, debt: "" }));
    }

    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validar que si es parcialmente pagado, tenga deuda
      if (
        parseInt(formData.current_state) === 1 &&
        (!formData.debt || parseFloat(formData.debt) <= 0)
      ) {
        setError(
          "Para gastos parcialmente pagados debe especificar la deuda pendiente."
        );
        return;
      }

      // Validar que la deuda no sea mayor al monto
      if (
        parseInt(formData.current_state) === 1 &&
        parseFloat(formData.debt) >= parseFloat(formData.amount)
      ) {
        setError("La deuda no puede ser mayor o igual al monto total.");
        return;
      }

      const dataToSend = {
        ...formData,
        amount: parseFloat(formData.amount),
        debt: formData.debt ? parseFloat(formData.debt) : null,
        id_category: parseInt(formData.id_category),
        id_supplier: parseInt(formData.id_supplier),
        current_state: parseInt(formData.current_state),
        payment_method: parseInt(formData.payment_method),
      };

      await dispatch(PostExpense(dataToSend));
      await dispatch(GetExpenses());

      setFormData({
        current_state: 0,
        id_category: "",
        id_supplier: "",
        payment_method: 0,
        notes: "",
        amount: "",
        debt: "",
        created_at: getCurrentDateTime(),
        created_by: authenticatedUser?.id,
      });
      setShowModal(false);
    } catch (error) {
      console.error("Error adding expense:", error);
      setError("Error al guardar el gasto. Por favor, inténtelo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setShowModal(false);
      setFormData({
        current_state: 0,
        id_category: "",
        id_supplier: "",
        payment_method: 0,
        notes: "",
        amount: "",
        debt: "",
        created_at: getCurrentDateTime(),
        created_by: parseInt(id),
      });
      setError(null);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        disabled={isSubmitting}
        className="button-custom"
      >
        <FaPlus className="me-2" />
        Agregar Gasto
      </Button>

      <Modal
        show={showModal}
        onHide={handleClose}
        backdrop={isSubmitting ? "static" : true}
      >
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title>
            <FaReceipt className="me-2" />
            Nuevo Gasto
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              <FaExclamationTriangle className="me-2" />
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>
                <FaCalendarAlt className="me-2" />
                Estado del Pago
              </Form.Label>
              <Form.Control
                as="select"
                name="current_state"
                value={formData.current_state}
                onChange={handleInputChange}
                disabled={isSubmitting}
              >
                <option value={0}>Pendiente de pago</option>
                <option value={1}>Parcialmente pagado</option>
                <option value={2}>Pagado</option>
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <FaTag className="me-2" />
                Categoría
              </Form.Label>
              <Form.Control
                as="select"
                name="id_category"
                value={formData.id_category}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                <option value="">Seleccionar categoría</option>
                {expensesCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                  </option>
                ))}
              </Form.Control>
              {formData.id_category && (
                <Form.Text className="text-muted mt-1">
                  {
                    expensesCategories.find(
                      (cat) => cat.id == parseInt(formData.id_category)
                    )?.aux_description
                  }
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <FaBuilding className="me-2" />
                Proveedor
              </Form.Label>
              <Form.Control
                as="select"
                name="id_supplier"
                value={formData.id_supplier}
                onChange={handleSupplierChange}
                required
                disabled={isSubmitting}
              >
                <option value="">Seleccionar proveedor</option>
                <option value="NEW" style={{ fontWeight: "bold" }}>Crear nuevo proveedor</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {capitalizeName(supplier.supplier_name)}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <FaCreditCard className="me-2" />
                Método de Pago
              </Form.Label>
              <Form.Control
                as="select"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                disabled={isSubmitting}
              >
                <option value={0}>Efectivo</option>
                <option value={1}>Transferencia</option>
                <option value={2}>Otro</option>
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <FaStickyNote className="me-2" />
                Notas
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Notas adicionales (opcional)"
                disabled={isSubmitting}
                maxLength={100}
              />
              <Form.Text className="text-muted">
                {formData.notes.length}/100 caracteres
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <FaDollarSign className="me-2" />
                Monto
              </Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault();
                  }
                }}
                required
                disabled={isSubmitting}
              />
            </Form.Group>

            {parseInt(formData.current_state) === 1 && (
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaDollarSign className="me-2" />
                  Deuda Pendiente
                </Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  name="debt"
                  value={formData.debt}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  required={parseInt(formData.current_state) === 1}
                  disabled={isSubmitting}
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            className="button-custom"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !formData.amount ||
              !formData.id_category ||
              !formData.id_supplier
            }
          >
            {isSubmitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  className="me-2"
                />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <SupplierModal
        show={showSupplierModal}
        onHide={() => setShowSupplierModal(false)}
        onSuccess={handleNewSupplierSuccess}
      />
    </>
  );
}
