import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/LandingPage/Home";
import AboutUs from "./components/LandingPage/AboutUs";
import Gallery from "./components/LandingPage/Gallery";
import Contact from "./components/LandingPage/Contact";
import Login from "./components/LandingPage/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import UserRegistration from "./components/LandingPage/UserRegistration";
import ForgotPassword from "./components/LandingPage/ForgotPassword";
import ResetPassword from "./components/LandingPage/ResetPassword";
import UpdateUserCredentials from "./components/Dashboard/UpdateUserCredentials";
import Users from "./components/Dashboard/Users/Users";
import Tariffs from "./components/Dashboard/Tariffs/Tariffs";
import Infants from "./components/Dashboard/Infants/Infants";
import SystemNotes from "./components/Dashboard/SystemNotes/SystemNotes";

function App() {
  return (
    <>
     <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/sobre_nosotros" element={<AboutUs />} />
      <Route path="/galeria" element={<Gallery />} />
      <Route path="/contacto" element={<Contact />} />
      <Route path="/iniciar_sesion" element={<Login />} />
      <Route path="/registro" element={<UserRegistration />} />
      <Route path="/recuperar_contrasena" element={<ForgotPassword />} />
      <Route path="/restablecer_contrasena" element={<ResetPassword />} />
      <Route path="/autogestion" element={<Dashboard />} />
      <Route path="/autogestion/actualizar_credenciales" element={<UpdateUserCredentials />} />
      <Route path="/autogestion/usuarios" element={<Users />} />
      <Route path="/autogestion/tarifas" element={<Tariffs />} />
      <Route path="/autogestion/infantes" element={<Infants />} />
      <Route path="/autogestion/notas-del-sistema" element={<SystemNotes />} />
     </Routes>
    </>
  )
}

export default App
