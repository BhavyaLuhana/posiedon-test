import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
import LoginPage from './pages/LoginPage'
import ClientOnboarding from './pages/ClientOnboarding'
import AdminDashboard from './pages/AdminDashboard'
import ClientDetail from './pages/ClientDetail'
import TryNowPage from './pages/TryNowPage'
import AdminLogin from './pages/AdminLogin'  // Add this import
import ProtectedRoute from './components/ProtectedRoute'  // Add this import
import { Toaster } from 'react-hot-toast'

function App() {
  return (
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
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/retail/plan-fees" element={<RetailPlanFees />} />
            <Route path="/retail/features" element={<RetailFeatures />} />
            <Route path="/retail/consulting" element={<RetailConsulting />} />
            <Route path="/corporate/plans" element={<CorporatePlans />} />
            <Route path="/corporate/structure" element={<CorporateStructure />} />
            <Route path="/testimonial" element={<TestimonialPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboard" element={<ClientOnboarding />} />
            <Route path="/try-now" element={<TryNowPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/client/:id" 
              element={
                <ProtectedRoute>
                  <ClientDetail />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App