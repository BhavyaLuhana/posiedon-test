import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Adminsetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    newEmail: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/auth/complete-admin-setup`,
        { newEmail: form.newEmail, newPassword: form.newPassword },
        { withCredentials: true }
      );

      toast.success('Credentials updated! Please log in again with your new details.');
      localStorage.removeItem('adminEmail');
      navigate('/admin-login');
    } catch (error) {
      const message = error.response?.data?.message || 'Setup failed. Please try again.';
      toast.error(message);

      // If setup was already completed (e.g. they refreshed this page
      // after finishing it once before), send them somewhere sensible.
      if (error.response?.status === 403) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-primary-dark">
              Welcome — Set Up Your Admin Account
            </h1>
            <p className="text-text-muted mt-2 text-sm">
              This is your first login. Set a permanent email and password before continuing.
              You won't see this screen again.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-primary-dark mb-2">
                New Admin Email
              </label>
              <input
                type="email"
                name="newEmail"
                value={form.newEmail}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-dark mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                placeholder="At least 8 characters"
              />
              <p className="text-xs text-text-muted mt-1">
                Must include an uppercase letter, a number, and a special character (!@#$%^&*)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-dark mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                placeholder="Re-enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-light text-primary-dark font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save & Continue'}
            </button>

            <div className="text-center text-xs text-text-muted border-t pt-4">
              <p>🔒 This setup screen can only ever be used once</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Adminsetup;