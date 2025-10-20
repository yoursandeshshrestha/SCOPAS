import React from "react";
import Navbar from "../../components/layout/Navbar";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Analytics: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-[var(--bg-dark)] flex flex-col">
      <Navbar />

      {/* Opaque background under navbar + title */}
      <div className="fixed top-0 left-0 right-0 h-[9.5rem] bg-[var(--bg-dark)] z-30" />

      {/* Header bar */}
      <div className="fixed top-24 left-0 right-0 z-40 px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-3 h-10 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 text-white flex items-center gap-2 hover:bg-white/10"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="px-3 h-10 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 text-white flex items-center gap-2">
            <BarChart3 size={16} />
            Analytics
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pt-38 pb-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative mb-2.5 rounded-lg bg-neutral-800 border border-neutral-700">
            <div className="p-4">
              <div className="text-white font-semibold mb-1">Overview</div>
              <div className="text-neutral-400 text-sm">
                Usage analytics coming soon.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
