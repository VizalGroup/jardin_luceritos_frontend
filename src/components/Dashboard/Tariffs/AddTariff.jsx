import { useState } from "react";
import { useDispatch } from "react-redux";
import { GetTariffs, PostTariff } from "../../../redux/actions";
import { Form, Button, Alert, Modal, Spinner } from "react-bootstrap";
import { FaClock, FaDollarSign, FaPlus, FaBaby } from "react-icons/fa";
import { getCurrentSQLDate } from "../../../utils";

export default function AddTariff() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    number_of_hours: "",
    price: "",
    infant_type: "0",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowSuccess(false);
    setShowError(false);

    try {
      const tariffToSubmit = {
        ...formData,
        last_update: getCurrentSQLDate(),
      };
      console.log(tariffToSubmit);

      await dispatch(PostTariff(tariffToSubmit));
      dispatch(GetTariffs());
      setFormData({ number_of_hours: "", price: "", infant_type: "0" });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setShowModal(false);
      }, 2000);
    } catch (error) {
      alert("Error al agregar tarifa: ", error);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="warning"
        onClick={() => setShowModal(true)}
        className="button-custom"
      >
        <FaPlus /> Agregar Tarifa
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Tarifa</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group controlId="number_of_hours">
              <Form.Label>
                <FaClock /> Horas
              </Form.Label>
              <Form.Control
                type="number"
                name="number_of_hours"
                value={formData.number_of_hours}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Text className="text-muted">
              Para horas y media, use ".5" (ejemplo: 4 horas y media = 4.5)
            </Form.Text>
            <br />
            <br />
            <Form.Group controlId="infant_type">
              <Form.Label>
                <FaBaby /> Tipo de infante
              </Form.Label>
              <Form.Select
                name="infant_type"
                value={formData.infant_type}
                onChange={handleInputChange}
                required
              >
                <option value="0">Regular</option>
                <option value="1">Bebé/Lactante</option>
              </Form.Select>
            </Form.Group>
            <br />
            <Form.Group controlId="price">
              <Form.Label>
                <FaDollarSign /> Costo
              </Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault();
                  }
                }}
                required
              />
            </Form.Group>

            {showSuccess && (
              <Alert variant="success">Tarifa agregada con éxito!</Alert>
            )}
            {showError && (
              <Alert variant="danger">Error al agregar la tarifa.</Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cerrar
            </Button>

            <Button
              variant="primary"
              type="submit"
              className="button-custom"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{" "}
                  Agregando...
                </>
              ) : (
                "Agregar"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
