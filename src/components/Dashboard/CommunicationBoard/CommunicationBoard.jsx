import { useSelector } from "react-redux";
import { Card, Button } from "react-bootstrap";
import { FaEnvelope, FaHistory, FaThumbtack } from "react-icons/fa";
import { isCommunicationVisibleForUser } from "../../../utils";
import { selectCommunicationsOrderedById } from "../../../redux/selectors";
import { useNavigate } from "react-router-dom";
import CommunicationsCarousel from "./CommunicationsCarousel";

export default function CommunicationBoard() {
  const navigate = useNavigate();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const userDetail = useSelector((state) => state.userDetail);
  const allCommunications = useSelector(selectCommunicationsOrderedById);
  const familyLinks = useSelector((state) => state.family_relationships);
  const infants = useSelector((state) => state.infants);
  const communicationRecipients = useSelector((state) => state.communication_recipients);

  const isParent = authenticatedUser?.user_role === 3;

  // Sedes y salas de los hijos del usuario autenticado
  const userChildrenLocationsAndRooms = familyLinks
    .filter((link) => link.user_id === authenticatedUser?.id)
    .map((link) => {
      const infant = infants.find((inf) => inf.id === link.infant_id);
      return infant ? { location: infant.location, room: infant.room } : null;
    })
    .filter(Boolean);

  // Lógica de visibilidad compartida (sin filtro de leído ni de fijado)
  const isVisibleForUser = (comm) => {
    const isPublic = parseInt(comm.target_type) === 0;
    const isStaffOnly = parseInt(comm.target_type) === 2;

    let isTargetedGroup = false;
    if (parseInt(comm.target_type) === 1) {
      if (!isParent) {
        isTargetedGroup = true;
      } else {
        isTargetedGroup = userChildrenLocationsAndRooms.some((child) => {
          const commLocation =
            comm.target_location !== "" && comm.target_location !== null
              ? parseInt(comm.target_location)
              : null;
          const commRoom =
            comm.target_room !== "" && comm.target_room !== null
              ? parseInt(comm.target_room)
              : null;
          if (commLocation === null && commRoom === null) return true;
          const matchesLocation = commLocation === null || child.location === commLocation;
          const matchesRoom = commRoom === null || child.room === commRoom;
          return matchesLocation && matchesRoom;
        });
      }
    }

    if (!isParent) {
      if (!isPublic && !isTargetedGroup && !isStaffOnly) return false;
    } else {
      const isMySentMessage = isStaffOnly && comm.sender_id === authenticatedUser?.id;
      if (!isPublic && !isTargetedGroup && !isMySentMessage) return false;
    }

    if (comm.scheduled_for) {
      const scheduledDate = new Date(comm.scheduled_for);
      const now = new Date();
      if (isParent && scheduledDate > now) return false;
    }

    if (authenticatedUser && !isParent) return true;

    if (authenticatedUser && userDetail) {
      return isCommunicationVisibleForUser(
        comm,
        userDetail.created_at || authenticatedUser.created_at
      );
    }

    return false;
  };

  // Comunicados pendientes de lectura
  const pendingCommunications = allCommunications.filter((comm) => {
    const isRead = communicationRecipients.some(
      (r) =>
        r.communication_id === comm.id &&
        r.recipient_id === authenticatedUser?.id &&
        parseInt(r.is_read) === 1
    );
    if (isRead) return false;
    return isVisibleForUser(comm);
  });

  // Comunicados fijados visibles (independientemente de si ya fueron leídos)
  const pinnedCommunications = allCommunications.filter((comm) => {
    if (parseInt(comm.is_pinned) !== 1) return false;
    return isVisibleForUser(comm);
  });

  const carouselProps = { isParent, familyLinks, infants, authenticatedUser };

  // Estado vacío para padres: al día con los comunicados
  if (pendingCommunications.length === 0 && isParent) {
    return (
      <div style={{ maxWidth: "800px", width: "100%", margin: "0 auto" }}>
        <Card
          style={{
            border: "3px solid #213472",
            borderRadius: "15px",
            backgroundColor: "#fff5ed",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <FaEnvelope size={60} color="#213472" />
          </div>
          <h4 style={{ color: "#213472", marginBottom: "15px" }}>
            ¡Estás al día con las comunicaciones!
          </h4>
          <p style={{ color: "#666", fontSize: "1.1rem", marginBottom: "25px" }}>
            No hay comunicados nuevos por leer en este momento.
          </p>
          <Button
            variant="primary"
            className="button-custom"
            onClick={() => navigate("/autogestion/historial-comunicaciones")}
            style={{ padding: "10px 30px", fontSize: "1rem", fontWeight: "600" }}
          >
            <FaHistory style={{ marginRight: "10px" }} />
            Ver Historial de Comunicaciones
          </Button>
        </Card>

        {pinnedCommunications.length > 0 && (
          <div style={{ marginTop: "30px" }}>
     
            <CommunicationsCarousel
              communications={pinnedCommunications}
              showMarkAsRead={false}
              {...carouselProps}
            />
          </div>
        )}
      </div>
    );
  }

  // Sin comunicados y no es padre: no mostrar nada
  if (pendingCommunications.length === 0) return null;

  // Vista normal: solo carrusel de pendientes
  return (
    <div style={{ maxWidth: "800px", width: "100%", margin: "0 auto" }}>
      <CommunicationsCarousel
        communications={pendingCommunications}
        showMarkAsRead={true}
        {...carouselProps}
      />
    </div>
  );
}
