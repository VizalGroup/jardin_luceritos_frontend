import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { FaEdit, FaUser, FaUserEdit, FaAt, FaPhone, FaHome, FaToggleOn, FaIdCard, FaMapMarkerAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { RiUserSettingsLine } from "react-icons/ri";
import { useState } from "react";
import { GetUsers, updateUser } from "../../../redux/actions";
import { getCurrentDateTime } from "../../../utils";
import bcrypt from "bcryptjs";
import { useDispatch } from "react-redux";

export default function EditUser({ user }) {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(user);
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShow = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    setChangePassword(false);
    setNewPassword("");
    setPasswordValid(false);
    setShowPassword(false);
    setFormData(user);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    const contieneMayuscula = /[A-Z]/.test(value);
    const contieneNumero = /[0-9]/.test(value);
    const tieneMinimo6 = value.length >= 6;
    setPasswordValid(contieneMayuscula && contieneNumero && tieneMinimo6);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const currentDateTime = getCurrentDateTime();
      let updatedData = {
        ...formData,
        updated_at: currentDateTime,
      };

      // Si se marca cambiar contraseña, hashearla
      if (changePassword && newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updatedData = {
          ...updatedData,
          clue: hashedPassword,
        };
      }

      await dispatch(updateUser(user.id, updatedData));
      await dispatch(GetUsers());
      
      alert("¡Usuario actualizado con éxito!");
      handleClose();
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      alert("Error al actualizar el usuario: " + (error.message || "Error desconocido"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="warning"
        size="sm"
        className="button-custom"
        onClick={handleShow}
        title="Editar usuario"
      >
        <FaEdit />
      </Button>

      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuario</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="row">
              <div className="col-md-6">
                <Form.Group controlId="edit_first_name" className="mb-3">
                  <Form.Label>
                    <FaUser /> Nombre
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group controlId="edit_lastname" className="mb-3">
                  <Form.Label>
                    <FaUserEdit /> Apellido
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group controlId="edit_email" className="mb-3">
              <Form.Label>
                <FaAt /> Email
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </Form.Group>

            <Form.Group controlId="edit_changePassword" className="mb-3">
              <Form.Check
                type="checkbox"
                label="Cambiar contraseña"
                checked={changePassword}
                onChange={(e) => setChangePassword(e.target.checked)}
                disabled={isSubmitting}
              />
            </Form.Group>

            {changePassword && (
              <Form.Group controlId="edit_newPassword" className="mb-3">
                <Form.Label>Nueva Contraseña</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Ingrese la nueva contraseña"
                    required={changePassword}
                    disabled={isSubmitting}
                    style={{ border: "2px solid #213472" }}
                  />
                  <button
                    type="button"
                    className="btn"
                    style={{
                      backgroundColor: "#213472",
                      color: "#FFF5ED",
                      border: "2px solid #213472",
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {newPassword && !passwordValid && (
                  <Form.Text className="text-danger">
                    Mínimo 6 caracteres, una mayúscula y un número
                  </Form.Text>
                )}
                {newPassword && passwordValid && (
                  <Form.Text className="text-success">
                    ✓ Contraseña válida
                  </Form.Text>
                )}
              </Form.Group>
            )}

            <Form.Group controlId="edit_user_role" className="mb-3">
              <Form.Label>
                <RiUserSettingsLine /> Rol del Usuario
              </Form.Label>
              <Form.Control
                as="select"
                name="user_role"
                value={formData.user_role}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                <option value="0">Programador</option>
                <option value="1">Administrador</option>
                <option value="2">Maestra / Auxiliar</option>
                <option value="3">Madre/Padre o Tutor</option>
                <option value="4">Dirección</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="edit_phone" className="mb-3">
              <Form.Label>
                <FaPhone /> Teléfono
              </Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  const sanitizedValue = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 13);
                  setFormData({ ...formData, phone: sanitizedValue });
                }}
                maxLength={13}
                required
                disabled={isSubmitting}
              />
              <Form.Text className="text-muted">
                Máximo 13 caracteres. Solo números.
              </Form.Text>
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group controlId="edit_document_type" className="mb-3">
                  <Form.Label>
                    <FaIdCard /> Tipo de Documento
                  </Form.Label>
                  <Form.Control
                    as="select"
                    name="document_type"
                    value={formData.document_type}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="0">Sin especificar / No informado</option>
                    <option value="1">
                      DNI (Documento Nacional de Identidad)
                    </option>
                    <option value="2">Pasaporte</option>
                    <option value="3">Cédula de identidad</option>
                  </Form.Control>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group controlId="edit_document_number" className="mb-3">
                  <Form.Label>
                    <FaIdCard /> Número de Documento
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="document_number"
                    value={formData.document_number}
                    onChange={(e) => {
                      const sanitizedValue = e.target.value.slice(0, 20);
                      setFormData({
                        ...formData,
                        document_number: sanitizedValue,
                      });
                    }}
                    maxLength={20}
                    placeholder="Ej: 12345678 o ABC123"
                    required
                    disabled={isSubmitting}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group controlId="edit_street_address" className="mb-3">
              <Form.Label>
                <FaHome /> <FaMapMarkerAlt /> Dirección
              </Form.Label>
              <Form.Control
                type="text"
                name="street_address"
                value={formData.street_address}
                onChange={handleInputChange}
                placeholder="Ej: Pedro Simón Laplace 5640"
                required
                disabled={isSubmitting}
              />
            </Form.Group>

            <Form.Group controlId="edit_is_activate" className="mb-3">
              <Form.Label>
                <FaToggleOn /> Estado del Usuario
              </Form.Label>
              <Form.Control
                as="select"
                name="is_activate"
                value={formData.is_activate}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </Form.Control>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="button-custom"
              disabled={
                isSubmitting || (changePassword && (!newPassword || !passwordValid))
              }
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
