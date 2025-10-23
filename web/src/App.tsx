import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";

function App() {
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
        accounts: metadata.accounts.map((account: any) => ({
          // eslint-disable-line @typescript-eslint/no-explicit-any
          id: account.id,
          name: account.name,
          mask: account.mask || null,
          type: account.type || "depository",
          subtype: account.subtype || null,
        })),
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(255,255,255,0.3)",
              borderTop: "3px solid white",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          ></div>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button
            onClick={() => window.close()}
            style={{
              background: "white",
              color: "#ff6b6b",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #00b894 0%, #00a085 100%)",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>✅ Success!</h2>
          <p>Bank account connected successfully!</p>
          <p style={{ fontSize: "14px", opacity: 0.8 }}>
            This window will close automatically...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "400px", padding: "20px" }}>
        <h1 style={{ marginBottom: "20px" }}>🏦 Connect Your Bank</h1>
        <p style={{ marginBottom: "30px", opacity: 0.9 }}>
          Securely connect your bank account to track spending and maximize
          savings.
        </p>

        {/* Debug info */}
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "20px",
            fontSize: "12px",
            textAlign: "left",
          }}
        >
          <div>Token: {linkToken ? "✅ Present" : "❌ Missing"}</div>
          <div>Auth: {authToken ? "✅ Present" : "❌ Missing"}</div>
          <div>Ready: {ready ? "✅ Yes" : "❌ No"}</div>
          <div>Loading: {loading ? "⏳ Yes" : "✅ No"}</div>
        </div>

        <button
          onClick={handleManualOpen}
          disabled={!ready}
          style={{
            background: "white",
            color: "#667eea",
            border: "none",
            padding: "15px 30px",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: ready ? "pointer" : "not-allowed",
            opacity: ready ? 1 : 0.6,
            transition: "all 0.3s",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          }}
          onMouseOver={(e) => {
            if (ready) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
            }
          }}
          onMouseOut={(e) => {
            if (ready) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
            }
          }}
        >
          {ready ? "🔗 Connect Bank Account" : "⏳ Loading..."}
        </button>

        <p style={{ fontSize: "12px", opacity: 0.7, marginTop: "20px" }}>
          Powered by Plaid • Bank-level security
        </p>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
