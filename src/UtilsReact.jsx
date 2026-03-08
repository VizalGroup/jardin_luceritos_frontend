import { Badge } from "react-bootstrap";

export const getChargeStatus = (state) => {
  if (state === 0) return <Badge bg="danger">Pendiente</Badge>;
  if (state === 1) return <Badge bg="warning" text="dark">Por verificar</Badge>;
  if (state === 2) return <Badge bg="success">Pagado</Badge>;
  return <Badge bg="secondary">Desconocido</Badge>;
};
