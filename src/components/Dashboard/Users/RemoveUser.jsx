import { useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Modal } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { DeleteUser, GetUsers } from "../../../redux/actions";

export default function RemoveUser({ user }) {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleDelete = async () => {
    try {
      await dispatch(DeleteUser(user.id));
      await dispatch(GetUsers());
      handleClose();
    } catch (error) {
      alert("Error al eliminar el usuario: " + error.message);
    }
  };

  return (
    <>
      <Button
        variant="danger"
        size="sm"
        style={{ margin: "2px" }}
        onClick={handleShow}
        title="Eliminar usuario"
      >
        <FaTrash />
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Eliminar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Está seguro que desea eliminar al usuario{" "}
          <b>{user.first_name} {user.lastname}</b>?<br />
          <br />
          <span className="text-muted">Email: {user.email}</span>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
