import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Signin from "./pages/SigninPage/Signin";
import Signup from "./pages/SignupPage/Signup";
import Onboarding from "./pages/OnboardingPage/Onboarding";
import Dashboard from "./pages/DashboardPage/Dashboard";
import Coupons from "./pages/CouponsPage/Coupons";
import Analytics from "./pages/AnalyticsPage/Analytics";
import Terms from "./pages/TermsPage/Terms";
import Privacy from "./pages/PrivacyPage/Privacy";
import Card from "./pages/CardPage/CardPage";
import Account from "./pages/AccountPage/Account";
import BankAccounts from "./pages/BankAccountsPage/BankAccounts";

function App() {
  return (
    <Provider store={store}>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireOnboarding={false}>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route
            path="/coupons/:storeName"
            element={
              <ProtectedRoute>
                <Coupons />
              </ProtectedRoute>
            }
          />
          <Route
            path="/card"
            element={
              <ProtectedRoute>
                <Card />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bank-accounts"
            element={
              <ProtectedRoute>
                <BankAccounts />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

export default App;
