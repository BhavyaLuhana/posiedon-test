import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import AnimatedSection from '../components/UI/AnimatedSection'
import { getClientById, deleteClient, updateClientStatus } from '../services/api'
import { generateClientPDF } from '../utils/pdfGenerator'

const ClientDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchClient()
  }, [id])

  const fetchClient = async () => {
    try {
      const response = await getClientById(id)
      setClient(response.data)
    } catch (error) {
      console.error('Error fetching client:', error)
      if (error.response?.status === 401) {
        navigate('/admin-login')
      } else {
        toast.error('Client not found')
        navigate('/dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true)
    try {
      const response = await updateClientStatus(id, newStatus)
      setClient(response.data)
      toast.success(`Status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${client.name}?`)) return

    try {
      await deleteClient(id)
      toast.success('Client deleted')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error deleting client:', error)
      toast.error('Failed to delete client')
    }
  }

  const handleDownloadPDF = () => {
    generateClientPDF(client)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-[80px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-light border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading client...</p>
        </div>
      </div>
    )
  }

  if (!client) return null

  const assets = client.assets || {}
  const incomeTypesDisplay = Array.isArray(client.incomeTypes)
    ? client.incomeTypes.join(', ')
    : (client.incomeTypes || 'N/A')

  const fields = [
    { label: 'Full Name', value: client.name },
    { label: 'Age', value: client.age },
    { label: 'PAN Card Number', value: client.panCardNumber },
    { label: 'Aadhar Number', value: client.aadharNumber },
    { label: 'Education Level', value: client.educationLevel || 'N/A' },
    { label: 'Professional Qualification', value: client.professionalQualification || 'N/A' },
    { label: 'Client Type', value: client.clientType || 'Retail' },
    { label: 'Debt/Loan Amount', value: client.debtLoanAmount ?? 'N/A' },
    { label: 'Amount for Investments', value: client.investmentAmount ?? 'N/A' },
    { label: 'Income Type/s', value: incomeTypesDisplay },
    { label: 'Annual Income', value: client.annualIncome ?? 'N/A' },
    { label: 'Total Net Worth', value: client.totalNetWorth ?? 'N/A' },
    { label: 'Real Estate', value: assets.realEstate ?? 'N/A' },
    { label: 'Equity', value: assets.equity ?? 'N/A' },
    { label: 'Alternatives', value: assets.alternatives ?? 'N/A' },
    { label: 'Fixed Income and Cash', value: assets.fixedIncomeAndCash ?? 'N/A' },
  ]

  const statusOptions = ['Pending', 'Contacted', 'Approved', 'Rejected']
  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Contacted: 'bg-blue-100 text-blue-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
  }

  return (
    <div className="pt-[80px] min-h-screen bg-gray-50">
      <section className="section-pad bg-primary-dark text-white">
        <div className="container-custom">
          <div className="flex justify-between items-center">
            <AnimatedSection>
              <h1 className="text-3xl md:text-4xl font-extrabold">Client Details</h1>
              <p className="text-gray-300 mt-2">Complete client profile information</p>
            </AnimatedSection>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-primary-light text-primary-dark rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container-custom max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header — no photo field exists in the schema, always show placeholder */}
              <div className="bg-gray-50 p-6 border-b border-gray-200 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center text-4xl text-gray-400">
                    👤
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-primary-dark">{client.name}</h2>
                    <p className="text-gray-600">
                      {client.clientType === 'Retail' ? 'Retail Client' : 'Corporate Client'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Submitted{' '}
                      {client.submittedAt
                        ? new Date(client.submittedAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Status selector */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={client.status || 'Pending'}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updatingStatus}
                    className={`px-3 py-2 rounded-lg font-semibold text-sm border-0 cursor-pointer ${
                      statusColors[client.status] || statusColors.Pending
                    } disabled:opacity-50`}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client Details */}
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {fields.map((field, index) => (
                    <div key={index} className="border-b border-gray-100 pb-3">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {field.label}
                      </label>
                      <p className="text-gray-900 font-medium mt-1">{field.value}</p>
                    </div>
                  ))}
                </div>

                {client.notes && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </label>
                    <p className="text-gray-900 mt-1">{client.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 py-3 bg-primary-dark text-white rounded-lg font-semibold hover:bg-black transition-colors"
                  >
                    Download PDF Report
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Delete Client
                  </button>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}

export default ClientDetail