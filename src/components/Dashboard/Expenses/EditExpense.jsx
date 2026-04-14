import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Form,
  Button,
  Modal,
  OverlayTrigger,
  Tooltip,
  Spinner,
} from "react-bootstrap";
import {
  FaEdit,
  FaDollarSign,
  FaBuilding,
  FaTag,
  FaCreditCard,
  FaCalendarAlt,
  FaStickyNote,
} from "react-icons/fa";
import {
  selectSortedExpenseCategories,
  selectSortedSuppliers,
} from "../../../redux/selectors";
import { UpdateExpense, GetExpenses } from "../../../redux/actions";

export default function EditExpense({ expense }) {
  const dispatch = useDispatch();
  const suppliers = useSelector(selectSortedSuppliers);
  const expensesCategories = useSelector(selectSortedExpenseCategories);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    current_state: expense.current_state,
    id_category: expense.id_category,
    id_supplier: expense.id_supplier,
    payment_method: expense.payment_method,
    notes: expense.notes || "",
    amount: expense.amount,
    debt: expense.debt || "",
    created_at: expense.created_at,
    created_by: expense.created_by,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if ((name === "amount" || name === "debt") && value !== "") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) return;
    }

    setFormData({ ...formData, [name]: value });

    if (name === "current_state" && parseInt(value) !== 1) {
      setFormData((prev) => ({ ...prev, [name]: value, debt: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const dataToSend = {
        ...formData,
        amount: parseFloat(formData.amount),
        debt: formData.debt ? parseFloat(formData.debt) : null,
        id_category: parseInt(formData.id_category),
        id_supplier: parseInt(formData.id_supplier),
        current_state: parseInt(formData.current_state),
        payment_method: parseInt(formData.payment_method),
        created_at: formData.created_at,
        created_by: parseInt(formData.created_by),
      };

      await dispatch(UpdateExpense(expense.id, dataToSend));
      await dispatch(GetExpenses());
      setShowModal(false);
    } catch (error) {
      console.error("Error actualizando gasto:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setShowModal(false);
      setFormData({
        current_state: expense.current_state,
        id_category: expense.id_category,
        id_supplier: expense.id_supplier,
        payment_method: expense.payment_method,
        notes: expense.notes || "",
        amount: expense.amount,
        debt: expense.debt || "",
        created_at: expense.created_at,
        created_by: expense.created_by,
      });
    }
  };

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={`tooltip-edit-${expense.id}`}>Editar</Tooltip>}
      >
        <Button className="button-custom" onClick={() => setShowModal(true)}>
          <FaEdit />
        </Button>
      </OverlayTrigger>

      <Modal
        show={showModal}
        onHide={handleClose}
        backdrop={isSubmitting ? "static" : true}
        keyboard={!isSubmitting}
      >
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title>Modificar Gasto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <fieldset disabled={isSubmitting}>
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
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar proveedor</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplier_name}
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
                  />
                </Form.Group>
              )}
            </fieldset>
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
            variant="primary"
            type="submit"
            className="button-custom"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !formData.amount ||
              !formData.id_category ||
              !formData.id_supplier
            }
          >
            {isSubmitting && (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                className="me-2"
              />
            )}
            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
