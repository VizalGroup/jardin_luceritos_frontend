import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  GetFamilyRelationships,
  GetInfants,
  PostFamilyRelationship,
  UpdateInfant,
} from "../../../redux/actions";
import {
  Button,
  Form,
  Modal,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { capitalizeName, getCurrentDateTime } from "../../../utils";
import { FaLink, FaUser, FaSearch } from "react-icons/fa";
import { selectSortedUsers } from "../../../redux/selectors";
import UnlinkFamily from "./UnlinkFamily";

export default function LinkFamily({ infant }) {
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const users = useSelector(selectSortedUsers);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    infant_id: infant.id,
  });
  const familyLinks = useSelector((state) => state.family_relationships);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para el buscador
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Obtener IDs de usuarios ya vinculados a este infante
  const linkedUserIds = familyLinks
    .filter((link) => link.infant_id === infant.id)
    .map((link) => link.user_id);

  // Filtrar usuarios basado en el término de búsqueda y excluir los ya vinculados
  const filteredUsers = users.filter((user) => {
    const matchesSearch = `${user.first_name} ${user.lastname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const notLinked = !linkedUserIds.includes(user.id);
    return matchesSearch && notLinked;
  });

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);

    // Si el campo está vacío, limpiar la selección
    if (!value) {
      setSelectedUser(null);
      setFormData({ ...formData, user_id: "" });
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchTerm(
      `${capitalizeName(user.lastname)} ${capitalizeName(user.first_name)}`,
    );
    setFormData({ ...formData, user_id: user.id });
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formdataToUpdate = {
        ...infant,
        user_id: authenticatedUser?.id,
        last_update: getCurrentDateTime(),
      };
      await dispatch(PostFamilyRelationship(formData));
      await dispatch(UpdateInfant(infant.id, formdataToUpdate));
      await dispatch(GetInfants());
      await dispatch(GetFamilyRelationships());

      // Resetear el formulario
      setFormData({ user_id: "", infant_id: infant.id });

      // Resetear estados del buscador
      setSearchTerm("");
      setSelectedUser(null);
      setShowDropdown(false);

      handleCloseModal();
      
      // Mostrar notificación de éxito
      alert("✅ Familiar vinculado exitosamente");
    } catch (error) {
      console.error("Error al registrar enlace familiar:", error);
      alert("Error al registrar enlace familiar: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Resetear estados del buscador al cerrar
    setSearchTerm("");
    setSelectedUser(null);
    setShowDropdown(false);
  };

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={`tooltip-top`}>Vinculos familiares</Tooltip>}
      >
        <Button className="button-custom" onClick={() => setShowModal(true)}>
          <FaLink />
        </Button>
      </OverlayTrigger>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Familiares Vinculados</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {/* Lista de familiares vinculados */}
            <h5>Familiares</h5>
            {familyLinks.some((link) => link.infant_id === infant.id) ? (
              familyLinks
                .filter((link) => link.infant_id === infant.id)
                .map((link) => (
                  <div
                    key={link.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    <div>
                      <div>
                        {capitalizeName(link.user.user_last_name)},{" "}
                        {capitalizeName(link.user.first_name)}
                      </div>
                      {link.user.phone && (
                        <a
                          href={`tel:${link.user.phone}`}
                          style={{
                            fontSize: "0.9em",

                            textDecoration: "none",
                          }}
                        >
                          {link.user.phone}
                        </a>
                      )}
                    </div>
                    <UnlinkFamily id={link.id} />
                  </div>
                ))
            ) : (
              <p style={{ color: "red" }}>No hay familiares vinculados</p>
            )}
            <br />

            {/* Buscador de usuarios */}
            <Form.Group controlId="user_id">
              <Form.Label>
                <FaUser /> Usuario
              </Form.Label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "relative" }}>
                  <Form.Control
                    type="text"
                    placeholder="Buscar usuario por nombre..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setShowDropdown(true)}
                    autoComplete="off"
                    required={!selectedUser}
                    style={{ paddingRight: "40px" }}
                  />
                  <FaSearch
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6c757d",
                    }}
                  />
                </div>

                {/* Dropdown con resultados */}
                {showDropdown && searchTerm && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "white",
                      border: "1px solid #ddd",
                      borderTop: "none",
                      maxHeight: "200px",
                      overflowY: "auto",
                      zIndex: 1000,
                      borderRadius: "0 0 4px 4px",
                    }}
                  >
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleUserSelect(user)}
                          style={{
                            padding: "10px",
                            cursor: "pointer",
                            borderBottom: "1px solid #f0f0f0",
                            backgroundColor: "white",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#f8f9fa";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "white";
                          }}
                        >
                          {capitalizeName(user.lastname)}{" "}
                          {capitalizeName(user.first_name)}
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          padding: "10px",
                          color: "#6c757d",
                          textAlign: "center",
                        }}
                      >
                        No se encontraron usuarios
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button
              variant="warning"
              className="button-custom"
              type="submit"
              disabled={isSubmitting || !selectedUser}
            >
              Guardar Cambios
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
