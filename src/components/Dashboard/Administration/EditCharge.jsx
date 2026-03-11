import { useState, useEffect } from "react";
import { GetCharges, UpdateCharge } from "../../../redux/actions";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Form,
  Modal,
  OverlayTrigger,
  Tooltip,
  Spinner,
} from "react-bootstrap";
import {
  FaClock,
  FaDollarSign,
  FaEdit,
  FaRegClock,
  FaCheckCircle,
  FaCalendarDay,
  FaUser,
} from "react-icons/fa";
import { capitalizeName, SaveFileToDrive } from "../../../utils";

export default function EditCharge({ charge }) {
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const family_relationships = useSelector(
    (state) => state.family_relationships,
  );

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ...charge,
    paid_by: charge.paying_user?.id ?? charge.paid_by ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);

  const infantFamilyLinks = family_relationships.filter(
    (link) => link.infant_id === charge.id_infant,
  );

  useEffect(() => {
    setFormData({
      ...charge,
      paid_by: charge.paying_user?.id ?? charge.paid_by ?? "",
    });
  }, [charge]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "current_state" && value === "0") {
      setFormData({
        ...formData,
        current_state: value,
        paid_at: null,
        paid_by: "",
        payment_method: 0,
        url_payment_document: null,
      });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async (e) => {
    try {
      setFileUploading(true);
      const fileUrl = await SaveFileToDrive(e);
      setFormData({ ...formData, url_payment_document: fileUrl });
    } catch (error) {
      alert("Error al subir el archivo: " + error.message);
    } finally {
      setFileUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formdataToUpdate = {
        ...formData,
        id_user: authenticatedUser?.id,
      };

      setLoading(true);
      await dispatch(UpdateCharge(charge.id, formdataToUpdate));
      dispatch(GetCharges());
      setShowModal(false);
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
        overlay={
          <Tooltip id={`tooltip-edit-${charge.id}`}>Editar cargo</Tooltip>
        }
      >
        <Button className="button-custom" size="sm" onClick={() => setShowModal(true)}>
          <FaEdit />
        </Button>
      </OverlayTrigger>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Modificar {charge.charge_title} de{" "}
            {capitalizeName(charge.infant?.lastname)},{" "}
            {capitalizeName(charge.infant?.first_name)}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>
                <FaClock /> Cantidad
              </Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="0.1"
                step="0.1"
                placeholder="Cantidad de horas"
                onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault();
                  }
                }}
                required
              />
            </Form.Group>
            <br />
            <Form.Group>
              <Form.Label>
                <FaDollarSign /> Costo Total
              </Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={formData.amount}
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
            <br />
            <Form.Group>
              <Form.Label>
                <FaRegClock /> Concepto/Cargo
              </Form.Label>
              <Form.Control
                type="text"
                name="charge_title"
                value={formData.charge_title}
                onChange={handleInputChange}
                placeholder="Retiro tardío, Hora extra programada, etc."
                required
              />
            </Form.Group>
            <br />
            <Form.Group>
              <Form.Label>
                <FaCalendarDay /> Fecha de vencimiento
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
            <Form.Group>
              <Form.Label>
                <FaCheckCircle /> Estado del cargo
              </Form.Label>
              <Form.Select
                name="current_state"
                value={formData.current_state}
                onChange={handleInputChange}
                required
              >
                <option value="0">Pendiente</option>
                <option value="1">Pendiente de verificar</option>
                <option value="2">Verificado</option>
              </Form.Select>
            </Form.Group>
            <br />
            {(formData.current_state == 1 || formData.current_state == 2) && (
              <>
                <Form.Group>
                  <Form.Label>
                    <FaCalendarDay /> Fecha de pago
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="paid_at"
                    value={formData.paid_at || ""}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <br />
                <Form.Group>
                  <Form.Label>
                    <FaDollarSign /> Medio de pago
                  </Form.Label>
                  <Form.Select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="0">Desconocido</option>
                    <option value="1">Efectivo</option>
                    <option value="2">Transferencia bancaria</option>
                  </Form.Select>
                </Form.Group>
                <br />
                <Form.Group>
                  <Form.Label>
                    <FaUser /> Pagado por
                  </Form.Label>
                  <Form.Select
                    name="paid_by"
                    value={formData.paid_by || ""}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar familiar</option>
                    {infantFamilyLinks.map((link) => (
                      <option key={link.id} value={link.user_id}>
                        {capitalizeName(link.user?.first_name)}{" "}
                        {capitalizeName(link.user?.user_last_name)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <br />
                <Form.Group>
                  <Form.Label>Subir Comprobante</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    disabled={fileUploading}
                  />
                  {fileUploading && (
                    <div className="mt-2 d-flex align-items-center gap-2">
                      <Spinner animation="border" size="sm" />
                      <span>Cargando archivo...</span>
                    </div>
                  )}
                  {formData.url_payment_document && !fileUploading && (
                    <div className="mt-2 text-success">
                      <FaCheckCircle className="me-1" /> Archivo cargado
                      correctamente
                    </div>
                  )}
                </Form.Group>
                <br />
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="button"
              disabled={loading || fileUploading}
            >
              {loading || fileUploading ? (
                <>
                  <Spinner animation="border" size="sm" /> Procesando...
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
