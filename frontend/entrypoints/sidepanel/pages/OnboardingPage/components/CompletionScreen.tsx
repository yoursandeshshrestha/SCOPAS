import React from "react";
import { Loader2 } from "lucide-react";

const CompletionScreen: React.FC = () => {
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

      {/* Content section */}
      <div className="absolute inset-0 flex items-end h-full">
        <div className="w-full rounded-t-[40px] relative z-10 bg-[var(--bg-dark)] h-auto flex flex-col">
          <div className="flex-1 flex items-center px-6 py-8">
            <div className="max-w-lg w-full">
              {/* Completion message */}
              <div className="mb-8">
                <h1 className="text-3xl font-normal text-white mb-1">
                  All set
                </h1>
                <h2 className="text-3xl font-normal text-white mb-4">
                  Welcome to Scopas
                </h2>
                <p className="text-gray-400 text-sm font-light leading-relaxed">
                  Your profile is personalized and ready. Taking you to your
                  dashboard
                </p>
              </div>

              {/* Loading spinner */}
              <div className="flex items-center justify-start py-4">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionScreen;
