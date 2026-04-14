import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadImageToCloudinary, capitalizeName } from "../../../utils";
import {
  UpdateAuthorizedPerson,
  GetAuthorizedPersons,
  DeleteAuthorizedPersonInfantLink,
  GetAuthorizedPersonInfantsLinks,
  PostAuthorizedPersonInfantLink
} from "../../../redux/actions";
import { Button, Form, Modal, Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  FaIdCard,
  FaImage,
  FaPhone,
  FaUser,
  FaEdit,
  FaChild,
} from "react-icons/fa";
import { selectFamilyLinksOrderedByLastName } from "../../../redux/selectors";

export default function EditAuthorizedPersons({ person }) {
  const dispatch = useDispatch();
  const infants = useSelector((state) => state.infants);
  const userDetail = useSelector((state) => state.userDetail);
  const familyRelationships = useSelector(selectFamilyLinksOrderedByLastName);
  const authorized_person_infant_links = useSelector(
    (state) => state.authorized_person_infant_links
  );

  const [formData, setFormData] = useState({
    first_name: "",
    lastname: "",
    dni: "",
    url_img: "",
    phone: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pictureUrl, setPictureUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newImageFile, setNewImageFile] = useState(null);
  const [selectedInfants, setSelectedInfants] = useState([]);
  const [initialSelectedInfants, setInitialSelectedInfants] = useState([]);

  // Obtener infantes disponibles según el rol del usuario
  const getAvailableInfants = () => {
    if (userDetail?.user_role === 3) {
      // Padres solo ven sus hijos
      const userChildren = familyRelationships
        .filter((link) => link.id_user === userDetail.id)
        .map((link) => link.id_infant);
      
      return infants
        .filter((infant) => userChildren.includes(infant.id) && infant.current_state == 1)
        .sort((a, b) => a.lastname.localeCompare(b.lastname));
    }
    // Otros roles ven todos los infantes activos
    return infants
      .filter((infant) => infant.current_state == 1)
      .sort((a, b) => a.lastname.localeCompare(b.lastname));
  };

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (showModal && person) {
      setFormData({
        first_name: person.first_name || "",
        lastname: person.lastname || "",
        dni: person.dni || "",
        url_img: person.url_img || "",
        phone: person.phone || "",
      });
      setPictureUrl(person.url_img || null);
      setNewImageFile(null);
      setUploadProgress(0);

      // Obtener las relaciones existentes para esta persona
      const existingRelations = authorized_person_infant_links
        .filter(link => link.id_authorized_person === person.id)
        .map(link => link.id_infant);
      
      setSelectedInfants(existingRelations);
      setInitialSelectedInfants(existingRelations);
    }
  }, [showModal, person, authorized_person_infant_links]);

  const handleInputChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === "url_img") {
      const file = files[0];
      setNewImageFile(file);

      try {
        setLoading(true);
        const uploadedUrl = await uploadImageToCloudinary(
          file,
          setUploadProgress
        );
        setPictureUrl(uploadedUrl);
        setFormData({ ...formData, url_img: uploadedUrl });
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Error al subir la imagen");
      } finally {
        setLoading(false);
        setUploadProgress(0);
      }
    } else if (name === "phone") {
      const sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: sanitizedValue });
    } else if (name === "dni") {
      const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      setFormData({ ...formData, [name]: sanitizedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleInfantChange = (infantId) => {
    setSelectedInfants(prevSelected => {
      if (prevSelected.includes(infantId)) {
        return prevSelected.filter(id => id !== infantId);
      } else {
        return [...prevSelected, infantId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Actualizar datos de la persona autorizada
      await dispatch(UpdateAuthorizedPerson(person.id, formData));

      // 2. Gestionar relaciones con infantes
      const infantsToRemove = initialSelectedInfants.filter(
        infantId => !selectedInfants.includes(infantId)
      );
      const infantsToAdd = selectedInfants.filter(
        infantId => !initialSelectedInfants.includes(infantId)
      );

      // Eliminar relaciones que se destildaron
      for (const infantId of infantsToRemove) {
        const linkToDelete = authorized_person_infant_links.find(
          link => link.id_authorized_person === person.id && link.id_infant === infantId
        );
        if (linkToDelete) {
          await dispatch(DeleteAuthorizedPersonInfantLink(linkToDelete.id));
        }
      }

      // Agregar nuevas relaciones
      for (const infantId of infantsToAdd) {
        await dispatch(PostAuthorizedPersonInfantLink({
          id_authorized_person: person.id,
          id_infant: infantId
        }));
      }

      // 3. Refrescar datos
      await dispatch(GetAuthorizedPersons());
      await dispatch(GetAuthorizedPersonInfantsLinks());

      setTimeout(() => {
        setShowModal(false);
        setLoading(false);
      }, 500);

      alert("Persona autorizada actualizada correctamente");
    } catch (error) {
      alert("Error al actualizar persona autorizada: " + error.message);
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewImageFile(null);
    setUploadProgress(0);
    setSelectedInfants([]);
    setInitialSelectedInfants([]);
  };

  const availableInfants = getAvailableInfants();

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>Editar</Tooltip>}
      >
        <Button
          variant="warning"
          onClick={() => setShowModal(true)}
          className="button-custom"
        >
          <FaEdit />
        </Button>
      </OverlayTrigger>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar Persona Autorizada</Modal.Title>
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
                <FaImage className="me-2" /> Foto de Identificación
              </Form.Label>
              {pictureUrl && (
                <div className="mb-3">
                  <p className="text-muted">Foto actual:</p>
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
              <Form.Control
                type="file"
                name="url_img"
                onChange={handleInputChange}
                accept="image/*"
                disabled={loading}
              />
              <Form.Text className="text-muted">
                Seleccione una nueva imagen si desea cambiar la foto actual
              </Form.Text>
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
            </Form.Group>
            <br />
            <Form.Group>
              <Form.Label>
                <FaChild className="me-2" /> Infantes Autorizados
              </Form.Label>
              <Form.Text className="text-muted d-block mb-2">
                Seleccione los infantes que esta persona puede retirar. 
                Destilar un infante eliminará la autorización existente.
              </Form.Text>
              <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ced4da", borderRadius: "4px", padding: "10px" }}>
                {availableInfants.length > 0 ? (
                  availableInfants.map((infant) => (
                    <Form.Check
                      key={infant.id}
                      type="checkbox"
                      id={`infant-${infant.id}`}
                      label={`${capitalizeName(infant.lastname)} ${capitalizeName(infant.first_name)}`}
                      checked={selectedInfants.includes(infant.id)}
                      onChange={() => handleInfantChange(infant.id)}
                      disabled={loading}
                      className="mb-2"
                    />
                  ))
                ) : (
                  <p className="text-muted text-center">No hay infantes disponibles</p>
                )}
              </div>
              {selectedInfants.length > 0 ? (
                <Form.Text className="text-muted">
                  {selectedInfants.length} infante(s) seleccionado(s)
                </Form.Text>
              ) : (
                <Form.Text className="text-danger">
                  Debe seleccionar al menos un infante
                </Form.Text>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={handleCloseModal}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading || formData.dni.length < 8 || selectedInfants.length === 0}
              className="button"
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
              {loading ? "Actualizando..." : "Actualizar Persona/Permisos"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
