import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Badge, Table } from "react-bootstrap";
import { FaFileInvoiceDollar } from "react-icons/fa";
import NavBarDB from "../NavBarDB";
import BackButton from "../../BackButton";
import {
  GetCharges,
  GetFamilyRelationships,
  GetInfants,
  LogoutUser,
} from "../../../redux/actions";
import { selectChargesOrderedById } from "../../../redux/selectors";
import {
  capitalizeName,
  formatCurrency,
  formatDate,
  getPaymentMethod,
  isOverdue,
} from "../../../utils";
import { getChargeStatus } from "../../../UtilsReact";
import Pagination from "../../Pagination";

export default function AccountStatement() {
  document.title = "Mi Estado de Cuenta - Luceritos";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  const familyLinks = useSelector((state) => state.family_relationships);
  const charges = useSelector(selectChargesOrderedById);

  useEffect(() => {
    if (!authenticatedUser) {
      navigate("/iniciar_sesion");
      return;
    }
    const now = Math.floor(Date.now() / 1000);
    if (authenticatedUser.expires_at && now > authenticatedUser.expires_at) {
      dispatch(LogoutUser());
      navigate("/iniciar_sesion");
      return;
    }
    dispatch(GetFamilyRelationships());
    dispatch(GetInfants());
    dispatch(GetCharges());
  }, [authenticatedUser, dispatch, navigate]);

  const myInfantIds = familyLinks
    .filter((link) => link.user_id === authenticatedUser?.id)
    .map((link) => link.infant_id);

  const myCharges = charges.filter((c) => myInfantIds.includes(c.id_infant));

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = myCharges.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(myCharges.length / itemsPerPage);

  if (!authenticatedUser) return null;

  return (
    <div className="watermark-background">
      <NavBarDB />
      <div
        className="container"
        style={{ marginTop: "100px", paddingBottom: "50px" }}
      >
        <div className="d-flex gap-3 mb-4 align-items-center">
          <BackButton />
        </div>
        <h3 className="text-center module-title">Mi Estado de Cuenta</h3>

        {myCharges.length === 0 ? (
          <div className="text-center text-muted py-5">
            <FaFileInvoiceDollar size={48} className="mb-3 opacity-25" />
            <p>No tenés cargos registrados.</p>
          </div>
        ) : (
          <div className="contrasting-background">
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
                    <th>
                      #<br />
                      <small className="fw-normal">Emisión</small>
                    </th>
                    <th>Concepto</th>
                    <th>Monto</th>
                    <th>Vencimiento / Pago</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((charge) => (
                    <tr key={charge.id}>
                      <td>
                        {charge.id}
                        <br />
                        <small className="text-muted">
                          {formatDate(charge.created_at)}
                        </small>
                      </td>
                      <td>
                        {capitalizeName(charge.charge_title)}
                        <br />
                        <small className="text-muted">
                          {capitalizeName(charge.infant?.lastname)},{" "}
                          {capitalizeName(charge.infant?.first_name)}
                        </small>
                      </td>
                      <td>{formatCurrency(charge.amount)}</td>
                      <td>
                        {formatDate(charge.due_date)}
                        {charge.current_state === 2 && charge.paid_at && (
                          <>
                            <br />
                            <small className="text-muted">
                              Pago: {formatDate(charge.paid_at)}
                            </small>
                          </>
                        )}
                        {isOverdue(charge.due_date, charge.current_state) && (
                          <>
                          <br />
                          <Badge bg="danger" className="ms-1">
                            Vencido
                          </Badge>
                          </>
                        )}
                      </td>
                      <td>
                        {(charge.current_state === 1 ||
                          charge.current_state === 2) &&
                          charge.paying_user && (
                            <small>
                              {capitalizeName(charge.paying_user.lastname)},{" "}
                              {capitalizeName(charge.paying_user.first_name)}
                              <br />
                              <span
                                style={{ fontStyle: "italic", color: "gray" }}
                              >
                                {getPaymentMethod(charge.payment_method)}
                              </span>
                              <br />
                            </small>
                          )}
                        {getChargeStatus(charge.current_state)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
