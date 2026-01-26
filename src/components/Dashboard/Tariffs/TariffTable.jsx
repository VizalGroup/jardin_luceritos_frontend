import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetTariffs } from "../../../redux/actions";
import { Table } from "react-bootstrap";
import { formatCurrency, formatDate, formatHours } from "../../../utils";
import EditTariff from "./EditTariff";

export default function TariffTable() {
  const dispatch = useDispatch();
  const tariffs = useSelector((state) => state.tariffs);

  // const nonTariffed = tariffs.find((tariff) => tariff.number_of_hours == 0);
  const realTariffs =
    tariffs?.filter((tariff) => tariff.number_of_hours > 0) || [];
  const extrahour = tariffs?.find((tariff) => tariff.number_of_hours == 0);
  // const infants = useSelector((state) => state.infants); // Aún no implementado

  useEffect(() => {
    dispatch(GetTariffs());
  }, [dispatch]);

  const calculateHourlyValue = (tariff) => {
    const hours = parseFloat(tariff.number_of_hours);
    const price = parseFloat(tariff.price);
    const workingDays = 20;

    if (isNaN(hours) || isNaN(price) || hours === 0) {
      return "No se puede calcular";
    }

    const totalHoursPerMonth = hours * workingDays;
    const hourlyValue = price / totalHoursPerMonth;
    return hourlyValue.toFixed(2);
  };

  // Función para calcular cuántos infantes tienen cada tarifa (aún no implementado)
  // const countInfantsByTariff = (tariffId) => {
  //   if (!infants || !infants.length) return 0;
  //   return infants.filter((infant) => infant.id_tariff === tariffId).length;
  // };

  // Función para contar infantes becados (tarifa con horas = 0)
  // const countScholarshipInfants = () => {
  //   if (!infants || !infants.length || !nonTariffed) return 0;
  //   return infants.filter((infant) => infant.id_tariff === nonTariffed.id).length;
  // };

  // Ordenar tarifas por número de horas
  const sortedRealTariffs = [...realTariffs].sort(
    (a, b) => parseFloat(a.number_of_hours) - parseFloat(b.number_of_hours),
  );

  return (
    <>
      <div style={{ overflowX: "auto" }}>
        <Table striped bordered hover style={{ textAlign: "center" }}>
          <thead>
            <tr>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>
                Precio por hora
                <br />
                <small className="text-muted">Promedio 20 días hábiles</small>
              </th>
              <th>Última modificación</th>
              {/* <th>Cantidad de alumnos</th> */}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
               Hora extra
              </td>
              <td>{formatCurrency(extrahour?.price)} </td>
              <td>No corresponde</td>
              <td>{formatDate(extrahour?.last_update)}</td>
              {/* <td>{countInfantsByTariff(extrahour?.id)}</td> */}
              <td>
                {extrahour != undefined ? (
                  <EditTariff tariff={extrahour} />
                ) : (
                  <span>No disponible</span>
                )}
              </td>
            </tr>
            {/* <tr>
              <td>Becados</td>
              <td>-</td>
              <td>-</td>
              <td>{formatDate(nonTariffed?.last_update)}</td>
              <td>{countScholarshipInfants()}</td>
              <td>-</td>
            </tr> */}

            {/* Filas para cada tarifa ordenadas por número de horas */}
            {sortedRealTariffs.map((tariff) => (
              <tr key={tariff.id}>
                <td>{formatHours(tariff.number_of_hours)}</td>
                <td>{formatCurrency(tariff.price)} </td>
                <td>{formatCurrency(calculateHourlyValue(tariff))}</td>
                <td>{formatDate(tariff.last_update)}</td>
                {/* <td>{countInfantsByTariff(tariff.id)}</td> */}
                <td>
                  <EditTariff tariff={tariff} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}
