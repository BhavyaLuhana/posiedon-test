import React from 'react'
import AnimatedSection from '../components/UI/AnimatedSection'

const ApproachPage = () => {
  const steps = [
    { number: '01', title: 'Discovery & Risk Profiling', desc: 'Understanding your exact financial objectives, timeline, and risk tolerance through comprehensive assessment.' },
    { number: '02', title: 'Strategy Formulation', desc: 'Designing a customized portfolio utilizing financial and non-financial assets aligned with your goals.' },
    { number: '03', title: 'Research & Analysis', desc: 'Deep dive market research and fundamental analysis to identify high-probability opportunities.' },
    { number: '04', title: 'Execution & Allocation', desc: 'Deploying capital optimization strategies across equities, metals, and alternatives.' },
    { number: '05', title: 'Monitoring & Rebalancing', desc: 'Continuous portfolio tracking and periodic rebalancing to maintain optimal allocation.' }
  ]

  return (
    <div className="pt-[80px]">
      <section className="section-pad bg-primary-dark text-white">
        <div className="container-custom text-center">
          <AnimatedSection>
            <div className="inline-flex px-4 py-1.5 rounded-full bg-primary-light text-primary-dark text-[0.75rem] font-bold uppercase tracking-wide mb-6">
              Our Approach
            </div>
            <h1 className="text-[3.5rem] font-extrabold mb-6">Research-Backed<br />Investment Philosophy</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              "My advisory approach is grounded in research-backed conviction, not speculation. Capital preservation acts as our non-negotiable foundational principle before aggressively seeking portfolio alpha."
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-extrabold text-primary-dark mb-12 text-center">Our Process</h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="flex gap-6 p-6 rounded-xl border border-gray-200 hover:border-primary-light hover:shadow-lg transition-all duration-300">
                  <div className="text-4xl font-bold text-primary-light min-w-[80px]">{step.number}</div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-dark mb-2">{step.title}</h3>
                    <p className="text-text-muted">{step.desc}</p>
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

export default ApproachPage