import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import AnimatedSection from '../components/UI/AnimatedSection'
import { submitClientForm } from '../services/api'

const educationOptions = ['High School', 'Graduate', 'Post Graduate', 'Doctorate', 'Other']
const incomeTypeOptions = ['Salary', 'Business', 'Investments', 'Rental', 'Pension', 'Other']

const ClientOnboarding = () => {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    panCardNumber: '',
    aadharNumber: '',
    educationLevel: '',
    professionalQualification: '',
    debtLoanAmount: '',
    investmentAmount: '',
    incomeTypes: [],
    annualIncome: '',
    totalNetWorth: '',
    assets: {
      realEstate: '',
      equity: '',
      alternatives: '',
      fixedIncomeAndCash: '',
    },
    clientType: 'Retail',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAssetChange = (e) => {
    setFormData({
      ...formData,
      assets: { ...formData.assets, [e.target.name]: e.target.value },
    })
  }

  const toggleIncomeType = (type) => {
    setFormData((prev) => ({
      ...prev,
      incomeTypes: prev.incomeTypes.includes(type)
        ? prev.incomeTypes.filter((t) => t !== type)
        : [...prev.incomeTypes, type],
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '', email: '', phone: '', age: '',
      panCardNumber: '', aadharNumber: '',
      educationLevel: '', professionalQualification: '',
      debtLoanAmount: '', investmentAmount: '',
      incomeTypes: [], annualIncome: '', totalNetWorth: '',
      assets: { realEstate: '', equity: '', alternatives: '', fixedIncomeAndCash: '' },
      clientType: 'Retail',
    })
  }

  const validate = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.age ||
        !formData.panCardNumber || !formData.aadharNumber || !formData.educationLevel ||
        !formData.investmentAmount || !formData.annualIncome || !formData.totalNetWorth) {
      toast.error('Please fill in all required fields')
      return false
    }
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    if (!panRegex.test(formData.panCardNumber.toUpperCase())) {
      toast.error('Please enter a valid PAN card number (e.g., ABCDE1234F)')
      return false
    }
    if (!/^[0-9]{12}$/.test(formData.aadharNumber)) {
      toast.error('Please enter a valid 12-digit Aadhar number')
      return false
    }
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return false
    }
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        panCardNumber: formData.panCardNumber.toUpperCase(),
        debtLoanAmount: parseFloat(formData.debtLoanAmount) || 0,
        investmentAmount: parseFloat(formData.investmentAmount),
        annualIncome: parseFloat(formData.annualIncome),
        totalNetWorth: parseFloat(formData.totalNetWorth),
        assets: {
          realEstate: parseFloat(formData.assets.realEstate) || 0,
          equity: parseFloat(formData.assets.equity) || 0,
          alternatives: parseFloat(formData.assets.alternatives) || 0,
          fixedIncomeAndCash: parseFloat(formData.assets.fixedIncomeAndCash) || 0,
        },
      }

      const response = await submitClientForm(payload)

      if (response.success) {
        toast.success('Client onboarded successfully!')
        resetForm()
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error submitting client:', error)
      if (error.response?.data?.alreadySubmitted) {
        toast.error('A client with this PAN, Aadhar, email, or phone already exists.')
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to onboard client. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="pt-[80px] min-h-screen bg-gray-50">
      <section className="section-pad bg-primary-dark text-white">
        <div className="container-custom text-center">
          <AnimatedSection>
            <div className="inline-flex px-4 py-1.5 rounded-full bg-primary-light text-primary-dark text-[0.75rem] font-bold uppercase tracking-wide mb-6">
              Client Onboarding
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-6">Client Registration Form</h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Please fill in all the details below to complete your client profile
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-custom max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, clientType: 'Retail' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.clientType === 'Retail'
                        ? 'border-primary-light bg-primary-light/10'
                        : 'border-gray-200 hover:border-primary-light'
                    }`}
                  >
                    <span className={`font-bold ${formData.clientType === 'Retail' ? 'text-primary-dark' : 'text-gray-600'}`}>
                      Retail Client
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, clientType: 'Corporate' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.clientType === 'Corporate'
                        ? 'border-primary-light bg-primary-light/10'
                        : 'border-gray-200 hover:border-primary-light'
                    }`}
                  >
                    <span className={`font-bold ${formData.clientType === 'Corporate' ? 'text-primary-dark' : 'text-gray-600'}`}>
                      Corporate Client
                    </span>
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold text-primary-dark mb-6">Personal Details</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="Enter full name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="client@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required maxLength="10"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="9876543210" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                      <input type="number" name="age" value={formData.age} onChange={handleChange} required min="18" max="100"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="Enter age" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card Number *</label>
                      <input type="text" name="panCardNumber" value={formData.panCardNumber} onChange={handleChange} required maxLength="10"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors uppercase"
                        placeholder="ABCDE1234F" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Number *</label>
                      <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} required maxLength="12"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="12-digit Aadhar number" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Education Level *</label>
                      <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors bg-white">
                        <option value="">Select education level</option>
                        {educationOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Professional Qualification</label>
                      <input type="text" name="professionalQualification" value={formData.professionalQualification} onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="e.g., CA, MBA, Engineer" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold text-primary-dark mb-6">Financial Details</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Debt/Loan Amount</label>
                      <input type="number" name="debtLoanAmount" value={formData.debtLoanAmount} onChange={handleChange} min="0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="₹" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount for Investments *</label>
                      <input type="number" name="investmentAmount" value={formData.investmentAmount} onChange={handleChange} required min="0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="₹" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Income Type/s</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {incomeTypeOptions.map((type) => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.incomeTypes.includes(type)} onChange={() => toggleIncomeType(type)}
                              className="w-4 h-4 text-primary-light rounded" />
                            <span className="text-sm">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Annual Income *</label>
                      <input type="number" name="annualIncome" value={formData.annualIncome} onChange={handleChange} required min="0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="₹" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Net Worth *</label>
                      <input type="number" name="totalNetWorth" value={formData.totalNetWorth} onChange={handleChange} required min="0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="₹" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold text-primary-dark mb-6">Asset Amount Classwise</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">1. Real Estate</label>
                      <input type="number" name="realEstate" value={formData.assets.realEstate} onChange={handleAssetChange} min="0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="₹" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">2. Equity</label>
                      <input type="number" name="equity" value={formData.assets.equity} onChange={handleAssetChange} min="0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="₹" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">3. Alternatives</label>
                      <input type="number" name="alternatives" value={formData.assets.alternatives} onChange={handleAssetChange} min="0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="₹" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">4. Fixed Income and Cash</label>
                      <input type="number" name="fixedIncomeAndCash" value={formData.assets.fixedIncomeAndCash} onChange={handleAssetChange} min="0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="₹" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3 bg-primary-dark text-white rounded-lg font-semibold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitting ? 'Submitting...' : 'Submit Client Details'}
                  </button>
                  <button type="button" onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}

export default ClientOnboarding