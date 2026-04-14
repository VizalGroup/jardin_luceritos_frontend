import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectActiveInfantsOrderedByLastName,
  selectFamilyLinksOrderedByLastName,
} from "../../../redux/selectors";
import { Button, Form, Modal, Spinner } from "react-bootstrap";
import {
  FaChild,
  FaIdCard,
  FaImage,
  FaPhone,
  FaPlus,
  FaUser,
} from "react-icons/fa";
import { authorizationFormData, uploadImageToCloudinary, capitalizeName } from "../../../utils";
import { PostAuthorizedPerson, GetAuthorizedPersons, PostAuthorizedPersonInfantLink, GetAuthorizedPersonInfantsLinks } from "../../../redux/actions";

export default function AddAuthorizedPersons() {
  const dispatch = useDispatch();
  const infants = useSelector(selectActiveInfantsOrderedByLastName);
  const familyRelationships = useSelector(selectFamilyLinksOrderedByLastName);
  const authenticatedUser = useSelector((state) => state.authenticatedUser);
  console.log(familyRelationships);
  
  const [formData, setFormData] = useState(authorizationFormData);

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pictureUrl, setPictureUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedInfants, setSelectedInfants] = useState([]);

  const getAvailableInfants = () => {
    if (authenticatedUser?.user_role === 3) {
      // Es padre/madre/tutor - mostrar solo sus hijos
      const userFamilyLinks = familyRelationships.filter(
        (link) => link.user_id === authenticatedUser.id,
      );

      return infants.filter((infant) =>
        userFamilyLinks.some((link) => link.infant_id === infant.id),
      );
    }
    // Para todos los demás roles (staff, etc.) mostrar todos los infantes activos
    return infants;
  };

  const availableInfants = getAvailableInfants();

  // Restablecer estados cuando se abre el modal
  useEffect(() => {
    if (showModal) {
      setFormData(authorizationFormData);
      setPictureUrl(null);
      setSelectedInfants([]);
    }
  }, [showModal]);

  const handleInputChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === "url_img") {
      const file = files[0];
      setFormData({ ...formData, url_img: file });

      try {
        setLoading(true);
        const uploadedUrl = await uploadImageToCloudinary(
          file,
          setUploadProgress,
        );
        setPictureUrl(uploadedUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Error al subir la imagen");
      } finally {
        setLoading(false);
        setUploadProgress(0);
      }
    } else if (name === "phone") {
      // Permitir solo números y limitar a 10 caracteres
      const sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: sanitizedValue });
    } else if (name === "dni") {
      // Permitir solo números y letras para documentos/pasaportes
      const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      setFormData({ ...formData, [name]: sanitizedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Manejar selección de infantes
  const handleInfantSelection = (infantId) => {
    setSelectedInfants((prev) => {
      if (prev.includes(infantId)) {
        return prev.filter((id) => id !== infantId);
      } else {
        return [...prev, infantId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataToSubmit = {
        first_name: formData.first_name,
        lastname: formData.lastname,
        dni: formData.dni,
        phone: formData.phone,
        url_img: pictureUrl,
      };

      // Crear la persona autorizada
      const newPersonResponse = await dispatch(
        PostAuthorizedPerson(formDataToSubmit),
      );

      // Si se creó exitosamente y hay infantes seleccionados, crear las relaciones
      if (newPersonResponse && selectedInfants.length > 0) {
        // Extraer el ID de la respuesta - la respuesta viene directamente como objeto
        const personId = newPersonResponse.payload?.id || newPersonResponse.id;

        console.log("ID de persona autorizada creada:", personId);
        console.log("Respuesta completa:", newPersonResponse);

        // Crear las relaciones con cada infante seleccionado
        for (const infantId of selectedInfants) {
          const linkData = {
            id_authorized_person: personId,
            id_infant: infantId,
          };

          console.log("Datos del enlace a crear:", linkData);

          await dispatch(PostAuthorizedPersonInfantLink(linkData));
        }

        // Actualizar las listas
        await dispatch(GetAuthorizedPersonInfantsLinks());
      }

      await dispatch(GetAuthorizedPersons());

      setTimeout(() => {
        setShowModal(false);
        setFormData(authorizationFormData);
        setPictureUrl(null);
        setSelectedInfants([]);
        setLoading(false);
      }, 500);

      alert("Persona autorizada agregada correctamente");
    } catch (error) {
      console.error("Error completo:", error);
      alert("Error al agregar persona autorizada: " + error.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="warning"
        onClick={() => setShowModal(true)}
        className="button-custom"
        
      >
        <FaPlus /> Agregar Persona Autorizada
      </Button>

       <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Agregar Persona Autorizada</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>
                <FaUser className="me-2" /> Nombre
              </Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                placeholder="Ingrese el nombre"
                value={formData.first_name}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </Form.Group>
            <br />
            <Form.Group>
              <Form.Label>
                <FaUser className="me-2" /> Apellido
              </Form.Label>
              <Form.Control
                type="text"
                name="lastname"
                placeholder="Ingrese el apellido"
                value={formData.lastname}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </Form.Group>
            <br />
            <Form.Group>
              <Form.Label>
                <FaIdCard className="me-2" /> Documento de Identidad
              </Form.Label>
              <Form.Control
                type="text"
                name="dni"
                placeholder="Ingrese el número de documento y/o pasaporte"
                value={formData.dni}
                onChange={handleInputChange}
                disabled={loading}
                minLength={8}
                required
              />
              <Form.Text className="text-muted">
                Ingrese el número de documento y/o pasaporte (mínimo 8 caracteres)
              </Form.Text>
            </Form.Group>
            <br />
            <Form.Group>
              <Form.Label>
                <FaPhone className="me-2" /> Teléfono
              </Form.Label>
              <Form.Control
                type="text"
                name="phone"
                placeholder="Ingrese el número de teléfono"
                value={formData.phone}
                onChange={handleInputChange}
                maxLength={10}
                disabled={loading}
                required
              />
              <Form.Text className="text-muted">
                Máximo 10 caracteres. No incluir 0 ni 15 al inicio.
              </Form.Text>
            </Form.Group>
            <br />
            <Form.Group>
              <Form.Label>
                <FaChild className="me-2" /> Infantes Autorizados
              </Form.Label>
              <div className="border rounded p-3" style={{ maxHeight: "200px", overflowY: "auto" }}>
                {availableInfants.length > 0 ? (
                  availableInfants.map((infant) => (
                    <Form.Check
                      key={infant.id}
                      type="checkbox"
                      id={`infant-${infant.id}`}
                      label={`${capitalizeName(infant.lastname)} ${capitalizeName(infant.first_name)}`}
                      checked={selectedInfants.includes(infant.id)}
                      onChange={() => handleInfantSelection(infant.id)}
                      disabled={loading}
                    />
                  ))
                ) : (
                  <p className="text-muted">No hay infantes disponibles</p>
                )}
              </div>
              <Form.Text className="text-muted">
                Seleccione los infantes que esta persona está autorizada a retirar
              </Form.Text>
            </Form.Group>
            <br />
            <Form.Group>
              <Form.Label>
                <FaImage className="me-2" /> Foto de Identificación
              </Form.Label>
              <Form.Control
                type="file"
                name="url_img"
                onChange={handleInputChange}
                accept="image/*"
                disabled={loading}
                required
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      {uploadProgress}%
                    </div>
                  </div>
                </div>
              )}
              {pictureUrl && (
                <div className="mt-3">
                  <img
                    src={pictureUrl}
                    alt="Persona autorizada"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "2px solid #dee2e6",
                    }}
                  />
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading || !pictureUrl || formData.dni.length < 8 || selectedInfants.length === 0}
              className="button-custom"
            >
              {loading && (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
              )}
              {loading ? "Agregando..." : "Agregar Persona"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
