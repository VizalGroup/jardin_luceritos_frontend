import { Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { selectActiveInfantsOrderedByLastName } from "../../../redux/selectors";
import { formatDate, formatDNI } from "../../../utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa";

export default function InfantListPDF() {
  const infants = useSelector(selectActiveInfantsOrderedByLastName);

  const generatePDF = () => {
    if (!infants || infants.length === 0) {
      alert("No hay datos de alumnos para generar el reporte");
      return;
    }

    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString("es-AR");
    const currentTime = new Date().toLocaleTimeString("es-AR");

    // Título solo en primera página
    doc.setFontSize(16);
    doc.text("LISTADO DE ALUMNOS", doc.internal.pageSize.getWidth() / 2, 15, {
      align: "center",
    });
    doc.setFontSize(10);
    doc.text(`Fecha del reporte: ${currentDate}`, 14, 22);

    const tableData = infants
      .map((infant, index) => {
        if (!infant) return null;

        const formattedDNI = formatDNI(infant.document_number); // Cambiado de dni a document_number

        return [
          (index + 1).toString(),
          infant.lastname.toUpperCase(), // Cambiado de last_name a lastname
          infant.first_name.toUpperCase(),
          formattedDNI,
          formatDate(infant.birthdate),
        ];
      })
      .filter(Boolean);

    if (tableData.length === 0) {
      alert("No hay datos válidos de alumnos para generar el reporte");
      return;
    }

    // Variable para almacenar el total de páginas
    let totalPages = 1;

    autoTable(doc, {
      startY: 27,
      head: [["#", "APELLIDO", "NOMBRE", "DNI", "FECHA DE NACIMIENTO"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [68, 94, 108],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: "linebreak",
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { fontStyle: "bold" },
        2: {},
        3: { halign: "center" },
        4: { halign: "center" },
      },
      didDrawPage: function (data) {
        // Solo actualizar totalPages en la última página
        if (data.pageCount == data.pageNumber) {
          totalPages = data.pageNumber;
        }

        // Mostrar numeración correcta
        doc.setFontSize(8);
        doc.text(
          `Página ${data.pageNumber} de ${totalPages}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10,
        );
      },
    });

    const finalY = doc.lastAutoTable?.finalY || 27 + tableData.length * 10;

    doc.setFontSize(9);
    doc.text(`Total de alumnos: ${tableData.length}`, 14, finalY + 15);
    doc.text(
      `Documento generado el ${currentTime}`,
      doc.internal.pageSize.getWidth() - 14,
      finalY + 15,
      { align: "right" },
    );

    doc.save("listado-alumnos.pdf");
  };

  return (
    <Button className="button" onClick={generatePDF} variant="danger">
      <FaFilePdf style={{ marginRight: "5px" }} /> Descargar Lista de Infantes
    </Button>
  );
}
