"use client";

import React from 'react';

export function WalkingLoader() {
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="loader-container">
                <div className="loader">
                    <svg className="head" viewBox="0 0 100 100" width="60" height="60">
                        <circle cx="50" cy="50" r="40" fill="#ffffff" />
                        <circle cx="35" cy="40" r="5" fill="#000" />
                        <circle cx="65" cy="40" r="5" fill="#000" />
                    </svg>
                    <svg className="bod" viewBox="0 0 100 100" width="80" height="80">
                        <rect x="25" y="25" width="50" height="50" rx="15" fill="#ffffff" />
                    </svg>
                    <svg className="legr" viewBox="0 0 100 100" width="40" height="60">
                        <rect x="30" y="0" width="40" height="60" rx="20" fill="#ffffff" />
                    </svg>
                    <svg className="legl" viewBox="0 0 100 100" width="40" height="60">
                        <rect x="30" y="0" width="40" height="60" rx="20" fill="#ffffff" />
                    </svg>
                    <div id="gnd"></div>
                </div>
            </div>

            <p className="text-white/80 font-mono text-sm animate-pulse">
                Em andamento...
            </p>

            <style jsx>{`
        .loader-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          /* overflow: hidden; */ 
        }
        .loader {
          scale: 0.75;
          position: relative;
          width: 200px;
          height: 200px;
          translate: 10px -20px;
        }
        .loader svg {
          position: absolute;
          top: 0;
          left: 0;
          overflow: visible;
        }
        .head {
          translate: 27px -30px;
          z-index: 30;
          animation: bob 1s infinite ease-in;
        }
        .bod {
          translate: 0px 30px;
          z-index: 20;
          animation: bob 1s infinite ease-in-out;
        }
        .legr {
          translate: 75px 135px;
          z-index: 10;
          animation: rstep 1s infinite ease-in;
          animation-delay: 0.45s;
        }

        .legl {
          translate: 30px 155px;
          z-index: 20;
          animation: lstep 1s infinite ease-in;
        }

        @keyframes bob {
          0% {
            transform: translateY(0) rotate(3deg);
          }
          5% {
            transform: translateY(0) rotate(3deg);
          }
          25% {
            transform: translateY(5px) rotate(0deg);
          }
          50% {
            transform: translateY(0px) rotate(-3deg);
          }
          70% {
            transform: translateY(5px) rotate(0deg);
          }
          100% {
            transform: translateY(0) rotate(3deg);
          }
        }

        @keyframes lstep {
          0% {
            transform: translateY(0) rotate(-5deg);
          }
          33% {
            transform: translateY(-15px) translate(32px) rotate(35deg);
          }
          66% {
            transform: translateY(0) translate(25px) rotate(-25deg);
          }
          100% {
            transform: translateY(0) rotate(-5deg);
          }
        }

        @keyframes rstep {
          0% {
            transform: translateY(0) translate(0px) rotate(-5deg);
          }
          33% {
            transform: translateY(-10px) translate(30px) rotate(35deg);
          }
          66% {
            transform: translateY(0) translate(20px) rotate(-25deg);
          }
          100% {
            transform: translateY(0) translate(0px) rotate(-5deg);
          }
        }

        #gnd {
          position: absolute;
          top: 180px;
          left: 50%;
          width: 200px;
          height: 20px;
          background: #000;
          border-radius: 50%;
          translate: -140px 0;
          rotate: 10deg;
          z-index: -1;
          filter: blur(5px) drop-shadow(1px 3px 5px #000000);
          opacity: 0.25;
          animation: scroll 1s infinite linear; /* Fixed duration to match 1s cycle */
        }

        @keyframes scroll {
          0% {
            transform: translateY(0px) translateX(50px) scaleX(1);
            opacity: 0;
          }
          33% {
            opacity: 0.25;
            transform: translateY(0px) translateX(0px) scaleX(1.2);
          }
          66% {
            opacity: 0.25;
          }
          100% {
            transform: translateY(0px) translateX(-100px) scaleX(0.5);
            opacity: 0;
          }
        }
      `}</style>
        </div>
    );
}
