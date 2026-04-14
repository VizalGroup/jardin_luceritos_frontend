import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Row, Col, Form, Table } from "react-bootstrap";
import {
  GetExpenses,
  GetExpenseCategories,
  GetCharges,
} from "../../../../redux/actions";
import { formatCurrency, isDateInRange } from "../../../../utils";
import {
  FaCalendarAlt,
  FaChartBar,
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaBalanceScale,
} from "react-icons/fa";
import RealIncomeTracker from "../../Administration/RealIncomeTracker";
import {
  selectSortedExpenses,
  selectSortedExpenseCategories,
} from "../../../../redux/selectors";
import BackButton from "../../../BackButton";
import NavBarDB from "../../NavBarDB";


export default function Statistics() {
  document.title = "Estadísticas de Gastos - Jardín de Corazones Alegres";
  const dispatch = useDispatch();
  const expenses = useSelector(selectSortedExpenses);
  const charges = useSelector((state) => state.charges); // Asegúrate de tener el selector correcto
  const expensesCategories = useSelector(selectSortedExpenseCategories);

  // Configurar fechas por defecto
  const getFirstDayOfMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstDay.toISOString().split('T')[0];
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [fromDate, setFromDate] = useState(getFirstDayOfMonth());
  const [toDate, setToDate] = useState(getTodayDate());

  useEffect(() => {
    dispatch(GetExpenses());
    dispatch(GetExpenseCategories());
    dispatch(GetCharges()); // Asegúrate de tener la acción correcta
  }, [dispatch]);

  // Filtrar gastos por período de fechas
  const filteredExpenses = expenses.filter((expense) =>
    isDateInRange(expense.created_at.split(" ")[0], fromDate, toDate)
  );

  // Calcular estadísticas por categoría
  const categoryStats = expensesCategories
    .map((category) => {
      const categoryExpenses = filteredExpenses.filter(
        (expense) => expense.id_category === category.id
      );

      const totalAmount = categoryExpenses.reduce(
        (sum, expense) => sum + parseFloat(expense.amount),
        0
      );

      // Calcular monto pagado (amount - debt para parcialmente pagados, amount completo para pagados)
      const totalPaid = categoryExpenses.reduce((sum, expense) => {
        if (expense.current_state === 2) {
          // Pagado completo
          return sum + parseFloat(expense.amount);
        } else if (expense.current_state === 1) {
          // Parcialmente pagado
          const debt = expense.debt ? parseFloat(expense.debt) : 0;
          return sum + (parseFloat(expense.amount) - debt);
        }
        return sum; // Pendiente (0) no suma nada al pagado
      }, 0);

      // Calcular deuda pendiente
      const totalDebt = categoryExpenses.reduce((sum, expense) => {
        if (expense.current_state === 0) {
          // Pendiente completo
          return sum + parseFloat(expense.amount);
        } else if (expense.current_state === 1) {
          // Parcialmente pagado
          const debt = expense.debt ? parseFloat(expense.debt) : 0;
          return sum + debt;
        }
        return sum; // Pagado (2) no tiene deuda
      }, 0);

      const totalCount = categoryExpenses.length;

      return {
        ...category,
        totalAmount,
        totalPaid,
        totalDebt,
        totalCount,
        expenses: categoryExpenses,
      };
    })
    .filter((category) => category.totalCount > 0) // Solo mostrar categorías con gastos
    .sort((a, b) => b.totalAmount - a.totalAmount); // Ordenar por monto descendente

  // Calcular totales generales
  const totalGeneral = filteredExpenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount),
    0
  );

  const totalPagado = filteredExpenses.reduce((sum, expense) => {
    if (expense.current_state === 2) {
      // Pagado completo
      return sum + parseFloat(expense.amount);
    } else if (expense.current_state === 1) {
      // Parcialmente pagado
      const debt = expense.debt ? parseFloat(expense.debt) : 0;
      return sum + (parseFloat(expense.amount) - debt);
    }
    return sum; // Pendiente (0) no suma nada al pagado
  }, 0);

  const totalDeuda = filteredExpenses.reduce((sum, expense) => {
    if (expense.current_state === 0) {
      // Pendiente completo
      return sum + parseFloat(expense.amount);
    } else if (expense.current_state === 1) {
      // Parcialmente pagado
      const debt = expense.debt ? parseFloat(expense.debt) : 0;
      return sum + debt;
    }
    return sum; // Pagado (2) no tiene deuda
  }, 0);

  const totalGastos = filteredExpenses.length;

  // Calcular ingreso real del período (solo si hay fechas seleccionadas)
  const realIncome =
    fromDate && toDate
      ? charges
          .filter(
            (charge) =>
              charge.current_state === 2 && // Solo cargos pagados y verificados
              isDateInRange(charge.paid_at, fromDate, toDate) // Filtrar por fecha de pago
          )
          .reduce((sum, charge) => sum + parseFloat(charge.amount), 0)
      : 0;

  // Calcular superávit o déficit
  const balance = realIncome - totalGeneral;
  const hasBalance = fromDate && toDate && totalGeneral > 0;

  return (
    <div className="watermark-background">
      <NavBarDB />
      <div className="container" style={{ marginTop: "100px" }}>
        <BackButton />

        <div >
          <h3 className="text-center module-title">
            Estadísticas de Gastos
          </h3>

          {/* Filtros de fecha */}
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  <FaCalendarAlt /> Desde
                </Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  <FaCalendarAlt /> Hasta
                </Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Resumen general */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Title>
                    <FaDollarSign /> Total de Gastos
                  </Card.Title>
                  <h4 className="text-primary">
                    {formatCurrency(totalGeneral)}
                  </h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Title>
                    <FaChartBar /> Total Pagado
                  </Card.Title>
                  <h4 className="text-success">
                    {formatCurrency(totalPagado)}
                  </h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Title>⚠️ Total Deuda</Card.Title>
                  <h4 className="text-danger">{formatCurrency(totalDeuda)}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Title>📊 Cantidad</Card.Title>
                  <h4 className="text-info">{totalGastos}</h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Ingreso Real y Balance */}
          {fromDate && toDate && (
            <Row className="mb-4">
              <Col md={4}>
                <RealIncomeTracker
                  charges={charges}
                  fromDate={fromDate}
                  toDate={toDate}
                />
              </Col>
              <Col md={4}>
                <Card className="text-center h-100">
                  <Card.Body>
                    <Card.Title>
                      <FaBalanceScale /> Balance del Período
                    </Card.Title>
                    {hasBalance && (
                      <>
                        <h4
                          className={
                            balance >= 0 ? "text-success" : "text-danger"
                          }
                        >
                          {balance >= 0 ? <FaArrowUp /> : <FaArrowDown />}{" "}
                          {formatCurrency(Math.abs(balance))}
                        </h4>
                        <p className="mb-0">
                          {balance >= 0 ? (
                            <span className="text-success">Superávit</span>
                          ) : (
                            <span className="text-danger">Déficit</span>
                          )}
                        </p>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center h-100">
                  <Card.Body>
                    <Card.Title>📈 Comparación</Card.Title>
                    {hasBalance && (
                      <>
                        <small className="text-muted d-block">
                          Ingresos: {formatCurrency(realIncome)}
                        </small>
                        <small className="text-muted d-block">
                          Gastos: {formatCurrency(totalGeneral)}
                        </small>
                        <hr className="my-2" />
                        <strong>
                          {((realIncome / totalGeneral) * 100).toFixed(1)}% de
                          cobertura
                        </strong>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Estadísticas por categoría */}
          <h5 className="text-center module-title">Gastos por Categoría</h5>
          
          {categoryStats.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Total Gastos</th>
                  <th>Deuda Pendiente</th>
                  <th>% del Total</th>
                </tr>
              </thead>
              <tbody>
                {categoryStats.map((category) => {
                  const percentage =
                    totalGeneral > 0
                      ? (
                          (category.totalAmount / totalGeneral) *
                          100
                        ).toFixed(1)
                      : 0;

                  return (
                    <tr key={category.id}>
                      <td>
                        <strong>{category.category_name}</strong>
                        {category.aux_description && (
                          <>
                            <br />
                            <small className="text-muted">
                              {category.aux_description}
                            </small>
                          </>
                        )}
                        <br />
                        <small className="text-muted">
                          {category.totalCount} movimiento{category.totalCount !== 1 ? 's' : ''}
                        </small>
                      </td>
                      <td className="text-end">
                        {formatCurrency(category.totalAmount)}
                      </td>
                      <td className="text-end text-danger">
                        {formatCurrency(category.totalDebt)}
                      </td>
                      <td className="text-center">
                        <span className="badge bg-primary fs-6">
                          {percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <div className="text-center text-muted">
              <p>No se encontraron gastos en el período seleccionado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
