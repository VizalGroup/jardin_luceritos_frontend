import { useState } from "react";
import {
  Button,
  Card,
  Container,
  Row,
  Col,
  Form,
  Spinner,
} from "react-bootstrap";
import { FaAt, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../../assets/logo.jpg";

export default function ForgotPassword() {
  document.title = "Recuperar Contraseña - Luceritos Jardín Maternal";
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Primero buscar el usuario por email
      const userResponse = await axios.get(
        `${import.meta.env.VITE_API_USERS_URL}`
      );

      const users = userResponse.data;
      const user = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        alert("No existe una cuenta asociada a este email.");
        setIsLoading(false);
        return;
      }

      // Enviar solicitud de reseteo con user_id
      const formData = new FormData();
      formData.append("METHOD", "POST");
      formData.append("user_id", user.id);

      await axios.post(
        `${import.meta.env.VITE_API_PASSWPORD_RESET_TOKENS_URL}`,
        formData
      );

      alert("¡Email enviado! Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.");
      setEmail("");
      setIsLoading(false);

      setTimeout(() => {
        navigate("/iniciar_sesion");
      }, 2000);
    } catch (error) {
      console.error("Error al solicitar recuperación:", error);
      alert(error.response?.data?.message || "Error al enviar el email de recuperación");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Container fluid className="login-wrapper">
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col xs={12} sm={8} md={6} lg={4} xl={3}>
            <Card className="login-card shadow-lg">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <img
                    src={Logo}
                    alt="Logo Jardín Luceritos"
                    className="login-logo mb-3"
                  />
                  <h4 className="login-title">Recuperar Contraseña</h4>
                  <p className="login-subtitle">
                    Ingresa tu email para recibir instrucciones
                  </p>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="email" className="mb-4">
                    <Form.Label>
                      <FaAt /> Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      disabled={isLoading}
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
                          Enviando...
                        </>
                      ) : (
                        "Enviar instrucciones"
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
