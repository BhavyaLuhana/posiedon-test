import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import AnimatedSection from '../components/UI/AnimatedSection'
import { submitLead } from '../services/api'

const ClientOnboarding = () => {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredContactTime: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      preferredContactTime: '',
    })
  }

  const validate = () => {
    if (!formData.name || !formData.name.trim()) {
      toast.error('Please enter the client\'s full name')
      return false
    }
    if (!formData.email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return false
    }
    if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone)) {
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
      const response = await submitLead({
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        phone: formData.phone,
        preferredContactTime: formData.preferredContactTime || null,
      })

      if (response.success) {
        toast.success('Lead added successfully! The client will receive an approval email.')
        resetForm()
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error submitting lead:', error)
      if (error.response?.data?.alreadySubmitted) {
        toast.error('A lead with this email or phone already exists.')
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to add lead. Please try again.')
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
              Add Lead
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-6">Add New Client Lead</h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Enter the client's contact details. They will receive a registration link after approval.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-custom max-w-2xl mx-auto">
          <AnimatedSection>
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  ℹ️ This is a lightweight lead form. The client will complete their full financial profile after registration.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                    placeholder="Enter client's full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                    placeholder="client@email.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The client will use this email to register after approval
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    maxLength="10"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Contact Time
                    <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="preferredContactTime"
                    value={formData.preferredContactTime}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-colors"
                    placeholder="e.g., Weekday evenings, Weekend mornings"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-primary-dark text-white rounded-lg font-semibold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Adding...' : 'Add Lead'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                </div>

                <div className="text-center text-xs text-gray-400 border-t pt-4">
                  <p>Lead will be created with status: <span className="font-medium text-yellow-600">Pending</span></p>
                  <p className="mt-1">After approval, the client can register and complete their profile</p>
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