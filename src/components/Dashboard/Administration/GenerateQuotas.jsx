import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Modal, ProgressBar } from "react-bootstrap";
import { getCurrentSQLDate } from "../../../utils";
import { selectActiveInfantsWithFixedFee } from "../../../redux/selectors";
import { FaRegClock, FaTags } from "react-icons/fa";
import { PostCharge, GetCharges } from "../../../redux/actions";

const chargeFormData = {
  charge_title: "",
  due_date: "",
};

export default function GenerateQuotas() {
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const infants = useSelector(selectActiveInfantsWithFixedFee);
  const [formData, setFormData] = useState(chargeFormData);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProgress(0);

    try {
      const totalInfants = infants.length;
      let completed = 0;

      for (const infant of infants) {
        const chargeData = {
          ...formData,
          id_user: authenticatedUser.id,
          id_infant: infant.id,
          quantity: 1,
          amount: infant.tariff.price,
          created_at: getCurrentSQLDate(),
          current_state: 0,
          paid_at: "",
          payment_method: 0,
          paid_by: null,
          url_payment_document: null,
        };

        await dispatch(PostCharge(chargeData));
        completed++;
        setProgress((completed / totalInfants) * 100);
      }

      await dispatch(GetCharges());
      setTimeout(() => {
        setShowModal(false);
        setFormData(chargeFormData);
        setLoading(false);
      }, 500);
      alert("Cuotas generadas correctamente");
    } catch (error) {
      alert("Error al generar cuotas: " + error.message);
      setLoading(false);
    }
  };

  const getNextMonthPlaceholder = () => {
    const date = new Date();
    const monthName = date.toLocaleString("es-ES", { month: "long" });
    return `Cuota ${
      monthName.charAt(0).toUpperCase() + monthName.slice(1)
    } ${date.getFullYear()}`;
  };

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setShowModal(true)}
        className="button-custom"
      >
        <FaTags /> Generar cuotas
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Generar cuotas</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>
                <FaRegClock /> Concepto/Cargo
              </Form.Label>
              <Form.Control
                type="text"
                name="charge_title"
                value={formData.charge_title}
                onChange={handleInputChange}
                placeholder={getNextMonthPlaceholder()}
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
            </Form.Group>
            <br />

            {loading && (
              <ProgressBar
                now={progress}
                animated
                striped
                variant="primary"
              />
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="button-custom"
              disabled={loading}
            >
              {loading ? "Generando..." : "Generar"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

