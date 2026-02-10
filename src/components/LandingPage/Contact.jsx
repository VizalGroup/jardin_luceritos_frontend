import { useState } from 'react'
import { FaInstagram, FaWhatsapp, FaClock, FaMapMarkerAlt } from 'react-icons/fa'
import NavigationBar from './NavigationBar'

export default function Contact() {
  document.title = "Contacto - Luceritos Jardín Maternal";
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [selectedSede, setSelectedSede] = useState('laplace')

  const mapUrls = {
    laplace: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3404.8357891234567!2d-64.2089!3d-31.3856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9432a2f2f2f2f2f2%3A0x1234567890abcdef!2sPedro%20Sim%C3%B3n%20Laplace%205640%2C%20C%C3%B3rdoba!5e0!3m2!1ses!2sar!4v1234567890123!5m2!1ses!2sar',
    docta: 'https://www.google.com/maps?q=-31.4607141,-64.308651&z=16&output=embed'
  }

  const handleWhatsAppClick = () => {
    setShowWhatsAppModal(true)
  }

  const handleWhatsAppChoice = (sede) => {
    const number = sede === 'laplace' ? '5493512489805' : '5493512434546'
    window.open(`https://wa.me/${number}`, '_blank')
    setShowWhatsAppModal(false)
  }

  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/luceritos_espacio', '_blank')
  }

  return (
    <div className="home-wrapper">
      <NavigationBar />
      
      <section className="contact-section">
        <h2 className="contact-title">CONTACTO</h2>
        
        <div className="contact-container">
          <div className="contact-card">
            <div className="contact-icon-group">
              <div className="contact-social-icon" onClick={handleInstagramClick}>
                <FaInstagram />
              </div>
              <div className="contact-social-icon" onClick={handleWhatsAppClick}>
                <FaWhatsapp />
              </div>
            </div>
            <h3 className="contact-card-title">Redes Sociales</h3>
            <p className="contact-description">
              Síguenos en Instagram o escríbenos por WhatsApp para conocer más sobre nuestras actividades diarias.
            </p>
          </div>
          <div className="contact-card">
            <div className="contact-icon">
              <FaClock />
            </div>
            <h3 className="contact-card-title">Horario de atención</h3>
            <p className="contact-description">
              <strong>Sede Laplace:</strong> Lunes a Viernes, 7:00 a 19:00 hs
              <br />
              <strong>Sede Docta:</strong> Lunes a Viernes, 7:00 a 18:00 hs
            </p>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <FaMapMarkerAlt />
            </div>
            <h3 className="contact-card-title">Visítanos</h3>
            <p className="contact-description">
              <strong>Sede Laplace:</strong> Pedro Simón Laplace N°5640, B° Villa Belgrano
              <br />
              <strong>Sede Docta:</strong> Av. de los Ejidos, Mzna 44 Lote 15, Docta Urbanización
            </p>
          </div>
        </div>

        <hr className="section-divider" />

        <div className="map-container">
          <h3 className="map-title">¿Cómo llegar?</h3>
          <div className="map-buttons">
            <button
              className={`map-button ${selectedSede === 'laplace' ? 'active' : ''}`}
              type="button"
              onClick={() => setSelectedSede('laplace')}
            >
              Sede Laplace
            </button>
            <button
              className={`map-button ${selectedSede === 'docta' ? 'active' : ''}`}
              type="button"
              onClick={() => setSelectedSede('docta')}
            >
              Sede Docta
            </button>
          </div>
          <div className="map-wrapper">
            <iframe
              src={mapUrls[selectedSede]}
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Ubicación de Sede ${selectedSede === 'laplace' ? 'Laplace' : 'Docta'}`}
            ></iframe>
          </div>
        </div>

        {showWhatsAppModal && (
          <div className="whatsapp-modal-backdrop" onClick={() => setShowWhatsAppModal(false)}>
            <div className="whatsapp-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <h3 className="whatsapp-modal-title">¿Con qué sede querés comunicarte?</h3>
              <div className="whatsapp-modal-actions">
                <button className="whatsapp-option" type="button" onClick={() => handleWhatsAppChoice('laplace')}>
                  Sede Laplace
                </button>
                <button className="whatsapp-option" type="button" onClick={() => handleWhatsAppChoice('docta')}>
                  Sede Docta
                </button>
              </div>
              <button className="whatsapp-cancel" type="button" onClick={() => setShowWhatsAppModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
