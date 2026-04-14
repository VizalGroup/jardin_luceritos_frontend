import { useEffect, useState } from "react";
import BackButton from "../../../BackButton";
import NavBarDB from "../../NavBarDB";
import { useDispatch, useSelector } from "react-redux";
import { selectSortedExpenseCategories } from "../../../../redux/selectors";
import { GetExpenseCategories } from "../../../../redux/actions";
import AddExpensesCategory from "./AddExpensesCategory";
import ExpensesCategoriesTable from "./ExpensesCategoriesTable";

export default function ExpensesCategories() {
  document.title = "Categorías de Gastos - Jardín de Corazones Alegres";
  const dispatch = useDispatch();
  const expenseCategories = useSelector(selectSortedExpenseCategories);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      await dispatch(GetExpenseCategories());

      setIsLoading(false);
    };
    loadCategories();
  }, [dispatch]);

  return (
    <>
      <NavBarDB />
      <div className="container" style={{ marginTop: "100px" }}>
        <div className="d-flex gap-3 mb-4">
          <BackButton />
          <AddExpensesCategory />
        </div>

        <div c>
          <h3 className="text-center module-title">Categorías de Gastos</h3>
          <ExpensesCategoriesTable
            categories={expenseCategories}
            isLoading={isLoading}
          />
        </div>
      </div>
    </>
  );
}
