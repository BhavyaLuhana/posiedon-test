import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useClientAuth } from '../../context/ClientAuthContext'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Get auth contexts
  const { isAuthenticated: isAdminAuth, user: adminUser, logout: adminLogout } = useAuth()
  const { isAuthenticated: isClientAuth, client, clientLogout } = useClientAuth()

  // Determine login state
  const isLoggedIn = isAdminAuth || isClientAuth
  
  // Get user info based on who's logged in
  const getUserInfo = () => {
    if (isAdminAuth && adminUser) {
      return { name: adminUser.name || 'Admin', role: 'Admin', type: 'admin' }
    }
    if (isClientAuth && client) {
      return { name: client.name || 'Client', role: 'Client', type: 'client' }
    }
    return null
  }

  const userInfo = getUserInfo()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setOpenDropdown(null)
  }, [location])

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName)
  }

  const handleLogout = async () => {
    if (isAdminAuth) {
      await adminLogout()
    } else if (isClientAuth) {
      await clientLogout()
    }
    setIsMobileMenuOpen(false)
    navigate('/')
  }

  const getDashboardLink = () => {
    if (isAdminAuth) return '/dashboard'
    if (isClientAuth) return '/client-dashboard'
    return '/'
  }

  // Base nav links (without auth-dependent ones)
  const baseNavLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { 
      name: 'Retail', 
      hasDropdown: true,
      dropdownType: 'retail',
      items: [
        { name: 'Features', path: '/retail/features' },
        { name: 'Fees', path: '/retail/plan-fees' },
      ]
    },
    { 
      name: 'Corporate', 
      hasDropdown: true,
      dropdownType: 'corporate',
      items: [
        { name: 'Structure', path: '/corporate/structure' },
        { name: 'Fees', path: '/corporate/plans' }
      ]
    },
    { name: 'Testimonial', path: '/testimonial' },
  ]

  // Build navLinks based on auth state
  let navLinks = [...baseNavLinks]

  // Add Dashboard or Login based on auth
  if (isLoggedIn) {
    navLinks.push({ name: 'Dashboard', path: getDashboardLink() })
  } else {
    navLinks.push({ name: 'Login', path: '/login' })
  }

  return (
    <nav className={`fixed top-0 w-full z-[1000] transition-all duration-300 ${
      scrolled ? 'bg-primary-dark/95 backdrop-blur-sm' : 'bg-primary-dark'
    } border-b border-white/5 py-3 md:py-4`}>
      <div className="container-custom flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-base md:text-[1.2rem] text-primary-light cursor-pointer">
          <img src="/Logo.png" alt="Logo" className="h-[25px] md:h-[30px]" />
          <span className="hidden xs:inline">Poseidon Wealth Planners</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-4 lg:gap-6 xl:gap-8 items-center">
          {navLinks.map((link) => (
            <div key={link.name} className="relative dropdown-container">
              {link.hasDropdown ? (
                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleDropdown(link.dropdownType)
                    }}
                    className={`text-white text-[0.85rem] font-medium transition-colors duration-300 flex items-center gap-1 py-1 whitespace-nowrap cursor-pointer ${
                      openDropdown === link.dropdownType ? 'text-primary-light' : 'hover:text-primary-light'
                    }`}
                  >
                    {link.name}
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        openDropdown === link.dropdownType ? 'rotate-180' : ''
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {openDropdown === link.dropdownType && (
                    <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white rounded-lg shadow-xl overflow-hidden animate-fade-up">
                      {link.items.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          className="block px-4 py-3 text-gray-700 hover:bg-primary-light hover:text-primary-dark transition-colors duration-200 cursor-pointer"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={link.path}
                  className={`text-white text-[0.85rem] font-medium transition-colors duration-300 py-1 inline-block whitespace-nowrap cursor-pointer ${
                    location.pathname === link.path ? 'text-primary-light' : 'hover:text-primary-light'
                  }`}
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}
          
          {/* User Info & Logout (Desktop) */}
          {isLoggedIn ? (
            <div className="flex items-center gap-4 ml-2">
              <span className="text-white/80 text-sm">
                {userInfo?.name} ({userInfo?.role})
              </span>
              <button
                onClick={handleLogout}
                className="text-white text-[0.85rem] font-medium hover:text-red-400 transition-colors duration-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/try-now"
              className="bg-primary-light text-primary-dark font-bold px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-primary-light/30 ml-2 whitespace-nowrap"
            >
              Contact Us
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white p-2 cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-primary-dark border-t border-white/10 mt-3 py-4 max-h-[80vh] overflow-y-auto">
          <div className="container-custom flex flex-col gap-3">
            {navLinks.map((link) => (
              <div key={link.name}>
                {link.hasDropdown ? (
                  <div>
                    <button
                      onClick={() => toggleDropdown(link.dropdownType)}
                      className="text-white text-[1rem] font-medium py-2 flex items-center justify-between w-full cursor-pointer"
                    >
                      {link.name}
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          openDropdown === link.dropdownType ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openDropdown === link.dropdownType && (
                      <div className="pl-4 mt-2 space-y-2">
                        {link.items.map((item) => (
                          <Link
                            key={item.name}
                            to={item.path}
                            className="block text-gray-300 hover:text-primary-light py-2 cursor-pointer"
                            onClick={() => {
                              setIsMobileMenuOpen(false)
                              setOpenDropdown(null)
                            }}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={link.path}
                    className={`block text-white text-[1rem] font-medium py-2 cursor-pointer ${
                      location.pathname === link.path ? 'text-primary-light' : 'hover:text-primary-light'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
            
            {/* User Info & Logout (Mobile) */}
            {isLoggedIn ? (
              <>
                <div className="text-white/80 text-sm py-2 border-t border-white/10 mt-2 pt-3">
                  {userInfo?.name} ({userInfo?.role})
                </div>
                <button
                  onClick={handleLogout}
                  className="text-white text-[1rem] font-medium py-2 hover:text-red-400 text-left cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/try-now"
                className="bg-primary-light text-primary-dark font-bold px-6 py-3 rounded-full hover:shadow-lg transition-all duration-300 text-center mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🚀 Try Now
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar