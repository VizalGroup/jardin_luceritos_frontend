import { useState } from "react";
import { Modal } from "react-bootstrap";
import Image1 from "../../assets/gallery_1.jpeg";
import Image2 from "../../assets/gallery_2.jpeg";
import Image3 from "../../assets/gallery_3.jpeg";
import Image4 from "../../assets/gallery_4.jpeg";
import Image5 from "../../assets/gallery_5.jpeg";
import Image6 from "../../assets/gallery_6.jpeg";
import Image7 from "../../assets/gallery_7.jpeg";
import Image8 from "../../assets/gallery_8.jpeg";
import Image9 from "../../assets/gallery_9.jpeg";
import NavigationBar from "./NavigationBar";

export default function Gallery() {
  document.title = "Galería - Luceritos Jardín Maternal";
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const images = [
    { id: 1, src: Image1, alt: "Jardín Luceritos" },
    { id: 2, src: Image2, alt: "Instalaciones del jardín" },
    { id: 3, src: Image3, alt: "Actividades en el jardín" },
    { id: 4, src: Image4, alt: "Espacios del jardín" },
    { id: 5, src: Image5, alt: "Momentos especiales" },
    { id: 6, src: Image6, alt: "Niños jugando" },
    { id: 7, src: Image7, alt: "Áreas recreativas" },
    { id: 8, src: Image8, alt: "Actividades diarias" },
    { id: 9, src: Image9, alt: "Nuestro jardín" },
  ];

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  return (
    <div className="home-wrapper">
    <NavigationBar />
      <section className="gallery-section" id="galeria">
        <h2 className="gallery-title">Galería</h2>

        <div className="gallery-grid">
          {images.map((image) => (
            <div
              key={image.id}
              className="gallery-item"
              onClick={() => handleImageClick(image)}
            >
              <div className="gallery-image-wrapper">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="gallery-image"
                />
              </div>
            </div>
          ))}
        </div>

        <Modal
          show={showModal}
          onHide={handleCloseModal}
          centered
          size="lg"
          className="gallery-modal"
        >
          {selectedImage && (
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="gallery-modal-image"
            />
          )}
        </Modal>
      </section>
    </div>
  );
}
