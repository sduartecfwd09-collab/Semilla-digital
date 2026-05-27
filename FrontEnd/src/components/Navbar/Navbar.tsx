import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { LogOut, ShoppingCart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { usePreferences } from "../context/PreferencesContext";
import CartDrawer from "../Cart/CartDrawer";
import "./Navbar.css";
import { ENDPOINTS, authFetch } from "../../services/api.config";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { getItemCount, setIsCartOpen } = useCart();
  const { notifications: notifEnabled } = usePreferences();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setMenuOpen(false);
    });
    return () => cancelAnimationFrame(handle);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [hasProfileNotif, setHasProfileNotif] = useState(false);
  const [hasContactNotif, setHasContactNotif] = useState(false);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro de que deseas salir de tu cuenta?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#52b788",
      cancelButtonColor: "#718096",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      navigate("/");
      Promise.resolve().then(() => logout());
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const handleScrollToTop = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const checkNotifications = async () => {
      if (user) {
        try {
          const res = await authFetch(ENDPOINTS.solicitudesCambioRol);
          if (!res.ok) return;
          const json = await res.json();
          const data = (json && json.success ? json.data : json) || [];
          const myResponses = data.filter(
            (s: any) =>
              String(s.usuarioId) === String(user.id) &&
              s.estado !== "Pendiente",
          );
          if (myResponses.length > 0) {
            const latest = myResponses.sort(
              (a: any, b: any) =>
                new Date(b.fechaRespuesta || b.fechaSolicitud).getTime() -
                new Date(a.fechaRespuesta || a.fechaSolicitud).getTime(),
            )[0];
            const seenId = localStorage.getItem(`seen_sol_${user.id}`);

            if (location.pathname === "/perfil") {
              localStorage.setItem(`seen_sol_${user.id}`, latest.id);
              setHasProfileNotif(false);
            } else if (seenId !== latest.id) {
              setHasProfileNotif(true);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }

      if (!user) return;
      try {
        const res = await authFetch(ENDPOINTS.contactMessagesMine);
        if (!res.ok) return;
        const json = await res.json();
        const data = (json && json.success ? json.data : json) || [];
        const savedIds: string[] = JSON.parse(
          localStorage.getItem("agromap_my_messages") || "[]",
        );

        const myResponded = data.filter((m: any) => {
          const matchedByEmail =
            user?.email &&
            m.correo &&
            m.correo.toLowerCase() === user.email.toLowerCase();
          const matchedByLocal = m.id && savedIds.includes(m.id);
          return (
            (matchedByEmail || matchedByLocal) && m.estado === "Respondido"
          );
        });

        if (myResponded.length > 0) {
          const latest = myResponded.sort(
            (a: any, b: any) =>
              new Date(b.fechaRespuesta || b.fechaEnvio).getTime() -
              new Date(a.fechaRespuesta || a.fechaEnvio).getTime(),
          )[0];
          const seenKey = user ? `seen_msg_${user.id}` : "seen_msg_anon";
          const seenId = localStorage.getItem(seenKey);

          if (location.pathname === "/contacto") {
            localStorage.setItem(seenKey, latest.id);
            setHasContactNotif(false);
          } else if (seenId !== latest.id) {
            setHasContactNotif(true);
          } else {
            setHasContactNotif(false);
          }
        } else {
          setHasContactNotif(false);
        }
      } catch (e) {
        console.error(e);
      }
    };

    checkNotifications();
  }, [user, location.pathname]);

  const showProfileDot =
    hasProfileNotif && notifEnabled && user?.role !== "Administrador";
  const showContactDot =
    hasContactNotif && notifEnabled && user?.role !== "Administrador";

  return (
    <nav className="pn-navbar">
      <Link to="/" className="pn-navbar-logo" onClick={handleScrollToTop}>
        <span className="pn-navbar-logo-agro">Agro</span>
        <span className="pn-navbar-logo-map">Map</span>
      </Link>

      <button
        className={`pn-navbar-hamburger ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul className={`pn-navbar-links ${menuOpen ? "open" : ""}`}>
        <li>
          <Link
            to="/"
            className={`pn-navbar-link ${isActive("/") ? "active" : ""}`}
            onClick={handleScrollToTop}
          >
            Inicio
          </Link>
        </li>
        <li>
          <Link
            to="/ferias"
            className={`pn-navbar-link ${isActive("/ferias") ? "active" : ""}`}
          >
            Ferias
          </Link>
        </li>
        <li>
          <Link
            to="/comparar"
            className={`pn-navbar-link ${isActive("/comparar") ? "active" : ""}`}
          >
            Productos
          </Link>
        </li>
        <li>
          <Link
            to="/recetas"
            className={`pn-navbar-link ${isActive("/recetas") ? "active" : ""}`}
          >
            Recetas
          </Link>
        </li>
        <li>
          <Link
            to="/contacto"
            className={`pn-navbar-link ${isActive("/contacto") ? "active" : ""}`}
          >
            Contáctanos
            {showContactDot && <span className="pn-navbar-dot"></span>}
          </Link>
        </li>

        {user?.role === "Administrador" && (
          <li>
            <Link
              to="/admin"
              className={`pn-navbar-link ${location.pathname.startsWith("/admin") ? "active" : ""}`}
            >
              Panel Admin
            </Link>
          </li>
        )}

        {user?.role === "Productor" && (
          <li>
            <Link
              to="/productor"
              className={`pn-navbar-link ${location.pathname.startsWith("/productor") ? "active" : ""}`}
            >
              Panel Mi Feria
            </Link>
          </li>
        )}

        {(user?.role === "DRIVER" || user?.role === "Repartidor") && (
          <li>
            <Link
              to="/driver"
              className={`pn-navbar-link ${location.pathname.startsWith("/driver") ? "active" : ""}`}
            >
              Panel Delivery
            </Link>
          </li>
        )}

        {user && (
          <li className="pn-navbar-item-perfil">
            <Link
              to="/perfil"
              className={`pn-navbar-link pn-navbar-link-profile ${location.pathname === "/perfil" ? "active" : ""}`}
              aria-label="Perfil"
            >
              <span className="pn-navbar-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt="" />
                ) : (
                  (user.name || user.nombre || "U").charAt(0).toUpperCase()
                )}
              </span>
              <span className="pn-navbar-link-profile-label">Perfil</span>
              {showProfileDot && <span className="pn-navbar-dot"></span>}
            </Link>
          </li>
        )}

        <li>
          <button
            className="pn-navbar-icon-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label="Abrir carrito"
          >
            <ShoppingCart size={20} strokeWidth={2} />
            {getItemCount() > 0 && (
              <span className="pn-navbar-cart-badge">{getItemCount()}</span>
            )}
          </button>
        </li>

        <li>
          {user ? (
            <button
              className="pn-navbar-icon-btn"
              onClick={handleLogout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut size={20} strokeWidth={2} />
            </button>
          ) : (
            <Link to="/auth" className="pn-navbar-cta">
              Iniciar sesión
            </Link>
          )}
        </li>
      </ul>
      <CartDrawer />
    </nav>
  );
};

export default Navbar;
