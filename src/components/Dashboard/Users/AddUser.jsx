import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userFormData } from "../../../utils";
import { BsPersonPlus } from "react-icons/bs";
import {
  FaAt,
  FaLock,
  FaPhone,
  FaUser,
  FaUserEdit,
  FaClock,
  FaIdCard,
  FaHome,
  FaMapMarkerAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import { RiUserSettingsLine } from "react-icons/ri";
import { GetUsers, PostUser } from "../../../redux/actions";
import { getCurrentDateTime } from "../../../utils";
import bcrypt from "bcryptjs";

export default function AddUser() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(userFormData);
  const [showSuccess, setShowSuccess] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "clue") {
      const contieneMayuscula = /[A-Z]/.test(value);
      const contieneNumero = /[0-9]/.test(value);
      setPasswordValid(contieneMayuscula && contieneNumero);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const hashedPassword = await bcrypt.hash(formData.clue, 10);
      const currentDateTime = getCurrentDateTime();

      let userData = {
        ...formData,
        clue: hashedPassword,
        created_at: currentDateTime,
        updated_at: currentDateTime,
      };

      await dispatch(PostUser(userData));
      await dispatch(GetUsers());

      alert("¡Usuario creado con éxito!");
      setFormData(userFormData);
      handleCloseModal();
    } catch (error) {
      console.error("Error al registrar el usuario:", error);
      alert(error.message || "Error al registrar el usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowSuccess(false);
  };

  const handleShowModal = () => setShowModal(true);

  return (
    <>
      <Button className="button-custom" onClick={handleShowModal}>
        <BsPersonPlus /> Registrar Usuario
      </Button>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Registrar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="first_name">
              <Form.Label>
                <FaUser /> Nombre
              </Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <br />
            <Form.Group controlId="lastname">
              <Form.Label>
                <FaUserEdit /> Apellido
              </Form.Label>
              <Form.Control
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <br />
            <Form.Group controlId="email">
              <Form.Label>
                <FaAt /> Email
              </Form.Label>
              <Form.Control
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
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
                onChange={(e) => {
                  // Permitir solo números y limitar a 13 caracteres
                  const sanitizedValue = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 13);
                  setFormData({ ...formData, phone: sanitizedValue });
                }}
                maxLength={13} // Limita el número de caracteres en el input
                required
              />
              <Form.Text className="text-muted">
                Máximo 13 caracteres. Solo números. No incluir el 0 y el 15
              </Form.Text>
            </Form.Group>
            <br />

            <div className="row">
              <div className="col-md-6">
                <Form.Group controlId="document_type">
                  <Form.Label>
                    <FaIdCard /> Tipo de Documento
                  </Form.Label>
                  <Form.Control
                    as="select"
                    name="document_type"
                    value={formData.document_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione un tipo</option>
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
                <Form.Group controlId="document_number">
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
                  />
                  <Form.Text className="text-muted">
                    Máximo 20 caracteres. Letras y números.
                  </Form.Text>
                </Form.Group>
              </div>
            </div>
            <br />

            <Form.Group controlId="street_address">
              <Form.Label>
                <FaHome /> <FaMapMarkerAlt /> Dirección (Calle y Número)
              </Form.Label>
              <Form.Control
                type="text"
                name="street_address"
                value={formData.street_address}
                onChange={handleInputChange}
                placeholder="Ej: Pedro Simón Laplace 5640"
                required
              />
            </Form.Group>
            <br />
            <Form.Group controlId="clue">
              <Form.Label>
                <FaLock /> Contraseña
              </Form.Label>
              <div className="input-group">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="clue"
                  value={formData.clue}
                  onChange={handleInputChange}
                  required
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
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formData.clue && !passwordValid && (
                <span className="text-danger">
                  La contraseña debe contener al menos una mayúscula y un número
                </span>
              )}
            </Form.Group>
            <br />
            <Form.Group controlId="user_role">
              <Form.Label>
                <RiUserSettingsLine /> Rol del Usuario
              </Form.Label>
              <Form.Control
                as="select"
                name="user_role"
                value={formData.user_role}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccionar</option>
                <option value="0">Programador</option>
                <option value="1">Director/a</option>
                <option value="2">Maestra / Auxiliar</option>
                <option value="3">Madre/Padre o Tutor</option>
              </Form.Control>
            </Form.Group>
            <br />

            {/* Campos adicionales solo para Maestras/Auxiliares */}
            {formData.user_role == 2 && (
              <>
                <div className="row">
                  <div className="col-md-6">
                    <Form.Group controlId="entry_time">
                      <Form.Label>
                        <FaClock /> Hora de Entrada
                      </Form.Label>
                      <Form.Control
                        type="time"
                        name="entry_time"
                        value={formData.entry_time || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group controlId="exit_time">
                      <Form.Label>
                        <FaClock /> Hora de Salida
                      </Form.Label>
                      <Form.Control
                        type="time"
                        name="exit_time"
                        value={formData.exit_time || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </div>
                </div>
                <br />
              </>
            )}

            <Modal.Footer>
              <Button
                variant="secondary"
                style={{ margin: "10px" }}
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                variant="button-custom"
                type="submit"
                className="button-custom"
                disabled={isSubmitting}
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
                    Registrando...
                  </>
                ) : (
                  "Registrar"
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
