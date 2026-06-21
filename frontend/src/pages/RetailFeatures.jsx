import React from 'react'
import AnimatedSection from '../components/UI/AnimatedSection'

const RetailFeatures = () => {
  const features = [
    {
      icon: '📊',
      title: 'Comprehensive Financial Planning',
      desc: 'Holistic approach to your financial goals, covering all aspects of your wealth journey.'
    },
    {
      icon: '📈',
      title: 'Portfolio Construction',
      desc: 'Building diversified portfolios tailored to your risk profile and investment objectives.'
    },
    {
      icon: '🎯',
      title: 'Asset Allocation',
      desc: 'Strategic distribution of investments across various asset classes for optimal returns.'
    },
    {
      icon: '📋',
      title: 'Investment Monitoring',
      desc: 'Continuous tracking and analysis of your investments to ensure they perform as expected.'
    },
    {
      icon: '🔄',
      title: 'Quarterly Portfolio Reviews',
      desc: 'Regular comprehensive reviews to keep your portfolio aligned with changing market conditions.'
    },
    {
      icon: '🎪',
      title: 'Goal-Based Wealth Planning',
      desc: 'Customized strategies designed to achieve your specific life goals and aspirations.'
    },
    {
      icon: '🤝',
      title: 'Ongoing Advisory Support',
      desc: 'Continuous guidance and support to help you navigate complex financial decisions.'
    }
  ]

  return (
    <div className="pt-[80px] min-h-screen">
      <section className="section-pad bg-primary-dark text-white">
        <div className="container-custom text-center">
          <AnimatedSection>
            <div className="inline-flex px-4 py-1.5 rounded-full bg-primary-light text-primary-dark text-[0.75rem] font-bold uppercase tracking-wide mb-6">
              Retail
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-[3.5rem] font-extrabold mb-6">Features</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive wealth management services designed for your financial success
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="p-6 md:p-8 bg-gray-50 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-primary-dark mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm md:text-base">{feature.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default RetailFeatures