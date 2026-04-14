import { useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DeleteExpense, GetExpenses } from "../../../redux/actions";
import { formatCurrency } from "../../../utils";

export default function RemoveExpense({ expense }) {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRemove = async () => {
    setIsDeleting(true);
    try {
      await dispatch(DeleteExpense(expense.id));
      await dispatch(GetExpenses());
      setShowModal(false);
      toast.success("Gasto eliminado correctamente");
    } catch (error) {
      toast.error("Error al eliminar el gasto. Intenta nuevamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
   
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={`tooltip-delete-expense-${expense.id}`}>
            Eliminar gasto
          </Tooltip>
        }
      >
        <Button
          variant="danger"
          className="button-custom"
          onClick={() => setShowModal(true)}
          disabled={isDeleting}
        >
          <FaTrash />
        </Button>
      </OverlayTrigger>

      <Modal show={showModal} onHide={() => !isDeleting && setShowModal(false)}>
        <Modal.Header closeButton={!isDeleting}>
          <Modal.Title>Eliminar Gasto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Está seguro que desea eliminar el gasto <strong>#{expense.id}</strong>?
          </p>
          <p>
            <strong>Proveedor:</strong>{" "}
            {expense.supplier?.supplier_name || "Sin proveedor"}
            <br />
            <strong>Categoría:</strong>{" "}
            {expense.category?.category_name || "Sin categoría"}
            <br />
            <strong>Monto:</strong> {formatCurrency(expense.amount)}
            {expense.notes && (
              <>
                <br />
                <strong>Nota:</strong> {expense.notes}
              </>
            )}
          </p>
          <p className="text-danger">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleRemove}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
