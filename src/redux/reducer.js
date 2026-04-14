const initialState = {
  users: [],
  userDetail: [],
  authenticatedUserId: null,
  authenticatedUser:
    JSON.parse(localStorage.getItem("authenticatedUser")) || null,
  authenticatedUserId: localStorage.getItem("authenticatedUserId") || null,
  tariffs: [],
  tariff_detail: [],
  infants: [],
  infant_detail: [],
  family_relationships: [],
  family_relationship_detail: [],
  communications: [],
  communicationDetail: [],
  communication_recipients: [],
  communication_recipientDetail: [],
  conversations: [],
  conversationDetail: [],
  chat_messages: [],
  chat_messageDetail: [],
  charges: [],
  charge_detail: [],
  expenseCategories: [],
  expenseCategoryDetail: [],
  suppliers: [],
  supplierDetail: [],
  expenses: [],
  expenseDetail: [],
  medical_documents: [],
  medical_documentDetail: [],
  authorized_persons: [],
  authorized_personDetail: [],
  authorized_person_infant_links: [],
  authorized_person_infant_linkDetail: [],
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case "GET_USERS":
      return {
        ...state,
        users: action.payload,
      };

    case "GET_ID_USER":
      return {
        ...state,
        userDetail: action.payload,
      };

    case "POST_USER":
      return {
        ...state,
      };

    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((item) => {
          return item.id === action.payload.id ? action.payload : item;
        }),
        userDetail:
          state.userDetail && state.userDetail.id === action.payload.id
            ? action.payload
            : state.userDetail,
      };

    case "DELETE_USER":
      return {
        ...state,
        users: state.users.filter((item) => item.id !== action.payload),
      };

    case "AUTHENTICATE_USER":
      return {
        ...state,
        authenticatedUser: action.payload,
        authenticatedUserId: action.payload.id,
      };

    case "SET_AUTHENTICATED_USER":
      return {
        ...state,
        authenticatedUser: action.payload,
        authenticatedUserId: action.payload.id,
      };

    case "LOGOUT_USER":
      return {
        ...state,
        authenticatedUser: null,
        authenticatedUserId: null,
      };

    case "GET_TARIFFS":
      return {
        ...state,
        tariffs: action.payload,
      };

    case "GET_ID_TARIFF":
      return {
        ...state,
        tariff_detail: action.payload,
      };

    case "POST_TARIFF":
      return {
        ...state,
      };

    case "UPDATE_TARIFF":
      return {
        ...state,
        tariffs: state.tariffs.map((item) => {
          return item.id === action.payload.id ? action.payload : item;
        }),
      };

    case "DELETE_TARIFF":
      return {
        ...state,
        tariffs: state.tariffs.filter((item) => item.id !== action.payload),
      };

    case "GET_INFANTS":
      return {
        ...state,
        infants: action.payload,
      };

    case "GET_ID_INFANT":
      return {
        ...state,
        infant_detail: action.payload,
      };

    case "POST_INFANT":
      return {
        ...state,
      };

    case "UPDATE_INFANT":
      return {
        ...state,
        infants: state.infants.map((item) => {
          return item.id === action.payload.id ? action.payload : item;
        }),
      };

    case "DELETE_INFANT":
      return {
        ...state,
        infants: state.infants.filter((item) => item.id !== action.payload),
      };

    case "GET_FAMILY_RELATIONSHIPS":
      return {
        ...state,
        family_relationships: action.payload,
      };

    case "GET_ID_FAMILY_RELATIONSHIP":
      return {
        ...state,
        family_relationship_detail: action.payload,
      };

    case "POST_FAMILY_RELATIONSHIP":
      return {
        ...state,
      };

    case "UPDATE_FAMILY_RELATIONSHIP":
      return {
        ...state,
        family_relationships: state.family_relationships.map((item) => {
          return item.id === action.payload.id ? action.payload : item;
        }),
      };

    case "DELETE_FAMILY_RELATIONSHIP":
      return {
        ...state,
        family_relationships: state.family_relationships.filter(
          (item) => item.id !== action.payload,
        ),
      };

    case "GET_COMMUNICATIONS":
      return {
        ...state,
        communications: action.payload,
      };

    case "GET_ID_COMMUNICATION":
      return {
        ...state,
        communicationDetail: action.payload,
      };

    case "POST_COMMUNICATION":
      return {
        ...state,
      };

    case "UPDATE_COMMUNICATION":
      return {
        ...state,
        communications: state.communications.map((item) => {
          return item.id === action.payload.id ? action.payload : item;
        }),
      };

    case "DELETE_COMMUNICATION":
      return {
        ...state,
        communications: state.communications.filter(
          (item) => item.id !== action.payload,
        ),
      };

    case "GET_COMMUNICATION_RECIPIENTS":
      return {
        ...state,
        communication_recipients: action.payload,
      };

    case "GET_ID_COMMUNICATION_RECIPIENT":
      return {
        ...state,
        communication_recipientDetail: action.payload,
      };

    case "POST_COMMUNICATION_RECIPIENT":
      return {
        ...state,
      };

    case "UPDATE_COMMUNICATION_RECIPIENT":
      return {
        ...state,
        communication_recipients: state.communication_recipients.map((item) => {
          return item.id === action.payload.id ? action.payload : item;
        }),
      };

    case "DELETE_COMMUNICATION_RECIPIENT":
      return {
        ...state,
        communication_recipients: state.communication_recipients.filter(
          (item) => item.id !== action.payload,
        ),
      };

    case "GET_CONVERSATIONS":
      return {
        ...state,
        conversations: action.payload,
      };

    case "GET_ID_CONVERSATION":
      return {
        ...state,
        conversationDetail: action.payload,
      };

    case "POST_CONVERSATION":
      return {
        ...state,
        conversations: [...state.conversations, action.payload], // Agregar al array
      };

    case "UPDATE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.map((item) => {
          return item.id === action.payload.id ? action.payload : item;
        }),
      };

    case "DELETE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.filter(
          (item) => item.id !== action.payload,
        ),
      };

    case "GET_CHAT_MESSAGES":
      return {
        ...state,
        chat_messages: action.payload,
      };

    case "GET_ID_CHAT_MESSAGE":
      return {
        ...state,
        chat_messageDetail: action.payload,
      };

    case "POST_CHAT_MESSAGE":
      return {
        ...state,
      };

    case "UPDATE_CHAT_MESSAGE":
      return {
        ...state,
        chat_messages: state.chat_messages.map((item) => {
          return item.id === action.payload.id ? action.payload : item;
        }),
      };

    case "DELETE_CHAT_MESSAGE":
      return {
        ...state,
        chat_messages: state.chat_messages.filter(
          (item) => item.id !== action.payload,
        ),
      };

    case "GET_CHARGES":
      return {
        ...state,
        charges: action.payload,
      };

    case "GET_ID_CHARGE":
      return {
        ...state,
        charge_detail: action.payload,
      };

    case "POST_CHARGE":
      return {
        ...state,
      };

    case "UPDATE_CHARGE":
      return {
        ...state,
        charges: state.charges.map((item) => {
          return item.id === action.payload.id ? action.payload : item;
        }),
      };

    case "DELETE_CHARGE":
      return {
        ...state,
        charges: state.charges.filter((item) => item.id !== action.payload),
      };

    case "GET_EXPENSE_CATEGORIES":
      return {
        ...state,
        expenseCategories: action.payload,
      };

    case "GET_ID_EXPENSE_CATEGORY":
      return {
        ...state,
        expenseCategoryDetail: action.payload,
      };

    case "POST_EXPENSE_CATEGORY":
      return {
        ...state,
      };

    case "UPDATE_EXPENSE_CATEGORY":
      return {
        ...state,
        expenseCategories: state.expenseCategories.map((item) => {
          return item.id === action.payload.id ? action.payload : item;
        }),
      };

    case "DELETE_EXPENSE_CATEGORY":
      return {
        ...state,
        expenseCategories: state.expenseCategories.filter(
          (item) => item.id !== action.payload,
        ),
      };

    case "GET_SUPPLIERS":
      return {
        ...state,
        suppliers: action.payload,
      };

    case "GET_ID_SUPPLIER":
      return {
        ...state,
        supplierDetail: action.payload,
      };

    case "POST_SUPPLIER":
      return {
        ...state,
      };

    case "UPDATE_SUPPLIER":
      return {
        ...state,
        suppliers: state.suppliers.map((item) => {
          return item.id === action.payload.id ? action.payload : item;
        }),
      };

    case "DELETE_SUPPLIER":
      return {
        ...state,
        suppliers: state.suppliers.filter((item) => item.id !== action.payload),
      };

    case "GET_EXPENSES":
      return {
        ...state,
        expenses: action.payload,
      };

    case "GET_ID_EXPENSE":
      return {
        ...state,
        expenseDetail: action.payload,
      };

    case "POST_EXPENSE":
      return {
        ...state,
      };

    case "UPDATE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.map((item) => {
          return item.id === action.payload.id ? action.payload : item;
        }),
      };

    case "DELETE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.filter((item) => item.id !== action.payload),
      };

    case "GET_MEDICAL_DOCUMENTS":
      return {
        ...state,
        medical_documents: action.payload,
      };

    case "GET_ID_MEDICAL_DOCUMENT":
      return {
        ...state,
        medical_documentDetail: action.payload,
      };

    case "POST_MEDICAL_DOCUMENT":
      return {
        ...state,
      };

    case "UPDATE_MEDICAL_DOCUMENT":
      return {
        ...state,
        medical_documents: state.medical_documents.map((item) => {
          return item.id === action.payload.id ? action.payload : item;
        }),
      };

    case "DELETE_MEDICAL_DOCUMENT":
      return {
        ...state,
        medical_documents: state.medical_documents.filter(
          (item) => item.id !== action.payload,
        ),
      };
    case "GET_AUTHORIZED_PERSONS":
      return {
        ...state,
        authorized_persons: action.payload,
      };

    case "GET_ID_AUTHORIZED_PERSON":
      return {
        ...state,
        authorized_personDetail: action.payload,
      };

    case "POST_AUTHORIZED_PERSON":
      return {
        ...state,
      };

    case "UPDATE_AUTHORIZED_PERSON":
      return {
        ...state,
        authorized_persons: state.authorized_persons.map((item) => {
          return item.id === action.payload.id ? action.payload : item;
        }),
      };

    case "DELETE_AUTHORIZED_PERSON":
      return {
        ...state,
        authorized_persons: state.authorized_persons.filter(
          (item) => item.id !== action.payload,
        ),
      };

    case "GET_AUTHORIZED_PERSON_INFANT_LINKS":
      return {
        ...state,
        authorized_person_infant_links: action.payload,
      };

    case "GET_ID_AUTHORIZED_PERSON_INFANT_LINK":
      return {
        ...state,
        authorized_person_infant_linkDetail: action.payload,
      };

    case "POST_AUTHORIZED_PERSON_INFANT_LINK":
      return {
        ...state,
      };

    case "UPDATE_AUTHORIZED_PERSON_INFANT_LINK":
      return {
        ...state,
        authorized_person_infant_links:
          state.authorized_person_infant_links.map((item) => {
            return item.id === action.payload.id ? action.payload : item;
          }),
      };

    case "DELETE_AUTHORIZED_PERSON_INFANT_LINK":
      return {
        ...state,
        authorized_person_infant_links:
          state.authorized_person_infant_links.filter(
            (item) => item.id !== action.payload,
          ),
      };
    default:
      return { ...state };
  }
};

export default rootReducer;
