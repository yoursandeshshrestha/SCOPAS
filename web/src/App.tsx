import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { usePlaidLink } from "react-plaid-link";
import { AlertCircle, CheckCircle } from "lucide-react";

// Redux store setup (simplified for web)
const store = configureStore({
  reducer: {
    // Add reducers as needed
  },
});

// Main App component with Plaid integration
function PlaidApp() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Get tokens from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const auth = urlParams.get("auth");

    console.log("🔍 URL params:", window.location.search);
    console.log("🔍 Token found:", token);
    console.log("🔍 Auth token found:", auth);

    if (token) {
      setLinkToken(token);
      setAuthToken(auth);
      setLoading(false);
    } else {
      setError("No link token provided");
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSuccess = async (publicToken: string, metadata: any) => {
    try {
      setLoading(true);
      console.log("🔍 Plaid onSuccess called with:", { publicToken, metadata });

      // Prepare the request data
      const requestData = {
        publicToken: publicToken,
        institutionId: metadata.institution.institution_id,
        institutionName: metadata.institution.name,
        accounts: metadata.accounts.map(
          (account: {
            id: string;
            name: string;
            mask?: string;
            type?: string;
            subtype?: string;
          }) => ({
            id: account.id,
            name: account.name,
            mask: account.mask || null,
            type: account.type || "depository",
            subtype: account.subtype || null,
          })
        ),
      };

      console.log("🔍 Sending request data:", requestData);

      // Call the backend to exchange the public token
      const response = await fetch(
        "http://localhost:7070/api/v1/plaid/exchange-public-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ API Error:", errorData);
        throw new Error(
          `Failed to exchange token: ${errorData.message || "Unknown error"}`
        );
      }

      const result = await response.json();
      console.log("✅ Token exchange successful:", result);

      setSuccess(true);

      // Communicate with parent window (extension)
      try {
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "PLAID_CONNECTION_SUCCESS",
              timestamp: Date.now(),
            },
            "*"
          );
          console.log("📤 Sent postMessage to parent window");
        }
      } catch (err) {
        console.log("⚠️ Could not send postMessage to parent:", err);
      }

      // Close window after success
      setTimeout(() => {
        window.close();
      }, 2000);
    } catch (err) {
      console.error("Error exchanging token:", err);
      setError("Failed to connect bank account");
    } finally {
      setLoading(false);
    }
  };

  const config = {
    token: linkToken,
    onSuccess: onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  console.log("🔍 App state:", { loading, error, success, linkToken, ready });

  // Fallback if Plaid Link fails to initialize
  const handleManualOpen = () => {
    console.log("🔍 Manual open clicked");
    if (open) {
      open();
    } else {
      setError("Plaid Link not ready. Please refresh the page.");
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-[var(--bg-dark)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-white tracking-tight">
            Loading...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full bg-[var(--bg-dark)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">
              ❌ Error
            </h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.close()}
              className="w-full py-3 px-6 bg-white text-red-500 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="h-screen w-full bg-[var(--bg-dark)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">
              ✅ Success!
            </h2>
            <p className="text-gray-400 mb-2">
              Bank account connected successfully!
            </p>
            <p className="text-gray-500 text-sm">
              This window will close automatically...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative overflow-hidden bg-[var(--bg-dark)]">
      {/* Background image */}
      <div className="absolute inset-0 bg-cover bg-center opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: "url('/images/main-background.png')",
            transform: "rotate(180deg)",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-8">
            <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">
              🏦 Connect Your Bank
            </h1>
            <p className="text-gray-400 mb-8 text-lg">
              Securely connect your bank account to track spending and maximize
              savings.
            </p>

            {/* Debug info */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-4 mb-6 text-left text-sm">
              <div className="text-gray-400">
                Token: {linkToken ? "✅ Present" : "❌ Missing"}
              </div>
              <div className="text-gray-400">
                Auth: {authToken ? "✅ Present" : "❌ Missing"}
              </div>
              <div className="text-gray-400">
                Ready: {ready ? "✅ Yes" : "❌ No"}
              </div>
              <div className="text-gray-400">
                Loading: {loading ? "⏳ Yes" : "✅ No"}
              </div>
            </div>

            <button
              onClick={handleManualOpen}
              disabled={!ready}
              className={`w-full py-4 px-8 rounded-xl text-lg font-semibold transition-all duration-300 ${
                ready
                  ? "bg-white text-black hover:bg-gray-100 hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
                  : "bg-white/20 text-gray-400 cursor-not-allowed"
              }`}
            >
              {ready ? "🔗 Connect Bank Account" : "⏳ Loading..."}
            </button>

            <p className="text-gray-500 text-sm mt-6">
              Powered by Plaid • Bank-level security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App wrapper
function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PlaidApp />} />
          <Route path="/plaid" element={<PlaidApp />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
