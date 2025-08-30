import './Navbar.css';
import { NavLink } from 'react-router-dom';

function Navbar({ online }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <NavLink to="/">
          <img src="/icon.png" alt="Logo Icon" className="logo-icon" />
          <img src="/name.png" alt="Logo Name" className="logo-name" />
        </NavLink>
      </div>

      <div className="online-indicator">
        {online > 0 ? (
          <span className="online">🟢 {online} users online</span>
        ) : (
          <span className="offline">🔴 No users online</span>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
