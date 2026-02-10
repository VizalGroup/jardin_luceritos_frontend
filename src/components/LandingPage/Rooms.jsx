import { BiDrink } from 'react-icons/bi'
import { GiDeer, GiWhaleTail } from 'react-icons/gi'
import { LuBird } from "react-icons/lu";


export default function Rooms() {
  return (
    <section className="rooms-section">
      <h2 className="rooms-title">NUESTRAS SALAS</h2>
      
      <div className="rooms-container">
        <div className="room-card">
          <div className="room-icon">
            <GiDeer />
          </div>
          <h3 className="room-name">SEMILLITAS</h3>
          <p className="room-description">
            En sala semillas acompañamos los primeros vínculos y descubrimientos de la vida fuera del hogar. Es un espacio pensado para ofrecer contención, ternura y seguridad.
          </p>
        </div>

        <div className="room-card">
          <div className="room-icon">
            <LuBird />
          </div>
          <h3 className="room-name">PRIMEROS PASOS Y EXPLORADORES</h3>
          <p className="room-description">
            Desde los 15 a 24 meses recibimos a niño que exploran el mundo con curiosidad y movimiento. En esta etapa la autonomía y el juego libre se vuelven protagonistas.
          </p>
        </div>

        <div className="room-card">
          <div className="room-icon">
            < GiWhaleTail/>
          </div>
          <h3 className="room-name">PEQUEÑOS EXPERTOS</h3>
          <p className="room-description">
            Desde los 24 a 36 meses invitamos a descubrir, crear y expresarse con confianza. Fortalecemos la autonomía, el lenguaje y el trabajo en equipo acompañado de propuestas pedagógicas.
          </p>
        </div>
      </div>
    </section>
  )
}
