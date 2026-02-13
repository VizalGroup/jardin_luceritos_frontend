import axios from "axios";

export const GET_USERS = "GET_USERS";
export const GET_ID_USER = "GET_ID_USER";
export const POST_USER = "POST_USER";
export const UPDATE_USER = "UPDATE_USER";
export const DELETE_USER = "DELETE_USER";
export const AUTHENTICATE_USER = "AUTHENTICATE_USER";
export const SET_AUTHENTICATED_USER = "SET_AUTHENTICATED_USER";
export const LOGOUT_USER = "LOGOUT_USER";

export const REQUEST_PASSWORD_RESET = "REQUEST_PASSWORD_RESET";
export const VERIFY_RESET_TOKEN = "VERIFY_RESET_TOKEN";
export const GET_PASSWORD_RESET_TOKENS = "GET_PASSWORD_RESET_TOKENS";

export const GET_TARIFFS = "GET_TARIFFS";
export const GET_ID_TARIFF = "GET_ID_TARIFF";
export const POST_TARIFF = "POST_TARIFF";
export const UPDATE_TARIFF = "UPDATE_TARIFF";
export const DELETE_TARIFF = "DELETE_TARIFF";

export const GET_INFANTS = "GET_INFANTS";
export const GET_ID_INFANT = "GET_ID_INFANT";
export const POST_INFANT = "POST_INFANT";
export const UPDATE_INFANT = "UPDATE_INFANT";
export const DELETE_INFANT = "DELETE_INFANT";

export const GET_FAMILY_RELATIONSHIPS = "GET_FAMILY_RELATIONSHIPS";
export const GET_ID_FAMILY_RELATIONSHIP = "GET_ID_FAMILY_RELATIONSHIP";
export const POST_FAMILY_RELATIONSHIP = "POST_FAMILY_RELATIONSHIP";
export const UPDATE_FAMILY_RELATIONSHIP = "UPDATE_FAMILY_RELATIONSHIP";
export const DELETE_FAMILY_RELATIONSHIP = "DELETE_FAMILY_RELATIONSHIP";

export const GET_COMMUNICATIONS = "GET_COMMUNICATIONS";
export const GET_ID_COMMUNICATION = "GET_ID_COMMUNICATION";
export const POST_COMMUNICATION = "POST_COMMUNICATION";
export const UPDATE_COMMUNICATION = "UPDATE_COMMUNICATION";
export const DELETE_COMMUNICATION = "DELETE_COMMUNICATION";

export const GET_COMMUNICATION_RECIPIENTS = "GET_COMMUNICATION_RECIPIENTS";
export const GET_ID_COMMUNICATION_RECIPIENT = "GET_ID_COMMUNICATION_RECIPIENT";
export const POST_COMMUNICATION_RECIPIENT = "POST_COMMUNICATION_RECIPIENT";
export const UPDATE_COMMUNICATION_RECIPIENT = "UPDATE_COMMUNICATION_RECIPIENT";
export const DELETE_COMMUNICATION_RECIPIENT = "DELETE_COMMUNICATION_RECIPIENT";

export const GET_CONVERSATIONS = "GET_CONVERSATIONS";
export const GET_ID_CONVERSATION = "GET_ID_CONVERSATION";
export const POST_CONVERSATION = "POST_CONVERSATION";
export const UPDATE_CONVERSATION = "UPDATE_CONVERSATION";
export const DELETE_CONVERSATION = "DELETE_CONVERSATION";

export const GET_CHAT_MESSAGES = "GET_CHAT_MESSAGES";
export const GET_ID_CHAT_MESSAGE = "GET_ID_CHAT_MESSAGE";
export const POST_CHAT_MESSAGE = "POST_CHAT_MESSAGE";
export const UPDATE_CHAT_MESSAGE = "UPDATE_CHAT_MESSAGE";
export const DELETE_CHAT_MESSAGE = "DELETE_CHAT_MESSAGE";

// url base de la API
const usersURL = import.meta.env.VITE_API_USERS_URL;
const authUserURL = import.meta.env.VITE_API_AUTH_USERS_URL;
const passwordResetURL = import.meta.env.VITE_API_PASSWPORD_RESET_TOKENS_URL;
const tariffsURL = import.meta.env.VITE_API_TARIFFS_URL;
const infantsURL = import.meta.env.VITE_API_INFANTS_URL;
const familyRelationshipsURL = import.meta.env
  .VITE_API_FAMILY_RELATIONSHIPS_URL;
const communicationsURL = import.meta.env.VITE_API_COMMUNICATIONS_URL;
const communicationRecipientsURL = import.meta.env
  .VITE_API_COMMUNICATION_RECIPIENTS_URL;
const conversationsURL = import.meta.env.VITE_API_CONVERSATIONS_URL;
const chatMessagesURL = import.meta.env.VITE_API_CHAT_MESSAGES_URL;

// actions de usuarios

export const GetUsers = () => {
  return async function (dispatch) {
    try {
      var response = await axios.get(usersURL);
      if (response.data !== null) {
        return dispatch({
          type: GET_USERS,
          payload: response.data,
        });
      } else {
        return dispatch({
          type: GET_USERS,
          payload: [],
        });
      }
    } catch (err) {
      alert("Ha ocurrido un error: ", err);
      throw err;
    }
  };
};

export const GetUserDetail = (id) => {
  return async function (dispatch) {
    try {
      const response = await axios.get(`${usersURL}?id=${id}`);
      if (response.data) {
        return dispatch({
          type: GET_ID_USER,
          payload: response.data,
        });
      } else {
        return dispatch({
          type: GET_ID_USER,
          payload: {},
        });
      }
    } catch (err) {
      console.error("Error al obtener detalles del usuario: ", err);
      throw err;
    }
  };
};

export const PostUser = (atributos) => {
  console.log(atributos);
  return async function (dispatch) {
    try {
      var form = new FormData();
      form.append("METHOD", "POST");
      form.append("first_name", atributos.first_name);
      form.append("lastname", atributos.lastname);
      form.append("user_role", atributos.user_role);
      form.append("email", atributos.email);
      form.append("clue", atributos.clue);
      form.append("phone", atributos.phone);
      form.append("is_activate", atributos.is_activate);
      form.append("document_type", atributos.document_type);
      form.append("document_number", atributos.document_number);
      form.append("street_address", atributos.street_address);
      form.append("created_at", atributos.created_at);
      form.append("updated_at", atributos.updated_at);

      var response = await axios.post(usersURL, form);
      console.log("Usuario creado, respuesta:", response.data);
      return dispatch({
        type: POST_USER,
        payload: response.data,
      });
    } catch (err) {
      console.error("Error completo:", err);

      // Verificar si es un error de respuesta del servidor
      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;

        // Error 409 - Email duplicado
        if (status === 409) {
          throw new Error(errorData.message || "Este email ya está registrado");
        }

        // Error 400 - Datos inválidos
        if (status === 400) {
          throw new Error(
            errorData.message || "Los datos proporcionados no son válidos",
          );
        }

        // Error 500 - Error del servidor
        if (status === 500) {
          throw new Error(
            "Error en el servidor. Intente nuevamente más tarde.",
          );
        }

        // Otros errores con mensaje del servidor
        throw new Error(
          errorData.message || "Ha ocurrido un error al registrar el usuario",
        );
      } else if (err.request) {
        // La petición se hizo pero no se recibió respuesta
        throw new Error(
          "No se pudo conectar con el servidor. Verifique su conexión a internet.",
        );
      } else {
        // Error al configurar la petición
        throw new Error(err.message || "Ha ocurrido un error inesperado");
      }
    }
  };
};

export const updateUser = (id, atributos) => {
  return async function (dispatch) {
    try {
      var form = new FormData();
      form.append("METHOD", "PUT");
      form.append("first_name", atributos.first_name);
      form.append("lastname", atributos.lastname);
      form.append("user_role", atributos.user_role);
      form.append("email", atributos.email);
      form.append("clue", atributos.clue);
      form.append("phone", atributos.phone);
      form.append("is_activate", atributos.is_activate);
      form.append("document_type", atributos.document_type);
      form.append("document_number", atributos.document_number);
      form.append("street_address", atributos.street_address);
      form.append("created_at", atributos.created_at);
      form.append("updated_at", atributos.updated_at);

      var response = await axios.post(usersURL, form, { params: { id } });
      console.log("Usuario actualizado, respuesta:", response.data);
      return dispatch({
        type: UPDATE_USER,
        payload: response.data,
      });
    } catch (err) {
      alert("Ha ocurrido un error: ", err);
      throw err;
    }
  };
};

export const DeleteUser = (id) => {
  return async function (dispatch) {
    try {
      var form = new FormData();
      form.append("METHOD", "DELETE");
      var response = await axios.post(usersURL, form, { params: { id } });
      return dispatch({
        type: DELETE_USER,
        payload: response.data,
      });
    } catch (err) {
      alert("Ha ocurrido un error: ", err);
      throw err;
    }
  };
};

// Función para verificar si la sesión ha expirado
export const CheckSessionExpiration = () => {
  return function (dispatch) {
    try {
      const authenticatedUser = localStorage.getItem("authenticatedUser");
      if (authenticatedUser) {
        const user = JSON.parse(authenticatedUser);
        const currentTime = Math.floor(Date.now() / 1000);

        if (user.expires_at && currentTime > user.expires_at) {
          console.log("Sesión expirada - cerrando sesión automáticamente.");
          dispatch(LogoutClient());
          return false;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al verificar la expiración de la sesión:", error);
      return false;
    }
  };
};

export const authenticateUser = (email, clue) => {
  return async function (dispatch) {
    try {
      var form = new FormData();
      form.append("METHOD", "LOGIN_USER");
      form.append("email", email);
      form.append("clue", clue);

      const response = await axios.post(authUserURL, form);

      if (response.data && !response.data.error) {
        console.log(
          "✅ Usuario logueado:",
          `${response.data.first_name} ${response.data.lastname}`,
        );

        localStorage.setItem("authenticatedUserId", response.data.id);
        localStorage.setItem(
          "authenticatedUser",
          JSON.stringify(response.data),
        );
        return dispatch({
          type: AUTHENTICATE_USER,
          payload: response.data,
        });
      } else {
        throw new Error(response.data.error || "Credenciales incorrectas");
      }
    } catch (err) {
      console.error("Error completo:", err);

      if (err.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        const status = err.response.status;
        const errorData = err.response.data;

        if (status === 401) {
          throw new Error(errorData.error || "Email o contraseña incorrectos");
        } else if (status === 403) {
          throw new Error(
            errorData.error ||
              "Esta cuenta ha sido desactivada. Contacte al administrador.",
          );
        } else if (status === 500) {
          throw new Error(
            "Error en el servidor. Intente nuevamente más tarde.",
          );
        } else {
          throw new Error(errorData.error || "Error al iniciar sesión");
        }
      } else if (err.request) {
        // La petición se hizo pero no se recibió respuesta
        throw new Error(
          "No se pudo conectar con el servidor. Verifique su conexión a internet.",
        );
      } else {
        // Algo sucedió al configurar la petición
        throw new Error(err.message || "Error inesperado al iniciar sesión");
      }
    }
  };
};

export const SetAuthenticatedUser = (user) => {
  return function (dispatch) {
    try {
      localStorage.setItem("authenticatedUserId", user.id);
      localStorage.setItem("authenticatedUser", JSON.stringify(user));
      return dispatch({
        type: SET_AUTHENTICATED_USER,
        payload: user,
      });
    } catch (error) {
      console.log(error);
    }
  };
};

export const LogoutUser = () => {
  return function (dispatch) {
    try {
      console.log("🚪 Cerrando sesión");
      localStorage.removeItem("authenticatedUserId");
      localStorage.removeItem("authenticatedUser");
      return dispatch({
        type: LOGOUT_USER,
        payload: null,
      });
    } catch (error) {
      console.log(error);
    }
  };
};

// Actions para recuperación de contraseña

export const RequestPasswordReset = (user_id) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "POST");
      f.append("user_id", user_id);

      var response = await axios.post(passwordResetURL, f);
      console.log("Token de reseteo creado:", response.data);

      return dispatch({
        type: REQUEST_PASSWORD_RESET,
        payload: response.data,
      });
    } catch (err) {
      console.error("Error al solicitar reseteo:", err);

      if (err.response && err.response.data) {
        throw new Error(
          err.response.data.message ||
            "Error al enviar el email de recuperación",
        );
      }

      throw new Error("Error al solicitar recuperación de contraseña");
    }
  };
};

export const VerifyPasswordResetToken = (token) => {
  return async function (dispatch) {
    try {
      const response = await axios.get(
        `${passwordResetURL}?verify_token=${token}`,
      );

      return dispatch({
        type: VERIFY_RESET_TOKEN,
        payload: response.data,
      });
    } catch (err) {
      console.error("Error al verificar token:", err);

      return dispatch({
        type: VERIFY_RESET_TOKEN,
        payload: { valid: false, message: "Token inválido o expirado" },
      });
    }
  };
};

export const GetPasswordResetTokens = () => {
  return async function (dispatch) {
    try {
      var response = await axios.get(passwordResetURL);
      if (response.data !== null) {
        return dispatch({
          type: GET_PASSWORD_RESET_TOKENS,
          payload: response.data,
        });
      } else {
        return dispatch({
          type: GET_PASSWORD_RESET_TOKENS,
          payload: [],
        });
      }
    } catch (err) {
      console.error("Error al obtener tokens:", err);
      throw err;
    }
  };
};

// Actions para tarifas

export const GetTariffs = () => {
  return async function (dispatch) {
    try {
      var response = await axios.get(tariffsURL);
      if (response.data !== null) {
        return dispatch({
          type: GET_TARIFFS,
          payload: response.data,
        });
      } else {
        return dispatch({
          type: GET_TARIFFS,
          payload: [],
        });
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
};

export const GetTariffDetail = (id) => {
  return async function (dispatch) {
    try {
      const response = await axios.get(`${tariffsURL}?id=${id}`);
      if (response.data) {
        return dispatch({
          type: GET_ID_TARIFF,
          payload: response.data,
        });
      } else {
        return dispatch({
          type: GET_ID_TARIFF,
          payload: [],
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
};

export const PostTariff = (atributos) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "POST");
      f.append("number_of_hours", atributos.number_of_hours);
      f.append("price", atributos.price);
      f.append("last_update", atributos.last_update);
      f.append("infant_type", atributos.infant_type);
      var response = await axios.post(tariffsURL, f);
      return dispatch({
        type: POST_TARIFF,
        payload: response.data,
      });
    } catch (err) {
      alert(err);
      throw err;
    }
  };
};

export const UpdateTariff = (id, atributos) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "PUT");
      f.append("number_of_hours", atributos.number_of_hours);
      f.append("price", atributos.price);
      f.append("last_update", atributos.last_update);
      f.append("infant_type", atributos.infant_type);
      var response = await axios.post(tariffsURL, f, { params: { id: id } });
      return dispatch({
        type: UPDATE_TARIFF,
        payload: response.data,
      });
    } catch (err) {
      alert(err);
      throw err;
    }
  };
};

export const DeleteTariff = (id) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "DELETE");
      var response = await axios.post(tariffsURL, f, { params: { id: id } });
      return dispatch({
        type: DELETE_TARIFF,
        payload: response.id,
      });
    } catch (err) {
      alert("Error al eliminar tarifa: ", err);
    }
  };
};

// Actions para niños

export const GetInfants = () => {
  return async function (dispatch) {
    try {
      var response = await axios.get(infantsURL);
      if (response.data !== null) {
        return dispatch({
          type: GET_INFANTS,
          payload: response.data,
        });
      } else {
        return dispatch({
          type: GET_INFANTS,
          payload: [],
        });
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
};

export const GetInfantDetail = (id) => {
  return async function (dispatch) {
    try {
      const response = await axios.get(`${infantsURL}?id=${id}`);
      if (response.data) {
        return dispatch({
          type: GET_ID_INFANT,
          payload: response.data,
        });
      } else {
        return dispatch({
          type: GET_ID_INFANT,
          payload: [],
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
};

export const PostInfant = (atributos) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "POST");
      f.append("document_number", atributos.document_number);
      f.append("first_name", atributos.first_name);
      f.append("lastname", atributos.lastname);
      f.append("birthdate", atributos.birthdate);
      f.append("current_state", atributos.current_state);
      f.append("schedule", JSON.stringify(atributos.schedule));
      f.append("user_id", atributos.user_id);
      f.append("last_update", atributos.last_update);
      f.append("id_tariff", atributos.id_tariff);
      f.append("room", atributos.room);
      f.append("location", atributos.location);
      var response = await axios.post(infantsURL, f);
      console.log("Niño creado en la ACTION: ", response.data);

      return dispatch({
        type: POST_INFANT,
        payload: response.data,
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
};

export const UpdateInfant = (id, atributos) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "PUT");
      f.append("document_number", atributos.document_number);
      f.append("first_name", atributos.first_name);
      f.append("lastname", atributos.lastname);
      f.append("birthdate", atributos.birthdate);
      f.append("current_state", atributos.current_state);
      f.append("schedule", JSON.stringify(atributos.schedule));
      f.append("user_id", atributos.user_id);
      f.append("last_update", atributos.last_update);
      f.append("id_tariff", atributos.id_tariff);
      f.append("room", atributos.room);
      f.append("location", atributos.location);
      var response = await axios.post(infantsURL, f, { params: { id: id } });
      console.log(response.data);

      return dispatch({
        type: UPDATE_INFANT,
        payload: response.data,
      });
    } catch (err) {
      alert(err);
      throw err;
    }
  };
};

export const DeleteInfant = (id) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "DELETE");
      var response = await axios.post(infantsURL, f, { params: { id: id } });
      return dispatch({
        type: DELETE_INFANT,
        payload: response.id,
      });
    } catch (err) {
      alert("Error al eliminar niño: ", err);
    }
  };
};

// actions para relaciones familiares
export const GetFamilyRelationships = () => {
  return async function (dispatch) {
    try {
      var response = await axios.get(familyRelationshipsURL);
      if (response.data !== null) {
        return dispatch({
          type: GET_FAMILY_RELATIONSHIPS,
          payload: response.data,
        });
      } else {
        return dispatch({
          type: GET_FAMILY_RELATIONSHIPS,
          payload: [],
        });
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
};

export const GetFamilyRelationshipDetail = (id) => {
  return async function (dispatch) {
    try {
      const response = await axios.get(`${familyRelationshipsURL}?id=${id}`);
      if (response.data) {
        return dispatch({
          type: GET_ID_FAMILY_RELATIONSHIP,
          payload: response.data,
        });
      } else {
        return dispatch({
          type: GET_ID_FAMILY_RELATIONSHIP,
          payload: [],
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
};

export const PostFamilyRelationship = (atributos) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "POST");
      f.append("infant_id", atributos.infant_id);
      f.append("user_id", atributos.user_id);
      var response = await axios.post(familyRelationshipsURL, f);
      console.log(response);

      return dispatch({
        type: POST_FAMILY_RELATIONSHIP,
        payload: response.data,
      });
    } catch (err) {
      alert(err);
      throw err;
    }
  };
};

export const UpdateFamilyRelationship = (id, atributos) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "PUT");
      f.append("infant_id", atributos.infant_id);
      f.append("user_id", atributos.user_id);
      var response = await axios.post(familyRelationshipsURL, f, {
        params: { id: id },
      });
      return dispatch({
        type: UPDATE_FAMILY_RELATIONSHIP,
        payload: response.data,
      });
    } catch (err) {
      alert(err);
      throw err;
    }
  };
};

export const DeleteFamilyRelationship = (id) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "DELETE");
      var response = await axios.post(familyRelationshipsURL, f, {
        params: { id: id },
      });
      return dispatch({
        type: DELETE_FAMILY_RELATIONSHIP,
        payload: response.id,
      });
    } catch (err) {
      alert("Error al eliminar relación familiar: ", err);
    }
  };
};

// Actions para comunicaciones
export const GetCommunications = () => {
  return async function (dispatch) {
    try {
      var response = await axios.get(communicationsURL);
      if (response.data !== null) {
        return dispatch({
          type: GET_COMMUNICATIONS,
          payload: response.data,
        });
      } else {
        return dispatch({
          type: GET_COMMUNICATIONS,
          payload: [],
        });
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
};

export const GetCommunicationDetail = (id) => {
  return async function (dispatch) {
    try {
      const response = await axios.get(`${communicationsURL}?id=${id}`);
      if (response.data) {
        return dispatch({
          type: GET_ID_COMMUNICATION,
          payload: response.data,
        });
      } else {
        return dispatch({
          type: GET_ID_COMMUNICATION,
          payload: [],
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
};

export const PostCommunication = (atributos) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "POST");
      f.append("message_title", atributos.message_title);
      f.append("message_content", atributos.message_content);
      f.append("sender_id", atributos.sender_id);
      f.append("target_type", atributos.target_type);
      f.append("target_location", atributos.target_location || "");
      f.append("target_room", atributos.target_room || "");
      f.append("created_at", atributos.created_at);
      f.append("updated_at", atributos.updated_at);
      f.append("scheduled_for", atributos.scheduled_for || "");
      f.append("url_img", atributos.url_img || "");
      
      console.log("📤 Enviando comunicación con:");
      console.log("   Target Type:", atributos.target_type);
      console.log("   Target Location:", atributos.target_location || "vacío");
      console.log("   Target Room:", atributos.target_room || "vacío");
      
      var response = await axios.post(communicationsURL, f);
      console.log("✅ Respuesta del servidor:", response.data);
      
      if (response.data.email_stats) {
        console.log("📧 Estadísticas de emails:");
        console.log("   Enviados:", response.data.email_stats.emails_sent);
        console.log("   Fallidos:", response.data.email_stats.emails_failed);
        console.log("   Total destinatarios:", response.data.email_stats.total_recipients);
      }
      
      return dispatch({
        type: POST_COMMUNICATION,
        payload: response.data.communication || response.data,
      });
    } catch (err) {
      console.error("❌ Error al crear comunicación:", err);
      throw err;
    }
  };
};

export const UpdateCommunication = (id, atributos) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "PUT");
      f.append("message_title", atributos.message_title);
      f.append("message_content", atributos.message_content);
      f.append("sender_id", atributos.sender_id);
      f.append("target_type", atributos.target_type);
      f.append("target_location", atributos.target_location || "");
      f.append("target_room", atributos.target_room || "");
      f.append("created_at", atributos.created_at);
      f.append("updated_at", atributos.updated_at);
      f.append("scheduled_for", atributos.scheduled_for || "");
      f.append("url_img", atributos.url_img || "");
      var response = await axios.post(communicationsURL, f, {
        params: { id: id },
      });
      console.log(response.data);
      return dispatch({
        type: UPDATE_COMMUNICATION,
        payload: response.data,
      });
    } catch (err) {
      alert(err);
      throw err;
    }
  };
};

export const DeleteCommunication = (id) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "DELETE");
      var response = await axios.post(communicationsURL, f, {
        params: { id: id },
      });
      return dispatch({
        type: DELETE_COMMUNICATION,
        payload: response.id,
      });
    } catch (err) {
      alert("Error al eliminar comunicación: ", err);
    }
  };
};

// Actions para destinatarios de comunicaciones

export const GetCommunicationRecipients = () => {
  return async function (dispatch) {
    try {
      var response = await axios.get(communicationRecipientsURL);
      if (response.data !== null) {
        return dispatch({
          type: GET_COMMUNICATION_RECIPIENTS,
          payload: response.data,
        });
      } else {
        return dispatch({
          type: GET_COMMUNICATION_RECIPIENTS,
          payload: [],
        });
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
};

export const GetCommunicationRecipientDetail = (id) => {
  return async function (dispatch) {
    try {
      const response = await axios.get(
        `${communicationRecipientsURL}?id=${id}`,
      );
      if (response.data) {
        return dispatch({
          type: GET_ID_COMMUNICATION_RECIPIENT,
          payload: response.data,
        });
      } else {
        return dispatch({
          type: GET_ID_COMMUNICATION_RECIPIENT,
          payload: [],
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
};

export const PostCommunicationRecipient = (atributos) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "POST");
      f.append("communication_id", atributos.communication_id);
      f.append("recipient_id", atributos.recipient_id);
      f.append("is_read", atributos.is_read);
      f.append("read_at", atributos.read_at || "");
      var response = await axios.post(communicationRecipientsURL, f);
      console.log(response);
      return dispatch({
        type: POST_COMMUNICATION_RECIPIENT,
        payload: response.data,
      });
    } catch (err) {
      alert(err);
      throw err;
    }
  };
};

export const UpdateCommunicationRecipient = (id, atributos) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "PUT");
      f.append("communication_id", atributos.communication_id);
      f.append("recipient_id", atributos.recipient_id);
      f.append("is_read", atributos.is_read);
      f.append("read_at", atributos.read_at || "");
      var response = await axios.post(communicationRecipientsURL, f, {
        params: { id: id },
      });
      return dispatch({
        type: UPDATE_COMMUNICATION_RECIPIENT,
        payload: response.data,
      });
    } catch (err) {
      alert(err);
      throw err;
    }
  };
};

export const DeleteCommunicationRecipient = (id) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "DELETE");
      var response = await axios.post(communicationRecipientsURL, f, {
        params: { id: id },
      });
      return dispatch({
        type: DELETE_COMMUNICATION_RECIPIENT,
        payload: response.id,
      });
    } catch (err) {
      alert("Error al eliminar destinatario de comunicación: ", err);
    }
  };
};

// Actions para conversaciones
export const GetConversations = () => {
  return async function (dispatch) {
    try {
      var response = await axios.get(conversationsURL);
      if (response.data !== null) {
        return dispatch({
          type: GET_CONVERSATIONS,
          payload: response.data,
        });
      } else {
        return dispatch({
          type: GET_CONVERSATIONS,
          payload: [],
        });
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
};

export const GetConversationDetail = (id) => {
  return async function (dispatch) {
    try {
      const response = await axios.get(`${conversationsURL}?id=${id}`);
      if (response.data) {
        return dispatch({
          type: GET_ID_CONVERSATION,
          payload: response.data,
        });
      } else {
        return dispatch({
          type: GET_ID_CONVERSATION,
          payload: [],
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
};

export const PostConversation = (atributos) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "POST");
      f.append("parent_id", atributos.parent_id);
      f.append("staff_id", atributos.staff_id);
      f.append("created_at", atributos.created_at);
      f.append("updated_at", atributos.updated_at);
      
      var response = await axios.post(conversationsURL, f);
      console.log("Conversación creada en la ACTION:", response.data);
      
      // Verificar que la respuesta tiene los datos correctos
      // El backend puede devolver 'id' o 'conversation_id'
      const conversationId = response.data?.id || response.data?.conversation_id;
      
      if (!conversationId) {
        throw new Error("La respuesta del servidor no contiene un ID válido");
      }
      
      // Normalizar la respuesta para que siempre tenga 'id'
      const normalizedData = {
        ...response.data,
        id: conversationId,
      };
      
      return dispatch({
        type: POST_CONVERSATION,
        payload: normalizedData,
      });
    } catch (err) {
      console.error("Error al crear conversación:", err);
      throw err;
    }
  };
};

export const UpdateConversation = (id, atributos) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "PUT");
      f.append("parent_id", atributos.parent_id);
      f.append("staff_id", atributos.staff_id);
      f.append("created_at", atributos.created_at);
      f.append("updated_at", atributos.updated_at);
      var response = await axios.post(conversationsURL, f, {
        params: { id: id },
      });
      console.log(response.data);
      return dispatch({
        type: UPDATE_CONVERSATION,
        payload: response.data,
      });
    } catch (err) {
      alert(err);
      throw err;
    }
  };
};

export const DeleteConversation = (id) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "DELETE");
      var response = await axios.post(conversationsURL, f, {
        params: { id: id },
      });
      return dispatch({
        type: DELETE_CONVERSATION,
        payload: response.id,
      });
    } catch (err) {
      alert("Error al eliminar conversación: ", err);
    }
  };
};

// Actions para mensajes de chat

export const GetChatMessages = () => {
  return async function (dispatch) {
    try {
      var response = await axios.get(chatMessagesURL);
      if (response.data !== null) {
        return dispatch({
          type: GET_CHAT_MESSAGES,
          payload: response.data,
        });
      } else {
        return dispatch({
          type: GET_CHAT_MESSAGES,
          payload: [],
        });
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
};

export const GetChatMessageDetail = (id) => {
  return async function (dispatch) {
    try {
      const response = await axios.get(`${chatMessagesURL}?id=${id}`);
      if (response.data) {
        return dispatch({
          type: GET_ID_CHAT_MESSAGE,
          payload: response.data,
        });
      } else {
        return dispatch({
          type: GET_ID_CHAT_MESSAGE,
          payload: [],
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
};

export const PostChatMessage = (atributos) => {  
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "POST");
      f.append("conversation_id", atributos.conversation_id);
      f.append("sender_id", atributos.sender_id);
      f.append("message_content", atributos.message_content);
      f.append("read_at", atributos.read_at || "");
      f.append("created_at", atributos.created_at);
      f.append("updated_at", atributos.updated_at);
      f.append("attachment_url", atributos.attachment_url || "");
      var response = await axios.post(chatMessagesURL, f);      
      return dispatch({
        type: POST_CHAT_MESSAGE,
        payload: response.data,
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  };
};

export const UpdateChatMessage = (id, atributos) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "PUT");
      f.append("conversation_id", atributos.conversation_id);
      f.append("sender_id", atributos.sender_id);
      f.append("message_content", atributos.message_content);
      f.append("read_at", atributos.read_at || "");
      f.append("created_at", atributos.created_at);
      f.append("updated_at", atributos.updated_at);
      f.append("attachment_url", atributos.attachment_url || "");
      var response = await axios.post(chatMessagesURL, f, {
        params: { id: id },
      });
      return dispatch({
        type: UPDATE_CHAT_MESSAGE,
        payload: response.data,
      });
    } catch (err) {
      alert(err);
      throw err;
    }
  };
};

export const DeleteChatMessage = (id) => {
  return async function (dispatch) {
    try {
      var f = new FormData();
      f.append("METHOD", "DELETE");
      var response = await axios.post(chatMessagesURL, f, {
        params: { id: id },
      });
      return dispatch({
        type: DELETE_CHAT_MESSAGE,
        payload: response.id,
      });
    } catch (err) {
      alert("Error al eliminar mensaje de chat: ", err);
    }
  };
};
