import React from "react";
import { motion } from "framer-motion";

const LoadingScreen: React.FC = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[var(--bg-dark)]">
      {/* Hourglass spinner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
      >
        <div className="lds-hourglass"></div>
      </motion.div>

      <style>{`
        .lds-hourglass {
          color: #ffffff;
        }
        .lds-hourglass,
        .lds-hourglass:after {
          box-sizing: border-box;
        }
        .lds-hourglass {
          display: inline-block;
          position: relative;
          width: 80px;
          height: 80px;
        }
        .lds-hourglass:after {
          content: " ";
          display: block;
          border-radius: 50%;
          width: 0;
          height: 0;
          margin: 8px;
          box-sizing: border-box;
          border: 32px solid currentColor;
          border-color: currentColor transparent currentColor transparent;
          animation: lds-hourglass 1.2s infinite;
        }
        @keyframes lds-hourglass {
          0% {
            transform: rotate(0);
            animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
          }
          50% {
            transform: rotate(900deg);
            animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
          }
          100% {
            transform: rotate(1800deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
