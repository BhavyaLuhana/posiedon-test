import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AnimatedSection from '../components/UI/AnimatedSection'

const ClientDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)

  useEffect(() => {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]')
    const found = clients.find(c => c.id === parseInt(id))
    if (found) {
      setClient(found)
    } else {
      navigate('/dashboard')
    }
  }, [id, navigate])

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-[80px]">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  const fields = [
    { label: 'Full Name', value: client.name },
    { label: 'Age', value: client.age },
    { label: 'PAN Card Number', value: client.panCard },
    { label: 'Aadhar Number', value: client.aadharNumber },
    { label: 'Education Level', value: client.educationLevel || 'N/A' },
    { label: 'Professional Qualification', value: client.professionalQualification || 'N/A' },
    { label: 'User Type', value: client.userType || 'Retail' },
    { label: 'Debt/Loan Amount', value: client.debtLoanAmount || 'N/A' },
    { label: 'Amount for Investments', value: client.investmentAmount || 'N/A' },
    { label: 'Income Type/s', value: client.incomeType || 'N/A' },
    { label: 'Annual Income', value: client.annualIncome || 'N/A' },
    { label: 'Total Net Worth', value: client.totalNetWorth || 'N/A' },
    { label: 'Real Estate', value: client.realEstate || 'N/A' },
    { label: 'Equity', value: client.equity || 'N/A' },
    { label: 'Alternatives', value: client.alternatives || 'N/A' },
    { label: 'Fixed Income and Cash', value: client.fixedIncomeCash || 'N/A' },
  ]

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
              {/* Header with Photo */}
              <div className="bg-gray-50 p-6 border-b border-gray-200 flex items-center gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {client.photo ? (
                    <img src={client.photo} alt={client.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                      👤
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary-dark">{client.name}</h2>
                  <p className="text-gray-600">
                    {client.userType === 'retail' ? 'Retail Client' : 'Corporate Client'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Client since {new Date(client.createdAt).toLocaleDateString()}
                  </p>
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

                {/* Action Buttons */}
                <div className="mt-8 flex gap-4">
                  <button
                    className="flex-1 py-3 bg-primary-dark text-white rounded-lg font-semibold hover:bg-black transition-colors"
                  >
                    Download PDF Report
                  </button>
                  <button
                    onClick={() => {
                      const clients = JSON.parse(localStorage.getItem('clients') || '[]')
                      const updated = clients.filter(c => c.id !== client.id)
                      localStorage.setItem('clients', JSON.stringify(updated))
                      navigate('/dashboard')
                    }}
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