import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import Input from "./ui/input";
import api from "../lib/api";

const JoinSquadModal = ({ isOpen, onClose, onSquadJoined }) => {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/squads/join", { inviteCode });
      if (onSquadJoined) onSquadJoined(data.squad);
      setInviteCode("");
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to join squad");
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
                <h2 className="text-xl font-semibold text-white">Join Squad</h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleJoin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                      <LogIn size={16} className="text-blue-400" />
                      Invite Code
                    </label>
                    <Input
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="e.g. ABC123"
                      className="bg-slate-950/50 font-mono uppercase tracking-wider"
                      required
                      maxLength={8}
                    />
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                      Join Squad
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

export default JoinSquadModal;
