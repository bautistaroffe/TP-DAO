import { NavLink, useLocation } from "react-router-dom";

export default function Navbar({ isOpen }) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav className={`navbar ${isOpen ? "show" : ""}`}>
      {!isHome && (
        <>
          <NavLink to="/predio">Predio</NavLink>
          <NavLink to="/reportes">Reportes</NavLink>
        </>
      )}
    </nav>
  );
}
