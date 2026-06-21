import React from 'react'
import AnimatedSection from '../components/UI/AnimatedSection'

const CorporatePlans = () => {
  const plans = [
    {
      title: 'Startup Consulting',
      icon: '🚀',
      services: [
        'Business Strategy',
        'Fundraising Preparation',
        'Financial Modeling',
        'Investor Deck Creation',
        'Go-To-Market Strategy',
        'Operational Structuring',
        'Growth Roadmaps'
      ],
      compensation: '5%–10% Equity',
      details: [
        'Stage of Business',
        'Strategic Complexity',
        'Time Commitment',
        'Resources Deployed',
        'Expected Value Creation'
      ]
    },
    {
      title: 'Mergers & Acquisitions Advisory',
      icon: '🏢',
      services: [
        'Buy-Side Advisory',
        'Sell-Side Advisory',
        'Target Identification',
        'Business Valuation',
        'Deal Structuring',
        'Due Diligence Coordination',
        'Investor & Buyer Outreach',
        'Negotiation Support'
      ],
      compensation: 'Success-Based Transaction Fee',
      details: [
        'Charged upon successful completion of a transaction'
      ]
    }
  ]

  return (
    <div className="pt-[80px] min-h-screen">
      <section className="section-pad bg-primary-dark text-white">
        <div className="container-custom text-center">
          <AnimatedSection>
            <div className="inline-flex px-4 py-1.5 rounded-full bg-primary-light text-primary-dark text-[0.75rem] font-bold uppercase tracking-wide mb-6">
              Corporate
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-[3.5rem] font-extrabold mb-6">2 Plans with Fees</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Strategic Growth & Transaction Advisory for businesses at every stage
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="bg-gray-50 rounded-2xl p-8 md:p-10 hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="text-5xl mb-4">{plan.icon}</div>
                  <h2 className="text-2xl font-bold text-primary-dark mb-4">{plan.title}</h2>
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-primary-dark uppercase mb-3">Services Include:</h3>
                    <ul className="space-y-2">
                      {plan.services.map((service, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-600">
                          <span className="text-primary-light">•</span>
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-primary-light/10 p-4 rounded-xl mb-4">
                    <h3 className="text-sm font-bold text-primary-dark mb-2">Compensation Structure:</h3>
                    <p className="text-lg font-bold text-primary-dark">{plan.compensation}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-primary-dark uppercase mb-2">The equity allocation depends on:</h3>
                    <ul className="space-y-1">
                      {plan.details.map((detail, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-primary-light">▸</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default CorporatePlans