import Picture_1 from "../../assets/Entrada_1.jpg";
import NavigationBar from "./NavigationBar";
import Rooms from "./Rooms";
import OurApproach from "./OurApproach";
import WhatFamiliesSay from "./WhatFamiliesSay";

export default function Home() {
  return (
    <div className="home-wrapper">
      <NavigationBar />

      <section className="hero-section">
        <img src={Picture_1} alt="Jardín Luceritos" className="hero-image" />
        <div className="hero-overlay">
          <div className="hero-content ">
            <h1 className="hero-title">LUCERITOS</h1>
            <h2 className="hero-subtitle">Jardín Maternal</h2>
            <p className="hero-text">Más de 15 años acompañando infancias.</p>
          </div>
        </div>
      </section>

      <hr className="section-divider" />
      <Rooms />
      <hr className="section-divider" />
      <OurApproach />
      <hr className="section-divider" />
      <WhatFamiliesSay />
    </div>
  );
}
