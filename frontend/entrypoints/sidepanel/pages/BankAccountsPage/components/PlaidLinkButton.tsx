import React, { useEffect, useState } from "react";
import { plaidService } from "../../../services/plaid.service";
import { Loader2, Plus, ExternalLink } from "lucide-react";
import Cookies from "js-cookie";

interface PlaidLinkButtonProps {
  onSuccess: () => void;
  buttonText?: string;
  variant?: "primary" | "secondary";
}

export const PlaidLinkButton: React.FC<PlaidLinkButtonProps> = ({
  onSuccess,
  buttonText = "Connect Bank Account",
  variant = "primary",
}) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plaidWindow, setPlaidWindow] = useState<Window | null>(null);

  // Fetch link token when component mounts
  useEffect(() => {
    const initializePlaid = async () => {
      try {
        setLoading(true);
        console.log("🔵 Fetching Plaid link token...");
        const response = await plaidService.createLinkToken();
        console.log("✅ Link token received:", response);
        setLinkToken(response.data.linkToken);
        setError(null);
      } catch (err: any) {
        console.error("❌ Error creating link token:", err);
        console.error("Response data:", err.response?.data);
        console.error("Status:", err.response?.status);
        setError(
          err.response?.data?.message ||
            "Failed to initialize bank connection. Check console for details."
        );
      } finally {
        setLoading(false);
      }
    };

    initializePlaid();
  }, []);

  // Detect Plaid completion using postMessage and window closure
  useEffect(() => {
    if (!plaidWindow) return;

    const checkPlaidCompletion = async () => {
      try {
        // Check if window is closed and try to verify connection
        if (plaidWindow.closed) {
          console.log("🔍 Plaid window is closed, checking for accounts...");
          try {
            const response = await plaidService.getAccounts();
            if (response.data && response.data.length > 0) {
              console.log("✅ Found connected accounts, calling onSuccess...");
              onSuccess();
              setPlaidWindow(null);
            }
          } catch (err) {
            console.log("⚠️ Could not verify accounts yet:", err);
          }
        }
      } catch (err) {
        console.log("❌ Error checking Plaid completion:", err);
      }
    };

    // Listen for postMessage from Plaid window
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "PLAID_CONNECTION_SUCCESS") {
        console.log("📨 Received postMessage from Plaid window:", event.data);
        onSuccess();
        setPlaidWindow(null);
      }
    };

    window.addEventListener("message", handleMessage);

    // Poll every 2 seconds to check if window is closed (fallback)
    const pollInterval = setInterval(checkPlaidCompletion, 2000);

    // Also check when window regains focus
    const handleFocus = () => {
      checkPlaidCompletion();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("focus", handleFocus);
    };
  }, [plaidWindow, onSuccess]);

  const handleConnectClick = () => {
    if (!linkToken) {
      setError("Link token not available. Please refresh the page.");
      return;
    }

    // Get auth token from cookies using js-cookie
    const authToken = Cookies.get("accessToken");

    // Encode the auth token for URL transmission
    const encodedAuthToken = authToken ? encodeURIComponent(authToken) : "";

    // Redirect to Plaid app with both tokens
    const plaidAppUrl = `http://localhost:5173?token=${linkToken}&auth=${encodedAuthToken}`;
    const newWindow = window.open(plaidAppUrl, "_blank");
    setPlaidWindow(newWindow);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleConnectClick}
        disabled={!linkToken || loading}
        className={`w-full py-3 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 ${
          variant === "primary"
            ? "bg-white text-black hover:bg-gray-100"
            : "bg-[var(--bg-secondary)] text-white border border-gray-800 hover:bg-[#333333]"
        } ${!linkToken || loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Plus size={16} />
            {buttonText}
            <ExternalLink size={14} className="opacity-60" />
          </>
        )}
      </button>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-red-400" />
          </div>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <p className="text-xs text-neutral-500 text-center">
        Opens in a new tab for secure bank connection
      </p>
    </div>
  );
};
