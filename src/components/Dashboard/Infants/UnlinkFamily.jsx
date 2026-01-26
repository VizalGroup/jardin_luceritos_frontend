import { useState } from "react";
import { useDispatch } from "react-redux";
import { DeleteFamilyRelationship, GetFamilyRelationships } from "../../../redux/actions";
import { Button, OverlayTrigger, Tooltip, Spinner } from "react-bootstrap";
import { FaLinkSlash } from "react-icons/fa6";

export default function UnlinkFamily({ id }) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await dispatch(DeleteFamilyRelationship(id));
      await dispatch(GetFamilyRelationships());
    } catch (error) {
      alert("Error al eliminar vínculo familiar: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OverlayTrigger 
      placement="top" 
      overlay={<Tooltip id={`tooltip-${id}`}>
        {isLoading ? 'Desvinculando...' : 'Desvincular familiar'}
      </Tooltip>}
    >
      <Button 
        variant="danger"
        onClick={handleDelete}
        disabled={isLoading}
        style={{ opacity: isLoading ? 0.7 : 1 }}
      >
        {isLoading ? <Spinner animation="border" size="sm" /> : <FaLinkSlash />}
      </Button>
    </OverlayTrigger>
  );
}