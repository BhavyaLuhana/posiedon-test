import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset link.');
      navigate('/admin-login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        newPassword: form.newPassword,
      });

      toast.success('Password reset successful! Please log in.');
      navigate('/admin-login');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password. The link may have expired.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-primary-dark">
              Set a New Password
            </h1>
            <p className="text-text-muted mt-2 text-sm">
              This link expires 30 minutes after it was sent.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-primary-dark mb-2">
                New Password
              </label>
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
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
                Confirm New Password
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
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
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;