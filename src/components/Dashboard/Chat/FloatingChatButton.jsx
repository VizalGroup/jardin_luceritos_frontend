import { useState, useEffect, useRef, useMemo } from "react";
import { Modal, Button, Form, ListGroup, Badge } from "react-bootstrap";
import { FaComments, FaSearch, FaUser } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import {
  capitalizeName,
  getUserRoleName,
  normalizeText,
  findExistingConversation,
  getCurrentDateTime,
} from "../../../utils";
import {
  selectSortedUsers,
  selectConversations,
  selectChatMessages,
} from "../../../redux/selectors";
import { GetChatMessages, GetConversations, PostConversation } from "../../../redux/actions";
import ChatWindow from "./ChatWindow";

export default function FloatingChatButton() {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const allUsers = useSelector(selectSortedUsers);

  const allMessages = useSelector(selectChatMessages);
  const conversations = useSelector(selectConversations);

  const currentUserId = authenticatedUser?.id ? Number(authenticatedUser.id) : null;

  const userConversations = useMemo(() => {
    if (!currentUserId) return [];
    return conversations.filter(
      (conv) =>
        Number(conv.parent_id) === currentUserId ||
        Number(conv.staff_id) === currentUserId
    );
  }, [conversations, currentUserId]);

  const totalUnreadMessages = useMemo(() => {
    if (!currentUserId || userConversations.length === 0) return 0;
    const conversationIds = new Set(userConversations.map((c) => Number(c.id)));
    return allMessages.filter(
      (msg) =>
        conversationIds.has(Number(msg.conversation_id)) &&
        Number(msg.sender_id) !== currentUserId &&
        !msg.read_at
    ).length;
  }, [allMessages, currentUserId, userConversations]);

  const usersWithUnreadMessages = useMemo(() => {
    if (!currentUserId || userConversations.length === 0) return [];
    return userConversations
      .map((conv) => {
        const unreadCount = allMessages.filter(
          (msg) =>
            Number(msg.conversation_id) === Number(conv.id) &&
            Number(msg.sender_id) !== currentUserId &&
            !msg.read_at
        ).length;

        if (unreadCount > 0) {
          return Number(conv.parent_id) === currentUserId
            ? Number(conv.staff_id)
            : Number(conv.parent_id);
        }
        return null;
      })
      .filter((id) => id !== null);
  }, [allMessages, currentUserId, userConversations]);

  const [openChats, setOpenChats] = useState([]);
  
  const intervalRef = useRef(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const hasOpenChats = openChats.length > 0;
    const intervalTime = hasOpenChats ? 5000 : 30000; // 5s o 30s

    intervalRef.current = setInterval(() => {
      dispatch(GetChatMessages());
      dispatch(GetConversations());
    }, intervalTime);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [openChats.length, dispatch]);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setSearchTerm("");
  };

  const getAvailableUsers = () => {
    let filteredUsers = allUsers.filter(
      (user) => user.id !== authenticatedUser?.id && user.is_activate === 1,
    );

    if (authenticatedUser?.user_role === 3) {
      filteredUsers = filteredUsers.filter(
        (user) => user.user_role !== 3 && user.user_role !== 15
      );
    }

    if (searchTerm) {
      const normalizedSearch = normalizeText(searchTerm);
      filteredUsers = filteredUsers.filter(
        (user) =>
          normalizeText(user.first_name).includes(normalizedSearch) ||
          normalizeText(user.lastname).includes(normalizedSearch),
      );
    }

    return filteredUsers.sort((a, b) => {
      const aHasUnread = usersWithUnreadMessages.includes(a.id);
      const bHasUnread = usersWithUnreadMessages.includes(b.id);
      if (aHasUnread && !bHasUnread) return -1;
      if (!aHasUnread && bHasUnread) return 1;
      return 0;
    });
  };

  const handleSelectUser = async (user) => {
    try {
      const existingChat = openChats.find((chat) => chat.user.id === user.id);
      if (existingChat) {
        setOpenChats(
          openChats.map((chat) =>
            chat.user.id === user.id ? { ...chat, isMinimized: false } : chat,
          ),
        );
        handleCloseModal();
        return;
      }

      // Abrir el chat inmediatamente con estado de carga
      const newChat = {
        user,
        conversation: null,
        isMinimized: false,
        isLoading: true,
      };

      setOpenChats([...openChats, newChat]);
      handleCloseModal();

      // Buscar o crear la conversación en segundo plano
      let conversation = findExistingConversation(
        conversations,
        authenticatedUser.id,
        user.id,
      );

      if (!conversation) {
        const now = getCurrentDateTime();
        const conversationData = {
          parent_id: authenticatedUser.user_role === 3 ? authenticatedUser.id : user.id,
          staff_id: authenticatedUser.user_role === 3 ? user.id : authenticatedUser.id,
          created_at: now,
          updated_at: now,
        };

        const result = await dispatch(PostConversation(conversationData));
        
        if (!result.payload || !result.payload.id) {
          throw new Error("No se pudo crear la conversación");
        }
        
        conversation = result.payload;
        
        // Recargar conversaciones y mensajes
        await dispatch(GetConversations());
      }

      if (!conversation || !conversation.id) {
        throw new Error("La conversación no tiene un ID válido");
      }

      // Actualizar el chat con la conversación lista
      setOpenChats((prevChats) =>
        prevChats.map((chat) =>
          chat.user.id === user.id
            ? { ...chat, conversation, isLoading: false }
            : chat,
        ),
      );
      
      await dispatch(GetChatMessages());
    } catch (error) {
      console.error("Error completo al abrir chat:", error);
      
      // Mostrar error con mensaje amigable
      setOpenChats((prevChats) =>
        prevChats.map((chat) =>
          chat.user.id === user.id
            ? { 
                ...chat, 
                isLoading: false, 
                error: "No se pudo cargar la conversación. Intenta cerrar y volver a abrir el chat." 
              }
            : chat,
        ),
      );
    }
  };

  const handleCloseChat = (userId) => {
    setOpenChats(openChats.filter((chat) => chat.user.id !== userId));
  };

  const handleMinimizeChat = (userId) => {
    setOpenChats(
      openChats.map((chat) =>
        chat.user.id === userId
          ? { ...chat, isMinimized: !chat.isMinimized }
          : chat,
      ),
    );
  };

  const getUnreadCountForUser = (userId) => {
    const conversation = findExistingConversation(
      conversations,
      authenticatedUser.id,
      userId,
    );
    if (!conversation) return 0;

    return allMessages.filter(
      (msg) =>
        Number(msg.conversation_id) === Number(conversation.id) &&
        Number(msg.sender_id) === Number(userId) &&
        !msg.read_at,
    ).length;
  };

  const getUserById = (userId) => {
    return allUsers.find((u) => u.id === userId);
  };

  const availableUsers = getAvailableUsers();

  return (
    <>
      <Button
        onClick={handleOpenModal}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "#213472",
          border: "none",
          boxShadow: "0 4px 12px rgba(33, 52, 114, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 998,
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(33, 52, 114, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(33, 52, 114, 0.4)";
        }}
      >
        <FaComments size={28} color="#FFF5ED" />
        {totalUnreadMessages > 0 && (
          <Badge
            bg="danger"
            pill
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              fontSize: "0.75rem",
            }}
          >
            {totalUnreadMessages}
          </Badge>
        )}
      </Button>

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header
          closeButton
          style={{ backgroundColor: "#213472", color: "#FFF5ED" }}
        >
          <Modal.Title>
            <FaComments style={{ marginRight: "10px" }} />
            {totalUnreadMessages > 0 ? (
              <>Mensajes Nuevos ({totalUnreadMessages})</>
            ) : (
              "Nuevo Chat"
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <Form.Group className="mb-3">
            <div style={{ position: "relative" }}>
              <Form.Control
                type="text"
                placeholder="Buscar por nombre o apellido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  paddingLeft: "40px",
                  border: "2px solid #213472",
                  borderRadius: "8px",
                }}
              />
              <FaSearch
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#213472",
                }}
              />
            </div>
          </Form.Group>

          {availableUsers.length === 0 ? (
            <div className="text-center p-4">
              <p style={{ color: "#6c757d" }}>
                No se encontraron usuarios disponibles
              </p>
            </div>
          ) : (
            <ListGroup>
              {availableUsers.map((user) => {
                const unreadCount = getUnreadCountForUser(user.id);
                const hasUnread = unreadCount > 0;

                return (
                  <ListGroup.Item
                    key={user.id}
                    action
                    onClick={() => handleSelectUser(user)}
                    style={{
                      cursor: "pointer",
                      borderRadius: "8px",
                      marginBottom: "8px",
                      border: hasUnread
                        ? "2px solid #213472"
                        : "1px solid #dee2e6",
                      backgroundColor: hasUnread ? "#e8f0ff" : "white",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = hasUnread
                        ? "#d4e4ff"
                        : "#f8f9fa";
                      e.currentTarget.style.borderColor = "#213472";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = hasUnread
                        ? "#e8f0ff"
                        : "white";
                      e.currentTarget.style.borderColor = hasUnread
                        ? "#213472"
                        : "#dee2e6";
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div
                        style={{
                          width: "45px",
                          height: "45px",
                          borderRadius: "50%",
                          backgroundColor: "#213472",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "15px",
                          position: "relative",
                        }}
                      >
                        <FaUser size={20} color="#FFF5ED" />
                        {hasUnread && (
                          <Badge
                            bg="danger"
                            pill
                            style={{
                              position: "absolute",
                              top: "-5px",
                              right: "-5px",
                              fontSize: "0.7rem",
                            }}
                          >
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: hasUnread ? "700" : "600",
                            color: "#213472",
                            fontSize: "1.1rem",
                          }}
                        >
                          {capitalizeName(user.lastname)},{" "}
                          {capitalizeName(user.first_name)}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#6c757d" }}>
                          {getUserRoleName(user.user_role)}
                          {hasUnread && (
                            <span
                              style={{
                                color: "#213472",
                                marginLeft: "8px",
                                fontWeight: "600",
                              }}
                            >
                              • {unreadCount} mensaje
                              {unreadCount > 1 ? "s" : ""} nuevo
                              {unreadCount > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {openChats.map((chat, index) => (
        <div
          key={chat.user.id}
          style={{
            right: `${90 + index * (chat.isMinimized ? 270 : 370)}px`,
          }}
        >
          <ChatWindow
            user={chat.user}
            conversation={chat.conversation}
            onClose={() => handleCloseChat(chat.user.id)}
            onMinimize={() => handleMinimizeChat(chat.user.id)}
            isMinimized={chat.isMinimized}
            isLoading={chat.isLoading}
            error={chat.error}
          />
        </div>
      ))}
    </>
  );
}
