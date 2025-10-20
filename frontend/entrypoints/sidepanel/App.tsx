import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Signin from "./pages/SigninPage/Signin";
import Signup from "./pages/SignupPage/Signup";
import Dashboard from "./pages/DashboardPage/Dashboard";
import Coupons from "./pages/CouponsPage/Coupons";
import Analytics from "./pages/AnalyticsPage/Analytics";
import Terms from "./pages/TermsPage/Terms";
import Privacy from "./pages/PrivacyPage/Privacy";
import Card from "./pages/CardPage/Card";

function App() {
  return (
    <Provider store={store}>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
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
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

export default App;
