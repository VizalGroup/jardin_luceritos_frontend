import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { DeleteSupplier, GetSuppliers } from '../../../redux/actions'
import { Button, Modal, OverlayTrigger, Tooltip, Spinner } from 'react-bootstrap'
import { FaTrash } from 'react-icons/fa'

export default function RemoveSupplier({ supplier }) {
  const dispatch = useDispatch()
  const [showModal, setShowModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await dispatch(DeleteSupplier(supplier.id))
      await dispatch(GetSuppliers())
      setShowModal(false)
    } catch (error) {
      console.error('Error eliminando proveedor: ', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={`tooltip-delete-${supplier.id}`}>Eliminar</Tooltip>}
      >
        <Button
          onClick={() => setShowModal(true)}
          className="button-custom"
        >
          <FaTrash />
        </Button>
      </OverlayTrigger>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        backdrop={isDeleting ? 'static' : true}
        keyboard={!isDeleting}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Está seguro que desea eliminar al proveedor{' '}
            <strong>{supplier.supplier_name}</strong>?
          </p>
          <p className="text-muted">Esta acción no se puede deshacer.</p>
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
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
            )}
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
