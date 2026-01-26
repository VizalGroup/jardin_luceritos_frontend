import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import bcrypt from "bcryptjs";
import { Form, Button, Card, Container, Row, Col, Spinner } from "react-bootstrap";
import { getCurrentDateTime } from "../../utils";
import { PostUser, GetUsers } from "../../redux/actions";
import Logo from "../../assets/logo.jpg";
import {
  FaUser,
  FaUserEdit,
  FaAt,
  FaLock,
  FaPhone,
  FaHome,
  FaArrowLeft,
  FaIdCard,
  FaMapMarkerAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const userFormData = {
  first_name: "",
  lastname: "",
  user_role: 3, // Por defecto padre, madre o tutor
  email: "",
  clue: "",
  is_activate: 1, // Por defecto ACTIVO
  phone: "",
  document_type: "", // Por defecto sin especificar
  document_number: "",
  street_address: "",
  created_at: "",
  updated_at: "",
};

export default function UserRegistration() {
  document.title = "Registro de Usuario - Luceritos Jardín Maternal";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(userFormData);
  const [passwordValid, setPasswordValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);

    try {
      const hashedPassword = await bcrypt.hash(formData.clue, 10);
      const currentDateTime = getCurrentDateTime();

      const dataToSubmit = {
        first_name: formData.first_name,
        lastname: formData.lastname,
        user_role: formData.user_role,
        email: formData.email,
        clue: hashedPassword,
        phone: formData.phone,
        is_activate: formData.is_activate,
        document_type: formData.document_type,
        document_number: formData.document_number,
        street_address: formData.street_address,
        created_at: currentDateTime,
        updated_at: currentDateTime,
      };

      await dispatch(PostUser(dataToSubmit));
      await dispatch(GetUsers());

      setFormData(userFormData);
      setIsLoading(false);

      alert("¡Registro exitoso! Será redirigido al inicio de sesión.");
      navigate("/iniciar_sesion");
    } catch (error) {
      console.error("Error al registrar el usuario: ", error);

      let errorMsg = "Ocurrió un error al registrar el usuario. Por favor, intente nuevamente.";

      if (error.message.includes("email ya está registrado")) {
        errorMsg = "Este email ya está registrado. Por favor, utilice otro.";
      }

      alert(errorMsg);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Container fluid className="login-wrapper">
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="login-card shadow-lg">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <img src={Logo} alt="Logo Jardín Luceritos" className="login-logo mb-3" />
                  <h4 className="login-title">Registro de Usuario</h4>
                  <p className="login-subtitle">Complete el formulario para crear su cuenta</p>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group controlId="first_name" className="mb-3">
                        <Form.Label>
                          <FaUser /> Nombre
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          placeholder="Ingrese su nombre"
                          required
                          disabled={isLoading}
                          className="login-input"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="lastname" className="mb-3">
                        <Form.Label>
                          <FaUserEdit /> Apellido
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="lastname"
                          value={formData.lastname}
                          onChange={handleInputChange}
                          placeholder="Ingrese su apellido"
                          required
                          disabled={isLoading}
                          className="login-input"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group controlId="email" className="mb-3">
                    <Form.Label>
                      <FaAt /> Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="correo@ejemplo.com"
                      required
                      disabled={isLoading}
                      className="login-input"
                    />
                  </Form.Group>

                  <Form.Group controlId="clue" className="mb-3">
                    <Form.Label>
                      <FaLock /> Contraseña
                    </Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="clue"
                        value={formData.clue}
                        onChange={handleInputChange}
                        placeholder="Ingrese su contraseña"
                        required
                        disabled={isLoading}
                        className="login-input"
                        style={{ border: "2px solid #213472" }}
                      />
                      <button
                        type="button"
                        className="btn login-toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        style={{
                          backgroundColor: "#213472",
                          color: "#FFF5ED",
                          border: "2px solid #213472",
                        }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {formData.clue && !passwordValid && (
                      <Form.Text className="text-danger">
                        La contraseña debe contener al menos una mayúscula y un número
                      </Form.Text>
                    )}
                  </Form.Group>

                  <Form.Group controlId="phone" className="mb-3">
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
                      placeholder="Ej: 3512472384"
                      required
                      disabled={isLoading}
                      className="login-input"
                    />
                    <Form.Text className="text-muted">
                      Máximo 13 caracteres. Solo números.
                    </Form.Text>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group controlId="document_type" className="mb-3">
                        <Form.Label>
                          <FaIdCard /> Tipo de Documento
                        </Form.Label>
                        <Form.Select
                          name="document_type"
                          value={formData.document_type}
                          onChange={handleInputChange}
                          required
                          disabled={isLoading}
                          className="login-input"
                        >
                            <option value="" disabled>Seleccione un tipo de documento</option>
                          <option value="0">Sin especificar / No informado</option>
                          <option value="1">DNI (Documento Nacional de Identidad)</option>
                          <option value="2">Pasaporte</option>
                          <option value="3">Cédula de identidad</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="document_number" className="mb-3">
                        <Form.Label>
                          <FaIdCard /> Número de Documento
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="document_number"
                          value={formData.document_number}
                          onChange={(e) => {
                            const sanitizedValue = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 8);
                            setFormData({ ...formData, document_number: sanitizedValue });
                          }}
                          maxLength={8}
                          placeholder="Ej: 12345678"
                          required
                          disabled={isLoading}
                          className="login-input"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group controlId="street_address" className="mb-4">
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
                      disabled={isLoading}
                      className="login-input"
                    />
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button
                      variant="primary"
                      type="submit"
                      size="lg"
                      className="login-submit-btn"
                      disabled={isLoading || (formData.clue && !passwordValid)}
                    >
                      {isLoading ? (
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
                        "Registrarse"
                      )}
                    </Button>

                    <Button
                      variant="outline-secondary"
                      onClick={() => navigate("/iniciar_sesion")}
                      disabled={isLoading}
                      className="register-btn"
                    >
                      <FaArrowLeft /> Volver al inicio de sesión
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
