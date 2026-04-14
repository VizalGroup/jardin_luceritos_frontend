import { Table, Spinner } from "react-bootstrap";
import { FaTag, FaAlignLeft } from "react-icons/fa";
import EditExpensesCategory from "./EditExpensesCategory";

export default function ExpensesCategoriesTable({ categories, isLoading }) {
  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" style={{ color: "black" }} />
        <p style={{ color: "black", marginTop: "10px" }}>
          Cargando categorías...
        </p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-4">
        <p style={{ color: "black" }}>No se encontraron categorías de gastos.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>
              <FaTag /> Nombre de la Categoría
            </th>
            <th>
              <FaAlignLeft /> Descripción
            </th>
            <th style={{ textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>{category.category_name}</td>
              <td>{category.aux_description || "Sin descripción"}</td>
              <td>
                     <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      justifyContent: "center",
                    }}
                  >

                <EditExpensesCategory category={category} />
                  </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
