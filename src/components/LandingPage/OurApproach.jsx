import { Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Girlphoto from '../../assets/OurApproach.jpg'

export default function OurApproach() {
  const navigate = useNavigate()

  const handleNavigate = () => {
    navigate('/sobre_nosotros')
    window.scrollTo(0, 0)
  }

  return (
    <section className="our-approach-section">
      <div className="our-approach-container">
        <div className="approach-image-wrapper">
          <div 
            className="approach-image"
            style={{
              backgroundImage: `url(${Girlphoto})`
            }}
          />
        </div>

        <div className="approach-content">
          <h2 className="approach-title">NUESTRO ENFOQUE</h2>
          <p className="approach-description">
            En Luceritos Jardín Maternal, acompañamos la primera infancia desde una mirada integral, basada en las inteligencias múltiples.
          </p>
          <p className="approach-description">
            Creemos en una educación que respeta los tiempos individuales, promueve la autonomía y valora el juego como principal forma de aprendizaje.
          </p>
          <div className="approach-button-container">
            <Button className="btn-know-more" onClick={handleNavigate}>
              Conócenos
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
