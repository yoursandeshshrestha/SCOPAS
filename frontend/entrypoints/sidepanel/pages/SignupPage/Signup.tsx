import React, { useState, useEffect } from "react";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { signup, clearError } from "../../store/slices/authSlice";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/ui/Checkbox";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Clear error when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleGoogleSignup = () => {
    // Handle Google signup logic here
    console.log("Google signup clicked");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      alert("Please accept the Terms and Conditions and Privacy Policy");
      return;
    }

    try {
      await dispatch(signup({ email, password })).unwrap();
      // Navigation will be handled by useEffect
    } catch (err) {
      // Error is handled by Redux state
      console.error("Signup failed:", err);
    }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-[var(--bg-dark)]">
      {/* Top section with background image (upside down) */}
      <div className="h-[60%] w-full relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/main-background.png')",
            transform: "rotate(180deg)",
          }}
        />
      </div>

      {/* Signup form section */}
      <div className="absolute inset-0 flex items-end">
        <div className="w-full rounded-t-[40px] relative z-10 py-10 bg-[var(--bg-dark)] h-auto">
          <div className="flex flex-col items-center justify-center h-full px-6">
            {/* Welcome Message */}
            <div className="mb-8">
              <h1 className="text-2xl font-medium text-white text-center">
                Create account
              </h1>
              <p className="text-gray-600 text-center mt-2 text-sm">
                Sign up to get started
              </p>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              {/* Email Input */}
              <Input
                type="email"
                placeholder="Email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* Password Input */}
              <Input
                type="password"
                placeholder="Password (min 8 characters)"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* Terms and Conditions */}
              <div className="pt-2">
                <Checkbox
                  checked={acceptTerms}
                  onChange={setAcceptTerms}
                  label={
                    <span>
                      I agree to the{" "}
                      <button
                        type="button"
                        className="text-white hover:underline font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/terms");
                        }}
                      >
                        Terms and Conditions
                      </button>{" "}
                      and{" "}
                      <button
                        type="button"
                        className="text-white hover:underline font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/privacy");
                        }}
                      >
                        Privacy Policy
                      </button>
                    </span>
                  }
                />
              </div>

              {/* Signup Button */}
              <Button
                type="submit"
                variant="primary"
                className="mt-5"
                isLoading={isLoading}
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>

            {/* Divider */}
            <div className="w-full max-w-md">
              <div className="flex items-center py-4">
                <div className="flex-1 border-t border-gray-800"></div>
                <span className="px-4 text-gray-600 text-xs">or</span>
                <div className="flex-1 border-t border-gray-800"></div>
              </div>

              {/* Google Signup Button */}
              <Button
                type="button"
                variant="secondary"
                onClick={handleGoogleSignup}
                icon={
                  <img
                    src="/images/google.svg"
                    alt="Google"
                    className="w-4 h-4"
                  />
                }
              >
                Continue with Google
              </Button>

              {/* Footer Links */}
              <div className="pt-6 text-center">
                <p className="text-gray-600 text-xs">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/signin")}
                    className="text-white hover:underline cursor-pointer font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
