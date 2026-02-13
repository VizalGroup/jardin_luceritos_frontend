import { useState, useEffect } from "react";
import { Button, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaHome,
  FaWhatsapp,
  FaCalendarPlus,
  FaEdit as FaCalendarEdit,
  FaIdCard,
  FaChild,
} from "react-icons/fa";
import { RiUserSettingsLine } from "react-icons/ri";
import Pagination from "../../Pagination";
import {
  getUserRoleName,
  formatDateTime,
  capitalizeName,
  getDocumentTypeName,
  canEditUsers,
} from "../../../utils";
import EditUser from "./EditUser";

export default function UsersTable({ users }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const totalPages = Math.ceil(users.length / itemsPerPage);
  
  // Obtener vínculos familiares (ya incluyen la info del infante)
  const familyLinks = useSelector((state) => state.family_relationships);
  
  // Obtener usuario autenticado para verificar permisos
  const authenticatedUser = useSelector((state) => state.authenticatedUser);

  // Función para obtener infantes de un usuario
  const getUserInfants = (userId) => {
    return familyLinks
      .filter((link) => link.user_id === userId)
      .map((link) => link.infant);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [users.length]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const currentItems = users.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div
      style={{
        marginBottom: "12vh",
        backgroundColor: "#ffffffa9",
        padding: "20px",
        borderRadius: "20px",
      }}
    >
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {users.length === 0 ? (
        <div className="text-center p-4">
          <p style={{ color: "#213472" }}>
            No hay usuarios que coincidan con la búsqueda.
          </p>
        </div>
      ) : (
        <Table
          striped
          bordered
          hover
          responsive
          style={{ textAlign: "center" }}
        >
          <thead style={{ backgroundColor: "#213472", color: "#FFF5ED" }}>
            <tr>
              <th>
                <FaUser /> Usuario
              </th>
              <th>
                <FaIdCard /> Documento
              </th>
              <th>
                <RiUserSettingsLine /> Rol
              </th>
              <th>
                Contacto
              </th>
              <th>
                <FaChild /> Infantes a cargo
              </th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((user) => {
              const userInfants = getUserInfants(user.id);
              
              return (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: "600", color: "#213472" }}>
                      {capitalizeName(user.lastname)},{" "}
                      {capitalizeName(user.first_name)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#6c757d",
                        marginTop: "5px",
                      }}
                    >
                      <div style={{ marginBottom: "2px" }}>
                        <FaCalendarPlus
                          size={10}
                          style={{ marginRight: "5px" }}
                        />
                        Creado: {formatDateTime(user.created_at)}
                      </div>
                      <div>
                        <FaCalendarEdit
                          size={10}
                          style={{ marginRight: "5px" }}
                        />
                        Actualizado: {formatDateTime(user.updated_at)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.9rem" }}>
                      <div style={{ fontWeight: "600", color: "#213472" }}>
                        {getDocumentTypeName(user.document_type)}
                      </div>
                      <div style={{ color: "#6c757d", marginTop: "2px" }}>
                        {user.document_number || "No especificado"}
                      </div>
                    </div>
                  </td>
                  <td>{getUserRoleName(parseInt(user.user_role))}</td>
                  <td>
                    <div style={{ fontSize: "0.85rem" }}>
                      {user.phone && (
                        <div style={{ marginBottom: "4px" }}>
                          <FaPhone size={11} style={{ marginRight: "5px", color: "#213472" }} />
                          <a 
                            href={`tel:${user.phone}`}
                            style={{ textDecoration: "none", color: "#213472" }}
                          >
                            {user.phone}
                          </a>
                        </div>
                      )}
                      {user.email && (
                        <div style={{ marginBottom: "4px", wordBreak: "break-word" }}>
                          <FaEnvelope size={11} style={{ marginRight: "5px", color: "#213472" }} />
                          <a 
                            href={`mailto:${user.email}`}
                            style={{ textDecoration: "none", color: "#213472" }}
                          >
                            {user.email}
                          </a>
                        </div>
                      )}
                      {user.street_address && (
                        <div style={{ color: "#6c757d" }}>
                          <FaHome size={11} style={{ marginRight: "5px" }} />
                          {user.street_address}
                        </div>
                      )}
                      {!user.phone && !user.email && !user.street_address && (
                        <span style={{ color: "#6c757d", fontStyle: "italic" }}>
                          Sin datos de contacto
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.85rem" }}>
                      {userInfants.length > 0 ? (
                        userInfants.map((infant, index) => (
                          <div 
                            key={`${user.id}-infant-${index}`}
                            style={{ 
                              marginBottom: index < userInfants.length - 1 ? "6px" : "0",
                              paddingBottom: index < userInfants.length - 1 ? "6px" : "0",
                              borderBottom: index < userInfants.length - 1 ? "1px solid #e0e0e0" : "none"
                            }}
                          >
                            <div style={{ fontWeight: "600", color: "#213472" }}>
                              {capitalizeName(infant.lastname)}, {capitalizeName(infant.first_name)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <span style={{ color: "#6c757d", fontStyle: "italic" }}>
                          Sin infantes vinculados
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "5px 10px",
                        borderRadius: "15px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        backgroundColor:
                          user.is_activate == 1 ? "#d4edda" : "#f8d7da",
                        color: user.is_activate == 1 ? "#155724" : "#721c24",
                      }}
                    >
                      {user.is_activate == 1 ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "2px",
                        justifyContent: "center",
                      }}
                    >
                      {user.phone && (
                        <Button className="button-custom" size="sm">
                          <a
                            href={`https://wa.me/549${user.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "inherit" }}
                            title="Contactar por WhatsApp"
                          >
                            <FaWhatsapp />
                          </a>
                        </Button>
                      )}
                      {canEditUsers(authenticatedUser?.user_role) && (
                        <EditUser user={user} />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
