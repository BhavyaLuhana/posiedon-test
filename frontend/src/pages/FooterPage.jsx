import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-primary-light pt-12 md:pt-20 pb-5 text-primary-dark">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start lg:items-center mb-12 lg:mb-16">
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight mb-4 md:mb-6">
              Secure your capital.<br />Optimize growth.
            </h2>
            <p className="font-bold text-base md:text-lg">
              ✉ planpotentia@gmail.com<br />✆ +91 88550 47265
            </p>
            <span className="block font-medium text-xs md:text-sm opacity-80 mt-3 md:mt-4">📍 India | Serving Global Clients</span>
          </div>

          <div className="w-full lg:w-1/2">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
              <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-primary-dark">Quick Links</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <Link to="/" className="text-sm md:text-base text-gray-600 hover:text-primary-dark transition-colors">Home</Link>
                <Link to="/about" className="text-sm md:text-base text-gray-600 hover:text-primary-dark transition-colors">About Us</Link>
                <div>
                  <div className="text-sm md:text-base text-gray-600 font-medium mb-1 md:mb-2">Retail</div>
                  <div className="space-y-1 md:space-y-2 ml-1 md:ml-2">
                    <Link to="/retail/plan-fees" className="block text-xs md:text-sm text-gray-500 hover:text-primary-dark transition-colors">Plan | Fees | Work</Link>
                    <Link to="/retail/features" className="block text-xs md:text-sm text-gray-500 hover:text-primary-dark transition-colors">Features</Link>
                    <Link to="/retail/consulting" className="block text-xs md:text-sm text-gray-500 hover:text-primary-dark transition-colors">Request Consulting</Link>
                  </div>
                </div>
                <div>
                  <div className="text-sm md:text-base text-gray-600 font-medium mb-1 md:mb-2">Corporate</div>
                  <div className="space-y-1 md:space-y-2 ml-1 md:ml-2">
                    <Link to="/corporate/plans" className="block text-xs md:text-sm text-gray-500 hover:text-primary-dark transition-colors">2 Plans with Fees</Link>
                    <Link to="/corporate/structure" className="block text-xs md:text-sm text-gray-500 hover:text-primary-dark transition-colors">Structure</Link>
                  </div>
                </div>
                <Link to="/testimonial" className="text-sm md:text-base text-gray-600 hover:text-primary-dark transition-colors">Testimonial</Link>
                <Link to="/contact" className="text-sm md:text-base text-gray-600 hover:text-primary-dark transition-colors">Contact Us</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between text-xs font-semibold pt-6 md:pt-8 border-t border-black/10 gap-3 md:gap-4 text-center md:text-left">
          <div>© 2026 Poseidon Wealth Planners. All Rights Reserved.</div>
          <div>Registered Under Udyam And Shop Act | GST No. 27CNTPC5892G1ZF</div>
        </div>
      </div>
    </footer>
  )
}

export default Footer