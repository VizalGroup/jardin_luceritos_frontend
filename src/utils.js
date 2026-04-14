export const getPaymentMethod = (method) => {
  if (method === 1) return "Efectivo";
  if (method === 2) return "Transferencia";
  return "Desconocido";
};

// Formatear fechas con el formato dd/mm/aaaa
export const formatDate = (dateString) => {
  if (!dateString || dateString === "0000-00-00") {
    return "No se registra fecha";
  }

  // Dividir la fecha manualmente para evitar problemas con zonas horarias
  const [year, month, day] = dateString.split("-");

  // Verificar que tenemos valores válidos
  if (!year || !month || !day) {
    return "Fecha inválida";
  }

  // Convertir a números y formatear
  const formattedDay = String(parseInt(day, 10)).padStart(2, "0");
  const formattedMonth = String(parseInt(month, 10)).padStart(2, "0");

  return `${formattedDay}/${formattedMonth}/${year}`;
};

// Formatea un número decimal como dinero.
export function formatCurrency(amount) {
  if (typeof amount === "string") {
    amount = parseFloat(amount);
  }

  if (isNaN(amount)) {
    return "";
  }

  // Convierte el número a una cadena con dos decimales.
  const formattedAmount = amount.toFixed(2);

  // Separa la parte entera y la parte decimal.
  const [integerPart, decimalPart] = formattedAmount.split(".");

  // Agrega puntos como separadores de miles.
  const integerWithThousandSeparator = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ".",
  );

  // Devuelve el formato final con coma para los decimales.
  return `$${integerWithThousandSeparator},${decimalPart}`;
}

//obtener datetime actual

export function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Funcion para calcular la edad en años y meses, el parametro que recibe es forma "yyyy-mm-dd"
export const calculateAge = (birthdate) => {
  const today = new Date();
  const birthDate = new Date(birthdate);

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (today.getDate() < birthDate.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months = 11;
    }
  }

  return `${years} años, ${months} meses`;
};

// Funcion que obtiene el nombre del dia

export const getDayName = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-ES", { weekday: "long" }).format(date);
};

export const capitalizeName = (name) => {
  if (!name) return ""; // Maneja valores nulos o vacíos
  return name
    .trim() // Elimina espacios extra al inicio y al final
    .split(/\s+/) // Divide en palabras (maneja múltiples espacios)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitaliza cada palabra
    .join(" "); // Une las palabras nuevamente
};

// Función para obtener el nombre del rol según el número
export const getUserRoleName = (userRole) => {
  const roles = {
    0: "Programador",
    1: "Administrador",
    2: "Maestras y/o auxiliares",
    3: "Padres y/o tutores",
    4: "Dirección",
  };

  return roles[userRole] || "Rol desconocido";
};

// Función para normalizar texto (sin acentos, minúsculas, sin espacios extras)
export const normalizeText = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

// Función para formatear timestamp Unix a fecha legible
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "No disponible";

  const date = new Date(timestamp * 1000); // Convertir a milisegundos
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Función para formatear datetime de MySQL (YYYY-MM-DD HH:MM:SS) a formato legible
export const formatDateTime = (datetimeString) => {
  if (!datetimeString) return "No disponible";

  // Dividir la fecha y hora
  const [datePart, timePart] = datetimeString.split(" ");
  const [year, month, day] = datePart.split("-");
  const [hours, minutes] = timePart ? timePart.split(":") : ["00", "00"];

  // Formatear como dd/mm/yyyy HH:mm
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const sanitizeText = (text) => {
  if (!text) return text;

  // Reemplazar caracteres problemáticos
  return text
    .replace(/'/g, "''") // Escapar comillas simples duplicándolas (estándar SQL)
    .replace(/\\/g, "\\\\") // Escapar backslashes
    .trim();
};

// Función para obtener el nombre del tipo de documento según el número
export const getDocumentTypeName = (documentType) => {
  const types = {
    0: "Sin especificar / No informado",
    1: "DNI (Documento Nacional de Identidad)",
    2: "Pasaporte",
    3: "Cédula de identidad",
  };

  return types[documentType] || "Tipo de documento desconocido";
};

// Función para verificar si puede gestionar usuarios y Otros Modulos (roles 0, 1, 2 y 4)
export const canManageSystem = (userRole) => {
  const role = parseInt(userRole);
  return role === 0 || role === 1 || role === 2 || role === 4;
};

// Función para verificar si puede editar usuarios (solo Programador, Administración y Dirección)
export const canEditUsers = (userRole) => {
  const role = parseInt(userRole);
  return role === 0 || role === 1 || role === 4;
};

// Función para verificar si puede acceder a módulos financieros (Gastos y Proveedores)
// Solo roles 0 (Programador) y 1 (Administración/Dirección)
export const canAccessFinancialModules = (userRole) => {
  const role = parseInt(userRole);
  return role === 0 || role === 1;
};

// Función para verificar si puede acceder al módulo de Administración
// Permitido: roles 0 y 1, y excepcionalmente el usuario con id 5 (rol 4)
export const canAccessAdministration = (userRole, userId) => {
  const role = parseInt(userRole);
  if (role === 0 || role === 1) return true;
  if (role === 4 && parseInt(userId) === 5) return true;
  return false;
};

// Función para calcular el tiempo restante de sesión
export const getSessionTimeRemaining = (expiresAt) => {
  if (!expiresAt) return "No disponible";

  const now = Math.floor(Date.now() / 1000); // Timestamp actual en segundos
  const timeLeft = expiresAt - now;

  if (timeLeft <= 0) {
    return "Sesión expirada";
  }

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

//Formulario Base para usuarios

export const userFormData = {
  first_name: "",
  lastname: "",
  user_role: 3, // Por defecto padre, madre o tutor
  email: "",
  clue: "",
  is_activate: 1, // Por defecto ACTIVO
  phone: "",
  document_type: "", // Por defecto sin especificar
  document_number: "",
  street_address: "",
  created_at: "",
  updated_at: "",
};

// obtener fecha de hoy formato SQL

export function getCurrentSQLDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Funcion que recibe como argumento un numero flotante (horas) y si este es .5 lo convierte a y media ejemplo recibe 4.00 y devuelve 4 horas y media y si recibe 4.00 deveulve 4 horas (se quitan los decimales)

export function formatHours(hours) {
  if (hours === null || hours === undefined) {
    return "No se registra horas";
  }

  const hoursInt = Math.floor(hours);
  const decimalPart = hours - hoursInt;

  if (decimalPart === 0) {
    return `${hoursInt} horas`;
  } else if (decimalPart === 0.5) {
    return `${hoursInt} horas y media`;
  } else {
    return `${hours} horas`;
  }
}

// Función para obtener el nombre del tipo de infante según el valor
export const getInfantTypeName = (infantType) => {
  const types = {
    0: "",
    1: "Bebé/Lactante",
  };

  return types[infantType] !== undefined ? types[infantType] : "";
};

//Formulario base de infantes

export const infantFormData = {
  document_number: "",
  first_name: "",
  lastname: "",
  last_update: getCurrentDateTime(),
  user_id: 0,
  birthdate: "",
  id_tariff: 0,
  current_state: 1,
  room: 0,
  location: 0,
  schedule: {
    Monday: null,
    Tuesday: null,
    Wednesday: null,
    Thursday: null,
    Friday: null,
  },
};

// Función para formatear número de documento

export const formatDNI = (dni) => {
  return dni.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Función para obtener el nombre de la sala según el número
export const getRoomName = (room) => {
  const rooms = {
    0: "Desconocida",
    1: "Semillitas (bebés)",
    2: "Primeros pasos (1 año)",
    3: "Exploradores y Pequeños expertos (2/3 años)",
  };

  return rooms[room] || "Sala no especificada";
};

// Función para obtener el nombre de la sede según el número
export const getLocationName = (location) => {
  const locations = {
    0: "Sede Laplace",
    1: "Sede Docta",
  };

  return locations[location] || "Sede no especificada";
};

// Verificar si un comunicado debe ser visible para un usuario
export const isCommunicationVisibleForUser = (communication, userCreatedAt) => {
  if (!communication || !userCreatedAt) return false;

  // Convertir las fechas a objetos Date
  const userCreatedDate = new Date(userCreatedAt);

  // Determinar la fecha efectiva del comunicado
  // Si tiene scheduled_for, usar esa; si no, usar created_at
  const communicationDate = communication.scheduled_for
    ? new Date(communication.scheduled_for)
    : new Date(communication.created_at);

  // Calcular la diferencia en días
  const diffInMs = userCreatedDate - communicationDate;
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  // El comunicado es visible si su fecha es posterior a 30 días antes de la creación del usuario
  // Es decir, solo se oculta si el comunicado tiene más de 30 días de antigüedad respecto al usuario
  return diffInDays <= 30;
};

// Función para obtener información del tipo de destinatario de comunicaciones
export const getTargetTypeInfo = (targetType) => {
  const types = {
    0: {
      name: "Todos",
      description: "Todos los usuarios del sistema",
      icon: "FaUsers",
    },
    1: {
      name: "Grupo",
      description: "Grupo específico (por sede/sala)",
      icon: "FaUsers",
    },
    2: {
      name: "Personal del jardín",
      description: "Solo personal docente y dirección",
      icon: "FaUserTie",
    },
  };

  return (
    types[targetType] || {
      name: "Tipo desconocido",
      description: "",
      icon: "FaQuestion",
    }
  );
};

// Función para obtener mensajes de una conversación específica
export const getMessagesByConversationId = (allMessages, conversationId) => {
  return allMessages.filter((msg) => msg.conversation_id === conversationId);
};

// Función para buscar conversación existente entre dos usuarios
export const findExistingConversation = (conversations, userId1, userId2) => {
  return conversations.find(
    (conv) =>
      (conv.parent_id === userId1 && conv.staff_id === userId2) ||
      (conv.parent_id === userId2 && conv.staff_id === userId1),
  );
};

// Función para obtener mensajes sin leer de un usuario
export const getUnreadMessagesFromUser = (
  allMessages,
  fromUserId,
  toUserId,
) => {
  return allMessages.filter(
    (msg) => msg.sender_id === fromUserId && !msg.read_at,
  );
};

// Función para obtener conversaciones con mensajes sin leer
export const getConversationsWithUnreadMessages = (
  conversations,
  messages,
  currentUserId,
) => {
  const conversationsWithUnread = [];

  conversations.forEach((conv) => {
    if (conv.parent_id !== currentUserId && conv.staff_id !== currentUserId) {
      return;
    }

    const unreadCount = messages.filter(
      (msg) =>
        msg.conversation_id === conv.id &&
        msg.sender_id !== currentUserId &&
        !msg.read_at,
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
};

//carga de imagenes
export const uploadImageToCloudinary = (file, setUploadProgress) => {
  return new Promise((resolve, reject) => {
    const url = import.meta.env.VITE_API_CLOUDINARY_URL;
    const preset = import.meta.env.VITE_API_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", preset);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);

    // Actualiza el progreso de carga
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.secure_url); // Guardamos la URL de la imagen
      } else {
        reject(new Error("Error en la subida de imagen"));
      }
    };

    xhr.onerror = () => reject(new Error("Error en la subida de imagen"));
    xhr.send(formData);
  });
};

export function SaveFileToDrive(e) {
  return new Promise((resolve, reject) => {
    var file = e.target.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      var rawLog = reader.result.split(",")[1];
      var dataSend = {
        dataReq: { data: rawLog, name: file.name, type: file.type },
        fname: "uploadFilesToGoogleDrive",
      };
      fetch(
        "https://script.google.com/macros/s/AKfycbypMaiz-YpxDC7LvtmhFbf9-dYHMPBJVS0Vk6sdHtW9Y78xYniYJDi9jK3ta4q4Tx3L/exec",
        { method: "POST", body: JSON.stringify(dataSend) },
      )
        .then((res) => res.json())
        .then((response) => {
          if (response.url) {
            resolve(response.url);
          } else {
            reject(new Error("Failed to upload file"));
          }
        })
        .catch((e) => reject(e));
    };
  });
}

// Función para validar si una fecha está dentro de un rango
export const isDateInRange = (dateString, fromDate, toDate) => {
  if (!dateString || dateString === "0000-00-00") return false;
  if (!fromDate && !toDate) return true;

  const date = new Date(dateString);
  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;

  if (from && to) {
    return date >= from && date <= to;
  } else if (from) {
    return date >= from;
  } else if (to) {
    return date <= to;
  }

  return true;
};

export const isOverdue = (dueDate, currentState) => {
  // Solo los cargos pendientes (current_state === 0) pueden estar vencidos
  if (currentState !== 0) return false;

  if (!dueDate || dueDate === "0000-00-00") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizar a medianoche

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0); // Normalizar a medianoche

  return due < today;
};

// Función para generar slots de tiempo dinámicos basados en los horarios de los niños
export const generateDynamicTimeSlots = (children, currentDay) => {
  const times = new Set();

  children.forEach((child) => {
    if (!child.schedule || !child.schedule[currentDay]) return;

    const entryTime = child.schedule[currentDay].entry;
    const exitTime = child.schedule[currentDay].exit;

    if (entryTime) times.add(entryTime);
    if (exitTime) times.add(exitTime);
  });

  // Convertir a array y ordenar
  const sortedTimes = Array.from(times).sort((a, b) => {
    const [hoursA, minutesA] = a.split(":").map(Number);
    const [hoursB, minutesB] = b.split(":").map(Number);

    const totalMinutesA = hoursA * 60 + minutesA;
    const totalMinutesB = hoursB * 60 + minutesB;

    return totalMinutesA - totalMinutesB;
  });

  return sortedTimes;
};

//Formulario base de proveedores

export const supplierFormData = {
  supplier_name: "",
  supplier_address: "",
  phone: "",
  notes: "",
  iva_condition: "",
};

// Obtener condición de IVA

export const getIvaCondition = (ivaCondition) => {
  switch (ivaCondition) {
    case 0:
      return "Desconocida";
    case 1:
      return "Responsable Inscripto";
    case 2:
      return "Monotributista";
    case 3:
      return "Otro";
    default:
      return "Desconocida";
  }
};

// Obtener método de pago para gastos
export const getExpensePaymentMethod = (paymentMethod) => {
  switch (paymentMethod) {
    case 0:
      return "Efectivo";
    case 1:
      return "Transferencia";
    case 2:
      return "Otro";
    default:
      return "Desconocido";
  }
};

// Obtener estado actual del gasto
export const getExpenseCurrentState = (currentState) => {
  switch (currentState) {
    case 0:
      return "Pendiente de pago";
    case 1:
      return "Parcialmente pagado";
    case 2:
      return "Pagado";
    default:
      return "Desconocido";
  }
};

// Obtener tipo de documento médico
export const getMedicalDocumentType = (type) => {
  switch (parseInt(type)) {
    case 0:
      return "Ficha médica";
    case 1:
      return "Carnet de vacunas";
    case 2:
      return "Credencial de obra social/prepaga";
    case 3:
      return "Otros";
    default:
      return "Desconocido";
  }
};

//Formulario de autorizacion

export const authorizationFormData = {
  first_name: "",
  lastname: "",
  dni: "",
  url_img: "",
  id_infant: "",
  phone: "",
}

// Formatear hora con minutos

export function formatTime(timeString) {
  const [hours, minutes] = timeString.split(":");
  return `${hours}:${minutes}`;
}
