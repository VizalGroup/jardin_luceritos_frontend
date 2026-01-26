import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import Logo from '../../assets/logo.jpg'

export default function NavigationBar() {
  const navigate = useNavigate()

  return (
    <Navbar expand="lg" className="landing-navbar">
      <Container fluid className="navbar-container">
        <Navbar.Brand href="/" className="navbar-logo">
          <img src={Logo} alt="Logo Jardín Luceritos" />
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" className="custom-toggler" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="navbar-links mx-auto">
            <Nav.Link href="/sobre_nosotros">Sobre Nosotros</Nav.Link>
            <Nav.Link href="/galeria">Galería</Nav.Link>
            <Nav.Link href="/contacto">Contacto</Nav.Link>
          </Nav>
        </Navbar.Collapse>
        
        <div className="navbar-login">
          <Button className="btn-login" onClick={() => navigate('/iniciar_sesion')}>
            Iniciar sesión
          </Button>
        </div>
      </Container>
    </Navbar>
  )
}
