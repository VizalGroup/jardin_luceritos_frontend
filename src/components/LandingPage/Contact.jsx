import { FaInstagram, FaWhatsapp, FaClock, FaMapMarkerAlt } from 'react-icons/fa'
import NavigationBar from './NavigationBar'

export default function Contact() {
  document.title = "Contacto - Luceritos Jardín Maternal";
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/5493512489805', '_blank')
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
              Lunes a Viernes
              <br />
              7:00 a 19:00 hs
            </p>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <FaMapMarkerAlt />
            </div>
            <h3 className="contact-card-title">Visítanos</h3>
            <p className="contact-description">
              Pedro Simón Laplace N°5640
              <br />
              B° Villa Belgrano
              <br />
              Córdoba, Argentina
            </p>
          </div>
        </div>

        <hr className="section-divider" />

        <div className="map-container">
          <h3 className="map-title">¿Cómo llegar?</h3>
          <div className="map-wrapper">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3404.8357891234567!2d-64.2089!3d-31.3856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9432a2f2f2f2f2f2%3A0x1234567890abcdef!2sPedro%20Sim%C3%B3n%20Laplace%205640%2C%20C%C3%B3rdoba!5e0!3m2!1ses!2sar!4v1234567890123!5m2!1ses!2sar"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de Jardín Luceritos"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  )
}
