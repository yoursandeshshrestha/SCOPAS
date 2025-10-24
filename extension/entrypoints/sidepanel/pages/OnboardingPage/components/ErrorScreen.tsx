import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import Button from "../../../components/ui/Button";

interface ErrorScreenProps {
  error: string;
  onRetry?: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onRetry }) => {
  const navigate = useNavigate();

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

      {/* Content section */}
      <div className="absolute inset-0 flex items-end h-full">
        <div className="w-full rounded-t-[40px] relative z-10 bg-[var(--bg-dark)] min-h-[60%] h-[60%] flex flex-col">
          <div className="flex-1 flex items-center px-6 py-8">
            <div className="text-center max-w-lg w-full">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-normal text-white mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-400 text-sm font-light mb-6">{error}</p>
              <div className="flex gap-3">
                {onRetry && (
                  <Button
                    variant="secondary"
                    onClick={onRetry}
                    className="flex-1 !rounded-full py-3 text-base font-medium"
                  >
                    Try Again
                  </Button>
                )}
                <Button
                  variant="primary"
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 !rounded-full py-3 text-base font-medium"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;
