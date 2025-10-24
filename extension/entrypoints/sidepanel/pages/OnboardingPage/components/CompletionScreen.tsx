import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Plus, ExternalLink } from "lucide-react";
import { useAppDispatch } from "../../../store/hooks";
import { clearNewUserFlag } from "../../../store/slices/authSlice";
import { Confetti } from "../../../components/ui/Confetti";
import Button from "../../../components/ui/Button";
import { plaidService } from "../../../services/plaid.service";
import Cookies from "js-cookie";

const CompletionScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plaidWindow, setPlaidWindow] = useState<Window | null>(null);

  // Clear the new user flag when component mounts
  useEffect(() => {
    dispatch(clearNewUserFlag());
  }, [dispatch]);

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
        setError(
          err.response?.data?.message ||
            "Failed to initialize bank connection. Check console for details."
        );
        setConnecting(false);
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
              setConnecting(false);
              navigate("/dashboard");
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
        setConnecting(false);
        navigate("/dashboard");
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
  }, [plaidWindow, navigate]);

  const handlePlaidConnection = () => {
    if (!linkToken) {
      setError("Link token not available. Please refresh the page.");
      return;
    }

    setConnecting(true);
    setError(null);

    // Get auth token from cookies using js-cookie
    const authToken = Cookies.get("accessToken");

    // Encode the auth token for URL transmission
    const encodedAuthToken = authToken ? encodeURIComponent(authToken) : "";

    // Redirect to Plaid app with both tokens
    const plaidAppUrl = `http://localhost:5173?token=${linkToken}&auth=${encodedAuthToken}`;
    const newWindow = window.open(plaidAppUrl, "_blank");
    setPlaidWindow(newWindow);

    // Set a timeout to reset connecting state if it takes too long (5 minutes)
    setTimeout(() => {
      if (connecting) {
        setConnecting(false);
        setError("Connection timed out. Please try again.");
      }
    }, 300000); // 5 minutes
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

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
        <motion.div
          className="w-full rounded-t-[40px] relative z-10 bg-[var(--bg-dark)] min-h-[60%] h-[60%] flex flex-col overflow-hidden"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: 0.2,
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
        >
          {/* Confetti animation */}
          <Confetti
            className="absolute inset-0 w-full h-full pointer-events-none z-50"
            options={{
              particleCount: 200,
              spread: 100,
              origin: { y: 0.6 },
              colors: ["#ffffff", "#f0f0f0", "#e0e0e0"],
            }}
          />

          <div className="flex-1 flex px-6 py-8">
            <div className="max-w-lg w-full">
              {/* Completion message */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <motion.h1
                  className="text-3xl font-semibold text-gray-400 mb-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  All set
                </motion.h1>
                <motion.h2
                  className="text-3xl font-semibold text-white mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  Welcome to Scopas 🎉
                </motion.h2>
                <motion.p
                  className="text-gray-400 text-sm font-light leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  Your profile is personalized and ready. Start discovering
                  amazing deals and maximizing your savings!
                </motion.p>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.1 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 1.2,
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="primary"
                    onClick={handlePlaidConnection}
                    disabled={!linkToken || loading || connecting}
                    className="w-full py-3 text-base font-medium !rounded-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Initializing...
                      </>
                    ) : connecting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Connecting to your bank...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Connect Bank Account
                        <ExternalLink size={14} className="opacity-60" />
                      </>
                    )}
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: 1.3,
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="w-full py-4 text-sm font-medium !rounded-full"
                  >
                    Skip for now
                  </Button>
                </motion.div>

                {error && (
                  <motion.div
                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                  >
                    <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                    </div>
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CompletionScreen;
