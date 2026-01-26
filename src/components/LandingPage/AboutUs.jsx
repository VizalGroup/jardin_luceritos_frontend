import React from 'react'
import LargeImage from '../../assets/Entrada_1.jpg'
import LargeImage2 from '../../assets/gallery_2.jpeg'
import NavigationBar from './NavigationBar'

export default function AboutUs() {
  document.title = "Sobre Nosotros - Luceritos Jardín Maternal";
  return (
    <div className="home-wrapper">
      <NavigationBar />
      
      <section className="about-us-section">
        <div className="about-us-container">
          <h2 className="about-us-title">Sobre Nosotros</h2>
          <h3 className="about-us-subtitle">ESPACIO LUCERITOS</h3>
          
          <hr className="section-divider" />
          
          <div className="about-us-image-wrapper">
            <img src={LargeImage} alt="Espacio Luceritos" className="about-us-large-image" />
          </div>

          <h4 className="about-us-section-title">Nuestra Historia</h4>
          
          <div className="about-us-text">
            <p>
              Luceritos Jardín Maternal es un espacio pensado para acompañar los primeros años de vida de niños y niñas, 
              ofreciendo un ambiente cálido, seguro y estimulante. Con más de 15 años de trayectoria, nos especializamos 
              en brindar una educación integral basada en el respeto por los tiempos individuales de cada niño.
            </p>
            <p>
              Nuestro enfoque pedagógico se fundamenta en las inteligencias múltiples, promoviendo el desarrollo de todas 
              las capacidades de los niños a través del juego, la exploración y la creatividad. Creemos firmemente que cada 
              niño es único y merece un acompañamiento personalizado que potencie sus fortalezas y respete su ritmo de aprendizaje.
            </p>
            <p>
              El equipo de Luceritos está conformado por profesionales comprometidos con la primera infancia, quienes trabajan 
              día a día para crear experiencias significativas que favorezcan el desarrollo emocional, social, cognitivo y físico 
              de cada niño. Valoramos profundamente el vínculo con las familias, considerándolas parte fundamental del proceso educativo.
            </p>
          </div>

          <div className="about-us-image-wrapper">
            <img src={LargeImage2} alt="Espacio Luceritos" className="about-us-large-image" />
          </div>
        </div>
      </section>
    </div>
  )
}
