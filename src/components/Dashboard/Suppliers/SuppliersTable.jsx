import { useState, useEffect } from "react";
import { Table, Alert } from "react-bootstrap";
import Pagination from "../../Pagination";
import { getIvaCondition } from "../../../utils";
import EditSupplier from "./EditSupplier";
import RemoveSupplier from "./RemoveSupplier";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaStickyNote,
  FaFileInvoiceDollar,
} from "react-icons/fa";

export default function SuppliersTable({ suppliers }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Resetear a página 1 cuando cambie el filtro de búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [suppliers]);

  // Calcular índices para la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSuppliers = suppliers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(suppliers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (suppliers.length === 0) {
    return (
      <Alert variant="info" className="text-center">
        No se encontraron proveedores que coincidan con los filtros aplicados.
      </Alert>
    );
  }

  return (
    <>
      <div className="table-responsive">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>
                <FaBuilding /> Nombre del Proveedor
              </th>
              <th>
                <FaMapMarkerAlt /> Dirección
              </th>
              <th>
                <FaPhone /> Teléfono
              </th>
              <th>
                <FaFileInvoiceDollar /> Condición IVA
              </th>
              <th>
                <FaStickyNote /> Notas
              </th>
              <th style={{ textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentSuppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td>{supplier.supplier_name}</td>
                <td>{supplier.supplier_address}</td>
                <td>
                  {supplier.phone ? (
                    <a
                      href={`tel:+54${supplier.phone}`}
                      style={{ color: "#007bff", textDecoration: "none" }}
                    >
                      {supplier.phone}
                    </a>
                  ) : (
                    "No registra"
                  )}
                </td>
                <td>{getIvaCondition(supplier.iva_condition)}</td>
                <td>{supplier.notes || "Sin notas"}</td>
                <td style={{ textAlign: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      justifyContent: "center",
                    }}
                  >
                    <EditSupplier supplier={supplier} />
                    <RemoveSupplier supplier={supplier} />
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
