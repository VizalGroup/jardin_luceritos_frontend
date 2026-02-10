import { createSelector } from "reselect";

// Selector general para usuarios y usuarios ordenados por user_rol y despues alfabeticamente por lastname y first_name
export const selectUsers = (state) => state.users;

export const selectSortedUsers = createSelector([selectUsers], (users) => {
  return [...users].sort((a, b) => {
    if (a.user_role === b.user_role) {
        if (a.lastname === b.lastname) {
            return a.first_name.localeCompare(b.first_name);
        }
        return a.lastname.localeCompare(b.lastname);
    }
    return a.user_role - b.user_role;
  });
});

//Tarifas

export const selectAllTariffs = (state) => state.tariffs;

//Tarifas, Exceptuando Hora extra y becados

export const selectTariffs = createSelector([selectAllTariffs], (tariffs) =>
  tariffs.filter((tariff) => tariff.number_of_hours > 1)
);

//Tarifas, Hora extra

export const selectExtraHour = createSelector([selectAllTariffs], (tariffs) =>
  tariffs.find((tariff) => tariff.id == 1)
);

//Infantes

export const selectInfants = (state) => state.infants;

//Infantes activos

export const selectActivateInfants = createSelector(
  [selectInfants],
  (infants) => infants.filter((infant) => infant.current_state == 1)
);

// Selector para ordenar infantes por apellido y luego por nombre
export const selectInfantsOrderedByLastName = createSelector(
  [selectInfants],
  (infants) =>
    [...infants].sort((a, b) => {
      const lastNameComparison = a.lastname.localeCompare(b.lastname);
      return lastNameComparison !== 0
        ? lastNameComparison // Si los apellidos son distintos, ordena por apellido
        : a.first_name.localeCompare(b.first_name); // Si los apellidos son iguales, ordena por nombre
    })
);

// Selector para obtener infantes activos y ordenarlos por apellido y luego por nombre
export const selectActiveInfantsOrderedByLastName = createSelector(
  [selectActivateInfants], // Usamos el selector de infantes activos
  (activeInfants) =>
    [...activeInfants].sort((a, b) => {
      const lastNameComparison = a.lastname.localeCompare(b.lastname);
      return lastNameComparison !== 0
        ? lastNameComparison // Si los apellidos son distintos, ordena por apellido
        : a.first_name.localeCompare(b.first_name); // Si los apellidos son iguales, ordena por nombre
    })
);

// Comunicaciones

export const selectCommunications = (state) => state.communications;

// Selector para ordenar comunicaciones de ID más alto a más bajo
export const selectCommunicationsOrderedById = createSelector(
  [selectCommunications],
  (communications) =>
    [...communications].sort((a, b) => b.id - a.id)
);

// ===== NUEVOS SELECTORES PARA CHAT =====

// Selector para conversaciones
export const selectConversations = (state) => state.conversations;

// Selector para mensajes de chat
export const selectChatMessages = (state) => state.chat_messages;

// Selector para ID del usuario autenticado
export const selectAuthenticatedUserId = (state) => state.authenticatedUserId;

// Selector para conversaciones donde participa el usuario autenticado
export const selectUserConversations = createSelector(
  [selectConversations, selectAuthenticatedUserId],
  (conversations, userId) => {
    if (!userId) return [];
    return conversations.filter(
      (conv) => conv.parent_id === userId || conv.staff_id === userId
    );
  }
);

// Selector para IDs de conversaciones del usuario (Set para lookup rápido)
export const selectUserConversationIds = createSelector(
  [selectUserConversations],
  (userConversations) => new Set(userConversations.map((c) => c.id))
);

// Selector para mensajes sin leer del usuario actual (solo en sus conversaciones)
export const selectUnreadMessages = createSelector(
  [selectChatMessages, selectAuthenticatedUserId, selectUserConversationIds],
  (messages, userId, conversationIds) => {
    if (!userId) return [];
    return messages.filter(
      (msg) =>
        conversationIds.has(msg.conversation_id) &&
        msg.sender_id !== userId &&
        !msg.read_at
    );
  }
);

// Selector para contar total de mensajes sin leer
export const selectUnreadMessagesCount = createSelector(
  [selectUnreadMessages],
  (unreadMessages) => unreadMessages.length
);

// Selector para conversaciones con mensajes sin leer (solo si el usuario participa)
export const selectConversationsWithUnreadMessages = createSelector(
  [selectUserConversations, selectChatMessages, selectAuthenticatedUserId],
  (conversations, messages, currentUserId) => {
    if (!currentUserId || !conversations.length) return [];

    const conversationsWithUnread = [];

    conversations.forEach((conv) => {
      const unreadCount = messages.filter(
        (msg) =>
          msg.conversation_id === conv.id &&
          msg.sender_id !== currentUserId &&
          !msg.read_at
      ).length;

      if (unreadCount > 0) {
        conversationsWithUnread.push({
          conversation: conv,
          unreadCount,
          otherUserId:
            conv.parent_id === currentUserId ? conv.staff_id : conv.parent_id,
        });
      }
    });

    return conversationsWithUnread;
  }
);

// Selector para IDs de usuarios con mensajes sin leer
export const selectUsersWithUnreadMessages = createSelector(
  [selectConversationsWithUnreadMessages],
  (conversationsWithUnread) => 
    conversationsWithUnread.map((c) => c.otherUserId)
);

// Selector para obtener mensajes de una conversación específica (memoizado)
export const selectMessagesByConversationId = createSelector(
  [
    selectChatMessages,
    (state, conversationId) => conversationId
  ],
  (messages, conversationId) => {
    if (!conversationId) return [];
    return messages.filter((msg) => msg.conversation_id === conversationId);
  }
);

// Selector para contar mensajes sin leer de una conversación específica
export const selectUnreadCountForConversation = createSelector(
  [
    selectMessagesByConversationId,
    selectAuthenticatedUserId
  ],
  (messages, userId) => {
    if (!userId) return 0;
    return messages.filter(
      (msg) => msg.sender_id !== userId && !msg.read_at
    ).length;
  }
);