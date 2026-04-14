import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { UpdateSupplier, GetSuppliers } from '../../../redux/actions'
import { Button, Form, Modal, OverlayTrigger, Tooltip, Alert, Spinner } from 'react-bootstrap'
import { FaEdit, FaBuilding, FaMapMarkerAlt, FaPhone, FaStickyNote, FaFileInvoiceDollar } from 'react-icons/fa'

export default function EditSupplier({ supplier }) {
  const dispatch = useDispatch()
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState(supplier)
  const [phoneExistsError, setPhoneExistsError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const suppliers = useSelector((state) => state.suppliers)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (name === 'phone' && phoneExistsError) {
      setPhoneExistsError(false)
    }
  }

  const phoneExists = (phone) => {
    if (!phone || phone.trim() === '') return false
    // Excluir el proveedor actual de la verificación
    return suppliers.some((sup) => sup.phone === phone && sup.id !== supplier.id)
  }

  const handlePhoneChange = (e) => {
    const sanitizedValue = e.target.value.replace(/\D/g, '').slice(0, 10)

    setFormData({ ...formData, phone: sanitizedValue })

    // Verificar si el teléfono ya existe
    if (sanitizedValue && phoneExists(sanitizedValue)) {
      setPhoneExistsError(true)
    } else {
      setPhoneExistsError(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    try {
      if (phoneExists(formData.phone)) {
        setPhoneExistsError(true)
        return
      }

      setIsSubmitting(true)

      await dispatch(UpdateSupplier(supplier.id, formData))
      dispatch(GetSuppliers())
      setShowModal(false)
    } catch (error) {
      console.error('Error actualizando proveedor: ', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={`tooltip-top`}>Editar</Tooltip>}
      >
        <Button className="button-custom" onClick={() => setShowModal(true)}>
          <FaEdit />
        </Button>
      </OverlayTrigger>

      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        backdrop={isSubmitting ? "static" : true}
        keyboard={!isSubmitting}
      >
        <Modal.Header closeButton>
          <Modal.Title>Modificar Proveedor</Modal.Title>
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
                  required
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
                  required
                  className={phoneExistsError ? 'is-invalid' : ''}
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
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={isSubmitting}
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
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </Modal.Footer>
            </fieldset>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  )
}
