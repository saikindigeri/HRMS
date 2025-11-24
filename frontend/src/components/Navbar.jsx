// src/components/Navbar.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiHome, FiUsers, FiUserCheck, FiShield, FiLogOut } from 'react-icons/fi';

export default function Navbar({ setToken }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <FiHome className="w-5 h-5" /> },
    { label: 'Employees', path: '/employees', icon: <FiUsers className="w-5 h-5" /> },
    { label: 'Teams', path: '/teams', icon: <FiUserCheck className="w-5 h-5" /> },
    { label: 'Audit Logs', path: '/logs', icon: <FiShield className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-gray-900 text-white shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5">

        {/* Desktop + Mobile Header */}
        <div className="flex justify-between items-center">

          {/* Logo */}
          <h1 
            onClick={() => navigate('/dashboard')} 
            className="text-3xl font-extrabold tracking-wider cursor-pointer bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent"
          >
            HRMS Pro
          </h1>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-2 text-lg font-medium hover:text-yellow-400 transition duration-200"
              >
               
                {item.label}
              </button>
            ))}
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-md font-semibold "
            >
             
              Logout
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-3xl hover:text-yellow-400 transition"
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-6 pb-6 border-t border-gray-700 pt-6 animate-fadeIn">
            <div className="flex flex-col gap-6">
              {navItems.map(item => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-4 text-xl font-medium hover:text-yellow-400 transition py-3 px-2 rounded-lg hover:bg-gray-800"
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <button
                onClick={logout}
                className="flex items-center gap-4 bg-white text-black px-6 py-4 rounded-md font-bold text-lg mt-4"
              >
              
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}