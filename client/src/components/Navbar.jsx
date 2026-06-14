import { Link, useLocation } from "react-router-dom";
import { Zap } from "lucide-react";
import { Button } from "./ui/button";
import useAuth from "../hooks/useAuth";
import { motion } from "framer-motion";
import { useState } from "react";
import AddAccountsModal from "./AddAccountsModal";

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <Zap className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Dev Sync
              </h1>
              <p className="text-xs text-slate-400">Code rhythm, visible.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsModalOpen(true)}
                className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300 hover:scale-105 hover:border-blue-400 hover:bg-blue-500/20 hover:text-blue-200 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              >
                <span className="hidden font-medium sm:inline">Add Accounts</span>
              </Button>
            )}

            <span className="hidden text-sm text-muted-foreground sm:inline px-2">{user?.name}</span>
            {user && (
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            )}
          </motion.div>
        </div>
      </nav>

      <AddAccountsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
