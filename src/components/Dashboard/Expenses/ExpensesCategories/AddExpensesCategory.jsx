import { useState } from "react";
import { useDispatch } from "react-redux";
import { Form, Button, Alert, Modal, Spinner } from "react-bootstrap";
import {
  FaPlus,
  FaTag,
  FaBookmark,
  FaAlignLeft,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  PostExpenseCategory,
  GetExpenseCategories,
} from "../../../../redux/actions";

export default function AddExpensesCategory() {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category_name: "",
    aux_description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "aux_description" && value.length > 255) return;
    setFormData({ ...formData, [name]: value });
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await dispatch(PostExpenseCategory(formData));
      await dispatch(GetExpenseCategories());
      setFormData({
        category_name: "",
        aux_description: "",
      });
      setShowModal(false);
    } catch (error) {
      console.error("Error adding expense category:", error);
      setError("Error al guardar la categoría. Por favor, inténtelo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setShowModal(false);
      setFormData({
        category_name: "",
        aux_description: "",
      });
      setError(null);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setShowModal(true)}
        disabled={isSubmitting}
        className="button-custom"
      >
        <FaPlus className="me-2" />
        Agregar Categoría
      </Button>

      <Modal
        show={showModal}
        onHide={handleClose}
        backdrop={isSubmitting ? "static" : true}
      >
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title>
            <FaTag className="me-2" />
            Nueva Categoría de Gastos
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
                <FaBookmark className="me-2" />
                Nombre de la Categoría
              </Form.Label>
              <Form.Control
                type="text"
                name="category_name"
                value={formData.category_name}
                onChange={handleInputChange}
                placeholder="Ingrese el nombre de la categoría"
                required
                disabled={isSubmitting}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <FaAlignLeft className="me-2" />
                Descripción
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="aux_description"
                value={formData.aux_description}
                onChange={handleInputChange}
                placeholder="Descripción opcional"
                disabled={isSubmitting}
                maxLength={255}
              />
              <Form.Text className="text-muted">
                {formData.aux_description.length}/255 caracteres
              </Form.Text>
            </Form.Group>
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
            className="button-custom"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.category_name.trim()}
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
    </>
  );
}
