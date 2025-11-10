import { NavLink } from "react-router-dom";

export default function Navbar({ isOpen }) {
  return (
    <nav className={`navbar ${isOpen ? "show" : ""}`}>
      <NavLink to="/" end>Inicio</NavLink>
      <NavLink to="/predio">Predio</NavLink>
      <NavLink to="/reportes">Reportes</NavLink>
    </nav>
  );
}
