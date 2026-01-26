import { useEffect } from "react";
import { GetTariffs } from "../../../redux/actions";
import NavBarDB from "../NavBarDB";
import { useDispatch } from "react-redux";
import BackButton from "../../BackButton";
import AddTariff from "./AddTariff";
import TariffTable from "./TariffTable";

export default function Tariffs() {
  document.title = "Tarifas - Jardín Luceritos";
  const dispatch = useDispatch();

  useEffect(() => {
    // dispatch(GetInfants());
    dispatch(GetTariffs());
  }, [dispatch]);
  return (
    <div className="watermark-background">
      <NavBarDB />
      <div className="container" style={{ marginTop: "100px" }}>
        <div className="d-flex gap-3 mb-4">
          <BackButton />
          <AddTariff />
        </div>
        <h2 className="text-center module-title">Gestión de Tarifas</h2>
        <TariffTable />
      </div>
    </div>
  );
}
