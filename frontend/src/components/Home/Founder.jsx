import React from 'react'
import AnimatedSection from '../UI/AnimatedSection'

const Founder = () => {
  return (
    <section className="py-[50px] md:py-[100px] bg-gray-50 relative overflow-hidden border-y border-gray-200">
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none"></div>
      
      <div className="container-custom flex flex-col lg:flex-row gap-8 lg:gap-16 relative z-[1] items-center">
        <div className="w-full lg:w-2/5 text-center lg:text-left">
          <AnimatedSection animation="fade-right">
            <div className="inline-flex px-3 md:px-4 py-1.5 rounded-full bg-primary-dark text-primary-light text-[0.7rem] md:text-[0.75rem] font-bold uppercase tracking-wide mb-4">
              Founder
            </div>
            <h2 className="text-3xl md:text-[3.5rem] font-extrabold leading-[1.2] md:leading-[1.1] mb-4 text-primary-dark">
              Atharva<br />Abhijeet Chitale
            </h2>
            <h4 className="text-sm md:text-base font-semibold text-text-muted mb-4 md:mb-6 uppercase tracking-wide">NISM Certified Research Analyst</h4>
            <p className="text-sm md:text-base text-text-muted mb-4">
              I am a 3rd-year student with good knowledge of the markets and over 5 years of active trading experience. Dedicated to transparency and metric-driven health analysis for small-scale businesses and premium portfolios.
            </p>
          </AnimatedSection>
        </div>

        <div className="w-full lg:w-3/5 flex justify-center lg:justify-end">
          <AnimatedSection animation="fade-left">
            <div className="relative w-[80%] md:w-[70%] mx-auto lg:mx-0">
              <div className="absolute -bottom-3 -left-3 md:-bottom-5 md:-left-5 w-[80%] h-[80%] rounded-2xl border-[10px] md:border-[15px] border-primary-light border-t-0 border-r-0 -z-10"></div>
              <img 
                src="/image-removebg-preview (7).png" 
                alt="Atharva Abhijeet Chitale" 
                className="w-full rounded-2xl"
              />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}

export default Founder