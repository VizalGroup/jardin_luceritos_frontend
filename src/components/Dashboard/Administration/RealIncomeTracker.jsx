import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Card } from "react-bootstrap";
import { formatCurrency, isDateInRange } from "../../../utils";
import { selectChargesOrderedById } from "../../../redux/selectors";
import { FaDollarSign, FaCheckCircle } from "react-icons/fa";

export default function RealIncomeTracker({ fromDate, toDate }) {
  const charges = useSelector(selectChargesOrderedById);

  const income = useMemo(() => {
    const paidCharges = charges.filter((c) => {
      if (c.current_state !== 2) return false;
      return isDateInRange(c.paid_at, fromDate, toDate);
    });

    const total = paidCharges.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const count = paidCharges.length;

    return { total, count };
  }, [charges, fromDate, toDate]);

  if (!fromDate || !toDate) {
    return (
      <Card
        className="shadow-sm text-center h-100"
        style={{ borderLeft: "4px solid #007bff", backgroundColor: "#f8f9fa" }}
      >
        <Card.Body className="py-2 px-3">
          <div className="d-flex justify-content-center align-items-center mb-1">
            <FaDollarSign className="text-primary me-1" size={14} />
            <small className="fw-bold text-muted">Ingreso Real del Período</small>
          </div>
          <small className="text-muted fst-italic">
            Filtrá entre dos fechas para ver el ingreso del período
          </small>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card
      className="shadow-sm text-center h-100"
      style={{ borderLeft: "4px solid #007bff", backgroundColor: "#f8f9fa" }}
    >
      <Card.Body className="py-2 px-3">
        <div className="d-flex justify-content-center align-items-center mb-1">
          <FaDollarSign className="text-primary me-1" size={14} />
          <small className="fw-bold text-muted">Ingreso Real del Período</small>
        </div>

        <h5 className="text-primary mb-0">{formatCurrency(income.total)}</h5>
        <small className="text-muted">{income.count} pagos verificados</small>

        <hr className="my-2" />

        <div className="d-flex justify-content-center align-items-center">
          <FaCheckCircle className="text-success me-1" size={12} />
          <small className="text-muted">Cargos Pagados y Verificados</small>
        </div>
      </Card.Body>
    </Card>
  );
}
