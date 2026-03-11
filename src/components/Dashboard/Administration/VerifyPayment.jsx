import { useState } from "react";
import { GetCharges, UpdateCharge } from "../../../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaCheck } from "react-icons/fa";
import { capitalizeName } from "../../../utils";

export default function VerifyPayment({ charge }) {
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async () => {
    try {
      const formdataToUpdate = {
        ...charge,
        id_user: authenticatedUser?.id,
        current_state: 2,
      };
      await dispatch(UpdateCharge(charge.id, formdataToUpdate));
      dispatch(GetCharges());
      setShowModal(false);
    } catch (error) {
      alert("Error actualizando cargo: " + error);
    }
  };

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={`tooltip-verify-${charge.id}`}>Aprobar pago</Tooltip>}
      >
        <Button variant="success" size="sm" className="button-custom" onClick={() => setShowModal(true)}>
          <FaCheck />
        </Button>
      </OverlayTrigger>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Verificación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Está seguro que quiere pasar el estado del cargo{" "}
            <b>#{charge.id}:</b>{" "}
            <i>
              {charge.charge_title}.{" "}
              {capitalizeName(charge.infant?.lastname)}{" "}
              {capitalizeName(charge.infant?.first_name)}
            </i>{" "}
            a verificado?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleSubmit} className="button">
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
