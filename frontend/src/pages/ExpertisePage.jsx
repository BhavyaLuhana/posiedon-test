import React from 'react'
import AnimatedSection from '../components/UI/AnimatedSection'

const ExpertisePage = () => {
  const expertiseAreas = [
    { title: 'Equity Investing', desc: 'Short, Positional & Long-term strategic equity deployment. Deep fundamental analysis and technical research for optimal entry and exit points.', icon: '📈' },
    { title: 'Metal Investments', desc: 'Tactical asset allocation in Gold, Silver, and related instruments. Hedging strategies and commodity market analysis.', icon: '🥇' },
    { title: 'Small-Scale Business', desc: 'In-depth opportunity analysis and operational consulting. Helping small businesses scale and optimize operations.', icon: '🏪' },
    { title: 'Capital Conversion', desc: 'Advanced money optimization and liquidity conversion strategies. Maximizing returns while maintaining flexibility.', icon: '💰' },
    { title: 'Business Valuation', desc: 'Comprehensive business metrics evaluation and health analysis. Accurate valuation for mergers, acquisitions, and investments.', icon: '📊' },
    { title: 'Risk Management', desc: 'Portfolio protection strategies and downside risk mitigation. Ensuring capital preservation in volatile markets.', icon: '🛡️' }
  ]

  return (
    <div className="pt-[80px]">
      <section className="section-pad bg-primary-dark text-white">
        <div className="container-custom text-center">
          <AnimatedSection>
            <div className="inline-flex px-4 py-1.5 rounded-full bg-primary-light text-primary-dark text-[0.75rem] font-bold uppercase tracking-wide mb-6">
              Our Expertise
            </div>
            <h1 className="text-[3.5rem] font-extrabold mb-6">Areas of Specialization</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive financial expertise across multiple asset classes and business domains
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {expertiseAreas.map((area, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="p-8 rounded-xl border border-gray-200 hover:border-primary-light hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <div className="text-4xl mb-4">{area.icon}</div>
                  <h3 className="text-xl font-bold text-primary-dark mb-3">{area.title}</h3>
                  <p className="text-text-muted leading-relaxed">{area.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-primary-light">
        <div className="container-custom text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-extrabold text-primary-dark mb-4">Ready to Grow Your Wealth?</h2>
            <p className="text-lg text-primary-dark/80 mb-8">Let's discuss how our expertise can help you achieve your financial goals</p>
            <button className="px-8 py-3 bg-primary-dark text-white rounded-lg font-semibold hover:bg-black transition-colors cursor-pointer">
              Schedule a Consultation
            </button>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}

export default ExpertisePage