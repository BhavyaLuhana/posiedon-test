import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllClients, deleteClient, approveLead } from '../services/api';
import AnimatedSection from '../components/UI/AnimatedSection';
import { generateAllClientsPDF } from '../utils/pdfGenerator';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await getAllClients();
      setClients(response.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      if (error.response?.status === 401) {
        navigate('/admin-login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteClient(id);
        setClients(clients.filter(client => client.id !== id));
        toast.success('Client deleted successfully');
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error('Failed to delete client');
      }
    }
  };

  const handleApprove = async (id, name) => {
    if (window.confirm(`Approve ${name} for registration?`)) {
      try {
        await approveLead(id);
        toast.success(`${name} has been approved for registration`);
        fetchClients(); // Refresh the list
      } catch (error) {
        console.error('Error approving lead:', error);
        toast.error(error.response?.data?.message || 'Failed to approve lead');
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

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Registered': 'bg-purple-100 text-purple-800',
      'Active': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status) => {
    const labels = {
      'Pending': '⏳ Pending',
      'Scheduled': '📅 Scheduled',
      'Registered': '🔐 Registered',
      'Active': '✅ Active'
    };
    return labels[status] || status;
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch =
      (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.panCardNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (client.status || '').toLowerCase() === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: clients.length,
    pending: clients.filter(c => c.status === 'Pending').length,
    scheduled: clients.filter(c => c.status === 'Scheduled').length,
    registered: clients.filter(c => c.status === 'Registered').length,
    active: clients.filter(c => c.status === 'Active').length
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
                onClick={async () => {
                  await logout();
                  navigate('/admin-login');
                }}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="text-xs font-medium text-gray-500">Total</h3>
                <p className="text-2xl font-bold text-primary-dark">{stats.total}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="text-xs font-medium text-yellow-600">Pending</h3>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="text-xs font-medium text-blue-600">Scheduled</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="text-xs font-medium text-purple-600">Registered</h3>
                <p className="text-2xl font-bold text-purple-600">{stats.registered}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="text-xs font-medium text-green-600">Active</h3>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search by name, PAN or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                  />
                </div>
                <div className="min-w-[150px]">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors bg-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="registered">Registered</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Client Grid */}
            {filteredClients.length === 0 ? (
              <div className="bg-white p-12 rounded-xl shadow-md text-center">
                <p className="text-gray-500">No clients found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center text-xl text-gray-400">
                            👤
                          </div>
                          <div>
                            <h3 className="font-bold text-primary-dark">{client.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(client.status)}`}>
                              {getStatusBadge(client.status)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(client.id, client.name);
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-500">Email:</span> {client.email}</p>
                        <p><span className="text-gray-500">Phone:</span> {client.phone}</p>
                        <p><span className="text-gray-500">PAN:</span> {client.panCardNumber || 'Not provided'}</p>
                        {client.status === 'Pending' && (
                          <p className="text-xs text-yellow-600 mt-1">⏳ Awaiting approval</p>
                        )}
                        {client.status === 'Scheduled' && (
                          <p className="text-xs text-blue-600 mt-1">📅 Approved for registration</p>
                        )}
                        {client.status === 'Registered' && (
                          <p className="text-xs text-purple-600 mt-1">🔐 Registered, profile pending</p>
                        )}
                        {client.status === 'Active' && (
                          <p className="text-xs text-green-600 mt-1">✅ Profile complete</p>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2 justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Submitted {client.submittedAt ? new Date(client.submittedAt).toLocaleDateString() : 'N/A'}
                        </span>
                        <div className="flex gap-2">
                          {client.status === 'Pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(client.id, client.name);
                              }}
                              className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/client/${client.id}`)}
                            className="text-xs px-3 py-1 bg-primary-light text-primary-dark rounded-lg hover:bg-opacity-90 transition-colors"
                          >
                            View →
                          </button>
                        </div>
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