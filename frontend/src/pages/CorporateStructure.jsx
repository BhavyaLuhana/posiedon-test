import React from 'react'
import AnimatedSection from '../components/UI/AnimatedSection'

const CorporateStructure = () => {
  const structures = [
    {
      title: 'Startup Consulting Engagement',
      steps: [
        'Discovery & Assessment',
        'Strategy Development',
        'Implementation Planning',
        'Execution Support',
        'Growth Monitoring'
      ],
      details: 'Equity-based compensation aligned with business growth and success'
    },
    {
      title: 'M&A Advisory Process',
      steps: [
        'Initial Consultation & Needs Assessment',
        'Target Identification & Evaluation',
        'Valuation & Deal Structuring',
        'Due Diligence & Negotiation',
        'Transaction Closing & Support'
      ],
      details: 'Success-based fee structure ensures alignment with client objectives'
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
            <h1 className="text-3xl md:text-4xl lg:text-[3.5rem] font-extrabold mb-6">Structure</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Our structured approach to corporate advisory services
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-custom max-w-4xl mx-auto">
          {structures.map((structure, index) => (
            <AnimatedSection key={index} delay={index * 0.2}>
              <div className={`mb-12 ${index === 0 ? '' : 'pt-12 border-t border-gray-200'}`}>
                <h2 className="text-2xl font-bold text-primary-dark mb-6">{structure.title}</h2>
                <div className="relative">
                  {structure.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-4 mb-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center text-primary-dark font-bold text-sm">
                          {idx + 1}
                        </div>
                        {idx < structure.steps.length - 1 && (
                          <div className="w-0.5 h-8 bg-primary-light/30"></div>
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-gray-700 font-medium">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border-l-4 border-primary-light">
                  <p className="text-gray-600">{structure.details}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </div>
  )
}

export default CorporateStructure