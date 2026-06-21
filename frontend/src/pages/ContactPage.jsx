import React, { useState } from 'react'
import AnimatedSection from '../components/UI/AnimatedSection'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('Thank you for your inquiry! We will contact you soon.')
    setFormData({ name: '', email: '', phone: '', message: '' })
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="pt-[80px]">
      <section className="section-pad bg-primary-dark text-white">
        <div className="container-custom text-center">
          <AnimatedSection>
            <div className="inline-flex px-4 py-1.5 rounded-full bg-primary-light text-primary-dark text-[0.75rem] font-bold uppercase tracking-wide mb-6">
              Get in Touch
            </div>
            <h1 className="text-[3.5rem] font-extrabold mb-6">Start Your Financial Journey</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Ready to secure your financial future? Let's discuss how we can help you achieve your goals.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12">
            <AnimatedSection animation="fade-right">
              <div>
                <h2 className="text-3xl font-extrabold text-primary-dark mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-dark mb-2">Email</h3>
                    <p className="text-text-muted">planpotentia@gmail.com</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-dark mb-2">Phone</h3>
                    <p className="text-text-muted">+91 88550 47265</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-dark mb-2">Location</h3>
                    <p className="text-text-muted">India | Serving Global Clients</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-dark mb-2">Office Hours</h3>
                    <p className="text-text-muted">Monday - Friday: 10:00 AM - 7:00 PM IST</p>
                    <p className="text-text-muted">Saturday: By Appointment Only</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-left">
              <div className="bg-gray-50 p-8 rounded-2xl">
                <h2 className="text-2xl font-extrabold text-primary-dark mb-6">Send us a Message</h2>
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
                      className="w-full p-4 border border-gray-200 rounded-lg focus:border-primary-light focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <textarea
                      name="message"
                      placeholder="Your Message / Investment Goals"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="4"
                      className="w-full p-4 border border-gray-200 rounded-lg focus:border-primary-light focus:outline-none transition-colors resize-none"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-primary-dark text-white rounded-lg font-semibold hover:bg-black transition-colors cursor-pointer"
                  >
                    Send Message ↗
                  </button>
                </form>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage