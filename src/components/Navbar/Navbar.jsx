import './Navbar.css';
import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar({ online }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Show stats after a brief delay for animation
    const timer = setTimeout(() => setShowStats(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const isCanvasPage = location.pathname === '/canvas';

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          <NavLink to="/" className="logo-link">
            <div className="logo-container-nav">
              <img src="/icon.png" alt="Logo Icon" className="logo-icon" />
              <div className="logo-text">
                <img src="/name.png" alt="Logo Name" className="logo-name" />
                <span className="logo-tagline">Pixel War</span>
              </div>
            </div>
          </NavLink>
        </div>

        <div className="navbar-center">
          {isCanvasPage && (
            <div className="nav-info">
              <span className="nav-info-label">Live Battle</span>
            </div>
          )}
        </div>

        <div className="navbar-right">
          <div className={`online-indicator ${showStats ? 'show' : ''}`}>
            <span className={`status-dot ${online > 0 ? 'online' : 'offline'}`}></span>
            <span className="status-count">{online > 0 ? online : 0}</span>
            <span className='nav-info-label'>Players</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
