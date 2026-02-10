import { useDispatch, useSelector } from "react-redux";
import { LogoutUser } from "../../redux/actions";
import { canManageSystem } from "../../utils";
import {
  FaAddressCard,
  FaDoorOpen,
  FaHome,
  FaStickyNote,
  FaUserCog,
  FaDollarSign,
  FaChild,
  FaEnvelope,
  FaHistory,
} from "react-icons/fa";

export default function NavBarDB() {
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);

  const handleLogout = () => {
    dispatch(LogoutUser());
    window.location.href = "/";
  };

  // Verificar si el usuario puede gestionar el sistema
  const canAccessManagement =
    authenticatedUser && canManageSystem(authenticatedUser.user_role);

  // Verificar si es padre/madre/tutor
  const isParent = authenticatedUser?.user_role === 3;

  return (
    <nav className="navbar navbar-dark navbar-custom fixed-top">
      <div className="container-fluid">
        <a className="navbar-brand navbar-title" href="/autogestion" style={{color: "#213472"}}>
          Luceritos Jardín Maternal 
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasNavbar"
          aria-controls="offcanvasNavbar"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" ></span>
        </button>
        <div
          className="offcanvas offcanvas-end offcanvas-custom"
          tabIndex="-1"
          id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasNavbarLabel" style={{color: "#213472"}}>
              Menú Principal
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
              <li className="nav-item">
                <a
                  className="nav-link active"
                  aria-current="page"
                  href="/autogestion"
                  style={{color: "#213472"}}
                >
                  <FaHome /> Inicio
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/autogestion/actualizar_credenciales">
                  <FaAddressCard /> Actualizar credenciales de usuario
                </a>
              </li>

              {/* Historial de comunicaciones solo para padres */}
              {isParent && (
                <>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/autogestion/historial-comunicaciones">
                      <FaHistory /> Historial de Comunicaciones
                    </a>
                  </li>
                </>
              )}

              {/* Solo mostrar estas opciones si NO es cliente (rol 3) */}
              {canAccessManagement && (
                <>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                  <li className="nav-item">
                    <a className="nav-link" href="/autogestion/comunicaciones">
                      <FaEnvelope /> Comunicaciones
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/autogestion/infantes">
                      <FaChild /> Infantes
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/autogestion/notas-del-sistema">
                      <FaStickyNote /> Notas del Sistema{" "}
                      {import.meta.env.VITE_APP_VERSION}
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/autogestion/tarifas">
                      <FaDollarSign /> Tarifas
                    </a>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/autogestion/usuarios">
                      <FaUserCog /> Usuarios
                    </a>
                  </li>
                </>
              )}

              <li>
                <hr className="dropdown-divider" />
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  onClick={handleLogout}
                  style={{ cursor: "pointer" }}
                >
                  <FaDoorOpen /> Cerrar sesión
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
