import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';

const TryNowPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredContactTime: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Name validation
    if (!formData.name || !formData.name.trim()) {
      toast.error('Please enter your full name');
      return false;
    }

    // Email validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${API_URL}/api/leads/submit`, formData);
      
      if (response.data.success) {
        setSubmitted(true);
        toast.success('✅ Thank you! We will contact you shortly to schedule a consultation.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Submission error:', error);
      if (error.response?.data?.alreadySubmitted) {
        toast.error('You have already submitted your details. Our team will contact you shortly.');
        setSubmitted(true);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to submit form. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // If already submitted, show success message
  if (submitted) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
          <div className="container-custom max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary-dark mb-4">
                Thank You for Your Interest! 🎉
              </h2>
              <p className="text-text-muted text-lg mb-4">
                We have received your details and will contact you shortly to schedule a consultation.
              </p>
              <div className="bg-primary-light/10 rounded-lg p-4 mb-6">
                <p className="text-sm text-primary-dark font-medium">
                  📧 A confirmation email has been sent to your registered email address.
                </p>
              </div>
              <div className="space-y-3 text-left max-w-md mx-auto">
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <span className="text-green-500">✓</span>
                  <span>Our team will review your request</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <span className="text-green-500">✓</span>
                  <span>You'll receive a call within 24-48 hours</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <span className="text-green-500">✓</span>
                  <span>We'll schedule a consultation at your preferred time</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/')}
                className="mt-8 bg-primary-light text-primary-dark font-bold px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Return to Homepage
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="container-custom max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Trust Banner */}
          <div className="bg-gradient-to-r from-primary-dark to-primary-dark/90 rounded-2xl p-4 md:p-6 mb-6 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm font-medium">256-bit SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm font-medium">Your data is secure</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">We never share your data</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-primary-dark">
                Start Your Financial Journey
              </h1>
              <p className="text-text-muted mt-2">
                Share your contact details and our experts will reach out to you
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-light/10 rounded-full text-xs font-medium text-primary-dark">
                  📋 Confidential
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-light/10 rounded-full text-xs font-medium text-primary-dark">
                  🔒 Encrypted
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-light/10 rounded-full text-xs font-medium text-primary-dark">
                  ⏱️ 24-48 hrs response
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-primary-dark mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-primary-dark mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-primary-dark mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                  placeholder="9876543210"
                  maxLength="10"
                  required
                />
                <p className="text-xs text-text-muted mt-1">🔒 We'll never share your phone number</p>
              </div>

              {/* Preferred Contact Time */}
              <div>
                <label className="block text-sm font-semibold text-primary-dark mb-2">
                  Preferred Contact Time
                  <span className="text-text-muted font-normal ml-1">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="preferredContactTime"
                  value={formData.preferredContactTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                  placeholder="e.g., Weekday evenings, Weekend mornings, 2-4 PM IST"
                />
                <p className="text-xs text-text-muted mt-1">⏰ We'll try to contact you at your preferred time</p>
              </div>

              {/* Privacy & Submit */}
              <div className="bg-primary-dark/5 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="privacy"
                    className="mt-1 w-4 h-4 text-primary-light"
                    required
                  />
                  <label htmlFor="privacy" className="text-sm text-text-muted">
                    I confirm that the information provided is accurate and I agree to the 
                    <a href="/privacy" className="text-primary-dark font-medium hover:underline ml-1">Privacy Policy</a>
                    . My data will be encrypted and kept confidential.
                  </label>
                </div>
              </div>

              <div className="flex gap-4 flex-wrap">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-light text-primary-dark font-bold py-4 px-8 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Get Started'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 bg-gray-200 text-primary-dark font-bold py-4 px-8 rounded-lg hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>

              {/* Trust Footer */}
              <div className="text-center text-xs text-text-muted border-t pt-4">
                <p>🔒 All data is encrypted using 256-bit AES encryption</p>
                <p className="mt-1">📋 Your information will only be used for advisory purposes</p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TryNowPage;