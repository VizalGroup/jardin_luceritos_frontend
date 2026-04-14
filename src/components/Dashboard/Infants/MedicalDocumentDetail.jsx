import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Form, Spinner, Alert } from "react-bootstrap";
import {
  FaFileMedical,
  FaUpload,
  FaTrash,
  FaEdit,
  FaListAlt,
} from "react-icons/fa";
import {
  UpdateMedicalDocument,
  DeleteMedicalDocument,
  GetMedicalDocuments,
} from "../../../redux/actions";
import { capitalizeName, formatDateTime, getCurrentDateTime, getMedicalDocumentType, SaveFileToDrive } from "../../../utils";


export default function MedicalDocumentDetail({ doc }) {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.authenticatedUser?.id);
  const isParent = useSelector((state) => state.authenticatedUser?.user_role === 3);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [editDocType, setEditDocType] = useState(String(doc.file_type));
  const [editDocUrl, setEditDocUrl] = useState(doc.file_url);
  const [fileUploading, setFileUploading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOpen = () => {
    setEditing(false);
    setConfirming(false);
    setError(null);
    setEditDocType(String(doc.file_type));
    setEditDocUrl(doc.file_url);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditing(false);
    setConfirming(false);
    setError(null);
    setEditDocType(String(doc.file_type));
    setEditDocUrl(doc.file_url);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError(null);
    try {
      setFileUploading(true);
      const fileUrl = await SaveFileToDrive(e);
      setEditDocUrl(fileUrl);
    } catch (err) {
      setError("Error al subir el archivo: " + err.message);
    } finally {
      setFileUploading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setError(null);
    try {
      await dispatch(
        UpdateMedicalDocument(doc.id, {
          id_infant: doc.id_infant,
          file_url: editDocUrl,
          file_type: editDocType,
          uploaded_by: userId,
          created_at: doc.created_at,
          updated_at: getCurrentDateTime(),
        })
      );
      await dispatch(GetMedicalDocuments());
      setEditing(false);
    } catch (err) {
      setError("Error al actualizar el documento: " + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setError(null);
    try {
      await dispatch(DeleteMedicalDocument(doc.id));
      await dispatch(GetMedicalDocuments());
      setShowModal(false);
    } catch (err) {
      setError("Error al eliminar el documento: " + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div
        role="button"
        onClick={handleOpen}
        style={{
          cursor: "pointer",
          display: "inline-block",
          fontSize: "0.85em",
          color: "#0d6efd",
          textDecoration: "underline",
        }}
      >
        {getMedicalDocumentType(doc.file_type)}
      </div>

      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaFileMedical className="me-2" />
            {editing ? "Editar documento médico" : "Documento médico"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {!editing ? (
            <div>
              <p className="fw-bold mb-3">{getMedicalDocumentType(doc.file_type)}</p>
              <p>
                <strong>Archivo:</strong>{" "}
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                  Ver documento
                </a>
              </p>
              <p>
                <strong>Subido por:</strong>{" "}
                {doc.uploaded_by
                  ? `${capitalizeName(doc.uploaded_by.first_name)} ${capitalizeName(doc.uploaded_by.lastname)}`
                  : "-"}
              </p>
              <p>
                <strong>Creación:</strong>{" "}
                {formatDateTime(doc.created_at)}
              </p>
              <p className="mb-0">
                <strong>Última actualización:</strong>{" "}
                {formatDateTime(doc.updated_at)}
              </p>

              {confirming && (
                <Alert variant="warning" className="mt-3">
                  ¿Estás seguro de que deseas eliminar este documento?
                  <div className="d-flex gap-2 mt-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "Sí, eliminar"
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setConfirming(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </Alert>
              )}
            </div>
          ) : (
            <Form onSubmit={handleEditSubmit} id={`editMedDocForm-${doc.id}`}>
              <Form.Group controlId={`editDocType-${doc.id}`} className="mb-3">
                <Form.Label>
                  <FaListAlt className="me-1" />
                  Tipo de documento
                </Form.Label>
                <Form.Select
                  value={editDocType}
                  onChange={(e) => setEditDocType(e.target.value)}
                  required
                  disabled={fileUploading || editLoading}
                >
                  <option value="0">Ficha médica</option>
                  <option value="1">Carnet de vacunas</option>
                  <option value="2">Credencial de obra social/prepaga</option>
                  <option value="3">Otros</option>
                </Form.Select>
              </Form.Group>

              <Form.Group controlId={`editDocFile-${doc.id}`} className="mb-3">
                <Form.Label>
                  <FaUpload className="me-1" />
                  Reemplazar archivo (opcional)
                </Form.Label>
                <Form.Control
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange}
                  disabled={fileUploading || editLoading}
                />
              </Form.Group>

              {fileUploading && (
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Spinner animation="border" size="sm" />
                  <span>Subiendo archivo...</span>
                </div>
              )}

              <p className="text-muted" style={{ fontSize: "0.85em" }}>
                Archivo actual:{" "}
                <a href={editDocUrl} target="_blank" rel="noopener noreferrer">
                  Ver documento actual
                </a>
              </p>
            </Form>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button className="button" variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>

          {!editing && !confirming && (
            <>
              <Button className="button" onClick={() => setEditing(true)}>
                <FaEdit className="me-1" />
                Editar
              </Button>
              {!isParent && (
                <Button
                  className="button"
                  variant="danger"
                  onClick={() => setConfirming(true)}
                >
                  <FaTrash className="me-1" />
                  Eliminar
                </Button>
              )}
            </>
          )}

          {editing && (
            <>
              <Button
                className="button"
                variant="secondary"
                onClick={() => {
                  setEditing(false);
                  setError(null);
                  setEditDocType(String(doc.file_type));
                  setEditDocUrl(doc.file_url);
                }}
              >
                Volver
              </Button>
              <Button
                className="button"
                type="submit"
                form={`editMedDocForm-${doc.id}`}
                disabled={fileUploading || editLoading}
              >
                {editLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Guardando...
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}
