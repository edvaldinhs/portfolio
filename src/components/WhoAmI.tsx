import { useRef } from 'react'
import { useWhoAmIAnimation } from '../animations/whoAmI'

export default function WhoAmI() {
  const rootRef = useRef<HTMLDivElement>(null)
  useWhoAmIAnimation(rootRef)

  return (
    <div className="whoami" ref={rootRef}>
      <div className="whoami-container">
        <div className="home-intro_layout u-grid no-gap">
          <div className="home-intro_col col-6 offset-4">
            <div className="v-flex_left-med">
              <div className="home-intro_quote u-relative">
                <p className="t-title-italic">
                  Edvaldo Henrique
                </p>
                <div className="scribble-el home-intro_svg">
                  <svg xmlns={"http://www.w3.org/2000/svg"} width={"1100"} height={"700"} viewBox={"0 0 1100 700"} fill={"none"}>
                    <path
                      id={"Layer 2"}
                      fillRule={"evenodd"}
                      d={"m683 344l51-79 42 91 76-75c0 0 67.76 200.94-87 210-60.57 22.39-78.49-99.26-6-10 72.49 89.26 193.48 203.02 258.34 137.85 36.48-56.75-34.56-88.03-161.34-19.85-101.84 27.95-209.63 70.37-313-188-103.37-258.37-204.89-251.24-260.65-170.4-17.77 25.77-93.05 191.7 37.61 384.11 47.79 58.66 70.97 13.33 68.92-15.18-3.59-49.88-14.89-163.49-115.88-321.53-91.34-187.05-199-242-199-242"}
                      stroke={"#BABABA"}
                      strokeWidth={"5"}
                      strokeLinecap={"round"}
                    />
                  </svg>
                </div>
              </div>
              <div className="text-scroll-fade">
                <h3 className="h3 text-indent-4col">
                  I'm Edinho — a fullstack developer and student who turns
                  ideas into playful, precise experiences, iterating until
                  every detail feels alive.
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="whoami-overlay" aria-hidden="true" />
    </div>
  )
}