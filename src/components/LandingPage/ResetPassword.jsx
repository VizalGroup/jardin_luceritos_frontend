import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import bcrypt from "bcryptjs";
import axios from "axios";
import { Button, Card, Container, Row, Col, Form, Spinner } from "react-bootstrap";
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import { VerifyPasswordResetToken, updateUser } from "../../redux/actions";
import Logo from "../../assets/logo.jpg";
import { getCurrentDateTime } from "../../utils";

export default function ResetPassword() {
  document.title = "Restablecer Contraseña - Luceritos Jardín Maternal";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userData, setUserData] = useState(null);
  const [fullUserData, setFullUserData] = useState(null);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordValid, setPasswordValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMessage("Token no válido. Por favor, solicita un nuevo enlace de recuperación.");
      setIsVerifying(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      setIsVerifying(true);
      const response = await dispatch(VerifyPasswordResetToken(token));

      if (response.payload && response.payload.valid) {
        setTokenValid(true);
        setUserData(response.payload);
        await getFullUserData(response.payload.user_id);
        setErrorMessage("");
      } else {
        setErrorMessage("El enlace ha expirado o no es válido. Por favor, solicita uno nuevo.");
      }
    } catch (error) {
      console.error("Error al verificar el token:", error);
      setErrorMessage("Error al verificar el enlace. Por favor, intenta nuevamente.");
    } finally {
      setIsVerifying(false);
    }
  };

  const getFullUserData = async (userId) => {
    try {
      const userDetailResponse = await axios.get(
        `${import.meta.env.VITE_API_USERS_URL}?id=${userId}`
      );

      if (userDetailResponse.data) {
        setFullUserData(userDetailResponse.data);
      }
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "newPassword") {
      const contieneMayuscula = /[A-Z]/.test(value);
      const contieneNumero = /[0-9]/.test(value);
      const tieneMinimo6 = value.length >= 6;
      setPasswordValid(contieneMayuscula && contieneNumero && tieneMinimo6);
    }

    if (name === "confirmPassword" || name === "newPassword") {
      const newPassword = name === "newPassword" ? value : formData.newPassword;
      const confirmPassword = name === "confirmPassword" ? value : formData.confirmPassword;
      setPasswordsMatch(newPassword === confirmPassword);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordsMatch) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    if (!passwordValid) {
      alert("La contraseña debe tener al menos 6 caracteres, una mayúscula y un número.");
      return;
    }

    if (!fullUserData) {
      alert("Error al obtener los datos del usuario.");
      return;
    }

    setIsLoading(true);

    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(formData.newPassword, saltRounds);

      const updatedUserData = {
        first_name: fullUserData.first_name,
        lastname: fullUserData.lastname,
        user_role: fullUserData.user_role,
        email: fullUserData.email,
        clue: hashedPassword,
        phone: fullUserData.phone || "",
        is_activate: fullUserData.is_activate,
        document_type: fullUserData.document_type,
        document_number: fullUserData.document_number || "",
        street_address: fullUserData.street_address || "",
        created_at: fullUserData.created_at,
        updated_at: getCurrentDateTime(),
      };

      await dispatch(updateUser(userData.user_id, updatedUserData));

      // Marcar el token como usado
      const markTokenUsedFormData = new FormData();
      markTokenUsedFormData.append("METHOD", "PUT");
      markTokenUsedFormData.append("user_id", userData.user_id);
      markTokenUsedFormData.append("token", token);
      markTokenUsedFormData.append(
        "expires_at",
        new Date().toISOString().slice(0, 19).replace("T", " ")
      );
      markTokenUsedFormData.append("used", "1");

      const tokenSearchResponse = await axios.get(
        `${import.meta.env.VITE_API_PASSWPORD_RESET_TOKENS_URL}`
      );

      const tokenRecord = tokenSearchResponse.data.find((t) => t.token === token);

      if (tokenRecord) {
        await axios.post(
          `${import.meta.env.VITE_API_PASSWPORD_RESET_TOKENS_URL}?id=${tokenRecord.id}`,
          markTokenUsedFormData
        );
      }

      // Enviar email de confirmación
      const confirmationFormData = new FormData();
      confirmationFormData.append("METHOD", "CONFIRM_PASSWORD_CHANGE");
      confirmationFormData.append("user_id", userData.user_id);

      try {
        await axios.post(
          `${import.meta.env.VITE_API_PASSWPORD_RESET_TOKENS_URL}`,
          confirmationFormData
        );
        console.log("✅ Email de confirmación enviado");
      } catch (emailError) {
        console.warn("⚠️ Error al enviar email de confirmación:", emailError);
      }

      setShowSuccess(true);
    } catch (error) {
      console.error("Error al actualizar contraseña:", error);
      alert("Error al actualizar la contraseña. Por favor, intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="login-container">
        <Container fluid className="login-wrapper">
          <Row className="justify-content-center align-items-center min-vh-100">
            <Col xs={12} className="text-center">
              <Spinner animation="border" variant="primary" style={{ color: "#213472" }} />
              <p className="mt-3" style={{ color: "#213472", fontWeight: "600" }}>
                Verificando token de recuperación...
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="login-container">
        <Container fluid className="login-wrapper">
          <Row className="justify-content-center align-items-center min-vh-100">
            <Col xs={12} sm={8} md={6} lg={4} xl={3}>
              <Card className="login-card shadow-lg">
                <Card.Body className="p-5 text-center">
                  <FaCheckCircle size={60} color="#28a745" className="mb-3" />
                  <img
                    src={Logo}
                    alt="Logo Jardín Luceritos"
                    className="login-logo mb-3"
                    style={{ maxWidth: "120px" }}
                  />
                  <div className="mb-3 p-3" style={{ backgroundColor: '#d4edda', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
                    <strong style={{ color: '#155724' }}>¡Contraseña restablecida con éxito!</strong>
                    <hr style={{ borderColor: '#c3e6cb' }} />
                    <p style={{ color: '#155724', margin: 0 }}>
                      Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión con
                      tu nueva contraseña.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/iniciar_sesion")}
                    className="login-submit-btn"
                  >
                    Iniciar sesión
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="login-container">
        <Container fluid className="login-wrapper">
          <Row className="justify-content-center align-items-center min-vh-100">
            <Col xs={12} sm={8} md={6} lg={4} xl={3}>
              <Card className="login-card shadow-lg">
                <Card.Body className="p-5 text-center">
                  <img src={Logo} alt="Logo Jardín Luceritos" className="login-logo mb-3" />
                  <div className="mb-3 p-3" style={{ backgroundColor: '#f8d7da', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
                    <strong style={{ color: '#721c24' }}>⚠️ Error</strong>
                    <hr style={{ borderColor: '#f5c6cb' }} />
                    <p style={{ color: '#721c24', margin: 0 }}>{errorMessage}</p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/iniciar_sesion")}
                    className="login-submit-btn"
                  >
                    Volver al inicio de sesión
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="login-container">
      <Container fluid className="login-wrapper">
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col xs={12} sm={8} md={6} lg={4} xl={3}>
            <Card className="login-card shadow-lg">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <img src={Logo} alt="Logo Jardín Luceritos" className="login-logo mb-3" />
                  <h4 className="login-title">Restablecer Contraseña</h4>
                  {userData && (
                    <p className="login-subtitle">
                      Hola <strong>{userData.first_name} {userData.lastname}</strong>
                    </p>
                  )}
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="newPassword" className="mb-3">
                    <Form.Label>
                      <FaLock /> Nueva Contraseña
                    </Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        placeholder="Ingrese su nueva contraseña"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        className="login-input"
                      />
                      <button
                        type="button"
                        className="btn login-toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {formData.newPassword && !passwordValid && (
                      <Form.Text className="text-danger">
                        Mínimo 6 caracteres, una mayúscula y un número
                      </Form.Text>
                    )}
                    {formData.newPassword && passwordValid && (
                      <Form.Text className="text-success">✓ Contraseña válida</Form.Text>
                    )}
                  </Form.Group>

                  <Form.Group controlId="confirmPassword" className="mb-4">
                    <Form.Label>
                      <FaLock /> Confirmar Contraseña
                    </Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirme su nueva contraseña"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        className="login-input"
                      />
                      <button
                        type="button"
                        className="btn login-toggle-password"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {formData.confirmPassword &&
                      formData.newPassword !== formData.confirmPassword && (
                        <Form.Text className="text-danger">Las contraseñas no coinciden</Form.Text>
                      )}
                    {formData.confirmPassword &&
                      formData.newPassword === formData.confirmPassword &&
                      passwordValid && (
                        <Form.Text className="text-success">✓ Las contraseñas coinciden</Form.Text>
                      )}
                  </Form.Group>

                  <div className="d-grid">
                    <Button
                      variant="primary"
                      type="submit"
                      size="lg"
                      className="login-submit-btn"
                      disabled={
                        isLoading ||
                        !passwordValid ||
                        formData.newPassword !== formData.confirmPassword
                      }
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
                          Restableciendo contraseña...
                        </>
                      ) : (
                        "Restablecer Contraseña"
                      )}
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
