import React from 'react'
import AnimatedSection from '../UI/AnimatedSection'

const Plans = () => {
  const plans = [
    {
      title: 'Investment Planning',
      price: '1.5% - 2.5% AUA',
      subPrice: 'OR Flat ₹75,000 (< 1.5 Yrs)',
      features: ['Principal Amount > 5 Lakh INR', 'Consultancy across Financial Assets', 'Fees regulated under SEBI Guidelines']
    },
    {
      title: 'Startup Assistance',
      price: '3% – 5% Equity',
      subPrice: '+ 5% of Net Profits',
      features: ['Strategic & Management Consulting', 'Subject to Vesting Policies', 'Independent of advisory']
    },
    {
      title: 'Transaction Advisory',
      price: 'Deal Dependent',
      subPrice: 'One-time fixed fee',
      features: ['Specific opportunity evaluation', 'Comprehensive Due Diligence', 'Documentation support']
    }
  ]

  return (
    <section className="py-[50px] md:py-[100px] bg-primary-dark text-white">
      <div className="container-custom">
        <AnimatedSection>
          <div className="inline-flex px-3 md:px-4 py-1.5 rounded-full bg-primary-light text-primary-dark text-[0.7rem] md:text-[0.75rem] font-bold uppercase tracking-wide mb-4">
            Pricing Plans
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-[3rem] font-extrabold mb-8 md:mb-12">Transparent Advisory Plans</h2>
        </AnimatedSection>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-8 md:mb-12">
          {plans.map((plan, index) => (
            <AnimatedSection key={index} delay={index * 0.1}>
              <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-10 hover:-translate-y-2 hover:bg-white/10 hover:border-primary-light transition-all duration-300">
                <h3 className="text-primary-light text-xl md:text-[1.5rem] font-bold mb-2">{plan.title}</h3>
                <div className="text-base md:text-[1.2rem] font-semibold mb-6 md:mb-8">
                  {plan.price}<br />
                  <span className="text-xs md:text-[0.8rem] font-normal opacity-80">{plan.subPrice}</span>
                </div>
                <ul className="flex flex-col gap-3 md:gap-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="text-xs md:text-[0.9rem] flex gap-2 opacity-90">
                      <span className="text-primary-light">•</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Plans