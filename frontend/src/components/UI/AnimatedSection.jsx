import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const AnimatedSection = ({ children, animation = 'fade-up', delay = 0 }) => {
  const sectionRef = useRef(null)

  useEffect(() => {
    const getAnimationProps = () => {
      switch(animation) {
        case 'fade-up':
          return { y: 60, opacity: 0 }
        case 'fade-right':
          return { x: -60, opacity: 0 }
        case 'fade-left':
          return { x: 60, opacity: 0 }
        default:
          return { y: 60, opacity: 0 }
      }
    }

    gsap.fromTo(sectionRef.current,
      getAnimationProps(),
      {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse"
        },
        y: 0,
        x: 0,
        opacity: 1,
        duration: 0.8,
        delay: delay,
        ease: "power3.out"
      }
    )
  }, [animation, delay])

  return <div ref={sectionRef}>{children}</div>
}

export default AnimatedSection