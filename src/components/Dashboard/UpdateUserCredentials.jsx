import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import bcrypt from "bcryptjs";
import {
  Form,
  Button,
  Card,
  Container,
  Row,
  Col,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaUser,
  FaUserEdit,
  FaAt,
  FaLock,
  FaPhone,
  FaHome,
  FaEye,
  FaEyeSlash,
  FaInfoCircle,
  FaIdCard,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { getCurrentDateTime, getDocumentTypeName, getUserRoleName } from "../../utils";
import { updateUser, GetUserDetail, LogoutUser } from "../../redux/actions";
import NavBarDB from "./NavBarDB";

export default function UpdateUserCredentials() {
  document.title = "Actualizar Credenciales - Luceritos Jardín Maternal";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const userDetail = useSelector((state) => state.userDetail);

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!authenticatedUser) {
      navigate("/iniciar_sesion");
      return;
    }

    // Verificar si la sesión ha expirado
    const now = Math.floor(Date.now() / 1000);
    if (authenticatedUser.expires_at && now > authenticatedUser.expires_at) {
      alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
      dispatch(LogoutUser());
      navigate("/iniciar_sesion");
      return;
    }

    if (authenticatedUser.id) {
      dispatch(GetUserDetail(authenticatedUser.id));
    }
  }, [authenticatedUser, dispatch, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "newPassword") {
      const contieneMayuscula = /[A-Z]/.test(value);
      const contieneNumero = /[0-9]/.test(value);
      const tieneMinimo6 = value.length >= 6;
      setPasswordValid(contieneMayuscula && contieneNumero && tieneMinimo6);
    }

    if (name === "confirmPassword") {
      setPasswordsMatch(formData.newPassword === value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    if (!passwordValid) {
      setErrorMessage(
        "La contraseña debe tener al menos 6 caracteres, una mayúscula y un número"
      );
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    setIsLoading(true);
    setShowError(false);
    setShowSuccess(false);

    try {
      const hashedPassword = await bcrypt.hash(formData.newPassword, 10);
      const currentDateTime = getCurrentDateTime();

      const dataToUpdate = {
        first_name: userDetail.first_name,
        lastname: userDetail.lastname,
        user_role: userDetail.user_role,
        email: userDetail.email,
        clue: hashedPassword,
        phone: userDetail.phone,
        is_activate: userDetail.is_activate,
        document_type: userDetail.document_type,
        document_number: userDetail.document_number,
        street_address: userDetail.street_address,
        created_at: userDetail.created_at,
        updated_at: currentDateTime,
      };

      await dispatch(updateUser(authenticatedUser.id, dataToUpdate));

      setShowSuccess(true);
      setFormData({
        newPassword: "",
        confirmPassword: "",
      });
      setIsLoading(false);

      setTimeout(() => {
        navigate("/autogestion");
      }, 2000);
    } catch (error) {
      console.error("Error al actualizar la contraseña: ", error);
      setErrorMessage(
        "Ocurrió un error al actualizar la contraseña. Por favor, intente nuevamente."
      );
      setShowError(true);
      setIsLoading(false);

      setTimeout(() => {
        setShowError(false);
      }, 5000);
    }
  };

  if (!userDetail || !userDetail.id) {
    return (
      <>
        <NavBarDB />
        <Container style={{ marginTop: "100px" }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" style={{ color: "#213472" }} />
            <p className="mt-3" style={{ color: "#213472" }}>Cargando información...</p>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <NavBarDB />
      <div className="watermark-background" style={{ marginTop: "80px", padding: "2rem" }}>
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8}>
              <Card className="shadow-lg" style={{ borderRadius: "15px", backgroundColor: "#FFF5ED" }}>
                <Card.Body className="p-4">
                  <h3
                    className="text-center mb-4"
                    style={{ color: "#213472", fontWeight: "700" }}
                  >
                    Actualizar Credenciales de Usuario
                  </h3>

                  <Alert variant="info" className="mb-4" style={{ backgroundColor: "#d4edda", borderColor: "#c3e6cb", color: "#155724" }}>
                    <FaInfoCircle /> <strong>Información importante:</strong>
                    <br />
                    Para actualizar información personal como domicilio, número de teléfono o documento, 
                    por favor comuníquese con la administración del jardín.
                  </Alert>

                  {showSuccess && (
                    <Alert
                      variant="success"
                      className="mb-3"
                      style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 9999,
                        minWidth: "400px",
                        textAlign: "center",
                        fontSize: "1.2rem",
                        padding: "30px",
                        backgroundColor: "#d4edda",
                        color: "#155724",
                        border: "2px solid #c3e6cb",
                      }}
                    >
                      <h4 style={{ marginBottom: "15px" }}>
                        ✓ ¡Contraseña actualizada con éxito!
                      </h4>
                      <p style={{ marginBottom: 0 }}>Redirigiendo al inicio...</p>
                    </Alert>
                  )}

                  {showError && (
                    <Alert variant="danger" className="mb-3">
                      {errorMessage}
                    </Alert>
                  )}

                  {/* Información del usuario - Solo lectura */}
                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "20px",
                      borderRadius: "10px",
                      marginBottom: "30px",
                      border: "2px solid #213472",
                    }}
                  >
                    <h5 style={{ color: "#213472", marginBottom: "20px" }}>
                      <FaUser /> Información Personal
                    </h5>

                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label style={{ color: "#213472", fontWeight: "600" }}>
                            <FaUser /> Nombre
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={userDetail.first_name}
                            disabled
                            style={{ backgroundColor: "#e9ecef", border: "1px solid #213472" }}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label style={{ color: "#213472", fontWeight: "600" }}>
                            <FaUserEdit /> Apellido
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={userDetail.lastname}
                            disabled
                            style={{ backgroundColor: "#e9ecef", border: "1px solid #213472" }}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label style={{ color: "#213472", fontWeight: "600" }}>
                            <FaAt /> Email
                          </Form.Label>
                          <Form.Control
                            type="email"
                            value={userDetail.email}
                            disabled
                            style={{ backgroundColor: "#e9ecef", border: "1px solid #213472" }}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label style={{ color: "#213472", fontWeight: "600" }}>
                            <FaPhone /> Teléfono
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={userDetail.phone || "No especificado"}
                            disabled
                            style={{ backgroundColor: "#e9ecef", border: "1px solid #213472" }}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label style={{ color: "#213472", fontWeight: "600" }}>
                            <FaIdCard /> Tipo de Documento
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={getDocumentTypeName(userDetail.document_type)}
                            disabled
                            style={{ backgroundColor: "#e9ecef", border: "1px solid #213472" }}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label style={{ color: "#213472", fontWeight: "600" }}>
                            <FaIdCard /> Número de Documento
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={userDetail.document_number || "No especificado"}
                            disabled
                            style={{ backgroundColor: "#e9ecef", border: "1px solid #213472" }}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12} className="mb-3">
                        <Form.Group>
                          <Form.Label style={{ color: "#213472", fontWeight: "600" }}>
                            <FaHome /> <FaMapMarkerAlt /> Dirección
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={userDetail.street_address || "No especificada"}
                            disabled
                            style={{ backgroundColor: "#e9ecef", border: "1px solid #213472" }}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12} className="mb-3">
                        <Form.Group>
                          <Form.Label style={{ color: "#213472", fontWeight: "600" }}>
                            Rol de Usuario
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={getUserRoleName(userDetail.user_role)}
                            disabled
                            style={{ backgroundColor: "#e9ecef", border: "1px solid #213472" }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  {/* Formulario para cambiar contraseña */}
                  <div>
                    <h5 style={{ color: "#213472", marginBottom: "20px" }}>
                      <FaLock /> Cambiar Contraseña
                    </h5>

                    <Form onSubmit={handleSubmit}>
                      <Form.Group controlId="newPassword" className="mb-3">
                        <Form.Label style={{ color: "#213472", fontWeight: "600" }}>
                          Nueva Contraseña
                        </Form.Label>
                        <div className="input-group">
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            placeholder="Ingrese su nueva contraseña"
                            required
                            disabled={isLoading}
                            style={{ border: "2px solid #213472" }}
                          />
                          <button
                            type="button"
                            className="btn"
                            style={{ 
                              backgroundColor: "#213472", 
                              color: "#FFF5ED",
                              border: "2px solid #213472"
                            }}
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
                          <Form.Text className="text-success">
                            ✓ Contraseña válida
                          </Form.Text>
                        )}
                      </Form.Group>

                      <Form.Group controlId="confirmPassword" className="mb-4">
                        <Form.Label style={{ color: "#213472", fontWeight: "600" }}>
                          Confirmar Nueva Contraseña
                        </Form.Label>
                        <div className="input-group">
                          <Form.Control
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirme su nueva contraseña"
                            required
                            disabled={isLoading}
                            style={{ border: "2px solid #213472" }}
                          />
                          <button
                            type="button"
                            className="btn"
                            style={{ 
                              backgroundColor: "#213472", 
                              color: "#FFF5ED",
                              border: "2px solid #213472"
                            }}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        {formData.confirmPassword && !passwordsMatch && (
                          <Form.Text className="text-danger">
                            Las contraseñas no coinciden
                          </Form.Text>
                        )}
                        {formData.confirmPassword && passwordsMatch && passwordValid && (
                          <Form.Text className="text-success">
                            ✓ Las contraseñas coinciden
                          </Form.Text>
                        )}
                      </Form.Group>

                      <div className="d-grid">
                        <Button
                          variant="primary"
                          type="submit"
                          size="lg"
                          disabled={
                            isLoading ||
                            !passwordValid ||
                            !passwordsMatch ||
                            !formData.newPassword ||
                            !formData.confirmPassword
                          }
                          style={{
                            backgroundColor: "#213472",
                            borderColor: "#213472",
                            fontFamily: "georgia, palatino, 'book antiqua', 'palatino linotype', serif",
                            fontWeight: "600",
                          }}
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
                              Actualizando...
                            </>
                          ) : (
                            "Actualizar Contraseña"
                          )}
                        </Button>
                      </div>
                    </Form>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}
