import React from 'react'
import AnimatedSection from '../UI/AnimatedSection'

const Philosophy = () => {
  const steps = [
    { title: '01. Discovery & Risk Profiling', desc: 'Understanding your exact financial objectives, timeline, and risk tolerance.' },
    { title: '02. Strategy Formulation', desc: 'Designing a customized portfolio utilizing financial and non-financial assets.' },
    { title: '03. Execution & Allocation', desc: 'Deploying capital optimization strategies across equities, metals, and alternatives.' }
  ]

  return (
    <section className="py-[50px] md:py-[100px] border-t border-gray-200 bg-white">
      <div className="container-custom flex flex-col lg:flex-row gap-8 lg:gap-16">
        <div className="w-full lg:w-1/2">
          <AnimatedSection animation="fade-right">
            <div className="inline-flex px-3 md:px-4 py-1.5 rounded-full bg-primary-light text-primary-dark text-[0.7rem] md:text-[0.75rem] font-bold uppercase tracking-wide mb-4">
              Investment Philosophy
            </div>
            <h2 className="text-xl sm:text-2xl md:text-[2.2rem] font-extrabold leading-[1.3] md:leading-[1.2] mb-4 md:mb-6 text-primary-dark">
              "My advisory approach is grounded in <span className="bg-primary-light px-1 md:px-2">research-backed conviction</span>, not speculation."
            </h2>
            <p className="text-sm md:text-base text-text-muted">Capital preservation acts as our non-negotiable foundational principle before aggressively seeking portfolio alpha.</p>
          </AnimatedSection>
        </div>
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          {steps.map((step, index) => (
            <AnimatedSection key={index} animation="fade-left" delay={index * 0.1}>
              <div className="p-4 md:p-6 rounded-xl border border-gray-200 bg-white hover:border-primary-light hover:shadow-lg hover:translate-x-2 transition-all duration-300">
                <h5 className="text-sm md:text-base font-bold mb-2 text-primary-dark">{step.title}</h5>
                <p className="text-xs md:text-[0.9rem] text-text-muted">{step.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Philosophy