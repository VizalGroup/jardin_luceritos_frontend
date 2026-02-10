import { useMemo, useState } from "react";
import { Table } from "react-bootstrap";
import { FaCalendarPlus, FaUser, FaUserTie, FaComments } from "react-icons/fa";
import { useSelector } from "react-redux";
import SearchBar from "../../../SearchBar";
import { capitalizeName, formatDateTime, normalizeText } from "../../../../utils";
import RemoveConversation from "./RemoveConversation";
import ViewConversation from "./ViewConversation";

const parseDateTime = (value) => {
  if (!value) return 0;
  const isoValue = value.includes("T") ? value : value.replace(" ", "T");
  const time = new Date(isoValue).getTime();
  return Number.isNaN(time) ? 0 : time;
};

export default function ConversationsTable({ conversations }) {
  const [searchTerm, setSearchTerm] = useState("");
  const chatMessages = useSelector((state) => state.chat_messages);

  const filteredConversations = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);

    return conversations.filter((conversation) => {
      if (!normalizedSearch) return true;

      const parentName = normalizeText(
        `${conversation.parent?.first_name || ""} ${conversation.parent?.lastname || ""}`
      );
      const staffName = normalizeText(
        `${conversation.staff?.first_name || ""} ${conversation.staff?.lastname || ""}`
      );

      return (
        parentName.includes(normalizedSearch) ||
        staffName.includes(normalizedSearch)
      );
    });
  }, [conversations, searchTerm]);

  const conversationStats = useMemo(() => {
    const stats = new Map();

    chatMessages.forEach((message) => {
      const conversationId = Number(message.conversation_id);
      if (!conversationId) return;

      const current = stats.get(conversationId) || {
        count: 0,
        lastCreatedAt: "",
        lastTime: 0,
      };

      const messageTime = parseDateTime(message.created_at);
      const isNewer = messageTime > current.lastTime;

      stats.set(conversationId, {
        count: current.count + 1,
        lastCreatedAt: isNewer ? message.created_at : current.lastCreatedAt,
        lastTime: isNewer ? messageTime : current.lastTime,
      });
    });

    return stats;
  }, [chatMessages]);

  return (
    <div
      style={{
        marginBottom: "12vh",
        backgroundColor: "#ffffffa9",
        padding: "20px",
        borderRadius: "20px",
      }}
    >
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        placeholder="Buscar por padre o staff..."
      />

      {filteredConversations.length === 0 ? (
        <div className="text-center p-4">
          <p style={{ color: "#213472" }}>
            No hay conversaciones que coincidan con los filtros.
          </p>
        </div>
      ) : (
        <Table striped bordered hover responsive style={{ textAlign: "center" }}>
          <thead style={{ backgroundColor: "#213472", color: "#FFF5ED" }}>
            <tr>
              <th>
                <FaCalendarPlus /> Fecha de creacion
              </th>
              <th>
                <FaUser /> Padre/Tutor
              </th>
              <th>
                <FaUserTie /> Staff
              </th>
              <th>
                <FaComments /> Mensajes
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredConversations.map((conversation) => {
              const parentName = capitalizeName(
                `${conversation.parent?.first_name || ""} ${conversation.parent?.lastname || ""}`.trim()
              );
              const staffName = capitalizeName(
                `${conversation.staff?.first_name || ""} ${conversation.staff?.lastname || ""}`.trim()
              );
              const stats = conversationStats.get(Number(conversation.id)) || {
                count: 0,
                lastCreatedAt: "",
              };

              return (
                <tr key={conversation.id}>
                  <td style={{ color: "#6c757d" }}>
                    {formatDateTime(conversation.created_at)}
                  </td>
                  <td>
                    <div style={{ fontWeight: "600", color: "#213472" }}>
                      {parentName || "Sin datos"}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: "600", color: "#213472" }}>
                      {staffName || "Sin datos"}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: "600", color: "#213472" }}>
                      {stats.count} mensajes
                    </div>
                    <div style={{ color: "#6c757d", marginTop: "4px" }}>
                      {stats.lastCreatedAt
                        ? `Ultimo: ${formatDateTime(stats.lastCreatedAt)}`
                        : "Sin mensajes"}
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        justifyContent: "center",
                      }}
                    >
                      <ViewConversation conversation={conversation} />
                      <RemoveConversation conversation={conversation} />
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
