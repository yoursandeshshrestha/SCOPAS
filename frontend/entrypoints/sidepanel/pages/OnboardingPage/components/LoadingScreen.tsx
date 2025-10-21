import React from "react";

const LoadingScreen: React.FC = () => {
  return (
    <div className="h-screen w-full relative overflow-hidden bg-[var(--bg-dark)]">
      {/* Top section with background image (upside down) */}
      <div className="h-[80%] w-full relative overflow-hidden">
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
        <div className="w-full rounded-t-[40px] relative z-10 bg-[var(--bg-dark)] h-auto flex flex-col">
          <div className="flex-1 flex items-center px-6 py-8">
            <div className="max-w-lg w-full">
              {/* Loading skeleton */}
              <div className="mb-8">
                {/* Title skeleton */}
                <div className="h-9 w-32 bg-gray-800/50 rounded-lg mb-1 animate-pulse" />

                {/* Subtitle skeleton */}
                <div className="h-9 w-64 bg-gray-800/50 rounded-lg mb-4 animate-pulse" />

                {/* Description skeleton */}
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-800/30 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-800/30 rounded animate-pulse" />
                </div>
              </div>

              {/* Button skeleton */}
              <div className="h-12 w-full bg-gray-800/50 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
