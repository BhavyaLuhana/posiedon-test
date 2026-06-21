import React from 'react'
import AnimatedSection from '../components/UI/AnimatedSection'

const FounderPage = () => {
  const achievements = [
    { year: '2024', title: 'NISM Certified Research Analyst', desc: 'Certified by SEBI for investment advisory services' },
    { year: '2023', title: '5+ Years Trading Experience', desc: 'Active trading across equities, commodities, and derivatives' },
    { year: '2024', title: 'Portfolio Performance', desc: 'Consistent 20-40% annual returns for clients' }
  ]

  return (
    <div className="pt-[80px]">
      <section className="section-pad bg-primary-dark text-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/2">
              <AnimatedSection animation="fade-right">
                <div className="inline-flex px-4 py-1.5 rounded-full bg-primary-light text-primary-dark text-[0.75rem] font-bold uppercase tracking-wide mb-6">
                  Founder
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Atharva Abhijeet Chitale</h1>
                <h2 className="text-xl text-primary-light mb-6">NISM Certified Research Analyst</h2>
                <p className="text-gray-300 leading-relaxed mb-6">
                  I am a 3rd-year student with deep knowledge of the markets and over 5 years of active trading experience. Dedicated to transparency and metric-driven health analysis for small-scale businesses and premium portfolios.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  My investment philosophy combines rigorous fundamental analysis with technical expertise to identify high-probability opportunities while maintaining strict risk management protocols.
                </p>
              </AnimatedSection>
            </div>
            <div className="md:w-1/2">
              <AnimatedSection animation="fade-left">
                <div className="relative">
                  <div className="absolute -bottom-5 -left-5 w-full h-full rounded-2xl border-[15px] border-primary-light border-t-0 border-r-0"></div>
                  <img 
                    src="/image-removebg-preview (7).png" 
                    alt="Atharva Abhijeet Chitale" 
                    className="w-full rounded-2xl relative z-10"
                  />
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-extrabold text-primary-dark mb-12 text-center">Achievements & Credentials</h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            {achievements.map((achievement, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="flex gap-6 p-6 rounded-xl border border-gray-200 hover:border-primary-light transition-all cursor-pointer">
                  <div className="text-2xl font-bold text-primary-light min-w-[100px]">{achievement.year}</div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-dark mb-2">{achievement.title}</h3>
                    <p className="text-text-muted">{achievement.desc}</p>
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

export default FounderPage