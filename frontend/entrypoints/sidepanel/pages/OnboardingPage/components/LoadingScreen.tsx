import React from "react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="h-screen w-full relative overflow-hidden bg-[var(--bg-dark)]">
      {/* Top section with background image (upside down) */}
      <div className="h-[100%] w-full relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/main-background.png')",
            transform: "rotate(180deg)",
          }}
        />
      </div>

      {/* Loading content section */}
      <div className="absolute inset-0 flex items-end h-full">
        <div className="w-full rounded-t-[40px] relative z-10 bg-[var(--bg-dark)] min-h-auto h-auto flex flex-col">
          <div className="flex-1 flex items-center px-6 py-8">
            <div className="max-w-lg w-full">
              {/* Loading message */}
              <div className="mb-8">
                <h1 className="text-3xl font-normal text-white mb-1">
                  Setting up... Just a moment
                </h1>
                <p className="text-gray-400 text-sm font-light leading-relaxed">
                  Please wait while we prepare your personalized experience
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full animate-progress"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          width: 0%;
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
