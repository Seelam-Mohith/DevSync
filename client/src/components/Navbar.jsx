import { Link, useLocation } from "react-router-dom";
import { Zap, Code, GitBranch, Terminal, Pencil, Plus, LogOut, ChevronDown, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import useAuth from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import AddAccountsModal from "./AddAccountsModal";

const avatarUrl = (seed) =>
  seed ? `https://api.dicebear.com/10.x/toon-head/svg?seed=${seed}` : null;

const platforms = [
  { key: "leetcode", label: "LeetCode", icon: Code, color: "text-yellow-500" },
  { key: "github", label: "GitHub", icon: GitBranch, color: "text-white" },
  { key: "codolio", label: "Codolio", icon: Terminal, color: "text-blue-400" },
];

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const linkedAccounts = user?.linkedAccounts || {};

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <Zap className="h-5 w-5 text-blue-400 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">
                Dev Sync
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block">Code rhythm, visible.</p>
            </div>
          </motion.div>

          {/* Desktop nav */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden items-center gap-2 md:flex"
          >
            <Link to="/dashboard">
              <Button
                variant={location.pathname === "/dashboard" ? "default" : "ghost"}
                size="sm"
              >
                Dashboard
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button
                variant={location.pathname === "/leaderboard" ? "default" : "ghost"}
                size="sm"
              >
                Leaderboard
              </Button>
            </Link>

            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 transition-all duration-200 hover:bg-white/10 hover:border-white/20"
                >
                  <div className="h-7 w-7 rounded-full overflow-hidden flex-shrink-0">
                    {user.avatar ? (
                      <img
                        src={avatarUrl(user.avatar)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                        {(user.name || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="font-medium">{user.name}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>

                      <div className="py-2">
                        {platforms.map(({ key, label, icon: Icon, color }) => {
                          const username = linkedAccounts[key];
                          const isLinked = Boolean(username);
                          return (
                            <button
                              key={key}
                              onClick={() => {
                                setDropdownOpen(false);
                                setIsModalOpen(true);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors"
                            >
                              <Icon size={16} className={`${color} flex-shrink-0`} />
                              <div className="flex-1 text-left">
                                <span className="text-slate-400 text-xs">{label}</span>
                                <p className="text-slate-200 text-sm">
                                  {isLinked ? `@${username}` : `Link ${label}`}
                                </p>
                              </div>
                              {isLinked ? (
                                <Pencil size={14} className="text-slate-500 flex-shrink-0" />
                              ) : (
                                <Plus size={14} className="text-slate-500 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="border-t border-white/10 py-2">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Mobile: avatar + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 p-1 text-sm text-slate-200 transition-all duration-200 hover:bg-white/10"
                >
                  <div className="h-7 w-7 rounded-full overflow-hidden flex-shrink-0">
                    {user.avatar ? (
                      <img src={avatarUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                        {(user.name || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                      <div className="py-2">
                        {platforms.map(({ key, label, icon: Icon, color }) => {
                          const username = linkedAccounts[key];
                          const isLinked = Boolean(username);
                          return (
                            <button
                              key={key}
                              onClick={() => {
                                setDropdownOpen(false);
                                setIsModalOpen(true);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors"
                            >
                              <Icon size={16} className={`${color} flex-shrink-0`} />
                              <div className="flex-1 text-left">
                                <span className="text-slate-400 text-xs">{label}</span>
                                <p className="text-slate-200 text-sm">
                                  {isLinked ? `@${username}` : `Link ${label}`}
                                </p>
                              </div>
                              {isLinked ? (
                                <Pencil size={14} className="text-slate-500 flex-shrink-0" />
                              ) : (
                                <Plus size={14} className="text-slate-500 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <div className="border-t border-white/10 py-2">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors hover:bg-white/10"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-white/10 md:hidden"
            >
              <div className="space-y-1 px-4 py-3">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    location.pathname === "/dashboard"
                      ? "bg-blue-600/20 text-blue-400"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/leaderboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    location.pathname === "/leaderboard"
                      ? "bg-blue-600/20 text-blue-400"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  Leaderboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsModalOpen(true);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors"
                >
                  Linked Accounts
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-white/5 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AddAccountsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
