import React from 'react'
import AnimatedSection from '../UI/AnimatedSection'

const Regulatory = () => {
  const regulations = [
    { title: '01 Market Risk & Performance', desc: 'Investments in securities markets are subject to market risks. Past performance is not indicative of future returns. Returns mentioned are indicative and not assured.' },
    { title: '02 Advisory Fee Structure', desc: 'The fee is not linked to investment execution, investment amount, or investment performance. The Client shall pay an advisory fee calculated at 1.5% per annum of Assets Under Advice.' },
    { title: '03 Compensation Limitations', desc: 'The Advisor shall not receive any compensation linked to investment performance, returns, profits, or upside of any investment made pursuant to this agreement.' }
  ]

  const cards = [
    'The Advisor may hold equity in the Company while separately providing investment advisory services to clients. Such interest is disclosed to all relevant parties.',
    'The PlanPoseidon Wealth Planners as the advisory partner shall be entitled to 5% of the Company\'s net profits as consideration for ongoing strategic involvement.',
    'Startup assistance services are independent of investment advisory services. Advisory equity is granted solely for consulting services rendered.'
  ]

  return (
    <section className="py-[50px] md:py-[100px] bg-white">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 mb-12 lg:mb-16">
          <div className="w-full lg:w-[30%] text-center lg:text-left">
            <AnimatedSection animation="fade-right">
              <h2 className="text-2xl md:text-[2.5rem] font-extrabold leading-[1.2] md:leading-[1.1] mb-4 text-primary-dark">
                Regulatory<br />Disclosures<br />& Terms
              </h2>
              <p className="text-sm md:text-[0.9rem] text-text-muted">Please review our operational policies and SEBI compliance guidelines.</p>
            </AnimatedSection>
          </div>

          <div className="w-full lg:w-[70%] flex flex-col gap-6 md:gap-8">
            <AnimatedSection animation="fade-left">
              {regulations.map((reg, index) => (
                <div key={index} className={`border-b border-gray-200 pb-4 md:pb-6 ${index === regulations.length - 1 ? 'border-none' : ''}`}>
                  <h4 className="text-sm md:text-base font-bold mb-2 uppercase text-primary-dark">{reg.title}</h4>
                  <p className="text-xs md:text-[0.9rem] text-text-muted">{reg.desc}</p>
                </div>
              ))}
            </AnimatedSection>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {cards.map((card, index) => (
            <AnimatedSection key={index} delay={index * 0.1}>
              <div className="flex-1 p-6 md:p-10 rounded-2xl border-2 border-primary-light text-center hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(255,217,0,0.15)] transition-all duration-300 bg-white cursor-pointer">
                <p className="text-xs md:text-[0.9rem] font-medium">{card}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Regulatory