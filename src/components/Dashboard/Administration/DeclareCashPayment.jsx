import { useState } from "react";
import { Button, Form, Modal, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import { FaMoneyBillWave } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { capitalizeName, getCurrentSQLDate } from "../../../utils";
import { GetCharges, UpdateCharge } from "../../../redux/actions";

export default function DeclareCashPayment({ charge }) {
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const family_relationships = useSelector((state) => state.family_relationships);

  const [showModal, setShowModal] = useState(false);
  const [paidBy, setPaidBy] = useState("");
  const [loading, setLoading] = useState(false);

  const infantFamilyLinks = family_relationships.filter(
    (link) => link.infant_id === charge.id_infant,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await dispatch(
        UpdateCharge(charge.id, {
          ...charge,
          id_user: authenticatedUser?.id,
          payment_method: 1,
          current_state: 1,
          paid_at: getCurrentSQLDate(),
          paid_by: paidBy,
        }),
      );
      dispatch(GetCharges());
      setShowModal(false);
      setPaidBy("");
    } catch (error) {
      alert("Error actualizando cargo: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={`tooltip-cash-${charge.id}`}>Declarar pago en efectivo</Tooltip>}
      >
        <Button className="button-custom" size="sm" onClick={() => setShowModal(true)}>
          <FaMoneyBillWave />
        </Button>
      </OverlayTrigger>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Declarar pago en efectivo — {charge.charge_title}
            <br />
            <small className="text-muted">
              {capitalizeName(charge.infant?.lastname)},{" "}
              {capitalizeName(charge.infant?.first_name)}
            </small>
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>¿Quién entregó el efectivo?</Form.Label>
              <Form.Select
                name="paid_by"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                required
              >
                <option value="">Seleccione un responsable</option>
                {infantFamilyLinks.map((link) => (
                  <option key={link.id} value={link.user_id}>
                    {capitalizeName(link.user?.first_name)}{" "}
                    {capitalizeName(link.user?.user_last_name)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" className="button" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-1" />
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
