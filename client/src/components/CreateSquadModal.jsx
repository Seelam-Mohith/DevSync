import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import Input from "./ui/input";
import api from "../lib/api";

const CreateSquadModal = ({ isOpen, onClose, onSquadCreated }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdSquad, setCreatedSquad] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/squads", { name });
      setCreatedSquad(data.squad);
      setName("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create squad");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (createdSquad) {
      navigator.clipboard.writeText(createdSquad.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDone = () => {
    if (onSquadCreated) onSquadCreated(createdSquad);
    setCreatedSquad(null);
    setCopied(false);
    onClose();
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
                <h2 className="text-xl font-semibold text-white">
                  {createdSquad ? "Squad Created!" : "Create Squad"}
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                {!createdSquad ? (
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-200">
                        <Users size={16} className="text-blue-400" />
                        Squad Name
                      </label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Code Warriors"
                        className="bg-slate-950/50"
                        required
                        minLength={2}
                        maxLength={60}
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
                        Create Squad
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <p className="text-sm text-slate-400">
                      Share this invite code with your teammates:
                    </p>

                    <div className="flex items-center gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                      <div className="flex-1 text-center">
                        <span className="text-3xl font-bold tracking-widest text-blue-400 font-mono">
                          {createdSquad.inviteCode}
                        </span>
                      </div>
                      <button
                        onClick={copyCode}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                      </button>
                    </div>

                    {copied && (
                      <p className="text-xs text-green-400 text-center">Copied to clipboard!</p>
                    )}

                    <p className="text-xs text-slate-500 text-center">
                      They can join by going to Leaderboard and clicking "Join Squad"
                    </p>

                    <div className="flex justify-end pt-2">
                      <Button onClick={handleDone}>Done</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateSquadModal;
