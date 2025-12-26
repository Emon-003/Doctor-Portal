import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import '../components/Navbar.css'; // Make sure this path is correct

const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Closes dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    signOut(auth);
    toggleMobileMenu(); // Close mobile menu on logout
    navigate('/login'); // Redirect to login after logout
  };

  // Function to get the first letter of the display name for the avatar
  const getDisplayNameInitial = (name: string | null | undefined, fallbackEmail: string | null | undefined) => {
    if (name && name.trim().length > 0) {
      return name.trim().charAt(0).toUpperCase();
    }
    if (fallbackEmail && fallbackEmail.trim().length > 0) {
      return fallbackEmail.trim().charAt(0).toUpperCase();
    }
    return '?'; // Default if no name or email
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">
          <a href="/">
            <img
              src="./healpoint_logo.png"
              alt="HealPoint Logo"
              className="logo-image"
              onError={(e) => {
                console.error('Error loading image:', e);
                const img = e.target as HTMLImageElement;
                console.log('Attempted image source:', img.src);
              }}
            />
          </a>
        </div>
        <div className="nav-links desktop-nav">
          <Link to="/" className={`nav-link${location.pathname === '/' ? ' active' : ''}`}>Home</Link>
          <Link to="/all-doctors" className={`nav-link${location.pathname === '/all-doctors' ? ' active' : ''}`}>All Doctors</Link>
          <Link to="/about" className={`nav-link${location.pathname === '/about' ? ' active' : ''}`}>About</Link>
          <Link to="/contact" className={`nav-link${location.pathname === '/contact' ? ' active' : ''}`}>Contact</Link>
        </div>
        {/* The admin-btn in the left section seems redundant if it's also in navbar-right for logged-in admin */}
        <Link to="/admin-panel" className={`admin-btn${location.pathname === '/admin-panel' ? ' active' : ''}`}>Admin Panel</Link>
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            {user.email === 'admin@healpoint.com' && (
              <Link to="/admin-panel" className={`admin-btn${location.pathname === '/admin-panel' ? ' active' : ''}`}>
                Admin Panel
              </Link>
            )}
            <div className="UserProfile-dropdown" ref={dropdownRef}>
              <button
                className="UserProfile-button"
                onClick={() => setShowDropdown(!showDropdown)}
                aria-expanded={showDropdown}
                aria-label="User menu"
              >
                {/* Display initial avatar here */}
                <div className="UserProfile-initial-avatar">
                  {getDisplayNameInitial(user.displayName, user.email)}
                </div>
              </button>

              {showDropdown && (
                <div className="dropdown-menu">
                  {/* Display user name in dropdown */}
                  <div className="dropdown-user-info">
                    <div className="dropdown-avatar">
                      {getDisplayNameInitial(user.displayName, user.email)}
                    </div>
                    <span className="dropdown-user-name">{user.displayName || user.email}</span>
                  </div>
                  <div className="dropdown-divider"></div>

                  <button
                    className="dropdown-item"
                    onClick={() => {
                      navigate('/UserProfile');
                      setShowDropdown(false);
                    }}
                  >
                    <span className="dropdown-icon">👤</span>
                    Profile
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      navigate('/myappointment');
                      setShowDropdown(false);
                    }}
                  >
                    <span className="dropdown-icon">📅</span>
                    My Appointments
                  </button>
                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-item logout"
                    onClick={handleLogout}
                  >
                    <span className="dropdown-icon">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="login-btn desktop-only">Login</Link>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <div className="menu-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-content">
          <button className="close-menu-btn" onClick={toggleMobileMenu}></button>

          {/* Main Navigation Links */}
          <div className="mobile-nav-section">
            <Link to="/" className={`mobile-nav-link${location.pathname === '/' ? ' active' : ''}`} onClick={toggleMobileMenu}>
              <span role="img" aria-label="home">🏠</span> Home
            </Link>
            <Link to="/all-doctors" className={`mobile-nav-link${location.pathname === '/all-doctors' ? ' active' : ''}`} onClick={toggleMobileMenu}>
              <span role="img" aria-label="doctors">🩺</span> All Doctors
            </Link>
            <Link to="/about" className={`mobile-nav-link${location.pathname === '/about' ? ' active' : ''}`} onClick={toggleMobileMenu}>
              <span role="img" aria-label="about">ℹ️</span> About
            </Link>
            <Link to="/contact" className={`mobile-nav-link${location.pathname === '/contact' ? ' active' : ''}`} onClick={toggleMobileMenu}>
              <span role="img" aria-label="contact">📞</span> Contact
            </Link>
            {/* Admin link in mobile menu */}
            {user?.email === 'admin@healpoint.com' && (
              <Link to="/admin-panel" className={`mobile-nav-link admin-link${location.pathname === '/admin-panel' ? ' active' : ''}`} onClick={toggleMobileMenu}>
                <span className="admin-icon">⚙️</span> Admin Panel
              </Link>
            )}
          </div>

          <div className="mobile-nav-section user-section">
            {user ? (
              <>
                <Link to="/UserProfile" className="mobile-user-profile-link" onClick={toggleMobileMenu}>
                    <div className="mobile-user-avatar">
                        {getDisplayNameInitial(user.displayName, user.email)}
                    </div>
                    <div className="mobile-user-details">
                        <span className="mobile-user-name">{user.displayName || user.email}</span>
                        <span className="mobile-user-view-profile">View Profile</span>
                    </div>
                </Link>
                <Link to="/myappointment" className="mobile-nav-link" onClick={toggleMobileMenu}>
                    <span className="dropdown-icon">📅</span> My Appointments
                </Link>
                <button className="mobile-logout-btn" onClick={handleLogout}>
                  <span className="logout-icon">🚪</span> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className={`mobile-nav-link login-link${location.pathname === '/login' ? ' active' : ''}`} onClick={toggleMobileMenu}>
                <span className="account-icon">📝</span> Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;