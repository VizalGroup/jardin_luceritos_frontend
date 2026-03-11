import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Card } from "react-bootstrap";
import { formatCurrency } from "../../../utils";
import { selectChargesOrderedById } from "../../../redux/selectors";
import { FaExclamationTriangle, FaCalendarTimes } from "react-icons/fa";

export default function DebtTracker() {
  const charges = useSelector(selectChargesOrderedById);

  const debt = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    const unpaid = charges.filter(
      (c) => c.current_state === 0 || c.current_state === 1
    );
    const total = unpaid.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const count = unpaid.length;

    const overdue = charges.filter(
      (c) => c.current_state === 0 && c.due_date && c.due_date < todayStr
    );
    const overdueTotal = overdue.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const overdueCount = overdue.length;

    return { total, count, overdueTotal, overdueCount };
  }, [charges]);

  return (
    <Card
      className="shadow-sm text-center h-100"
      style={{ borderLeft: "4px solid #dc3545", backgroundColor: "#f8f9fa" }}
    >
      <Card.Body className="py-2 px-3">
        <div className="d-flex justify-content-center align-items-center mb-1">
          <FaExclamationTriangle className="text-danger me-1" size={14} />
          <small className="fw-bold text-muted">Deuda Total Pendiente</small>
        </div>

        <h5 className="text-danger mb-0">{formatCurrency(debt.total)}</h5>
        <small className="text-muted">{debt.count} cargos sin pagar</small>

        <hr className="my-2" />

        <div className="d-flex justify-content-center align-items-center mb-1">
          <FaCalendarTimes className="text-danger me-1" size={12} />
          <small className="fw-bold text-muted">Deuda Vencida</small>
        </div>

        <h6 className="text-danger mb-0">{formatCurrency(debt.overdueTotal)}</h6>
        <small className="text-muted">{debt.overdueCount} cargos vencidos</small>
      </Card.Body>
    </Card>
  );
}
