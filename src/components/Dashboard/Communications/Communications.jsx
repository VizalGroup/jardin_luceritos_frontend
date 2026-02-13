import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GetCommunicationRecipients, GetCommunications, GetFamilyRelationships, GetUsers } from "../../../redux/actions";
import { selectCommunicationsOrderedById } from "../../../redux/selectors";
import NavBarDB from "../NavBarDB";
import BackButton from "../../BackButton";
import AddCommunication from "./AddCommunication";
import CommunicationsTable from "./CommunicationsTable";
import { Button } from "react-bootstrap";
import { FaComments } from "react-icons/fa";

export default function Communications() {
  document.title = "Comunicaciones - Jardín Luceritos";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const communications = useSelector(selectCommunicationsOrderedById);
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  
  // Solo Programador (0), Administración (1) y Dirección (4) pueden ver conversaciones
  const canViewChats = authenticatedUser?.user_role === 0 || 
                       authenticatedUser?.user_role === 1 || 
                       authenticatedUser?.user_role === 4;

  useEffect(() => {
    dispatch(GetCommunications());
    dispatch(GetUsers());
    dispatch(GetCommunicationRecipients());
    dispatch(GetFamilyRelationships());
  }, [dispatch]);

  return (
    <div className="watermark-background">
      <NavBarDB />
      <div className="container" style={{ marginTop: "100px" }}>
        <div className="d-flex gap-3 mb-4">
          <BackButton />
          <AddCommunication />
          {canViewChats && (
            <Button
              className="button-custom"
              onClick={() => navigate("/autogestion/comunicaciones/chats")}
            >
              <FaComments /> Conversaciones
            </Button>
          )}
        </div>
        <h2 className="text-center module-title">Gestión de Comunicaciones</h2>
        <CommunicationsTable communications={communications} />
      </div>
    </div>
  );
}
