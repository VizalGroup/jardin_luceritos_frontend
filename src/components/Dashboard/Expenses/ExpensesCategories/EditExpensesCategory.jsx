import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  UpdateExpenseCategory,
  GetExpenseCategories,
} from "../../../../redux/actions";
import {
  Button,
  Form,
  Modal,
  OverlayTrigger,
  Tooltip,
  Spinner,
} from "react-bootstrap";
import { FaEdit, FaBookmark, FaAlignLeft } from "react-icons/fa";

export default function EditExpensesCategory({ category }) {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category_name: category.category_name,
    aux_description: category.aux_description || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "aux_description" && value.length > 255) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await dispatch(UpdateExpenseCategory(category.id, formData));
      await dispatch(GetExpenseCategories());
      setShowModal(false);
    } catch (error) {
      console.error("Error actualizando categoría: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setShowModal(false);
      setFormData({
        category_name: category.category_name,
        aux_description: category.aux_description || "",
      });
    }
  };

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={`tooltip-top`}>Editar</Tooltip>}
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
          <Modal.Title>Modificar Categoría</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <fieldset disabled={isSubmitting}>
              <Form.Group controlId="category_name">
                <Form.Label>
                  <FaBookmark className="me-2" />
                  Nombre de la Categoría
                </Form.Label>
                <Form.Control
                  type="text"
                  name="category_name"
                  value={formData.category_name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <br />
              <Form.Group controlId="aux_description">
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
                  maxLength={255}
                />
                <Form.Text className="text-muted">
                  {formData.aux_description.length}/255 caracteres
                </Form.Text>
              </Form.Group>
              <br />
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
                  disabled={isSubmitting || !formData.category_name.trim()}
                  className="button-custom"
                >
                  {isSubmitting && (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                  )}
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </Modal.Footer>
            </fieldset>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
