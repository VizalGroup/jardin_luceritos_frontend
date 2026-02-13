import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import NavBarDB from "../NavBarDB";
import BackButton from "../../BackButton";
import { selectSortedUsers } from "../../../redux/selectors";
import { canManageSystem, normalizeText } from "../../../utils";
import { GetUsers, LogoutUser, GetInfants, GetFamilyRelationships } from "../../../redux/actions";
import { Button } from "react-bootstrap";
import { FaCopy } from "react-icons/fa";
import AddUser from "./AddUser";
import UsersTable from "./UsersTable";
import SearchBar from "../../SearchBar";

export default function Users() {
  document.title = "Usuarios - Panel de Administración";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const users = useSelector(selectSortedUsers);
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = () => {
    const registrationLink = "https://luceritosjardinmaternal.com/registro";
    navigator.clipboard
      .writeText(registrationLink)
      .then(() => {
        setLinkCopied(true);
        alert("Enlace copiado en portapapeles");
        setTimeout(() => {
          setLinkCopied(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Error al copiar el enlace: ", err);
        alert("Error al copiar el enlace");
      });
  };

  useEffect(() => {
    // Verificar autenticación
    if (!authenticatedUser) {
      navigate("/");
      return;
    }

    // Verificar que no sea cliente (rol 3)
    if (!canManageSystem(authenticatedUser.user_role)) {
      alert("No tienes permisos para acceder a esta sección.");
      dispatch(LogoutUser());
      navigate("/");
      return;
    }

    dispatch(GetUsers());
    dispatch(GetInfants());
    dispatch(GetFamilyRelationships());
  }, [dispatch, authenticatedUser, navigate]);

  const filteredUsers = users.filter((user) => {
    const normalizedSearch = normalizeText(searchTerm);

    return (
      normalizeText(user.first_name).includes(normalizedSearch) ||
      normalizeText(user.lastname).includes(normalizedSearch) ||
      normalizeText(user.email).includes(normalizedSearch) ||
      normalizeText(user.phone).includes(normalizedSearch) ||
      normalizeText(user.street_address).includes(normalizedSearch)
    );
  });

  if (!authenticatedUser || !canManageSystem(authenticatedUser.user_role)) {
    return null;
  }

  return (
    <div className="watermark-background">
      <NavBarDB />
      <div className="container" style={{ marginTop: "100px" }}>
        <div className="d-flex gap-3 mb-4">
          <BackButton />
          <Button
            variant="primary"
            onClick={handleCopyLink}
            className="button-custom"
          >
            <FaCopy /> Copiar enlace de registro
          </Button>
          <AddUser />
        </div>
        <h2 className="text-center module-title">Usuarios</h2>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Buscar por nombre, email, teléfono o dirección..."
        />
        <UsersTable users={filteredUsers} />
      </div>
    </div>
  );
}
