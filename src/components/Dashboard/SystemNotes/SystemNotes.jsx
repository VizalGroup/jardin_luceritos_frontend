import NavBarDB from "../NavBarDB";
import BackButton from "../../BackButton";
import { FaStickyNote } from "react-icons/fa";

export default function SystemNotes() {
  document.title = "Notas del Sistema - Jardín Luceritos";

  return (
    <>
      <NavBarDB />
      <div className="watermark-background" style={{ marginTop: "100px" }}>
        <div className="container system-notes-container">
          <BackButton />

          <div className="text-center mb-4">
            <h1 className="system-notes-main-title">
              <FaStickyNote /> Notas del Sistema{" "}
              {import.meta.env.VITE_APP_VERSION}
            </h1>
            <p className="system-notes-subtitle">
              Historial de actualizaciones y mejoras del sistema de gestión del
              jardín maternal
            </p>
          </div>

          {/* Sección de Actualizaciones */}
          <section className="system-notes-section">
            <h2 className="system-notes-title">Registro de Actualizaciones</h2>
            <ul className="notes-timeline">
              <li className="timeline-item">
                <span className="timeline-date">26 de Enero de 2025</span>
                <ul className="timeline-updates">
                  <li className="update-item">
                    <strong>Sitio Web Institucional:</strong> Landing page
                    inspirada en el sitio original del jardín en Wix, con
                    secciones de inicio, sobre nosotros, galería de fotos y
                    contacto
                  </li>
                  <li className="update-item">
                    <strong>Sistema de Autenticación:</strong> Login con
                    recuperación de contraseña por email mediante tokens seguros
                    con expiración de 1 hora
                  </li>
                  <li className="update-item">
                    <strong>Registro de Usuarios Externo:</strong> Formulario
                    público para que padres, madres y tutores puedan crear su
                    cuenta sin necesidad de contactar a la administración
                  </li>
                  <li className="update-item">
                    <strong>Gestión de Sesiones:</strong> Sistema de sesiones
                    con tiempo de expiración de 48 horas y visualización del
                    tiempo restante en tiempo real
                  </li>
                  <li className="update-item">
                    <strong>Dashboard Principal:</strong> Panel de control
                    diferenciado según el rol del usuario (Programador,
                    Administrador, Maestras, Padres/Tutores)
                  </li>
                  <li className="update-item">
                    <strong>Portal para Padres:</strong> Vista especial para
                    padres, madres y tutores con acceso a la información de sus
                    hijos
                  </li>
                  <li className="update-item">
                    <strong>Módulo de Usuarios:</strong> Sistema completo de
                    gestión de usuarios con roles diferenciados (Programador,
                    Administrador, Maestras y Auxiliares, Padres y Tutores)
                  </li>
                  <li className="update-item">
                    <strong>Actualización de Credenciales:</strong> Los usuarios
                    pueden modificar su contraseña de forma segura desde su
                    perfil
                  </li>
                  <li className="update-item">
                    <strong>Módulo de Tarifas:</strong> Gestión de planes
                    tarifarios con diferentes duraciones y precios, incluyendo
                    opción de becas (0 horas)
                  </li>
                  <li className="update-item">
                    <strong>Módulo de Infantes:</strong> Registro completo de
                    niños con información personal, fecha de nacimiento,
                    documento, tarifa asignada y horarios semanales
                    personalizados
                  </li>
                  <li className="update-item">
                    <strong>Horarios Personalizados:</strong> Sistema de
                    configuración de horarios semanales por día (Lunes a
                    Viernes) con horarios de entrada y salida específicos para
                    cada niño
                  </li>
                  <li className="update-item">
                    <strong>Filtros Avanzados:</strong> Sistema de filtrado de
                    infantes por estado (Inscriptos, Pendientes de validar,
                    Inactivos/Egresados)
                  </li>
                  <li className="update-item">
                    <strong>Búsqueda Inteligente:</strong> Barra de búsqueda con
                    normalización de texto (elimina acentos) para encontrar
                    infantes por nombre o apellido
                  </li>
                  <li className="update-item">
                    <strong>Exportación a PDF:</strong> Generación de listado
                    completo de infantes en formato PDF con jsPDF y
                    jsPDF-AutoTable
                  </li>
                  <li className="update-item">
                    <strong>Vínculos Familiares:</strong> Sistema para registrar
                    la relación entre usuarios (padres/tutores) e infantes
                  </li>
                  <li className="update-item">
                    <strong>Visualización de Hijos:</strong> Los padres y
                    tutores pueden ver cards informativas de sus hijos con todos
                    los datos relevantes (estado, DNI, edad, fecha de
                    nacimiento, tarifa, horarios)
                  </li>
                  <li className="update-item">
                    <strong>Registro de Hijos:</strong> Formulario para que
                    padres y tutores puedan registrar a sus hijos directamente
                    desde su portal
                  </li>
                  <li className="update-item">
                    <strong>Validación de Documentos:</strong> Sistema de
                    validación de números de DNI/pasaporte para evitar
                    duplicados
                  </li>
                  <li className="update-item">
                    <strong>Estados de Inscripción:</strong> Sistema de estados
                    para infantes (Verificado, Pendiente de validación,
                    Inactivo)
                  </li>
                  <li className="update-item">
                    <strong>Cálculo Automático de Edad:</strong> El sistema
                    calcula y muestra automáticamente la edad de los niños en
                    años y meses
                  </li>
                  <li className="update-item">
                    <strong>Formateo de Datos:</strong> Formateo automático de
                    DNI, fechas, nombres y montos para mejor legibilidad
                  </li>
                  <li className="update-item">
                    <strong>Diseño Responsivo:</strong> Interfaz completamente
                    adaptable a dispositivos móviles, tablets y escritorio
                  </li>
                  <li className="update-item">
                    <strong>Sistema de Colores Institucional:</strong> Paleta de
                    colores personalizada (#213472 - Azul oscuro, #FFF5ED -
                    Crema) que representa la identidad visual del jardín
                  </li>
                  <li className="update-item">
                    <strong>Marca de Agua:</strong> Logo del jardín como marca
                    de agua de fondo en todas las vistas del sistema
                  </li>
                  <li className="update-item">
                    <strong>Seguridad:</strong> Encriptación de contraseñas con
                    bcryptjs y validación de sesiones en cada acción
                  </li>
                  <li className="update-item">
                    <strong>Validación de Contraseñas:</strong> Las contraseñas
                    deben contener al menos una mayúscula y un número para mayor
                    seguridad
                  </li>
                </ul>
              </li>
            </ul>
          </section>

          {/* Sección de Tecnologías */}
          <section className="system-notes-section">
            <h2 className="system-notes-title">Stack Tecnológico</h2>
            <ul className="timeline-updates">
              <li className="update-item">
                <strong>Frontend:</strong> React.js con Vite y React Router para
                navegación
              </li>
              <li className="update-item">
                <strong>Estado Global:</strong> Redux Toolkit para gestión
                centralizada del estado
              </li>
              <li className="update-item">
                <strong>UI Framework:</strong> React Bootstrap para componentes
                de interfaz
              </li>
              <li className="update-item">
                <strong>Iconos:</strong> React Icons (Font Awesome)
              </li>
              <li className="update-item">
                <strong>Generación de PDF:</strong> jsPDF con jsPDF-AutoTable
                para exportación de documentos
              </li>
              <li className="update-item">
                <strong>Seguridad:</strong> bcryptjs para encriptación de
                contraseñas
              </li>
              <li className="update-item">
                <strong>Estilos:</strong> CSS personalizado con sistema de
                colores de marca (#213472, #FFF5ED)
              </li>
              <li className="update-item">
                <strong>Servidor:</strong> PHP con arquitectura RESTful
              </li>
              <li className="update-item">
                <strong>Base de Datos:</strong> MySQL
              </li>
              <li className="update-item">
                <strong>Hosting:</strong> Hostinger con dominio propio
              </li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
