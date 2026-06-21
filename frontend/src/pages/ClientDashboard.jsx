import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllClients } from '../services/api';
import AnimatedSection from '../components/UI/AnimatedSection';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      const data = await getAllClients();
      // Client sees only their own data
      if (data && data.length > 0) {
        setClientData(data[0]);
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-[80px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-light border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[80px] min-h-screen bg-gray-50">
      <section className="section-pad bg-primary-dark text-white">
        <div className="container-custom">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <AnimatedSection>
                <h1 className="text-3xl md:text-4xl font-extrabold">My Dashboard</h1>
                <p className="text-gray-300 mt-2">Welcome back, {user?.name}</p>
              </AnimatedSection>
            </div>
            <button
              onClick={logout}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container-custom max-w-4xl mx-auto">
          <AnimatedSection>
            {clientData ? (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gray-50 p-6 border-b border-gray-200 flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {clientData.photo ? (
                      <img src={clientData.photo} alt={clientData.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                        👤
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-primary-dark">{clientData.name}</h2>
                    <p className="text-gray-600">
                      {clientData.userType === 'retail' ? 'Retail Client' : 'Corporate Client'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Member since {new Date(clientData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border-b border-gray-100 pb-3">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">PAN Card</label>
                      <p className="text-gray-900 font-medium mt-1">{clientData.panCard}</p>
                    </div>
                    <div className="border-b border-gray-100 pb-3">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Aadhar Number</label>
                      <p className="text-gray-900 font-medium mt-1">{clientData.aadharNumber}</p>
                    </div>
                    <div className="border-b border-gray-100 pb-3">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Age</label>
                      <p className="text-gray-900 font-medium mt-1">{clientData.age || 'N/A'}</p>
                    </div>
                    <div className="border-b border-gray-100 pb-3">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Education</label>
                      <p className="text-gray-900 font-medium mt-1">{clientData.educationLevel || 'N/A'}</p>
                    </div>
                    <div className="border-b border-gray-100 pb-3">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Income</label>
                      <p className="text-gray-900 font-medium mt-1">₹{clientData.annualIncome || 'N/A'}</p>
                    </div>
                    <div className="border-b border-gray-100 pb-3">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Net Worth</label>
                      <p className="text-gray-900 font-medium mt-1">₹{clientData.totalNetWorth || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-bold text-primary-dark mb-2">Asset Distribution</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Real Estate:</span>
                        <span className="ml-2 font-medium">₹{clientData.realEstate || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Equity:</span>
                        <span className="ml-2 font-medium">₹{clientData.equity || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Alternatives:</span>
                        <span className="ml-2 font-medium">₹{clientData.alternatives || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Fixed Income & Cash:</span>
                        <span className="ml-2 font-medium">₹{clientData.fixedIncomeCash || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/client/${clientData._id}`)}
                    className="w-full mt-6 py-3 bg-primary-dark text-white rounded-lg font-semibold hover:bg-black transition-colors"
                  >
                    View Full Profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl shadow-md text-center">
                <p className="text-gray-500">No client data found. Please contact your advisor.</p>
              </div>
            )}
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default ClientDashboard;