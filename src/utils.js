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
    "."
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
    1: "Administrador/a",
    2: "Maestras y/o auxiliares",
    3: "Padres y/o tutores",
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

// Función para verificar si puede gestionar usuarios y Otros Modulos (roles 0, 1, 2)
export const canManageSystem = (userRole) => {
  const role = parseInt(userRole);
  return role === 0 || role === 1 || role === 2;
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
