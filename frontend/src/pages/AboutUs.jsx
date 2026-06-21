import React from 'react'
import AnimatedSection from '../components/UI/AnimatedSection'

const AboutUs = () => {
  return (
    <div className="pt-[80px] min-h-screen">
      <section className="section-pad bg-primary-dark text-white">
        <div className="container-custom text-center">
          <AnimatedSection>
            <div className="inline-flex px-4 py-1.5 rounded-full bg-primary-light text-primary-dark text-[0.75rem] font-bold uppercase tracking-wide mb-6">
              About Us
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-[3.5rem] font-extrabold mb-6">Poseidon Wealth Planners</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Creating lasting wealth for individuals, families, founders, and businesses through disciplined advice and aligned incentives.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-custom max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-primary-dark mb-4">Why Clients Work With Us</h2>
              <p className="text-gray-600 mb-6">
                Unlike traditional advisors who focus solely on investments or consulting, Poseidon Wealth Planners combines:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-primary-light text-xl">✓</span>
                  <span className="text-gray-700">Wealth Management</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-primary-light text-xl">✓</span>
                  <span className="text-gray-700">Strategic Consulting</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-primary-light text-xl">✓</span>
                  <span className="text-gray-700">Transaction Advisory</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-primary-light text-xl">✓</span>
                  <span className="text-gray-700">Founder Advisory</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                  <span className="text-primary-light text-xl">✓</span>
                  <span className="text-gray-700">Long-Term Partnership</span>
                </div>
              </div>
            </div>

            <div className="bg-primary-dark text-white p-8 md:p-12 rounded-2xl text-center">
              <h3 className="text-xl font-bold text-primary-light mb-4">Our Objective</h3>
              <p className="text-lg">
                To create lasting wealth for individuals, families, founders, and businesses through disciplined advice and aligned incentives.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}

export default AboutUs