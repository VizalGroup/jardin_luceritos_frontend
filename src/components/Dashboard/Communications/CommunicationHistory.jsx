import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GetCommunications, GetCommunicationRecipients, GetInfants, GetFamilyRelationships } from "../../../redux/actions";
import { selectCommunicationsOrderedById } from "../../../redux/selectors";
import NavBarDB from "../NavBarDB";
import BackButton from "../../BackButton";
import CommunicationsTable from "./CommunicationsTable";
import { isCommunicationVisibleForUser } from "../../../utils";

export default function CommunicationHistory() {
  document.title = "Historial de Comunicaciones - Jardín Luceritos";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const userDetail = useSelector((state) => state.userDetail);
  const allCommunications = useSelector(selectCommunicationsOrderedById);
  const familyLinks = useSelector((state) => state.family_relationships);
  const infants = useSelector((state) => state.infants);
  const communicationRecipients = useSelector((state) => state.communication_recipients);

  // Verificar si es padre/madre/tutor (rol 3)
  const isParent = authenticatedUser?.user_role === 3;

  useEffect(() => {
    // Verificar autenticación
    if (!authenticatedUser) {
      navigate("/iniciar_sesion");
      return;
    }

    // Verificar que sea padre/madre/tutor
    if (!isParent) {
      alert("No tienes permisos para acceder a esta sección.");
      navigate("/autogestion");
      return;
    }

    dispatch(GetCommunications());
    dispatch(GetCommunicationRecipients());
    dispatch(GetInfants());
    dispatch(GetFamilyRelationships());
  }, [dispatch, authenticatedUser, isParent, navigate]);

  // Obtener sedes y salas de los hijos del usuario
  const userChildrenLocationsAndRooms = familyLinks
    .filter((link) => link.user_id === authenticatedUser?.id)
    .map((link) => {
      const infant = infants.find((inf) => inf.id === link.infant_id);
      return infant ? { location: infant.location, room: infant.room } : null;
    })
    .filter(Boolean);

  // Filtrar comunicados relevantes para el usuario (todos los que puede ver, leídos o no)
  const userCommunications = allCommunications.filter((comm) => {
    // Verificar tipo "Todos" (target_type === 0)
    const isPublic = parseInt(comm.target_type) === 0;
    
    // Verificar tipo "Grupo" (target_type === 1) 
    let isTargetedGroup = false;
    if (parseInt(comm.target_type) === 1) {
      isTargetedGroup = userChildrenLocationsAndRooms.some((child) => {
        const commLocation = comm.target_location !== "" && comm.target_location !== null 
          ? parseInt(comm.target_location) 
          : null;
        const commRoom = comm.target_room !== "" && comm.target_room !== null 
          ? parseInt(comm.target_room) 
          : null;

        if (commLocation === null && commRoom === null) {
          return true;
        }

        const matchesLocation = commLocation === null || child.location === commLocation;
        const matchesRoom = commRoom === null || child.room === commRoom;

        return matchesLocation && matchesRoom;
      });
    }

    // Verificar tipo "Usuarios específicos" (target_type === 2)
    // Solo mostrar si el usuario es destinatario
    let isPersonal = false;
    if (parseInt(comm.target_type) === 2) {
      isPersonal = communicationRecipients.some(
        (recipient) =>
          recipient.communication_id === comm.id &&
          recipient.recipient_id === authenticatedUser?.id
      );
    }

    // Verificar tipo "Personal del jardín" (target_type === 3)
    // Solo mostrar si el usuario es el emisor
    let isOwnMessage = false;
    if (parseInt(comm.target_type) === 3) {
      isOwnMessage = parseInt(comm.sender_id) === parseInt(authenticatedUser?.id);
    }

    if (!isPublic && !isTargetedGroup && !isPersonal && !isOwnMessage) return false;

    // Verificar la fecha de visibilidad
    if (authenticatedUser && userDetail) {
      return isCommunicationVisibleForUser(comm, userDetail.created_at || authenticatedUser.created_at);
    }

    return true;
  });

  if (!authenticatedUser || !isParent) {
    return null;
  }

  return (
    <div className="watermark-background">
      <NavBarDB />
      <div className="container" style={{ marginTop: "100px" }}>
        <div className="d-flex gap-3 mb-4">
          <BackButton />
        </div>
        <h2 className="text-center module-title">Historial de Comunicaciones</h2>
        <p className="text-center" style={{ color: "#213472", fontSize: "1.1rem", marginBottom: "30px" }}>
          Aquí puedes ver todos los comunicados del jardín que te corresponden
        </p>
        <CommunicationsTable communications={userCommunications} />
      </div>
    </div>
  );
}
