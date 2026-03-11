import { useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { DeleteCharge, GetCharges } from "../../../redux/actions";
import { capitalizeName, formatCurrency } from "../../../utils";

export default function RemoveCharge({ charge }) {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);

  const handleRemove = async () => {
    try {
      await dispatch(DeleteCharge(charge.id));
      await dispatch(GetCharges());
      setShowModal(false);
      alert("Cargo eliminado correctamente");
    } catch (error) {
      alert("Error eliminando cargo: " + error);
    }
  };

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={`tooltip-delete-${charge.id}`}>Eliminar cargo</Tooltip>}
      >
        <Button variant="danger" size="sm" className="button-custom" onClick={() => setShowModal(true)}>
          <FaTrash />
        </Button>
      </OverlayTrigger>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar Cargo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Está seguro que desea eliminar el cargo <b>#{charge.id}</b>?<br />
            <strong>Concepto:</strong> {charge.charge_title},{" "}
            {capitalizeName(charge.infant?.lastname)}{" "}
            {capitalizeName(charge.infant?.first_name)}
            <br />
            <strong>Monto:</strong> {formatCurrency(charge.amount)}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleRemove}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
