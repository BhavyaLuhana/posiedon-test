import React from 'react'
import AnimatedSection from '../UI/AnimatedSection'

const Expertise = () => {
  const expertiseAreas = [
    { title: 'Equity Investing', desc: 'Short, Positional & Long-term strategic equity deployment.' },
    { title: 'Metal Investments', desc: 'Tactical asset allocation in Gold, Silver, and related instruments.' },
    { title: 'Small-Scale Business', desc: 'In-depth opportunity analysis and operational consulting.' },
    { title: 'Capital Conversion', desc: 'Advanced money optimization and liquidity conversion strategies.' },
    { title: 'Business Valuation', desc: 'Comprehensive business metrics evaluation and health analysis.' }
  ]

  return (
    <section className="py-[50px] md:py-[100px] bg-white">
      <div className="container-custom flex flex-col gap-6 md:gap-8">
        <AnimatedSection>
          <div className="inline-flex px-3 md:px-4 py-1.5 rounded-full bg-primary-dark text-primary-light text-[0.7rem] md:text-[0.75rem] font-bold uppercase tracking-wide mb-4">
            Focus
          </div>
          <h2 className="text-2xl md:text-[2.5rem] font-extrabold text-primary-dark">Areas of Expertise</h2>
        </AnimatedSection>

        <div>
          {expertiseAreas.map((area, index) => (
            <AnimatedSection key={index} delay={index * 0.1}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center py-6 md:py-8 border-b border-gray-200 hover:pl-2 md:hover:pl-4 hover:bg-gray-50 transition-all duration-300 cursor-pointer">
                <div className="w-full sm:w-[30%] text-base md:text-[1.3rem] font-bold text-primary-dark mb-2 sm:mb-0">{area.title}</div>
                <div className="w-full sm:w-[60%] text-sm md:text-base text-text-muted">{area.desc}</div>
                <div className="w-full sm:w-[10%] text-right text-primary-light font-bold text-xl md:text-[1.5rem] transition-transform duration-300 mt-2 sm:mt-0">
                  ↗
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Expertise