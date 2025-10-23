import React, { useState } from "react";
import coin from "../../../../public/icon/coin.png";
import { Menu, User, LogOut, Home, CreditCard, BarChart3, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { signout } from "../../store/slices/authSlice";
import MenuDropdown, { MenuItem } from "./MenuDropdown";

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(signout()).unwrap();
    } catch (e) {
      // ignore
    } finally {
      navigate("/signin");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Scopas
            </h1>
            <div className="relative flex items-center">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg">
                <img
                  src={coin}
                  alt="Coins"
                  className="w-5 h-5 object-contain"
                />
                <span className="text-white font-semibold text-sm">0</span>
              </div>
              <div className="h-6 w-px bg-white/10 mx-3" />
              <button
                onClick={() => setOpen((v) => !v)}
                aria-label="Open menu"
                className="p-2 rounded-lg text-white hover:bg-white/5"
              >
                <Menu size={18} />
              </button>

              {open && (
                <MenuDropdown
                  isOpen={open}
                  onClose={() => setOpen(false)}
                  align="right"
                  items={
                    [
                      {
                        id: "home",
                        label: "Home",
                        Icon: Home,
                        onSelect: () => {
                          setOpen(false);
                          navigate("/dashboard");
                        },
                      },
                      {
                        id: "card",
                        label: "Card",
                        Icon: CreditCard,
                        onSelect: () => {
                          setOpen(false);
                          navigate("/card");
                        },
                      },
                      {
                        id: "analytics",
                        label: "Analytics",
                        Icon: BarChart3,
                        onSelect: () => {
                          setOpen(false);
                          navigate("/analytics");
                        },
                      },
                      {
                        id: "bank-accounts",
                        label: "Bank Accounts",
                        Icon: Building2,
                        onSelect: () => {
                          setOpen(false);
                          navigate("/bank-accounts");
                        },
                      },
                      {
                        id: "account",
                        label: "Account",
                        Icon: User,
                        onSelect: () => {
                          setOpen(false);
                          navigate("/account");
                        },
                      },
                      {
                        id: "logout",
                        label: "Logout",
                        Icon: LogOut,
                        onSelect: handleLogout,
                        showDividerAbove: true,
                        isLoading: isLoggingOut,
                      },
                    ] as MenuItem[]
                  }
                />
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
