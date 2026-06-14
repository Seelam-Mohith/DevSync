import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitBranch, Code, Terminal, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import Input from "./ui/input";
import api from "../lib/api";
import useAuth from "../hooks/useAuth";

const AddAccountsModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();

  const [accounts, setAccounts] = useState({
    leetcode: user?.leetcodeUsername || "",
    github: user?.githubUsername || "",
    codolio: user?.codolio || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccounts((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data } = await api.put("/user/profile", {
        leetcodeUsername: accounts.leetcode,
        githubUsername: accounts.github,
      });

      const updatedUser = data.user;
      updateUser({
        leetcodeUsername: updatedUser.leetcodeUsername,
        githubUsername: updatedUser.githubUsername,
      });
      setSuccess(true);

      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update accounts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl pointer-events-auto">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Link Accounts</h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <p className="mb-6 text-sm text-slate-400">
                  Connect your coding profiles to aggregate your stats and track your progress across platforms.
                </p>

                <form onSubmit={handleSave} className="space-y-4">
                  {/* LeetCode */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                      <Code size={16} className="text-yellow-500" />
                      LeetCode Username
                    </label>
                    <Input
                      name="leetcode"
                      value={accounts.leetcode}
                      onChange={handleChange}
                      placeholder="e.g. gautam"
                      className="bg-slate-950/50"
                    />
                  </div>

                  {/* GitHub */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                      <GitBranch size={16} className="text-white" />
                      GitHub Username
                    </label>
                    <Input
                      name="github"
                      value={accounts.github}
                      onChange={handleChange}
                      placeholder="e.g. torvalds"
                      className="bg-slate-950/50"
                    />
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-400 border border-green-500/20">
                      Accounts linked successfully!
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                      Save Accounts
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddAccountsModal;
