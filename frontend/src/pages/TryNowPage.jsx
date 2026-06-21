import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';

const TryNowPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    panCardNumber: '',
    aadharNumber: '',
    educationLevel: '',
    professionalQualification: '',
    clientType: 'Retail',
    debtLoanAmount: '',
    investmentAmount: '',
    incomeTypes: [],
    annualIncome: '',
    totalNetWorth: '',
    assets: {
      realEstate: '',
      equity: '',
      alternatives: '',
      fixedIncomeAndCash: ''
    }
  });

  const educationOptions = ['High School', 'Graduate', 'Post Graduate', 'Doctorate', 'Other'];
  const incomeTypeOptions = ['Salary', 'Business', 'Investments', 'Rental', 'Pension', 'Other'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        incomeTypes: checked 
          ? [...prev.incomeTypes, value]
          : prev.incomeTypes.filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const required = ['name', 'email', 'phone', 'age', 'panCardNumber', 'aadharNumber', 
                      'educationLevel', 'clientType', 'investmentAmount', 'annualIncome', 'totalNetWorth'];
    
    for (let field of required) {
      if (!formData[field]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    // Email validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    
    // PAN validation
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(formData.panCardNumber.toUpperCase())) {
      toast.error('Please enter a valid PAN card number (e.g., ABCDE1234F)');
      return false;
    }
    
    // Aadhar validation
    const aadharRegex = /^[0-9]{12}$/;
    if (!aadharRegex.test(formData.aadharNumber)) {
      toast.error('Please enter a valid 12-digit Aadhar number');
      return false;
    }
    
    // Age validation
    if (parseInt(formData.age) < 18 || parseInt(formData.age) > 100) {
      toast.error('Age must be between 18 and 100');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const submitData = {
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
          fixedIncomeAndCash: parseFloat(formData.assets.fixedIncomeAndCash) || 0
        }
      };

      const response = await axios.post('http://localhost:5000/api/clients/submit', submitData);
      
      if (response.data.success) {
        setSubmitted(true);
        toast.success('✅ Form submitted successfully! We will contact you within 24-48 hours.');
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Submission error:', error);
      if (error.response?.data?.alreadySubmitted) {
        toast.error('You have already submitted your details. Our team will contact you shortly.');
        setSubmitted(true);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to submit form. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // If already submitted, show success message
  if (submitted) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
          <div className="container-custom max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary-dark mb-4">
                Form Submitted Successfully! 🎉
              </h2>
              <p className="text-text-muted text-lg mb-4">
                Thank you for sharing your details with us.
              </p>
              <div className="bg-primary-light/10 rounded-lg p-4 mb-6">
                <p className="text-sm text-primary-dark font-medium">
                  📧 A confirmation email has been sent to your registered email address.
                </p>
              </div>
              <div className="space-y-3 text-left max-w-md mx-auto">
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <span className="text-green-500">✓</span>
                  <span>Our team will review your details</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <span className="text-green-500">✓</span>
                  <span>You'll receive a call within 24-48 hours</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-muted">
                  <span className="text-green-500">✓</span>
                  <span>Keep your documents ready for verification</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/')}
                className="mt-8 bg-primary-light text-primary-dark font-bold px-8 py-3 rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Return to Homepage
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="container-custom max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Trust Banner */}
          <div className="bg-gradient-to-r from-primary-dark to-primary-dark/90 rounded-2xl p-4 md:p-6 mb-6 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm font-medium">256-bit SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm font-medium">Your data is secure</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">We never share your data</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-primary-dark">
                Client Onboarding Form
              </h1>
              <p className="text-text-muted mt-2">
                Fill in your details and our team will contact you within 24-48 hours
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-light/10 rounded-full text-xs font-medium text-primary-dark">
                  📋 Confidential
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-light/10 rounded-full text-xs font-medium text-primary-dark">
                  🔒 Encrypted
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-light/10 rounded-full text-xs font-medium text-primary-dark">
                  ⏱️ 24-48 hrs response
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Type Selection */}
              <div className="bg-primary-dark/5 rounded-xl p-6">
                <label className="block text-sm font-semibold text-primary-dark mb-3">
                  I am a * 
                </label>
                <div className="flex gap-4 flex-wrap">
                  {['Retail', 'Corporate'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="clientType"
                        value={type}
                        checked={formData.clientType === type}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-light"
                      />
                      <span className="font-medium">{type} Client</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-dark mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-dark mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-dark mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    placeholder="9876543210"
                    maxLength="10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-dark mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    placeholder="Enter your age"
                    min="18"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-dark mb-2">
                    PAN Card Number *
                  </label>
                  <input
                    type="text"
                    name="panCardNumber"
                    value={formData.panCardNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent uppercase"
                    placeholder="ABCDE1234F"
                    maxLength="10"
                    required
                  />
                  <p className="text-xs text-text-muted mt-1">🔒 Encrypted for security</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-dark mb-2">
                    Aadhar Number *
                  </label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    placeholder="Enter 12-digit Aadhar number"
                    maxLength="12"
                    required
                  />
                  <p className="text-xs text-text-muted mt-1">🔒 Encrypted for security</p>
                </div>
              </div>

              {/* Education & Professional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-dark mb-2">
                    Education Level *
                  </label>
                  <select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    required
                  >
                    <option value="">Select education level</option>
                    {educationOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-dark mb-2">
                    Professional Qualification
                  </label>
                  <input
                    type="text"
                    name="professionalQualification"
                    value={formData.professionalQualification}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    placeholder="e.g., CA, MBA, B.Tech"
                  />
                </div>
              </div>

              {/* Financial Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-dark mb-2">
                    Debt/Loan Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="debtLoanAmount"
                    value={formData.debtLoanAmount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-dark mb-2">
                    Amount for Investments (₹) *
                  </label>
                  <input
                    type="number"
                    name="investmentAmount"
                    value={formData.investmentAmount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    placeholder="Enter investment amount"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary-dark mb-2">
                  Income Type/s *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {incomeTypeOptions.map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={type}
                        checked={formData.incomeTypes.includes(type)}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-light rounded"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-dark mb-2">
                    Annual Income (₹) *
                  </label>
                  <input
                    type="number"
                    name="annualIncome"
                    value={formData.annualIncome}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    placeholder="Enter annual income"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-dark mb-2">
                    Total Net Worth (₹) *
                  </label>
                  <input
                    type="number"
                    name="totalNetWorth"
                    value={formData.totalNetWorth}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    placeholder="Enter total net worth"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Asset Classes */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-primary-dark mb-4">Asset Allocation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary-dark mb-2">
                      Real Estate (₹)
                    </label>
                    <input
                      type="number"
                      name="assets.realEstate"
                      value={formData.assets.realEstate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary-dark mb-2">
                      Equity (₹)
                    </label>
                    <input
                      type="number"
                      name="assets.equity"
                      value={formData.assets.equity}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary-dark mb-2">
                      Alternatives (₹)
                    </label>
                    <input
                      type="number"
                      name="assets.alternatives"
                      value={formData.assets.alternatives}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary-dark mb-2">
                      Fixed Income & Cash (₹)
                    </label>
                    <input
                      type="number"
                      name="assets.fixedIncomeAndCash"
                      value={formData.assets.fixedIncomeAndCash}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy & Submit */}
              <div className="bg-primary-dark/5 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="privacy"
                    className="mt-1 w-4 h-4 text-primary-light"
                    required
                  />
                  <label htmlFor="privacy" className="text-sm text-text-muted">
                    I confirm that the information provided is accurate and I agree to the 
                    <a href="/privacy" className="text-primary-dark font-medium hover:underline ml-1">Privacy Policy</a>
                    . My data will be encrypted and kept confidential.
                  </label>
                </div>
              </div>

              <div className="flex gap-4 flex-wrap">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary-light text-primary-dark font-bold py-4 px-8 rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Form'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 bg-gray-200 text-primary-dark font-bold py-4 px-8 rounded-lg hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>

              {/* Trust Footer */}
              <div className="text-center text-xs text-text-muted border-t pt-4">
                <p>🔒 All data is encrypted using 256-bit AES encryption</p>
                <p className="mt-1">📋 Your information will only be used for advisory purposes</p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TryNowPage;