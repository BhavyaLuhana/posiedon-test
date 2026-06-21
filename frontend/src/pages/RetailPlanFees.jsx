import React from 'react'
import AnimatedSection from '../components/UI/AnimatedSection'

const RetailPlanFees = () => {
  return (
    <div className="pt-[80px] min-h-screen">
      <section className="section-pad bg-primary-dark text-white">
        <div className="container-custom">
          <AnimatedSection>
            <div className="inline-flex px-4 py-1.5 rounded-full bg-primary-light text-primary-dark text-[0.75rem] font-bold uppercase tracking-wide mb-6">
              Retail
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-[3.5rem] font-extrabold mb-6">Plan | Fees | Work</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl">
              Our Wealth Management Fee Model - At Poseidon Wealth Planners, we believe our success should be aligned with our clients' success.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-extrabold text-primary-dark mb-6 text-center">Annual Advisory Fee</h2>
                <div className="bg-primary-light/10 p-8 md:p-12 rounded-2xl text-center border-2 border-primary-light">
                  <div className="text-4xl md:text-5xl font-extrabold text-primary-dark">2%</div>
                  <p className="text-lg md:text-xl text-gray-600 mt-2">per annum of Assets Under Advisory (AUA)</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="p-6 md:p-8 bg-gray-50 rounded-xl">
                  <h3 className="text-lg font-bold text-primary-dark mb-4">This fee includes:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-primary-light text-lg mt-1">✓</span>
                      <span className="text-gray-600">Comprehensive Financial Planning</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary-light text-lg mt-1">✓</span>
                      <span className="text-gray-600">Portfolio Construction</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary-light text-lg mt-1">✓</span>
                      <span className="text-gray-600">Asset Allocation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary-light text-lg mt-1">✓</span>
                      <span className="text-gray-600">Investment Monitoring</span>
                    </li>
                  </ul>
                </div>
                <div className="p-6 md:p-8 bg-gray-50 rounded-xl">
                  <h3 className="text-lg font-bold text-primary-dark mb-4">Additional Services:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-primary-light text-lg mt-1">✓</span>
                      <span className="text-gray-600">Quarterly Portfolio Reviews</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary-light text-lg mt-1">✓</span>
                      <span className="text-gray-600">Goal-Based Wealth Planning</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary-light text-lg mt-1">✓</span>
                      <span className="text-gray-600">Ongoing Advisory Support</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 p-6 md:p-8 rounded-xl border-l-4 border-primary-light">
                <h3 className="text-lg font-bold text-primary-dark mb-2">Performance-Based Fee</h3>
                <p className="text-gray-600">
                  For select mandates, an additional performance-linked fee may apply when returns exceed predetermined benchmarks or hurdle rates.
                </p>
              </div>

              <div className="mt-12 p-6 md:p-8 bg-primary-dark rounded-xl text-white">
                <h3 className="text-lg font-bold text-primary-light mb-4">Suitable For:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-primary-light">•</span>
                    <span>Professionals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-light">•</span>
                    <span>Entrepreneurs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-light">•</span>
                    <span>Business Owners</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-light">•</span>
                    <span>HNIs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-light">•</span>
                    <span>Family Wealth Structures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary-light">•</span>
                    <span>NRIs</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  )
}

export default RetailPlanFees