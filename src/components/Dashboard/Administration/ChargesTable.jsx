import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectChargesOrderedById } from "../../../redux/selectors";
import {
  capitalizeName,
  formatCurrency,
  formatDate,
  getPaymentMethod,
} from "../../../utils";
import { getChargeStatus } from "../../../UtilsReact";
import { Button, ButtonGroup, Table, Badge, Form } from "react-bootstrap";
import {
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaFilter,
  FaCalendarAlt,
} from "react-icons/fa";
import SearchBar from "../../SearchBar";
import Pagination from "../../Pagination";
import EditCharge from "./EditCharge";
import RemoveCharge from "./RemoveCharge";
import VerifyPayment from "./VerifyPayment";
import DeclareCashPayment from "./DeclareCashPayment";
import DebtTracker from "./DebtTracker";
import RealIncomeTracker from "./RealIncomeTracker";

export default function ChargesTable() {
  const charges = useSelector(selectChargesOrderedById);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [filterState, setFilterState] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const isDateInRange = (dateStr, from, to) => {
    if (!dateStr) return false;
    const date = dateStr.split(" ")[0]; // soporta "YYYY-MM-DD HH:MM:SS"
    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
  };

  const baseFiltered = charges
    .filter((c) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      const title = c.charge_title?.toLowerCase() || "";
      const name =
        `${c.infant?.lastname || ""} ${c.infant?.first_name || ""}`.toLowerCase();
      const nameRev =
        `${c.infant?.first_name || ""} ${c.infant?.lastname || ""}`.toLowerCase();
      return title.includes(q) || name.includes(q) || nameRev.includes(q);
    })
    .filter((c) => {
      if (!fromDate && !toDate) return true;
      const dateField =
        c.current_state === 2 && c.paid_at ? c.paid_at : c.created_at;
      return isDateInRange(dateField, fromDate, toDate);
    });

  const filteredCharges = baseFiltered.filter((c) =>
    filterState !== null ? c.current_state === filterState : true,
  );

  const pendingCount = baseFiltered.filter((c) => c.current_state === 0).length;
  const verifyCount = baseFiltered.filter((c) => c.current_state === 1).length;
  const paidCount = baseFiltered.filter((c) => c.current_state === 2).length;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCharges.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCharges.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterState, searchTerm, fromDate, toDate]);

  return (
    <div className="contrasting-background">
      <h3 className="text-center module-title">Cargos</h3>

      {/* Barra de búsqueda y filtros de fecha */}
      <div className="row mb-2">
        <div className="col-12">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder="Buscar por concepto o nombre del niño..."
          />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-6">
          <Form.Group controlId="fromDate">
            <Form.Label>
              <FaCalendarAlt /> Desde
            </Form.Label>
            <Form.Control
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </Form.Group>
        </div>
        <div className="col-md-6">
          <Form.Group controlId="toDate">
            <Form.Label>
              <FaCalendarAlt /> Hasta
            </Form.Label>
            <Form.Control
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </Form.Group>
        </div>
      </div>

      {/* Trackers de métricas financieras */}
      <div className="row mb-3">
        <div className="col-md-6">
          <RealIncomeTracker fromDate={fromDate} toDate={toDate} />
        </div>
        <div className="col-md-6">
          <DebtTracker />
        </div>
      </div>

      {/* Filtro por estado */}
      <Form.Label>
        <FaFilter /> Filtrar por estado
      </Form.Label>
      <ButtonGroup className="d-flex mb-3">
        <Button
          variant={filterState === 0 ? "danger" : "outline-danger"}
          onClick={() => setFilterState(filterState === 0 ? null : 0)}
        >
          <FaClock /> Pendiente ({pendingCount})
        </Button>
        <Button
          variant={filterState === 1 ? "primary" : "outline-primary"}
          onClick={() => setFilterState(filterState === 1 ? null : 1)}
        >
          <FaExclamationCircle /> Por verificar ({verifyCount})
        </Button>
        <Button
          variant={filterState === 2 ? "success" : "outline-success"}
          onClick={() => setFilterState(filterState === 2 ? null : 2)}
        >
          <FaCheckCircle /> Pagado ({paidCount})
        </Button>
      </ButtonGroup>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <div style={{ overflowX: "auto" }}>
        <Table
          striped
          bordered
          hover
          responsive
          style={{ textAlign: "center" }}
        >
          <thead>
            <tr>
              <th>#</th>
              <th>Concepto</th>
              <th>Cantidad</th>
              <th>Monto</th>
              <th>Emisión / Vencimiento / Pago</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((charge) => (
                <tr key={charge.id}>
                  <td>{charge.id}</td>
                  <td>
                    {capitalizeName(charge.charge_title)}
                    <br />
                    {capitalizeName(charge.infant?.lastname)}{" "}
                    {capitalizeName(charge.infant?.first_name)}
                  </td>
                  <td>{charge.quantity}</td>
                  <td>{formatCurrency(charge.amount)}</td>
                  <td>
                    {formatDate(charge.created_at)}
                    <br />
                    {formatDate(charge.due_date)}
                    <br />
                    {formatDate(charge.paid_at)}
                  </td>

                  <td>
                    {getChargeStatus(charge.current_state)}
                    <br />
                    {charge.current_state === 0 && (
                      <small className="text-muted">
                        {capitalizeName(charge.user?.lastname)}{" "}
                        {capitalizeName(charge.user?.first_name)}
                      </small>
                    )}
                    {charge.current_state === 1 && (
                      <small>
                        {charge.payment_method === 1 && charge.user && (
                          <>
                            Recibió:{" "}
                            {capitalizeName(charge.user?.lastname)}{" "}
                            {capitalizeName(charge.user?.first_name)}
                            <br />
                          </>
                        )}
                        {charge.url_payment_document && (
                          <a
                            href={charge.url_payment_document}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-link btn-sm p-0"
                          >
                            Ver comprobante
                          </a>
                        )}
                        <br />
                        <span style={{ fontStyle: "italic", color: "gray" }}>
                          {getPaymentMethod(charge.payment_method)}
                        </span>
                      </small>
                    )}
                    {charge.current_state === 2 && (
                      <small>
                        Verificado por: {capitalizeName(charge.user?.lastname)}{" "}
                        {capitalizeName(charge.user?.first_name)}
                        <br />
                        {charge.url_payment_document && (
                          <a
                            href={charge.url_payment_document}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-link btn-sm p-0"
                          >
                            Ver comprobante
                          </a>
                        )}
                        <br />
                        <span style={{ fontStyle: "italic", color: "gray" }}>
                          {getPaymentMethod(charge.payment_method)}
                        </span>
                      </small>
                    )}
                    {charge.paying_user && (
                      <small>
                        <br />
                        Pagó:{" "}
                        {capitalizeName(charge.paying_user?.lastname)}{" "}
                        {capitalizeName(charge.paying_user?.first_name)}
                      </small>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-1 justify-content-center">
                      <EditCharge charge={charge} />
                      <RemoveCharge charge={charge} />
                      {charge.current_state === 0 && (
                        <DeclareCashPayment charge={charge} />
                      )}
                      {charge.current_state === 1 && (
                        <VerifyPayment charge={charge} />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No hay cargos registrados</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
