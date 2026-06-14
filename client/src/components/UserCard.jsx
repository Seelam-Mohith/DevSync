import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Camera } from "lucide-react";
import { useState } from "react";
import api from "../lib/api";
import useAuth from "../hooks/useAuth";

const avatarSeeds = [
  "Aria", "Blake", "Cody", "Drew", "Eden", "Finn", "Gia", "Hugo",
  "Ivy", "Jade", "Kai", "Luna", "Milo", "Nova", "Owen", "Rhea",
];

const avatarUrl = (seed) =>
  `https://api.dicebear.com/10.x/toon-head/svg?seed=${seed}`;

const UserCard = ({ user }) => {
  const { updateUser } = useAuth();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "Aria");
  const [saving, setSaving] = useState(false);

  const currentSeed = user?.avatar || "Aria";

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/user/profile", { avatar: selectedAvatar });
      updateUser({ avatar: selectedAvatar });
      setShowAvatarModal(false);
    } catch (err) {
      console.error("Failed to update avatar", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-white">Welcome Back!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-white">{user?.name || "Guest"}</p>
              <p className="text-sm text-slate-400">{user?.email}</p>
            </div>
            {/* Avatar with Edit Overlay */}
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-16 w-16 rounded-full overflow-hidden shadow-md cursor-pointer transition-all duration-300"
                onClick={() => {
                  setSelectedAvatar(currentSeed);
                  setShowAvatarModal(true);
                }}
              >
                <img
                  src={avatarUrl(currentSeed)}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Edit Icon Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                onClick={() => {
                  setSelectedAvatar(currentSeed);
                  setShowAvatarModal(true);
                }}
              >
                <Camera size={20} className="text-white" />
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avatar Selection Modal */}
      <AnimatePresence>
        {showAvatarModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAvatarModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="border-b border-white/10 p-6">
                  <h2 className="text-lg font-bold text-white">Choose Avatar</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Select your profile picture
                  </p>
                </div>

                {/* Avatar Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-4 gap-3">
                    {avatarSeeds.map((seed, index) => (
                      <motion.button
                        key={seed}
                        type="button"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedAvatar(seed)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative rounded-lg overflow-hidden transition-all duration-200 ${
                          selectedAvatar === seed
                            ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-[#0f172a] scale-110"
                            : "opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={avatarUrl(seed)}
                          alt={seed}
                          className="w-full h-auto"
                        />
                        {selectedAvatar === seed && (
                          <motion.div
                            layoutId="avatar-check"
                            className="absolute -top-1 -right-1 w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center"
                          >
                            <span className="text-white text-xs font-bold">✓</span>
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="border-t border-white/10 bg-white/5 p-6">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-400 mb-2">Preview</p>
                      <motion.div
                        key={selectedAvatar}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="h-20 w-20 rounded-full overflow-hidden shadow-lg mx-auto"
                      >
                        <img
                          src={avatarUrl(selectedAvatar)}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-white/10 p-4 flex gap-3">
                  <button
                    onClick={() => setShowAvatarModal(false)}
                    className="flex-1 rounded-lg bg-white/5 border border-white/10 text-slate-200 py-2 font-medium hover:bg-white/10 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 rounded-lg bg-blue-600 text-white py-2 font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserCard;
