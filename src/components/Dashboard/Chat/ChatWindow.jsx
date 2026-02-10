import { useState, useEffect, useRef } from "react";
import { Button, Form, Badge, Spinner } from "react-bootstrap";
import { FaTimes, FaMinus, FaPaperPlane, FaUser } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  PostChatMessage,
  UpdateChatMessage,
  GetChatMessages,
} from "../../../redux/actions";
import {
  capitalizeName,
  getCurrentDateTime,
  formatDateTime,
  sanitizeText,
} from "../../../utils";
import { selectMessagesByConversationId } from "../../../redux/selectors";

export default function ChatWindow({
  user,
  conversation,
  onClose,
  onMinimize,
  isMinimized,
  isLoading = false,
  error = null,
}) {
  const dispatch = useDispatch();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);

  // Usar selector memoizado en lugar de filtrar manualmente
  const messages = useSelector((state) =>
    selectMessagesByConversationId(state, conversation?.id),
  );

  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const hasMarkedAsRead = useRef(false); // Ref para evitar marcar múltiples veces
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const count = messages.filter(
      (msg) => msg.sender_id !== authenticatedUser.id && !msg.read_at,
    ).length;
    setUnreadCount(count);
  }, [messages, authenticatedUser?.id]);

  const MAX_CHARACTERS = 200;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Efecto separado para marcar como leídos (solo cuando se abre/expande)
  useEffect(() => {
    if (
      conversation &&
      !isMinimized &&
      unreadCount > 0 &&
      !hasMarkedAsRead.current
    ) {
      hasMarkedAsRead.current = true; // Marcar para evitar re-ejecución
      markMessagesAsRead();
    }

    // Reset cuando se minimiza
    if (isMinimized) {
      hasMarkedAsRead.current = false;
    }
  }, [conversation, isMinimized, unreadCount]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const markMessagesAsRead = async () => {
    try {
      const unreadMessages = messages.filter(
        (msg) => msg.sender_id !== authenticatedUser.id && !msg.read_at,
      );

      if (unreadMessages.length === 0) return;

      // Marcar todos en paralelo sin esperar la recarga completa
      const updatePromises = unreadMessages.map((msg) =>
        dispatch(
          UpdateChatMessage(msg.id, {
            ...msg,
            read_at: getCurrentDateTime(),
            updated_at: getCurrentDateTime(),
          }),
        ),
      );

      await Promise.all(updatePromises);

      // Recargar mensajes solo UNA vez después de marcar todos
      await dispatch(GetChatMessages());
      setUnreadCount(0);
    } catch (error) {
      console.error("Error al marcar mensajes como leídos:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSendingMessage || !conversation || !conversation.id) return;

    setIsSendingMessage(true);
    try {
      const now = getCurrentDateTime();
      const sanitizedContent = sanitizeText(newMessage.trim());
      const messageData = {
        conversation_id: conversation.id, // Ahora está garantizado que existe
        sender_id: authenticatedUser.id,
        message_content: sanitizedContent,
        created_at: now,
        updated_at: now,
        read_at: "",
        attachment_url: "",
      };

      await dispatch(PostChatMessage(messageData));
      setNewMessage("");

      // Solo recargar mensajes, no marcar como leídos nuevamente
      await dispatch(GetChatMessages());
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      alert("Error al enviar el mensaje: " + error.message);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setNewMessage(value.slice(0, MAX_CHARACTERS));
  };

  const remainingCharacters = MAX_CHARACTERS - newMessage.length;
  const isNearLimit = remainingCharacters <= 20;

  if (isMinimized) {
    return (
      <div
        className={unreadCount > 0 ? "chat-minimized-pulse" : ""}
        style={{
          position: "fixed",
          bottom: 0,
          right: "20px",
          width: "250px",
          backgroundColor: "#213472",
          color: "#FFF5ED",
          borderRadius: "8px 8px 0 0",
          padding: "10px 15px",
          cursor: "pointer",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.2)",
          zIndex: 999,
        }}
        onClick={onMinimize}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <FaUser size={16} />
            <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>
              {capitalizeName(user.lastname)}, {capitalizeName(user.first_name)}
            </span>
            {unreadCount > 0 && (
              <Badge bg="danger" pill>
                {unreadCount}
              </Badge>
            )}
          </div>
          <FaTimes
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        right: "20px",
        width: "350px",
        height: "500px",
        backgroundColor: "#FFF5ED",
        borderRadius: "8px 8px 0 0",
        boxShadow: "0 -2px 20px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        zIndex: 999,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#213472",
          color: "#FFF5ED",
          padding: "12px 15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              backgroundColor: "#FFF5ED",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaUser size={18} color="#213472" />
          </div>
          <div>
            <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>
              {capitalizeName(user.lastname)}, {capitalizeName(user.first_name)}
            </div>
            <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
              {user.user_role === 3
                ? "Padre/Madre/Tutor"
                : "Personal del jardín"}
            </div>
          </div>
        </div>
        <div className="d-flex gap-2">
          <FaMinus onClick={onMinimize} style={{ cursor: "pointer" }} />
          <FaTimes onClick={onClose} style={{ cursor: "pointer" }} />
        </div>
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "15px",
          backgroundColor: "#f8f9fa",
        }}
      >
        {isLoading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#213472",
            }}
          >
            <Spinner animation="border" style={{ marginBottom: "15px" }} />
            <p style={{ fontSize: "1rem", fontWeight: "500" }}>
              Preparando la conversación...
            </p>
          </div>
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              color: "#dc3545",
              marginTop: "50px",
            }}
          >
            <p style={{ fontWeight: "600" }}>Error al cargar el chat</p>
            <p style={{ fontSize: "0.85rem" }}>{error}</p>
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() => window.location.reload()}
              style={{ marginTop: "10px" }}
            >
              Recargar página
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#6c757d",
              marginTop: "50px",
            }}
          >
            <p>No hay mensajes aún</p>
            <p style={{ fontSize: "0.85rem" }}>Inicia la conversación</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.sender_id === authenticatedUser.id;
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "10px 14px",
                    borderRadius: isOwnMessage
                      ? "15px 15px 0 15px"
                      : "15px 15px 15px 0",
                    backgroundColor: isOwnMessage ? "#213472" : "#ffffff",
                    color: isOwnMessage ? "#FFF5ED" : "#213472",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ wordWrap: "break-word" }}>
                    {msg.message_content}
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      opacity: 0.7,
                      marginTop: "5px",
                      textAlign: "right",
                    }}
                  >
                    {formatDateTime(msg.created_at)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <Form
        onSubmit={handleSendMessage}
        style={{
          padding: "12px",
          backgroundColor: "#ffffff",
          borderTop: "1px solid #dee2e6",
        }}
      >
        <div className="d-flex gap-2 align-items-center">
          <div style={{ flex: 1, position: "relative" }}>
            <Form.Control
              type="text"
              placeholder={isLoading || error ? "Esperando..." : "Escribe un mensaje..."}
              value={newMessage}
              onChange={handleMessageChange}
              disabled={isSendingMessage || isLoading || error || !conversation || !conversation.id}
              style={{
                border: "2px solid #213472",
                borderRadius: "20px",
                fontSize: "0.9rem",
                paddingRight: "50px",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.75rem",
                color: isNearLimit ? "#dc3545" : "#6c757d",
                fontWeight: isNearLimit ? "600" : "400",
              }}
            >
              {remainingCharacters}
            </span>
          </div>
          <Button
            type="submit"
            disabled={isSendingMessage || isLoading || error || !newMessage.trim() || !conversation || !conversation.id}
            style={{
              backgroundColor: "#213472",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              opacity: (isSendingMessage || isLoading || error || !conversation || !conversation.id) ? 0.5 : 1,
            }}
          >
            <FaPaperPlane size={16} />
          </Button>
        </div>
      </Form>
    </div>
  );
}
