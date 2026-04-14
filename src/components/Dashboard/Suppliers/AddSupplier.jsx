import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetSuppliers, PostSupplier } from "../../../redux/actions";
import { Form, Button, Alert, Modal, Spinner } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BsPersonPlus } from "react-icons/bs";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaStickyNote,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { supplierFormData } from "../../../utils";

export default function AddSupplier() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(supplierFormData);
  const [showError, setShowError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneExistsError, setPhoneExistsError] = useState(false);
  const suppliers = useSelector((state) => state.suppliers);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "phone" && phoneExistsError) {
      setPhoneExistsError(false);
    }
  };

  const phoneExists = (phone) => {
    if (!phone || phone.trim() === "") return false;
    return suppliers.some((supplier) => supplier.phone === phone);
  };

  const handlePhoneChange = (e) => {
    const sanitizedValue = e.target.value.replace(/\D/g, "").slice(0, 10);

    setFormData({ ...formData, phone: sanitizedValue });

    // Verificar si el teléfono ya existe
    if (sanitizedValue && phoneExists(sanitizedValue)) {
      setPhoneExistsError(true);
    } else {
      setPhoneExistsError(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      if (phoneExists(formData.phone)) {
        setPhoneExistsError(true);
        return;
      }

      setIsSubmitting(true);

      await dispatch(PostSupplier(formData));
      await dispatch(GetSuppliers());

      toast.success("El proveedor fue creado con éxito");
      setShowModal(false);
      setFormData(supplierFormData);
    } catch (error) {
      console.error("Error al registrar el proveedor: ", error);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  return (
    <>
      <Button className="button-custom" onClick={handleShowModal}>
        <BsPersonPlus /> Registrar Proveedor
      </Button>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        backdrop={isSubmitting ? "static" : true}
        keyboard={!isSubmitting}
      >
        <Modal.Header closeButton>
          <Modal.Title>Registrar Proveedor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <fieldset disabled={isSubmitting}>
              <Form.Group controlId="supplier_name">
                <Form.Label>
                  <FaBuilding /> Nombre del Proveedor
                </Form.Label>
                <Form.Control
                  type="text"
                  name="supplier_name"
                  value={formData.supplier_name}
                  onChange={handleInputChange}
                  maxLength={50}
                  required
                />
                <Form.Text className="text-muted">
                  Máximo 50 caracteres
                </Form.Text>
              </Form.Group>
              <br />
              <Form.Group controlId="supplier_address">
                <Form.Label>
                  <FaMapMarkerAlt /> Dirección
                </Form.Label>
                <Form.Control
                  type="text"
                  name="supplier_address"
                  value={formData.supplier_address}
                  onChange={handleInputChange}
                  maxLength={50}
                />
                <Form.Text className="text-muted">
                  Máximo 50 caracteres
                </Form.Text>
              </Form.Group>
              <br />
              <Form.Group controlId="phone">
                <Form.Label>
                  <FaPhone /> Teléfono
                </Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  className={phoneExistsError ? "is-invalid" : ""}
                />
                <Form.Text className="text-muted">
                  Máximo 10 caracteres. No incluir 0 ni 15 al inicio.
                </Form.Text>
                {phoneExistsError && (
                  <Alert variant="danger" className="mt-2">
                    Este número de teléfono ya existe en la base de datos.
                  </Alert>
                )}
              </Form.Group>
              <br />
              <Form.Group controlId="iva_condition">
                <Form.Label>
                  <FaFileInvoiceDollar /> Condición IVA
                </Form.Label>
                <Form.Control
                  as="select"
                  name="iva_condition"
                  value={formData.iva_condition}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value={0}>Desconocida</option>
                  <option value={1}>Responsable Inscripto</option>
                  <option value={2}>Monotributista</option>
                  <option value={3}>Otro</option>
                </Form.Control>
              </Form.Group>
              <br />
              <Form.Group controlId="notes">
                <Form.Label>
                  <FaStickyNote /> Notas
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  maxLength={255}
                  placeholder="Observaciones adicionales (opcional)"
                />
                <Form.Text className="text-muted">
                  Máximo 255 caracteres
                </Form.Text>
              </Form.Group>
              <br />
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                  className="button"
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
                  {isSubmitting ? "Registrando..." : "Registrar"}
                </Button>
              </Modal.Footer>
            </fieldset>
          </Form>
        </Modal.Body>
      </Modal>

      <ToastContainer position="top-right" autoClose={4000} />
      {showError && (
        <Alert variant="danger">
          Ocurrió un error, intenta nuevamente más tarde.
        </Alert>
      )}
    </>
  );
}
