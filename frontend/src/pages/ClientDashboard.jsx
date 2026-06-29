import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext';
import { getClientProfile } from '../services/api';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { toast } from 'react-hot-toast';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { client, clientLogout, updateClient } = useClientAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getClientProfile();
      updateClient(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        navigate('/client-login');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleLogout = async () => {
    await clientLogout();
    navigate('/');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-[80px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-light border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!client) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-[80px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">No client data found</p>
            <button
              onClick={() => navigate('/client-login')}
              className="mt-4 px-6 py-2 bg-primary-light text-primary-dark rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Go to Login
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const assets = client.assets || {};
  const totalInvestments = Object.values(assets).reduce((sum, val) => sum + (val || 0), 0);
  const isProfileComplete = client.profileComplete || client.status === 'Active';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-[80px] pb-12">
        <div className="container-custom max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-dark to-primary-dark/90 rounded-2xl p-6 md:p-8 mb-8 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold">
                  Welcome, {client.name}!
                </h1>
                <p className="text-gray-300 text-sm mt-1">
                  {client.clientType || 'Client'} • Status: {client.status}
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-4 py-2 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors disabled:opacity-50"
                >
                  {refreshing ? 'Refreshing...' : '🔄 Refresh'}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600/80 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</p>
              <p className="text-xl font-bold text-primary-dark mt-1">{client.status}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Profile Status</p>
              <p className="text-xl font-bold text-primary-dark mt-1">
                {isProfileComplete ? '✅ Complete' : '⚠️ Incomplete'}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Investments</p>
              <p className="text-xl font-bold text-primary-dark mt-1">₹{totalInvestments.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Net Worth</p>
              <p className="text-xl font-bold text-primary-dark mt-1">
                ₹{client.totalNetWorth?.toLocaleString() || 'N/A'}
              </p>
            </div>
          </div>

          {/* Profile Complete Warning */}
          {!isProfileComplete && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-yellow-800">Complete Your Profile</h3>
                  <p className="text-sm text-yellow-700">
                    Please complete your financial profile to access all features.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/client-profile/complete')}
                  className="px-6 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                >
                  Complete Profile Now →
                </button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-primary-dark">Your Profile</h2>
                  <button
                    onClick={() => navigate('/client-profile/edit')}
                    className="px-4 py-2 bg-primary-light text-primary-dark rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                  >
                    ✏️ Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</p>
                    <p className="text-gray-900 font-medium mt-1">{client.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
                    <p className="text-gray-900 font-medium mt-1">{client.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</p>
                    <p className="text-gray-900 font-medium mt-1">{client.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Preferred Contact Time</p>
                    <p className="text-gray-900 font-medium mt-1">{client.preferredContactTime || 'Not specified'}</p>
                  </div>
                  {isProfileComplete && (
                    <>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Age</p>
                        <p className="text-gray-900 font-medium mt-1">{client.age || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Client Type</p>
                        <p className="text-gray-900 font-medium mt-1">{client.clientType || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Education</p>
                        <p className="text-gray-900 font-medium mt-1">{client.educationLevel || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</p>
                        <p className="text-gray-900 font-medium mt-1">{client.professionalQualification || 'N/A'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Investment Summary Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-primary-dark mb-4">Investment Summary</h2>
                
                {isProfileComplete ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="text-sm text-gray-600">Real Estate</span>
                      <span className="font-semibold">₹{(assets.realEstate || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="text-sm text-gray-600">Equity</span>
                      <span className="font-semibold">₹{(assets.equity || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="text-sm text-gray-600">Alternatives</span>
                      <span className="font-semibold">₹{(assets.alternatives || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="text-sm text-gray-600">Fixed Income & Cash</span>
                      <span className="font-semibold">₹{(assets.fixedIncomeAndCash || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t-2 border-primary-light">
                      <span className="font-bold text-primary-dark">Total</span>
                      <span className="font-bold text-primary-dark">₹{totalInvestments.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">Complete your profile to see your investment summary</p>
                    <button
                      onClick={() => navigate('/client-profile/complete')}
                      className="mt-4 px-4 py-2 bg-primary-light text-primary-dark rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                    >
                      Complete Profile
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                <h2 className="text-xl font-bold text-primary-dark mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/client-profile/edit')}
                    className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    ✏️ Edit Profile
                  </button>
                  {!isProfileComplete && (
                    <button
                      onClick={() => navigate('/client-profile/complete')}
                      className="w-full text-left px-4 py-2 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-medium text-yellow-800"
                    >
                      📝 Complete Profile
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/')}
                    className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                  >
                    🏠 Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ClientDashboard;