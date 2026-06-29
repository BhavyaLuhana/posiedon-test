import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { toast } from 'react-hot-toast';

const ClientLogin = () => {
  const navigate = useNavigate();
  const { clientLogin } = useClientAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await clientLogin(formData.email, formData.password);
      toast.success('Login successful!');
      navigate('/client-dashboard');
    } catch (error) {
      // Error is handled in the context
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
        <div className="container-custom max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-primary-dark">
                Client Login
              </h1>
              <p className="text-text-muted text-sm mt-2">
                Access your dashboard and manage your profile
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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

              <div>
                <label className="block text-sm font-semibold text-primary-dark mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-light text-primary-dark font-bold py-3 px-4 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* ============ REGISTER LINK ============ */}
            <div className="mt-6 text-center">
              <p className="text-sm text-text-muted">
                Don't have an account?{' '}
                <Link to="/client-register" className="text-primary-dark font-semibold hover:underline">
                  Register Here
                </Link>
              </p>
              <p className="text-sm text-text-muted mt-2">
                <Link to="/" className="text-primary-dark hover:underline">
                  ← Back to Homepage
                </Link>
              </p>
            </div>

            {/* ============ INFO BOX ============ */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ You can only login if you have:
                <br />
                1. Submitted your lead details via the form
                <br />
                2. Been approved by our team
                <br />
                3. Completed your registration (set password)
              </p>
            </div>

            {/* ============ DEMO CREDENTIALS (Remove in production) ============ */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 font-medium mb-1">🔑 Demo Credentials</p>
              <p className="text-xs text-blue-700">
                Email: test@client.com<br />
                Password: Test@1234
              </p>
              <p className="text-xs text-blue-500 mt-1">
                * Only works after approval and registration
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ClientLogin;