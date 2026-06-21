import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Hero = () => {
  const containerRef = useRef(null)
  const titleRef = useRef(null)
  const descRef = useRef(null)
  const pillRef = useRef(null)
  const cardLimeRef = useRef(null)
  const cardDark1Ref = useRef(null)
  const cardDark2Ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        }
      })

      tl.to(titleRef.current, { opacity: 0, y: -50, duration: 1 }, 0)
        .to(descRef.current, { opacity: 0, y: -30, duration: 1 }, 0)
        .to(pillRef.current, { opacity: 0, duration: 0.5 }, 0)
        .to(cardLimeRef.current, { x: "-20vw", y: "30vh", rotation: -20, scale: 1.1, opacity: 0, duration: 1 }, 0)
        .to(cardDark1Ref.current, { x: "20vw", y: "45vh", rotation: 15, scale: 1.2, opacity: 0, duration: 1 }, 0)
        .to(cardDark2Ref.current, { x: "30vw", y: "-15vh", rotation: 35, scale: 0.9, opacity: 0, duration: 1 }, 0)
    })

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="h-[200vh] bg-white mt-[60px] relative">
      <div className="sticky top-[60px] h-[calc(100vh-60px)] flex items-center overflow-hidden w-full">
        <div className="container-custom flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-0">
          <div className="w-full lg:w-[55%] z-10 text-center lg:text-left">
            <div ref={pillRef} className="inline-flex px-3 py-1.5 md:px-4 rounded-full bg-primary-dark text-primary-light text-[0.7rem] md:text-[0.75rem] font-bold uppercase tracking-wide mb-4 md:mb-6">
              NISM Certified Advisory
            </div>
            <h1 ref={titleRef} className="text-3xl sm:text-4xl md:text-5xl lg:text-[4.5rem] font-extrabold leading-[1.15] lg:leading-[1.05] uppercase mb-4 md:mb-6 tracking-[-1px] lg:tracking-[-1.5px] text-primary-dark">
              Strategic<br />Wealth<br />Management
            </h1>
            <p ref={descRef} className="text-base md:text-[1.1rem] text-text-muted max-w-full lg:max-w-[80%] px-4 lg:px-0">
              Catering exclusively to premium clientele seeking disciplined, research-driven, and customized investment solutions.
            </p>
          </div>

          <div className="w-full lg:w-[45%] relative h-[300px] sm:h-[350px] md:h-[400px] flex justify-center items-center mt-8 lg:mt-0">
            <div ref={cardLimeRef} className="absolute p-4 md:p-6 rounded-xl font-semibold shadow-lg bg-primary-light text-primary-dark top-[5%] left-[5%] md:top-[10%] md:left-[10%] w-[180px] md:w-[220px] z-[3] hover:shadow-2xl transition-shadow">
              <h4 className="text-base md:text-[1.2rem] mb-0.5 font-bold">Flat ₹75,000</h4>
              <p className="text-[0.7rem] md:text-[0.8rem] opacity-80 font-normal">Advisory Fee (&lt; 1.5 Years)</p>
            </div>
            <div ref={cardDark1Ref} className="absolute p-4 md:p-6 rounded-xl font-semibold shadow-lg bg-primary-dark text-white top-[35%] left-[35%] md:top-[40%] md:left-[40%] w-[200px] md:w-[240px] z-[2] hover:shadow-2xl transition-shadow">
              <h4 className="text-base md:text-[1.2rem] mb-0.5 text-primary-light">Metals & Equity</h4>
              <p className="text-[0.7rem] md:text-[0.8rem] opacity-80 font-normal">Diversified Alternative Ideas</p>
            </div>
            <div ref={cardDark2Ref} className="absolute p-4 md:p-6 rounded-xl font-semibold shadow-lg bg-primary-dark text-white top-[65%] left-[15%] md:top-[70%] md:left-[20%] w-[160px] md:w-[200px] z-[1] hover:shadow-2xl transition-shadow">
              <h4 className="text-base md:text-[1.2rem] mb-0.5 text-primary-light">Performance</h4>
              <p className="text-[0.7rem] md:text-[0.8rem] opacity-80 font-normal">Averaging 20–40% p.a.*</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero