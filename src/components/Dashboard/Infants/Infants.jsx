import { useEffect, useState } from "react";
import BackButton from "../../BackButton";
import { useDispatch, useSelector } from "react-redux";
import { GetFamilyRelationships, GetInfants, GetTariffs, GetUsers } from "../../../redux/actions";
import { selectInfantsOrderedByLastName } from "../../../redux/selectors";
import NavBarDB from "../NavBarDB";
import AddInfant from "./AddInfant";
import InfantListPDF from "./InfantListPDF";
import InfantsTable from "./InfantsTable";
import SearchBar from "../../SearchBar";

export default function Infants() {
  document.title = "Infantes - Jardín Luceritos";
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const infants = useSelector(selectInfantsOrderedByLastName);

  useEffect(() => {
    dispatch(GetInfants());
    dispatch(GetTariffs());
    dispatch(GetFamilyRelationships());
    dispatch(GetUsers());
  }, [dispatch]);

  return (
    <div className="watermark-background">
      <NavBarDB />
      <div className="container" style={{ marginTop: "100px" }}>
        <div className="d-flex gap-3 mb-4">
          <BackButton />
          <AddInfant />
          <InfantListPDF />
        </div>
        <h2 className="text-center module-title">Infantes</h2>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Buscar por nombre o apellido..."
        />
        <InfantsTable infants={infants} searchTerm={searchTerm} />
      </div>
    </div>
  );
}
