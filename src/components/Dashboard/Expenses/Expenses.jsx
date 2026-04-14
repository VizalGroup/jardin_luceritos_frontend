import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  selectSortedExpenseCategories,
  selectSortedExpenses,
} from "../../../redux/selectors";
import {
  GetExpenseCategories,
  GetExpenses,
  GetSuppliers,
} from "../../../redux/actions";
import { normalizeText } from "../../../utils";
import NavBarDB from "../NavBarDB";
import BackButton from "../../BackButton";
import AddExpenses from "./AddExpenses";
import ExpensesTable from "./ExpensesTable";
import SearchBar from "../../SearchBar";

export default function Expenses() {
  document.title = "Gastos - Jardín Luceritos";
  const dispatch = useDispatch();
  const expenses = useSelector(selectSortedExpenses);
  const expensesCategories = useSelector(selectSortedExpenseCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    dispatch(GetExpenses());
    dispatch(GetExpenseCategories());
    dispatch(GetSuppliers());
  }, [dispatch]);

  // Filtrar gastos por búsqueda de texto y categoría seleccionada
  const filteredExpenses = expenses.filter((expense) => {
    const normalizedSearch = normalizeText(searchTerm);

    // Filtro por texto (ID, proveedor, categoría, usuario, notas)
    const matchesSearch =
      !searchTerm ||
      expense.id.toString().includes(searchTerm) ||
      (expense.supplier?.supplier_name &&
        normalizeText(expense.supplier.supplier_name).includes(
          normalizedSearch,
        )) ||
      (expense.category?.category_name &&
        normalizeText(expense.category.category_name).includes(
          normalizedSearch,
        )) ||
      (expense.user?.first_name &&
        normalizeText(expense.user.first_name).includes(normalizedSearch)) ||
      (expense.user?.last_name &&
        normalizeText(expense.user.last_name).includes(normalizedSearch)) ||
      (expense.notes &&
        normalizeText(expense.notes).includes(normalizedSearch));

    // Filtro por categoría
    const matchesCategory =
      !selectedCategory || expense.id_category === parseInt(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="watermark-background">
      <NavBarDB />
      <div className="container" style={{ marginTop: "100px" }}>
        <div className="d-flex gap-3 mb-4">
          <BackButton />
          <AddExpenses />
          <Link
            to="/autogestion/gastos/categorias"
            className="btn button-custom"
          >
            Categorías de Gastos
          </Link>
          <Link
            to="/autogestion/gastos/estadisticas"
            className="btn button-custom"
          >
            Estadísticas
          </Link>
        </div>
          <br />
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder="Buscar por proveedor o nota..."
          />
          <ExpensesTable expenses={filteredExpenses} />
      </div>
    </div>
  );
}
