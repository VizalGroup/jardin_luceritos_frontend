import { useState, useEffect } from "react";
import { Table, Alert, ButtonGroup, Button, Form } from "react-bootstrap";
import Pagination from "../../Pagination";
import EditExpense from "./EditExpense";
import RemoveExpense from "./RemoveExpense";
import {
  formatCurrency,
  formatDateTime,
  getExpensePaymentMethod,
} from "../../../utils";
import { GetExpenseStatus } from "../../../UtilsReact";
import {
  FaHashtag,
  FaDollarSign,
  FaTag,
  FaCalendarAlt,
  FaUser,
  FaClock,
  FaExclamationCircle,
  FaCheckCircle,
  FaFilter,
} from "react-icons/fa";

export default function ExpensesTable({ expenses }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterState, setFilterState] = useState(null);
  const itemsPerPage = 10;

  // Resetear a página 1 cuando cambie el filtro de búsqueda o estado
  useEffect(() => {
    setCurrentPage(1);
  }, [expenses, filterState]);

  // Filtrar gastos por estado seleccionado
  const filteredExpenses = expenses.filter((expense) =>
    filterState !== null ? expense.current_state === filterState : true,
  );

  // Calcular conteos por estado
  const pendingCount = expenses.filter((e) => e.current_state === 0).length;
  const partialCount = expenses.filter((e) => e.current_state === 1).length;
  const paidCount = expenses.filter((e) => e.current_state === 2).length;

  // Calcular índices para la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = filteredExpenses.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (expenses.length === 0) {
    return (
      <Alert variant="info" className="text-center">
        No se encontraron gastos que coincidan con los filtros aplicados.
      </Alert>
    );
  }

  return (
    <>
      <div className="mb-3">
        <Form.Label>
          <FaFilter /> Filtrar por Estado de Pago
        </Form.Label>
        <ButtonGroup className="d-flex">
          <Button
            variant={filterState === 0 ? "warning" : "outline-warning"}
            onClick={() => setFilterState(filterState === 0 ? null : 0)}
          >
            <FaClock /> Pendiente ({pendingCount})
          </Button>
          <Button
            variant={filterState === 1 ? "danger" : "outline-danger"}
            onClick={() => setFilterState(filterState === 1 ? null : 1)}
          >
            <FaExclamationCircle /> Parcial ({partialCount})
          </Button>
          <Button
            variant={filterState === 2 ? "success" : "outline-success"}
            onClick={() => setFilterState(filterState === 2 ? null : 2)}
          >
            <FaCheckCircle /> Pagado ({paidCount})
          </Button>
        </ButtonGroup>
      </div>

      <div className="table-responsive">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        <Table striped bordered hover>
          <thead
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderBottom: "2px solid rgba(100, 170, 70, 0.45)",
            }}
          >
            <tr>
              <th style={{ textAlign: "center" }}>
                <FaHashtag />
              </th>
              <th>
                <FaDollarSign /> Monto
              </th>
              <th>
                <FaCalendarAlt /> Fecha / Usuario
              </th>
              <th style={{ textAlign: "center" }}>Estado</th>
              <th style={{ textAlign: "center" }}>
                <FaTag /> Categoría / <br />
                Proveedor / Notas
              </th>
              <th style={{ textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentExpenses.map((expense) => (
              <tr key={expense.id}>
                <td style={{ textAlign: "center" }}>{expense.id}</td>
                <td>
                  {formatCurrency(expense.amount)}
                  {expense.debt && expense.debt !== "0.00" && (
                    <>
                      <br />
                      <span style={{ fontSize: "0.8em", color: "red" }}>
                        Deuda: {formatCurrency(expense.debt)}
                      </span>
                    </>
                  )}
                  <br />
                  <span style={{ fontSize: "0.8em", color: "gray" }}>
                    {getExpensePaymentMethod(expense.payment_method)}
                  </span>
                </td>
                <td>
                  {formatDateTime(expense.created_at)}
                  <br />
                  <span style={{ fontSize: "0.8em", color: "gray" }}>
                    <FaUser className="me-1" />
                    {expense.user
                      ? `${expense.user.first_name} ${expense.user.last_name}`
                      : "Usuario no disponible"}
                  </span>
                </td>
                <td style={{ textAlign: "center" }}>
                  {GetExpenseStatus(expense.current_state)}
                </td>
                <td style={{ textAlign: "center" }}>
                  <strong>
                    {expense.category?.category_name || "Sin categoría"}
                  </strong>
                  <br />
                  <span style={{ fontSize: "0.9em", color: "gray" }}>
                    {expense.supplier?.supplier_name || "Sin proveedor"}
                  </span>
                  {expense.notes && expense.notes.trim() !== "" && (
                    <>
                      <br />
                      <span style={{ fontSize: "0.8em" }}>
                        Nota: {expense.notes}
                      </span>
                    </>
                  )}
                </td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      justifyContent: "center",
                    }}
                  >
                    <EditExpense expense={expense} />
                    <RemoveExpense expense={expense} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
