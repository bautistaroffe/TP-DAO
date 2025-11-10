import { Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "./Navbar";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bounce, setBounce] = useState(false);

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
    setBounce(true);

    setTimeout(() => setBounce(false), 500);
  };

  return (
    <header className={`header ${menuOpen ? "open" : ""}`}>
      <div className="header-logo">
        <Link to="/" onClick={handleLogoClick}>
          <img
            src="/logo2.png"
            alt="Estadia Logo"
            className={`logo ${bounce ? "bounce" : ""}`}
          />
        </Link>
      </div>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      <Navbar isOpen={menuOpen} />
    </header>
  );
}
