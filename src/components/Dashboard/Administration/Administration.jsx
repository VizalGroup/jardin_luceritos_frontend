import { useEffect } from "react";
import NavBarDB from "../NavBarDB";
import BackButton from "../../BackButton";
import { useDispatch } from "react-redux";
import {
  GetCharges,
  GetFamilyRelationships,
  GetInfants,
} from "../../../redux/actions";
import AddCharge from "./AddCharge";
import GenerateQuotas from "./GenerateQuotas";
import ChargesTable from "./ChargesTable";
import BulkWhatsAppReminder from "./BulkWhatsAppReminder";

export default function Administration() {
  document.title = "Administración - Jardín Luceritos";
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(GetInfants());
    dispatch(GetCharges());
    dispatch(GetFamilyRelationships());
  }, [dispatch]);

  return (
    <div className="watermark-background">
      <NavBarDB />
      <div className="container" style={{ marginTop: "100px" }}>
        <div className="d-flex gap-3 mb-4">
          <BackButton />
          <AddCharge />
          <GenerateQuotas />
          <BulkWhatsAppReminder />
        </div>
        <ChargesTable />
      </div>
    </div>
  );
}
