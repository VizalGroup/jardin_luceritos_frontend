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
                <span className="timeline-date">14 de Abril de 2026</span>
                <ul className="timeline-updates">
                  <li className="update-item">
                    <strong>Actualización de Cuotas Vencidas:</strong> Nuevo
                    componente en el módulo de Administración que permite
                    actualizar en bloque las cuotas pendientes vencidas. Calcula
                    el nuevo monto aplicando un recargo del 10% o 20% sobre la
                    tarifa vigente del infante, establece una nueva fecha de
                    vencimiento y registra el usuario autenticado como
                    responsable de la actualización en lugar del usuario
                    original del cargo. Incluye selección individual o masiva
                    de cuotas, previsualización del nuevo importe y spinner de
                    carga durante el proceso
                  </li>
                </ul>
              </li>
              <li className="timeline-item">
                <span className="timeline-date">10 de Abril de 2026</span>
                <ul className="timeline-updates">
                  <li className="update-item">
                    <strong>Módulo de Proveedores:</strong> Gestión completa del
                    registro de proveedores del jardín. Permite agregar, editar
                    y eliminar proveedores con datos de contacto (nombre,
                    dirección, teléfono, notas) y condición fiscal (responsable
                    inscripto, monotributista, etc.). Incluye búsqueda
                    normalizada por nombre, teléfono o notas, paginación y
                    validación de teléfono único. También se incorporó un modal
                    reutilizable para crear proveedores directamente desde el
                    formulario de gastos sin salir del flujo de trabajo
                  </li>
                  <li className="update-item">
                    <strong>Módulo de Gastos:</strong> Control y seguimiento de
                    los gastos del jardín con soporte para tres estados de pago:{" "}
                    <em>Pendiente</em>, <em>Parcialmente pagado</em> y{" "}
                    <em>Pagado</em>. Cada gasto se asocia a un proveedor, una
                    categoría y un método de pago. El módulo incluye filtrado
                    por estado con contador por categoría, búsqueda por
                    proveedor, categoría, usuario o notas, y paginación.
                    Complementado por un sub-módulo de{" "}
                    <strong>Categorías de Gastos</strong> (CRUD completo con
                    nombre y descripción auxiliar) y un sub-módulo de{" "}
                    <strong>Estadísticas</strong> que agrupa los gastos por
                    categoría en un rango de fechas seleccionable, mostrando
                    totales pagados, pendientes y parciales junto con el
                    comparativo de ingresos reales
                  </li>
                  <li className="update-item">
                    <strong>Módulo de Personas Autorizadas a Retirar:</strong>{" "}
                    Registro de personas autorizadas para retirar infantes del
                    jardín. Soporta relaciones de muchos a muchos: una persona
                    puede estar autorizada para varios infantes y un infante
                    puede tener múltiples personas autorizadas. Los datos
                    incluyen nombre, apellido, DNI/pasaporte, teléfono y foto
                    (subida a Cloudinary). Los padres y tutores solo visualizan
                    y gestionan personas vinculadas a sus propios hijos, mientras
                    que el personal tiene acceso completo. La tabla incluye
                    búsqueda por nombre, apellido, DNI o infantes a su cargo,
                    paginación y visualización de foto en lightbox
                  </li>
                  <li className="update-item">
                    <strong>Carga de Documentación Médica:</strong> Nueva
                    funcionalidad en el módulo de infantes que permite subir
                    documentos médicos (certificados de vacunación, carnet de
                    salud, entre otros) para cada niño. Los archivos se alojan
                    en Google Drive y se registra la URL en el sistema. Soporta
                    tres tipos de documentos por infante, con validación de
                    duplicados: si un tipo ya fue cargado, el selector lo
                    indica y sugiere editar el existente en lugar de crear un
                    nuevo registro. La interfaz incluye barra de progreso de
                    subida y cierre automático al completarse exitosamente
                  </li>
                </ul>
              </li>
              <li className="timeline-item">
                <span className="timeline-date">11 de Marzo de 2026</span>
                <ul className="timeline-updates">
                  <li className="update-item">
                    <strong>Unificación de salas de 2 y 3 años:</strong> Las
                    salas "Exploradores (2 años)" (código 3) y "Pequeños
                    expertos (3 años)" (código 4) se unificaron en una única
                    sala con código 3, denominada{" "}
                    <em>Exploradores y Pequeños expertos (2/3 años)</em>. El
                    código 4 ya no está disponible en el sistema. El cambio se
                    aplicó en todos los formularios de registro y edición de
                    infantes, módulo de comunicaciones, lista de infantes en PDF
                    y en la función utilitaria <code>getRoomName</code>
                  </li>
                  <li className="update-item">
                    <strong>Generación de cargos por sede:</strong> El módulo de
                    generación de cargos ahora permite seleccionar entre tres
                    opciones grupales mutuamente excluyentes: <em>Todos</em>,{" "}
                    <em>Sede Laplace</em> y <em>Sede Docta</em>. Cada opción
                    muestra el conteo de niños activos correspondiente. Al
                    marcar una opción grupal se oculta el buscador individual y
                    se genera un cargo para cada niño del grupo seleccionado
                  </li>
                  <li className="update-item">
                    <strong>Botón de hora extra en el cronograma:</strong> El
                    botón "Agregar hora extra" se incorporó al dashboard del
                    personal, ubicado a la derecha por encima del cronograma de
                    asistencia y debajo del buscador por nombre
                  </li>
                  <li className="update-item">
                    <strong>
                      Declaración de pago con selección de cargos:
                    </strong>{" "}
                    Los padres ahora pueden elegir qué cargos quieren declarar
                    mediante checkboxes individuales. El total se actualiza en
                    tiempo real según los cargos seleccionados. Si un cargo
                    contiene la palabra "cuota", se muestra una leyenda
                    informando el 5% de descuento por pago en efectivo entre el
                    1° y el 5° de cada mes, con el valor con descuento ya
                    calculado
                  </li>
                  <li className="update-item">
                    <strong>
                      Permisos de acceso al módulo de Administración:
                    </strong>{" "}
                    Se corrigieron y refinaron los permisos de acceso al módulo
                    de Administración. El módulo ahora solo es visible para los
                    usuarios con los permisos correspondientes, tanto en el
                    dashboard como en la barra de navegación
                  </li>
                  <li className="update-item">
                    <strong>Declarar efectivo recibido:</strong> Nueva función
                    en el dashboard del personal (junto al botón de hora extra)
                    que permite registrar el cobro en efectivo de uno o varios
                    cargos pendientes de un infante en un único flujo. Se busca
                    al infante, se selecciona quién entregó el efectivo entre
                    los familiares vinculados al niño, se marcan los cargos a
                    declarar y al confirmar cada uno pasa al estado{" "}
                    <em>Por verificar</em> con método de pago <em>Efectivo</em>,
                    registrando tanto quien recibió (usuario autenticado) como
                    quien pagó (familiar seleccionado)
                  </li>
                  <li className="update-item">
                    <strong>
                      Tabla de cargos — detalle de pago en efectivo:
                    </strong>{" "}
                    Los cargos con método de pago en efectivo ahora muestran dos
                    líneas diferenciadas: <em>Recibió</em> (el usuario del
                    sistema que registró el cobro) y <em>Pagó</em> (el familiar
                    vinculado al niño que entregó el dinero)
                  </li>
                </ul>
              </li>
              <li className="timeline-item">
                <span className="timeline-date">9 de Marzo de 2026</span>
                <ul className="timeline-updates">
                  <li className="update-item">
                    <strong>Cronograma de Asistencia:</strong> Nuevo componente
                    en el dashboard del personal que muestra los horarios de
                    entrada y salida de todos los niños activos organizados por
                    franja horaria. Filtra por sede (Laplace / Docta) con
                    contador de niños por sede, incluye barra de búsqueda con
                    normalización de texto (sin distinción de tildes) y
                    navegación entre días de la semana iniciando en el día
                    actual
                  </li>
                  <li className="update-item">
                    <strong>Módulo de Administración Financiera:</strong> Panel
                    completo de gestión de cargos con tabla unificada, filtros
                    por estado (pendiente, por verificar, pagado), búsqueda por
                    concepto o nombre, rango de fechas, paginación y métricas de
                    ingresos reales y deuda total
                  </li>
                  <li className="update-item">
                    <strong>Estado de Cuenta para Padres:</strong> Módulo
                    exclusivo para padres y tutores con tabla paginada (10 por
                    página) que muestra todos los cargos de sus hijos —
                    pendientes, en verificación y pagados — en una sola vista,
                    identificando quién realizó cada pago y el método utilizado
                  </li>
                  <li className="update-item">
                    <strong>Declaración de Pago:</strong> Los padres y tutores
                    pueden declarar el pago de un cargo adjuntando el
                    comprobante, seleccionando el método de pago y subiendo el
                    documento a Google Drive. El cargo pasa al estado "por
                    verificar" hasta que el personal lo confirme
                  </li>
                  <li className="update-item">
                    <strong>
                      Almacenamiento de Comprobantes en Google Drive:
                    </strong>{" "}
                    Integración con la API de Google Drive para guardar los
                    comprobantes de pago subidos por los padres, con enlace
                    directo al archivo desde la tabla de cargos del panel
                    administrativo
                  </li>
                </ul>
              </li>
              <li className="timeline-item">
                <span className="timeline-date">19 de Febrero de 2026</span>
                <ul className="timeline-updates">
                  <li className="update-item">
                    <strong>Corrección de Permisos para Directivos:</strong> Se
                    corrigieron los permisos del rol de directivos para que
                    accedan correctamente a las secciones habilitadas según su
                    nivel
                  </li>
                  <li className="update-item">
                    <strong>Orden de Tabla de Usuarios:</strong> Se reordenó la
                    tabla de usuarios para que el personal (staff) aparezca
                    siempre antes que los padres y tutores, independientemente
                    del número de rol asignado
                  </li>
                </ul>
              </li>
              <li className="timeline-item">
                <span className="timeline-date">13 de Febrero de 2026</span>
                <ul className="timeline-updates">
                  <li className="update-item">
                    <strong>Tarifas con Tipo de Infante:</strong> Se agregó la
                    propiedad "infant_type" a las tarifas para diferenciar entre
                    tarifa regular y tarifa para bebés/lactantes (Sala de bebé)
                  </li>
                  <li className="update-item">
                    <strong>Selector de Tipo de Infante:</strong> Los
                    formularios de agregar y editar tarifas ahora incluyen un
                    selector para especificar si la tarifa es para sala regular
                    o sala de bebé
                  </li>
                  <li className="update-item">
                    <strong>Visualización en Selectores:</strong> Los selectores
                    de tarifa en los módulos de infantes ahora muestran "(Sala
                    de bebé)" cuando corresponde para mayor claridad
                  </li>
                  <li className="update-item">
                    <strong>Tabla de Tarifas Mejorada:</strong> La tabla de
                    tarifas muestra debajo de las horas si es una tarifa para
                    bebés/lactantes con la función getInfantTypeName()
                  </li>
                  <li className="update-item">
                    <strong>Imágenes en Comunicaciones:</strong> Los comunicados
                    ahora pueden incluir imágenes adjuntas opcionales que se
                    suben a Cloudinary mediante la función
                    uploadImageToCloudinary
                  </li>
                  <li className="update-item">
                    <strong>Visualización de Imágenes:</strong> Las imágenes de
                    los comunicados se muestran con un borde decorativo en
                    colores del jardín tanto en la pizarra como en la vista
                    detallada
                  </li>
                  <li className="update-item">
                    <strong>Carrusel Optimizado:</strong> Las flechas de
                    navegación del carrusel de comunicados ahora solo aparecen
                    cuando hay más de un comunicado para mostrar
                  </li>
                </ul>
              </li>
              <li className="timeline-item">
                <span className="timeline-date">9 de Febrero de 2026</span>
                <ul className="timeline-updates">
                  <li className="update-item">
                    <strong>Modulo de Pizarra:</strong> Nueva pizarra de
                    comunicaciones para ver avisos y novedades del jardin
                  </li>
                  <li className="update-item">
                    <strong>Modulo de Comunicaciones:</strong> Gestion de
                    comunicados con historial, filtros y acciones
                  </li>
                  <li className="update-item">
                    <strong>Sistema de Chat:</strong> Conversaciones entre
                    padres/tutores y personal con vista de mensajes y gestion
                  </li>
                  <li className="update-item">
                    <strong>Seccion de Contacto:</strong> Se agrego la segunda
                    sede Docta con direccion, horario y mapa
                  </li>
                </ul>
              </li>
              <li className="timeline-item">
                <span className="timeline-date">27 de Enero de 2025</span>
                <ul className="timeline-updates">
                  <li className="update-item">
                    <strong>Atributos de Ubicación:</strong> Se agregaron los
                    campos "Sala" y "Sede" al módulo de infantes para registrar
                    la ubicación específica de cada niño dentro del jardín
                  </li>

                  <li className="update-item">
                    <strong>Listado PDF con Filtros:</strong> Mejora en la
                    exportación de PDF permitiendo filtrar y generar listados
                    específicos por Sede y/o Sala seleccionada
                  </li>
                  <li className="update-item">
                    <strong>Visualización de Ubicación:</strong> Las tablas de
                    infantes ahora muestran la sede y sala asignada a cada niño
                  </li>
                  <li className="update-item">
                    <strong>Selector de Filtros Interactivo:</strong> Modal
                    intuitivo para seleccionar la combinación de Sede y Sala
                    antes de generar el PDF
                  </li>
                </ul>
              </li>
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
