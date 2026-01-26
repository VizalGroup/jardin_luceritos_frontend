import React from "react";
import { Carousel } from "react-bootstrap";

export default function WhatFamiliesSay() {
  const testimonials = [
    {
      id: 1,
      text: "La verdad super agradecida de la calidad humana del jardín. Mi niña esta contenta cada día que va, las seños super atentas a sus necesidades, los acompañan en cada proceso que van pasando. A medida que crecen hacen actividades diferentes como yoga, cocina, actividades ludicas.",
    },
    {
      id: 2,
      text: "Hermosa experiencia con mis 3 nietos y mi hijo que hoy tiene 18!!! Un lugar con tanto amor. Hoy mi nieto pasa con 8 años y grita mi jardín! Mi jardín!! Siempre que podemos les dejamos flores a las seños tan dulces que hay ahí.",
    },
    {
      id: 3,
      text: "Lo recomiendo, te dan toda la confianza que necesitamos para dejar a nuestros hijos. Las Seño y la directora Cecilia tienen una calidad humana. Además cuentan muchas actividades que estimulan a nuestros peques. Gracias Lucerito por recibir a mi pequeña olí.",
    },
  ];

  return (
    <section className="testimonials-section">
      <h2 className="testimonials-title">Lo que dicen las familias</h2>

      <Carousel className="testimonials-carousel" interval={5000}>
        {testimonials.map((testimonial) => (
          <Carousel.Item key={testimonial.id}>
            <div className="testimonial-content">
              <p className="testimonial-text">{testimonial.text}</p>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </section>
  );
}
