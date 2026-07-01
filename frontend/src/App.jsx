import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ClientAuthProvider } from './context/ClientAuthContext'

import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'
import HomePage from './pages/HomePage'
import AboutUs from './pages/AboutUs'
import RetailPlanFees from './pages/RetailPlanFees'
import RetailFeatures from './pages/RetailFeatures'
import RetailConsulting from './pages/RetailConsulting'
import CorporatePlans from './pages/CorporatePlans'
import CorporateStructure from './pages/CorporateStructure'
import TestimonialPage from './pages/TestimonialPage'
import ContactPage from './pages/ContactPage'
import UnifiedLogin from './pages/UnifiedLogin' // NEW
import ClientOnboarding from './pages/ClientOnboarding'
import AdminDashboard from './pages/AdminDashboard'
import ClientDetail from './pages/ClientDetail'
import TryNowPage from './pages/TryNowPage'
import AdminLogin from './pages/AdminLogin'
import AdminSetup from './pages/Adminsetup'
import ForgotPassword from './pages/Forgotpassword'
import ResetPassword from './pages/Resetpassword'

// Client Pages
import ClientLogin from './pages/ClientLogin'
import ClientRegister from './pages/ClientRegister'
import ClientDashboard from './pages/ClientDashboard'
import ClientProfileForm from './pages/ClientProfileForm'

import ProtectedRoute from './components/ProtectedRoute'
import ProtectedClientRoute from './components/ProtectedClientRoute'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <AuthProvider>
      <ClientAuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 5000,
                iconTheme: {
                  primary: '#8BC34A',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* ============ PUBLIC ROUTES ============ */}
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/retail/plan-fees" element={<RetailPlanFees />} />
                <Route path="/retail/features" element={<RetailFeatures />} />
                <Route path="/retail/consulting" element={<RetailConsulting />} />
                <Route path="/corporate/plans" element={<CorporatePlans />} />
                <Route path="/corporate/structure" element={<CorporateStructure />} />
                <Route path="/testimonial" element={<TestimonialPage />} />
                <Route path="/contact" element={<ContactPage />} />
                
                {/* ============ AUTH ROUTES ============ */}
                {/* Unified Login - NEW */}
                <Route path="/login" element={<UnifiedLogin />} />
                
                {/* Legacy Redirects */}
                <Route path="/admin-login" element={<Navigate to="/login" replace />} />
                <Route path="/client-login" element={<Navigate to="/login" replace />} />
                
                <Route path="/client-register" element={<ClientRegister />} />
                <Route path="/try-now" element={<TryNowPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/onboard" element={<ClientOnboarding />} />

                {/* ============ ADMIN PROTECTED ROUTES ============ */}
                <Route
                  path="/admin-setup"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminSetup />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/client/:id"
                  element={
                    <ProtectedRoute adminOnly>
                      <ClientDetail />
                    </ProtectedRoute>
                  }
                />

                {/* ============ CLIENT PROTECTED ROUTES ============ */}
                <Route
                  path="/client-dashboard"
                  element={
                    <ProtectedClientRoute>
                      <ClientDashboard />
                    </ProtectedClientRoute>
                  }
                />
                <Route
                  path="/client-profile/complete"
                  element={
                    <ProtectedClientRoute>
                      <ClientProfileForm mode="complete" />
                    </ProtectedClientRoute>
                  }
                />
                <Route
                  path="/client-profile/edit"
                  element={
                    <ProtectedClientRoute requireProfileComplete={true}>
                      <ClientProfileForm mode="edit" />
                    </ProtectedClientRoute>
                  }
                />

                {/* ============ CATCH-ALL ============ */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ClientAuthProvider>
    </AuthProvider>
  )
}

export default App