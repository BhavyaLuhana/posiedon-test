import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { toast } from 'react-hot-toast';

const ClientRegister = () => {
  const navigate = useNavigate();
  const { clientRegister } = useClientAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    // Email validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }
    if (!/[A-Z]/.test(formData.password)) {
      toast.error('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/[0-9]/.test(formData.password)) {
      toast.error('Password must contain at least one number');
      return false;
    }
    if (!/[!@#$%^&*]/.test(formData.password)) {
      toast.error('Password must contain at least one special character (!@#$%^&*)');
      return false;
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await clientRegister(formData.email, formData.password);
      // Redirect to login after successful registration
      navigate('/client-login');
    } catch (error) {
      // Error is handled in the context
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
              <h1 className="text-2xl font-extrabold text-primary-dark">
                Create Your Account
              </h1>
              <p className="text-text-muted text-sm mt-2">
                Already approved? Set up your password to access your dashboard.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                ⚠️ You can only register if your email has been approved by our team.
                Please wait for the approval email before registering.
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
                <p className="text-xs text-text-muted mt-1">
                  Use the same email you submitted your lead with
                </p>
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
                  placeholder="Create a strong password"
                  required
                />
                <ul className="text-xs text-text-muted mt-2 space-y-1">
                  <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                    ✓ At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                    ✓ One uppercase letter
                  </li>
                  <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                    ✓ One number
                  </li>
                  <li className={/[!@#$%^&*]/.test(formData.password) ? 'text-green-600' : ''}>
                    ✓ One special character (!@#$%^&*)
                  </li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary-dark mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                  placeholder="Confirm your password"
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
                    Registering...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-text-muted mt-6">
              Already have an account?{' '}
              <Link to="/client-login" className="text-primary-dark font-semibold hover:underline">
                Sign In
              </Link>
            </p>

            <p className="text-center text-xs text-text-muted mt-4">
              By creating an account, you agree to our{' '}
              <a href="/terms" className="text-primary-dark hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="/privacy" className="text-primary-dark hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ClientRegister;