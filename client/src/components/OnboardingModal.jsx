import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

const CHROME_EXTENSION_URL = "https://chromewebstore.google.com/detail/devsync";

const features = [
  "Automatic LeetCode sync",
  "Real-time leaderboard updates",
  "Daily coding streak tracking",
  "Friend activity feed",
  "Contest reminders",
  "No manual refresh needed",
];

const OnboardingModal = ({ isOpen, onClose, onDontShowAgain }) => {
  const handleInstall = () => {
    window.open(CHROME_EXTENSION_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-[0_0_60px_rgba(59,130,246,0.15)] backdrop-blur-xl pointer-events-auto">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500" />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="px-7 pt-8 pb-2">
                <div className="mb-1 text-3xl">🎉</div>
                <h2 className="text-2xl font-bold text-white">
                  Welcome to DevSync!
                </h2>
              </div>

              <div className="px-7 py-4 space-y-5">
                <div>
                  <h3 className="text-base font-semibold text-sky-300">
                    Unlock Automatic LeetCode Sync
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Install the DevSync Chrome Extension to automatically sync
                    your LeetCode submissions, update leaderboards in real time,
                    track your coding streak, and compete with your friends
                    without any manual updates.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                        <Check size={12} className="text-emerald-400" />
                      </span>
                      <span className="text-sm text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-7 pb-7 pt-2 space-y-3">
                <Button
                  onClick={handleInstall}
                  className="w-full gap-2"
                  size="lg"
                >
                  <span>🚀 Install Chrome Extension</span>
                  <ExternalLink size={16} className="shrink-0" />
                </Button>

                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Maybe Later
                </Button>

                <div className="flex justify-center pt-1">
                  <button
                    onClick={onDontShowAgain}
                    className="text-xs text-slate-500 underline-offset-2 hover:text-slate-300 hover:underline transition-colors"
                  >
                    Don't show again
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OnboardingModal;
