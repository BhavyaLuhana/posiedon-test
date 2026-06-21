import React, { useState } from 'react'
import AnimatedSection from '../components/UI/AnimatedSection'

const RetailConsulting = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    investmentGoal: '',
    message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('Thank you for your request! Our team will contact you within 24 hours.')
    setFormData({ name: '', email: '', phone: '', investmentGoal: '', message: '' })
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="pt-[80px] min-h-screen">
      <section className="section-pad bg-primary-dark text-white">
        <div className="container-custom text-center">
          <AnimatedSection>
            <div className="inline-flex px-4 py-1.5 rounded-full bg-primary-light text-primary-dark text-[0.75rem] font-bold uppercase tracking-wide mb-6">
              Retail
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-[3.5rem] font-extrabold mb-6">Request Consulting</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Schedule a consultation with our expert advisors to discuss your wealth management needs
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-custom max-w-3xl mx-auto">
          <AnimatedSection>
            <div className="bg-gray-50 p-6 md:p-10 rounded-2xl">
              <h2 className="text-2xl font-bold text-primary-dark mb-6 text-center">Let's Start Your Wealth Journey</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-4 border border-gray-200 rounded-lg focus:border-primary-light focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-4 border border-gray-200 rounded-lg focus:border-primary-light focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full p-4 border border-gray-200 rounded-lg focus:border-primary-light focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <select
                    name="investmentGoal"
                    value={formData.investmentGoal}
                    onChange={handleChange}
                    required
                    className="w-full p-4 border border-gray-200 rounded-lg focus:border-primary-light focus:outline-none transition-colors bg-white"
                  >
                    <option value="">Select Your Investment Goal</option>
                    <option value="retirement">Retirement Planning</option>
                    <option value="wealth">Wealth Accumulation</option>
                    <option value="education">Education Funding</option>
                    <option value="real-estate">Real Estate Investment</option>
                    <option value="business">Business Investment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <textarea
                    name="message"
                    placeholder="Additional Message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    className="w-full p-4 border border-gray-200 rounded-lg focus:border-primary-light focus:outline-none transition-colors resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-primary-dark text-white rounded-lg font-semibold hover:bg-black transition-colors"
                >
                  Request Consultation
                </button>
              </form>
              <p className="text-xs text-gray-500 text-center mt-4">
                By submitting this form, you agree to our privacy policy and terms of service.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}

export default RetailConsulting