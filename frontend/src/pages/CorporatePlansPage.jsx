import React from 'react'
import AnimatedSection from '../components/UI/AnimatedSection'

const CorporatePlansPage = () => {
  return (
    <div className="pt-[80px] min-h-screen">
      <section className="section-pad bg-primary-dark text-white">
        <div className="container-custom text-center">
          <AnimatedSection>
            <div className="inline-flex px-4 py-1.5 rounded-full bg-primary-light text-primary-dark text-[0.75rem] font-bold uppercase tracking-wide mb-6">
              Corporate Plans
            </div>
            <h1 className="text-[3.5rem] font-extrabold mb-6">Corporate Wealth Solutions</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Coming Soon! Enterprise-grade financial solutions for businesses and corporations.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection>
              <div className="mb-12">
                <div className="text-6xl mb-6">🏢</div>
                <h2 className="text-3xl font-extrabold text-primary-dark mb-4">Coming Soon</h2>
                <p className="text-text-muted text-lg mb-8">
                  Our corporate wealth solutions are in development. We're creating comprehensive financial 
                  strategies for businesses of all sizes to optimize their capital and growth potential.
                </p>
                <div className="bg-gray-50 p-8 rounded-2xl">
                  <h3 className="text-xl font-bold text-primary-dark mb-4">Coming features:</h3>
                  <ul className="space-y-3 text-left max-w-md mx-auto">
                    <li className="flex items-center gap-3">
                      <span className="text-primary-light text-xl">✓</span>
                      <span className="text-text-muted">Corporate treasury management</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-primary-light text-xl">✓</span>
                      <span className="text-text-muted">Business valuation services</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-primary-light text-xl">✓</span>
                      <span className="text-text-muted">M&A advisory</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-primary-light text-xl">✓</span>
                      <span className="text-text-muted">ESOP and funding solutions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CorporatePlansPage