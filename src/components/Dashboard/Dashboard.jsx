import {
  FaStickyNote,
  FaUser,
  FaUserCog,
  FaChild,
  FaDollarSign,
  FaEnvelope,
} from "react-icons/fa";
import NavBarDB from "./NavBarDB";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { canManageSystem } from "../../utils";
import {
  GetTariffs,
  GetUserDetail,
  LogoutUser,
  GetInfants,
  GetFamilyRelationships,
  GetCommunications,
  GetCommunicationRecipients,
  GetUsers,
  GetConversations,
  GetChatMessages,
} from "../../redux/actions";
import AddMySon from "./AddMySon";
import MyChildren from "./MyChildren";
import CommunicationBoard from "./CommunicationBoard/CommunicationBoard";
import ParentCommunication from "./ParentCommunication";
import FloatingChatButton from "./Chat/FloatingChatButton";

export default function Dashboard() {
  document.title = "Autogestión - Luceritos Jardín Maternal";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const userDetail = useSelector((state) => state.userDetail);
  const infants = useSelector((state) => state.infants);
  const familyLinks = useSelector((state) => state.family_relationships);

  // Verificar si es padre/madre/tutor (rol 3)
  const isParent = authenticatedUser?.user_role === 3;

  // Filtrar los hijos del usuario actual
  const myChildren = familyLinks
    .filter((link) => link.user_id === authenticatedUser?.id)
    .map((link) => {
      const infant = infants.find((inf) => inf.id === link.infant_id);
      return infant;
    })
    .filter((infant) => infant !== undefined);

  useEffect(() => {
    // Verificar si hay un usuario autenticado
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

    // Obtener los detalles del usuario autenticado
    if (authenticatedUser.id) {
      dispatch(GetUserDetail(authenticatedUser.id));
      dispatch(GetTariffs());
      dispatch(GetInfants());
      dispatch(GetFamilyRelationships());
      dispatch(GetCommunications());
      dispatch(GetCommunicationRecipients());
      dispatch(GetUsers());
      dispatch(GetConversations());
      dispatch(GetChatMessages());
    }
  }, [authenticatedUser, dispatch, navigate]);

  // Array de módulos según el rol (ordenados alfabéticamente)
  const modules = canManageSystem(authenticatedUser?.user_role)
    ? [
        {
          key: "communications",
          path: "/autogestion/comunicaciones",
          icon: FaEnvelope,
          text: "Comunicaciones",
        },
        {
          key: "infants",
          path: "/autogestion/infantes",
          icon: FaChild,
          text: "Infantes",
        },
        {
          key: "systemNotes",
          path: "/autogestion/notas-del-sistema",
          icon: FaStickyNote,
          text: `Notas del Sistema ${import.meta.env.VITE_APP_VERSION}`,
        },
        {
          key: "tariffs",
          path: "/autogestion/tarifas",
          icon: FaDollarSign,
          text: "Tarifas",
        },
        {
          key: "configUsers",
          path: "/autogestion/usuarios",
          icon: FaUserCog,
          text: "Usuarios",
        },
      ]
    : [];

  if (!authenticatedUser) {
    return null;
  }

  return (
    <div
      className="watermark-background"
      style={{ marginTop: "80px", paddingBottom: "50px" }}
    >
      <NavBarDB />
      <div className="text-center">
        <h3 className="user-text" style={{ color: "#213472" }}>
          <FaUser /> ¡Bienvenido/a{" "}
          {userDetail?.first_name || authenticatedUser.first_name}{" "}
          {userDetail?.lastname || authenticatedUser.lastname}!
        </h3>
      </div>

      <div className="container">
        {isParent ? (
          // Vista para padres, madres o tutores
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 20px",
            }}
          >
            {/* Mostrar mensaje informativo si no hay hijos vinculados */}
            {myChildren.length === 0 && (
              <>
                <FaChild
                  size={120}
                  color="#213472"
                  style={{
                    marginBottom: "30px",
                  }}
                />

                <h2
                  style={{
                    color: "#213472",
                    fontWeight: "700",
                    marginBottom: "20px",
                    textAlign: "center",
                    fontFamily:
                      "georgia, palatino, 'book antiqua', 'palatino linotype', serif",
                  }}
                >
                  Portal para Padres, Madres y Tutores
                </h2>

                <p
                  style={{
                    fontSize: "1.2rem",
                    color: "#213472",
                    textAlign: "center",
                    maxWidth: "700px",
                    marginBottom: "30px",
                    lineHeight: "1.8",
                    fontFamily:
                      "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  Pronto vas a poder cargar{" "}
                  <strong>autorizados a retirar</strong>, acceder a{" "}
                  <strong>documentos médicos</strong> de tu hijo/a, ver el{" "}
                  <strong>seguimiento de actividades diarias</strong>,
                  comunicarte directamente con las educadoras y acceder a muchas
                  más funciones desde aquí.
                </p>

                <div
                  style={{
                    background: "rgba(255, 245, 237, 0.5)",
                    borderRadius: "15px",
                    padding: "25px 35px",
                    marginTop: "20px",
                    border: "2px solid #FFF5ED",
                    maxWidth: "600px",
                    marginBottom: "30px",
                  }}
                >
                  <p
                    style={{
                      color: "#213472",
                      fontSize: "1rem",
                      margin: 0,
                      textAlign: "center",
                      fontFamily:
                        "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
                    }}
                  >
                    <strong>¡Estamos trabajando para ti!</strong>
                    <br />
                    Estas funcionalidades estarán disponibles muy pronto para
                    hacer tu experiencia aún mejor.
                  </p>
                </div>
              </>
            )}

            {/* Carrusel de comunicados - solo si tiene hijos vinculados */}
            {myChildren.length > 0 && <CommunicationBoard />}

            <MyChildren />
            <AddMySon />
            <ParentCommunication />
          </div>
        ) : (
          // Vista para administradores/personal (roles 0, 1, 2)
          <>
            <div className="admin-panel">
              {modules.map((module) => {
                const IconComponent = module.icon;

                return (
                  <div key={module.key} className="admin-button-container">
                    <a href={module.path} className="module-link">
                      <button
                        className="btn btn-lg admin-button"
                        style={{
                          backgroundColor: "#213472",
                          color: "#FFFFFF",
                          border: "2px solid #213472",
                          fontFamily:
                            "georgia, palatino, 'book antiqua', 'palatino linotype', serif",
                          fontWeight: "600",
                          padding: "15px 30px",
                          margin: "10px",
                          transition: "all 0.3s ease",
                          minWidth: "250px",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-3px)";
                          e.target.style.boxShadow =
                            "0 8px 20px rgba(33, 52, 114, 0.4)";
                          e.target.style.backgroundColor = "#1a2859";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "none";
                          e.target.style.backgroundColor = "#213472";
                        }}
                      >
                        <IconComponent style={{ marginRight: "10px" }} />
                        <span>{module.text}</span>
                      </button>
                    </a>
                  </div>
                );
              })}
            </div>

            {/* Carrusel de comunicados para empleados/directivos */}
            <div style={{ marginTop: "60px" }}>
              <CommunicationBoard />
            </div>
          </>
        )}
      </div>

      {/* Botón flotante de chat */}
      <FloatingChatButton />
    </div>
  );
}
