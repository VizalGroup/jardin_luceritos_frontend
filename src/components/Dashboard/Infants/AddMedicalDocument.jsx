import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { FaFileMedical, FaListAlt, FaUpload } from "react-icons/fa";
import { PostMedicalDocument, GetMedicalDocuments } from "../../../redux/actions";
import { capitalizeName, getCurrentDateTime, getMedicalDocumentType, SaveFileToDrive } from "../../../utils";


export default function AddMedicalDocument({ infant }) {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.authenticatedUser?.id);
  const allDocs = useSelector((state) => state.medical_documents);
  const infantDocs = allDocs.filter((doc) => doc.id_infant === infant?.id);
  const uploadedTypes = infantDocs.map((doc) => parseInt(doc.file_type));

  const [showModal, setShowModal] = useState(false);
  const [docUrl, setDocUrl] = useState(null);
  const [docFileType, setDocFileType] = useState("");
  const [docType, setDocType] = useState("");
  const [fileUploading, setFileUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => handleClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleOpen = () => {
    setDocUrl(null);
    setDocFileType("");
    setDocType("");
    setSuccess(false);
    setError(null);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setDocUrl(null);
    setDocFileType("");
    setDocType("");
    setSuccess(false);
    setError(null);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError(null);
    try {
      setFileUploading(true);
      const fileUrl = await SaveFileToDrive(e);
      setDocUrl(fileUrl);
      setDocFileType(file.type);
    } catch (err) {
      setError("Error al subir el archivo: " + err.message);
    } finally {
      setFileUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!docUrl) {
      setError("Debes subir un documento primero.");
      return;
    }
    if (docType === "") {
      setError("Debes seleccionar el tipo de documento.");
      return;
    }
    const now = getCurrentDateTime();
    setLoading(true);
    setError(null);
    try {
      await dispatch(
        PostMedicalDocument({
          id_infant: infant.id,
          file_url: docUrl,
          file_type: docType,
          uploaded_by: userId,
          created_at: now,
          updated_at: now,
        })
      );
      await dispatch(GetMedicalDocuments());
      setSuccess(true);
    } catch (err) {
      setError("Error al guardar el documento: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={`tooltip-medical-${infant.id}`}>Agregar documento médico</Tooltip>}
      >
        <Button className="button-custom" onClick={handleOpen}>
          <FaFileMedical />
        </Button>
      </OverlayTrigger>

      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaFileMedical className="me-2" />
            Documento médico
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            <strong>Infante:</strong>{" "}
            {capitalizeName(infant.lastname)}, {capitalizeName(infant.first_name)}
          </p>
          {success ? (
            <Alert variant="success">
              Documento médico guardado correctamente.
            </Alert>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId={`medicalDocType-${infant.id}`} className="mb-3">
                <Form.Label><FaListAlt className="me-1" />Tipo de documento</Form.Label>
                <Form.Select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  required
                  disabled={fileUploading || loading}
                >
                  <option value="" disabled>Seleccionar tipo...</option>
                  {[0, 1, 2].map((type) => {
                    const alreadyUploaded = uploadedTypes.includes(type);
                    return (
                      <option key={type} value={String(type)} disabled={alreadyUploaded}>
                        {alreadyUploaded
                          ? `${getMedicalDocumentType(type)} — ya cargada (editá para actualizar)`
                          : getMedicalDocumentType(type)}
                      </option>
                    );
                  })}
                  <option value="3">Otros</option>
                </Form.Select>
              </Form.Group>

              <Form.Group controlId={`medicalDoc-${infant.id}`} className="mb-3">
                <Form.Label><FaUpload className="me-1" />Seleccionar archivo</Form.Label>
                <Form.Control
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange}
                  disabled={fileUploading || loading}
                />
              </Form.Group>

              {fileUploading && (
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Spinner animation="border" size="sm" />
                  <span>Subiendo archivo...</span>
                </div>
              )}

              {docUrl && !fileUploading && (
                <Alert variant="info" className="mb-3">
                  Archivo subido. Listo para guardar.
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              <div className="d-flex justify-content-end gap-2">
                <Button
                  className="button"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  className="button"
                  type="submit"
                  disabled={!docUrl || fileUploading || loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar documento"
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}
