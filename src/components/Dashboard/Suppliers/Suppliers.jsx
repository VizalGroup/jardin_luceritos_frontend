import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectSortedSuppliers } from "../../../redux/selectors";
import { GetSuppliers } from "../../../redux/actions";
import NavBarDB from "../NavBarDB";
import BackButton from "../../BackButton";
import SearchBar from "../../SearchBar";
import AddSupplier from "./AddSupplier";
import { normalizeText } from "../../../utils";
import SuppliersTable from "./SuppliersTable";

export default function Suppliers() {
  document.title = "Proveedores - Jardín Luceritos";
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const suppliers = useSelector(selectSortedSuppliers);

  useEffect(() => {
    dispatch(GetSuppliers());
  }, [dispatch]);

    // Filtrar proveedores por nombre, teléfono o notas
  const filteredSuppliers = suppliers.filter((supplier) => {
    const normalizedSearch = normalizeText(searchTerm);
    return (
      (supplier.supplier_name && normalizeText(supplier.supplier_name).includes(normalizedSearch)) ||
      (supplier.phone && supplier.phone.includes(searchTerm)) ||
      (supplier.notes && normalizeText(supplier.notes).includes(normalizedSearch))
    );
  });

  return (
    <div className="watermark-background">
      <NavBarDB />
      <div className="container" style={{ marginTop: "100px" }}>
        <div className="d-flex gap-3 mb-4">
          <BackButton />
          <AddSupplier />
        </div>
        <h2 className="text-center module-title">Proveedores</h2>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Buscar por nombre"
        />
        <SuppliersTable suppliers={filteredSuppliers} />
      </div>
    </div>
  );
}
