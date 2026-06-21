import React from 'react'
import AnimatedSection from '../components/UI/AnimatedSection'

const TestimonialPage = () => {
  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Business Owner',
      content: 'Poseidon Wealth Planners transformed our family wealth management approach. Their comprehensive planning and strategic advice have been invaluable.',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'HNI Investor',
      content: 'The team at Poseidon provides exceptional advisory services. Their disciplined approach and alignment with client success sets them apart.',
      rating: 5
    },
    {
      name: 'Amit Patel',
      role: 'Entrepreneur',
      content: 'Working with Poseidon on our startup consulting needs was a game-changer. Their strategic guidance and fundraising support were outstanding.',
      rating: 5
    },
    {
      name: 'Sneha Reddy',
      role: 'Professional',
      content: 'As an NRI, I was looking for reliable wealth management in India. Poseidon provided exactly what I needed - professional, transparent, and effective.',
      rating: 5
    }
  ]

  return (
    <div className="pt-[80px] min-h-screen">
      <section className="section-pad bg-primary-dark text-white">
        <div className="container-custom text-center">
          <AnimatedSection>
            <div className="inline-flex px-4 py-1.5 rounded-full bg-primary-light text-primary-dark text-[0.75rem] font-bold uppercase tracking-wide mb-6">
              Testimonials
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-[3.5rem] font-extrabold mb-6">What Our Clients Say</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Real stories from real clients who have experienced the Poseidon difference
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <div className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300">
                  <div className="flex text-primary-light mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-bold text-primary-dark">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
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

export default TestimonialPage