import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext';
import { completeClientProfile, updateClientProfile, getClientProfile } from '../services/api';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { toast } from 'react-hot-toast';

const ClientProfileForm = ({ mode = 'complete' }) => {
  const navigate = useNavigate();
  const { client, updateClient } = useClientAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    // Personal
    name: '',
    phone: '',
    preferredContactTime: '',
    age: '',
    // Education
    educationLevel: '',
    professionalQualification: '',
    clientType: 'Retail',
    // Financial
    debtLoanAmount: '',
    investmentAmount: '',
    incomeTypes: [],
    annualIncome: '',
    totalNetWorth: '',
    // Assets
    assets: {
      realEstate: '',
      equity: '',
      alternatives: '',
      fixedIncomeAndCash: ''
    }
  });

  const educationOptions = ['High School', 'Graduate', 'Post Graduate', 'Doctorate', 'Other'];
  const incomeTypeOptions = ['Salary', 'Business', 'Investments', 'Rental', 'Pension', 'Other'];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getClientProfile();
      if (data) {
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          preferredContactTime: data.preferredContactTime || '',
          age: data.age || '',
          educationLevel: data.educationLevel || '',
          professionalQualification: data.professionalQualification || '',
          clientType: data.clientType || 'Retail',
          debtLoanAmount: data.debtLoanAmount || '',
          investmentAmount: data.investmentAmount || '',
          incomeTypes: data.incomeTypes || [],
          annualIncome: data.annualIncome || '',
          totalNetWorth: data.totalNetWorth || '',
          assets: {
            realEstate: data.assets?.realEstate || '',
            equity: data.assets?.equity || '',
            alternatives: data.assets?.alternatives || '',
            fixedIncomeAndCash: data.assets?.fixedIncomeAndCash || ''
          }
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setFetching(false);
    }
  };

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
    // For edit mode, only validate what's filled
    if (mode === 'edit') {
      return true;
    }

    // For complete mode, validate all required fields
    const required = ['age', 'educationLevel', 'clientType', 'investmentAmount', 'annualIncome', 'totalNetWorth'];
    
    for (let field of required) {
      if (!formData[field]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // PAN and Aadhar are required for complete mode
    // They're handled separately with encryption on backend
    if (!formData.panCardNumber) {
      toast.error('PAN Card number is required');
      return false;
    }
    if (!formData.aadharNumber) {
      toast.error('Aadhar number is required');
      return false;
    }

    // Age validation
    if (parseInt(formData.age) < 18 || parseInt(formData.age) > 120) {
      toast.error('Age must be between 18 and 120');
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

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        age: parseInt(formData.age) || null,
        panCardNumber: formData.panCardNumber?.toUpperCase(),
        debtLoanAmount: parseFloat(formData.debtLoanAmount) || 0,
        investmentAmount: parseFloat(formData.investmentAmount) || 0,
        annualIncome: parseFloat(formData.annualIncome) || 0,
        totalNetWorth: parseFloat(formData.totalNetWorth) || 0,
        assets: {
          realEstate: parseFloat(formData.assets.realEstate) || 0,
          equity: parseFloat(formData.assets.equity) || 0,
          alternatives: parseFloat(formData.assets.alternatives) || 0,
          fixedIncomeAndCash: parseFloat(formData.assets.fixedIncomeAndCash) || 0
        }
      };

      let response;
      if (mode === 'complete') {
        response = await completeClientProfile(submitData);
        toast.success('Profile completed successfully!');
      } else {
        response = await updateClientProfile(submitData);
        toast.success('Profile updated successfully!');
      }

      // Update client context
      if (response.data) {
        updateClient(response.data);
      }

      // Navigate back to dashboard
      navigate('/client-dashboard');
    } catch (error) {
      console.error('Profile submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-[80px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-light border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const isCompleteMode = mode === 'complete';
  const title = isCompleteMode ? 'Complete Your Profile' : 'Edit Profile';
  const subtitle = isCompleteMode 
    ? 'Fill in your financial details to complete your profile' 
    : 'Update your personal and financial information';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="container-custom max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-primary-dark">
                {title}
              </h1>
              <p className="text-text-muted mt-2">{subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Type Selection - Only in complete mode */}
              {isCompleteMode && (
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
              )}

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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-dark mb-2">
                    Preferred Contact Time
                  </label>
                  <input
                    type="text"
                    name="preferredContactTime"
                    value={formData.preferredContactTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    placeholder="e.g., Weekday evenings"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-dark mb-2">
                    Age {isCompleteMode && '*'}
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    placeholder="Enter your age"
                    min="18"
                    max="120"
                    required={isCompleteMode}
                  />
                </div>
              </div>

              {/* PAN & Aadhar - Only in complete mode */}
              {isCompleteMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary-dark mb-2">
                      PAN Card Number *
                    </label>
                    <input
                      type="text"
                      name="panCardNumber"
                      value={formData.panCardNumber || ''}
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
                      value={formData.aadharNumber || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                      placeholder="Enter 12-digit Aadhar number"
                      maxLength="12"
                      required
                    />
                    <p className="text-xs text-text-muted mt-1">🔒 Encrypted for security</p>
                  </div>
                </div>
              )}

              {/* Education & Professional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary-dark mb-2">
                    Education Level {isCompleteMode && '*'}
                  </label>
                  <select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    required={isCompleteMode}
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
                    Amount for Investments (₹) {isCompleteMode && '*'}
                  </label>
                  <input
                    type="number"
                    name="investmentAmount"
                    value={formData.investmentAmount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    placeholder="Enter investment amount"
                    min="0"
                    required={isCompleteMode}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary-dark mb-2">
                  Income Type/s
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
                    Annual Income (₹) {isCompleteMode && '*'}
                  </label>
                  <input
                    type="number"
                    name="annualIncome"
                    value={formData.annualIncome}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    placeholder="Enter annual income"
                    min="0"
                    required={isCompleteMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-dark mb-2">
                    Total Net Worth (₹) {isCompleteMode && '*'}
                  </label>
                  <input
                    type="number"
                    name="totalNetWorth"
                    value={formData.totalNetWorth}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                    placeholder="Enter total net worth"
                    min="0"
                    required={isCompleteMode}
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

              {/* Submit Button */}
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
                      Saving...
                    </span>
                  ) : (
                    isCompleteMode ? 'Complete Profile' : 'Update Profile'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/client-dashboard')}
                  className="flex-1 bg-gray-200 text-primary-dark font-bold py-4 px-8 rounded-lg hover:bg-gray-300 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ClientProfileForm;