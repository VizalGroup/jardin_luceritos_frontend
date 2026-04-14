import { Badge } from "react-bootstrap";
import { FaCheckCircle, FaClock, FaExclamationCircle } from "react-icons/fa";

export const getChargeStatus = (state) => {
  if (state === 0) return <Badge bg="danger">Pendiente</Badge>;
  if (state === 1) return <Badge bg="primary">Por verificar</Badge>;
  if (state === 2) return <Badge bg="success">Pagado</Badge>;
  return <Badge bg="secondary">Desconocido</Badge>;
};

export const GetExpenseStatus = (status) => {
  switch (status) {
    case 0:
      return <FaClock title="Pendiente de pago" style={{ color: "orange" }} />;
    case 1:
      return (
        <FaExclamationCircle
          title="Parcialmente pagado"
          style={{ color: "red" }}
        />
      );
    case 2:
      return <FaCheckCircle title="Pagado" style={{ color: "green" }} />;
    default:
      return "Desconocido";
  }
};
