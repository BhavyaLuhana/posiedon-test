import React from 'react'
import AnimatedSection from '../components/UI/AnimatedSection'

const PlansPage = () => {
  const plans = [
    {
      title: 'Investment Planning',
      price: '1.5% - 2.5% AUA',
      subPrice: 'OR Flat ₹75,000 (< 1.5 Yrs)',
      features: ['Principal Amount > 5 Lakh INR', 'Consultancy across Financial Assets', 'Fees regulated under SEBI Guidelines', 'Quarterly Portfolio Review', 'Direct Access to Advisor'],
      recommended: false
    },
    {
      title: 'Startup Assistance',
      price: '3% – 5% Equity',
      subPrice: '+ 5% of Net Profits',
      features: ['Strategic & Management Consulting', 'Subject to Vesting Policies', 'Independent of advisory', 'Business Plan Development', 'Fundraising Support'],
      recommended: true
    },
    {
      title: 'Transaction Advisory',
      price: 'Deal Dependent',
      subPrice: 'One-time fixed fee',
      features: ['Specific opportunity evaluation', 'Comprehensive Due Diligence', 'Documentation support', 'Negotiation Assistance', 'Legal Compliance Review'],
      recommended: false
    }
  ]

  return (
    <div className="pt-[80px]">
      <section className="section-pad bg-primary-dark text-white">
        <div className="container-custom text-center">
          <AnimatedSection>
            <div className="inline-flex px-4 py-1.5 rounded-full bg-primary-light text-primary-dark text-[0.75rem] font-bold uppercase tracking-wide mb-6">
              Pricing Plans
            </div>
            <h1 className="text-[3.5rem] font-extrabold mb-6">Transparent Advisory Plans</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the plan that best fits your financial goals and investment needs
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-pad bg-gray-50">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className={`bg-white rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                  plan.recommended ? 'ring-2 ring-primary-light shadow-xl' : 'border border-gray-200'
                }`}>
                  {plan.recommended && (
                    <div className="inline-block px-3 py-1 rounded-full bg-primary-light text-primary-dark text-xs font-bold mb-4">
                      Recommended
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-primary-dark mb-2">{plan.title}</h3>
                  <div className="text-3xl font-bold text-primary-dark mb-1">{plan.price}</div>
                  <div className="text-sm text-text-muted mb-6">{plan.subPrice}</div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-600">
                        <span className="text-primary-light text-lg">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full py-3 bg-primary-dark text-white rounded-lg font-semibold hover:bg-black transition-colors cursor-pointer">
                    Choose Plan
                  </button>
                </div>
              </AnimatedSection>
            ))}
          </div>
          
          <div className="mt-12 p-6 bg-primary-light/10 rounded-xl text-center">
            <p className="text-text-muted">*All fees are regulated under SEBI Guidelines. Custom plans available for HNI clients.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PlansPage