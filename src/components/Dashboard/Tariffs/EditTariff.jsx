import { useState } from "react";
import { useDispatch } from "react-redux";
import { getCurrentSQLDate } from "../../../utils";
import { UpdateTariff, GetTariffs } from "../../../redux/actions";
import { Button, Modal, OverlayTrigger, Tooltip, Form } from "react-bootstrap";
import { FaDollarSign, FaEdit, FaClock } from "react-icons/fa";

const EditTariff = ({ tariff }) => {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ ...tariff });

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSuubmit = {
        ...formData,
        last_update: getCurrentSQLDate(),
      };
      // Actualizar la tarifa y refrescar la lista
      await dispatch(UpdateTariff(tariff.id, formDataToSuubmit));
      dispatch(GetTariffs()); // Refrescar lista de tarifas después del update
      setShowModal(false);
    } catch (error) {
      console.error("Error actualizando tarifa: ", error);
    }
  };

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={`tooltip-top`}>Editar</Tooltip>}
      >
        <Button
          variant="warning"
          onClick={() => setShowModal(true)}
          className="button-custom"
        >
          <FaEdit />
        </Button>
      </OverlayTrigger>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modificar Tarifa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Está modificando la tarifa por{" "}
            {formData.number_of_hours <= 1
              ? "hora extra"
              : `${formData.number_of_hours} horas`}
            .
          </p>
          <Form onSubmit={handleSubmit}>
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

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" className="button">
                Guardar
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default EditTariff;
