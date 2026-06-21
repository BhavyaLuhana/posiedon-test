import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AnimatedSection from '../components/UI/AnimatedSection'

const ClientOnboarding = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    // Personal Details
    name: '',
    age: '',
    panCard: '',
    aadharNumber: '',
    educationLevel: '',
    professionalQualification: '',
    
    // Financial Details
    debtLoanAmount: '',
    investmentAmount: '',
    incomeType: '',
    annualIncome: '',
    totalNetWorth: '',
    
    // Asset Details
    realEstate: '',
    equity: '',
    alternatives: '',
    fixedIncomeCash: '',
    
    // User Type
    userType: 'retail', // retail or corporate
  })

  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Save client data to localStorage (for demo purposes)
    const existingClients = JSON.parse(localStorage.getItem('clients') || '[]')
    const newClient = {
      id: Date.now(),
      ...formData,
      photo: photoPreview,
      createdAt: new Date().toISOString()
    }
    existingClients.push(newClient)
    localStorage.setItem('clients', JSON.stringify(existingClients))
    
    alert('Client onboarded successfully!')
    navigate('/dashboard')
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
                {/* Client Photo */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-primary-light overflow-hidden bg-gray-100 flex items-center justify-center">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Client" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl text-gray-400">📸</span>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-primary-dark text-white p-2 rounded-full cursor-pointer hover:bg-black transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Upload Client Photo</p>
                </div>

                {/* User Type Selection */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: 'retail' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.userType === 'retail'
                        ? 'border-primary-light bg-primary-light/10'
                        : 'border-gray-200 hover:border-primary-light'
                    }`}
                  >
                    <span className={`font-bold ${formData.userType === 'retail' ? 'text-primary-dark' : 'text-gray-600'}`}>
                      Retail Client
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, userType: 'corporate' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.userType === 'corporate'
                        ? 'border-primary-light bg-primary-light/10'
                        : 'border-gray-200 hover:border-primary-light'
                    }`}
                  >
                    <span className={`font-bold ${formData.userType === 'corporate' ? 'text-primary-dark' : 'text-gray-600'}`}>
                      Corporate Client
                    </span>
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold text-primary-dark mb-6">Personal Details</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="Enter age"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PAN Card Number</label>
                      <input
                        type="text"
                        name="panCard"
                        value={formData.panCard}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="Enter PAN card number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Number</label>
                      <input
                        type="text"
                        name="aadharNumber"
                        value={formData.aadharNumber}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="Enter Aadhar number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
                      <input
                        type="text"
                        name="educationLevel"
                        value={formData.educationLevel}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="e.g., Graduate, Post Graduate"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Professional Qualification</label>
                      <input
                        type="text"
                        name="professionalQualification"
                        value={formData.professionalQualification}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="e.g., CA, MBA, Engineer"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold text-primary-dark mb-6">Financial Details</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Debt/Loan Amount</label>
                      <input
                        type="text"
                        name="debtLoanAmount"
                        value={formData.debtLoanAmount}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="₹"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount for Investments</label>
                      <input
                        type="text"
                        name="investmentAmount"
                        value={formData.investmentAmount}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="₹"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Income Type/s</label>
                      <input
                        type="text"
                        name="incomeType"
                        value={formData.incomeType}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="e.g., Salary, Business, Rental"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Annual Income</label>
                      <input
                        type="text"
                        name="annualIncome"
                        value={formData.annualIncome}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="₹"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Net Worth</label>
                      <input
                        type="text"
                        name="totalNetWorth"
                        value={formData.totalNetWorth}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="₹"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold text-primary-dark mb-6">Asset Amount Classwise</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">1. Real Estate</label>
                      <input
                        type="text"
                        name="realEstate"
                        value={formData.realEstate}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="₹"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">2. Equity</label>
                      <input
                        type="text"
                        name="equity"
                        value={formData.equity}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="₹"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">3. Alternatives</label>
                      <input
                        type="text"
                        name="alternatives"
                        value={formData.alternatives}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="₹"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">4. Fixed Income and Cash</label>
                      <input
                        type="text"
                        name="fixedIncomeCash"
                        value={formData.fixedIncomeCash}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                        placeholder="₹"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary-dark text-white rounded-lg font-semibold hover:bg-black transition-colors"
                  >
                    Submit Client Details
                  </button>
                  <button
                    type="reset"
                    onClick={() => {
                      setFormData({
                        name: '',
                        age: '',
                        panCard: '',
                        aadharNumber: '',
                        educationLevel: '',
                        professionalQualification: '',
                        debtLoanAmount: '',
                        investmentAmount: '',
                        incomeType: '',
                        annualIncome: '',
                        totalNetWorth: '',
                        realEstate: '',
                        equity: '',
                        alternatives: '',
                        fixedIncomeCash: '',
                        userType: 'retail',
                      })
                      setPhoto(null)
                      setPhotoPreview(null)
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
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