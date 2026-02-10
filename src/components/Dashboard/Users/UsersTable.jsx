import { useState, useEffect } from "react";
import { Button, Table } from "react-bootstrap";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaHome,
  FaWhatsapp,
  FaCalendarPlus,
  FaEdit as FaCalendarEdit,
  FaIdCard,
} from "react-icons/fa";
import { RiUserSettingsLine } from "react-icons/ri";
import Pagination from "../../Pagination";
import {
  getUserRoleName,
  formatDateTime,
  capitalizeName,
  getDocumentTypeName,
} from "../../../utils";
import EditUser from "./EditUser";

export default function UsersTable({ users }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const totalPages = Math.ceil(users.length / itemsPerPage);

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
                <FaEnvelope /> Email
              </th>
              <th>
                <FaPhone /> Teléfono
              </th>
              <th>
                <FaIdCard /> Documento
              </th>
              <th>
                <RiUserSettingsLine /> Rol
              </th>
              <th>
                <FaHome /> Dirección
              </th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((user) => (
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
                <td style={{ wordBreak: "break-word" }}>{user.email}</td>
                <td>{user.phone || "No especificado"}</td>
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
                <td style={{ wordBreak: "break-word" }}>
                  {user.street_address || "No especificada"}
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
                    <EditUser user={user} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
