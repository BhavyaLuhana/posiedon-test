import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllClients, deleteClient } from '../services/api';
import AnimatedSection from '../components/UI/AnimatedSection';
import { generateAllClientsPDF } from '../utils/pdfGenerator';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await getAllClients();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteClient(id);
        setClients(clients.filter(client => client._id !== id));
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const handleExportAll = () => {
    if (clients.length === 0) {
      alert('No clients to export!');
      return;
    }
    generateAllClientsPDF(clients);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.panCard.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || client.userType === filterType;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: clients.length,
    retail: clients.filter(c => c.userType === 'retail').length,
    corporate: clients.filter(c => c.userType === 'corporate').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-[80px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-light border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading clients...</p>
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
                <h1 className="text-3xl md:text-4xl font-extrabold">Admin Dashboard</h1>
                <p className="text-gray-300 mt-2">Manage all clients and their details</p>
              </AnimatedSection>
            </div>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={handleExportAll}
                className="px-6 py-2 bg-primary-light text-primary-dark rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Export All PDF
              </button>
              <button
                onClick={() => navigate('/onboard')}
                className="px-6 py-2 bg-primary-light text-primary-dark rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                + Add Client
              </button>
              <button
                onClick={logout}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container-custom">
          <AnimatedSection>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-sm font-medium text-gray-500">Total Clients</h3>
                <p className="text-3xl font-bold text-primary-dark">{stats.total}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-sm font-medium text-gray-500">Retail Clients</h3>
                <p className="text-3xl font-bold text-primary-dark">{stats.retail}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-sm font-medium text-gray-500">Corporate Clients</h3>
                <p className="text-3xl font-bold text-primary-dark">{stats.corporate}</p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search by name or PAN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                  />
                </div>
                <div className="min-w-[150px]">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors bg-white"
                  >
                    <option value="all">All Clients</option>
                    <option value="retail">Retail</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Client Grid */}
            {filteredClients.length === 0 ? (
              <div className="bg-white p-12 rounded-xl shadow-md text-center">
                <p className="text-gray-500">No clients found. Start by adding a new client!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((client) => (
                  <div
                    key={client._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => navigate(`/client/${client._id}`)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            {client.photo ? (
                              <img src={client.photo} alt={client.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl text-gray-400">
                                👤
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-primary-dark">{client.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              client.userType === 'retail'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {client.userType}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(client._id, client.name);
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-500">PAN:</span> {client.panCard}</p>
                        <p><span className="text-gray-500">Investment:</span> ₹{client.investmentAmount || 'N/A'}</p>
                        <p><span className="text-gray-500">Annual Income:</span> ₹{client.annualIncome || 'N/A'}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                        <span>Client since {new Date(client.createdAt).toLocaleDateString()}</span>
                        <span className="text-primary-dark font-medium">Click to view →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;