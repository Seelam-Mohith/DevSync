import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import Input from "./ui/input";

const CodolioSetup = ({ onSave, onClose, initialUsername = "" }) => {
  const [username, setUsername] = useState(initialUsername);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter a Codolio username");
      return;
    }

    setLoading(true);
    try {
      // Validate username by fetching data
      const response = await fetch(`/api/codolio/${username.trim()}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch Codolio profile");
      }

      // Save to localStorage
      localStorage.setItem("codolio_username", username.trim());
      onSave(username.trim());
    } catch (err) {
      setError(err.message || "Invalid Codolio username");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-lg">Codolio Profile</CardTitle>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 block mb-2">
                  Codolio Username
                </label>
                <Input
                  type="text"
                  placeholder="Enter your Codolio username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="w-full"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Your Codolio profile will be fetched to populate your dashboard
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex gap-3">
                {onClose && (
                  <Button
                    type="button"
                    onClick={onClose}
                    variant="outline"
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={loading || !username.trim()}
                  className="flex-1"
                >
                  {loading ? "Connecting..." : "Connect"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CodolioSetup;
