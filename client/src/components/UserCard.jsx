import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Camera } from "lucide-react";
import { useState } from "react";

const UserCard = ({ user }) => {
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || null);

  // Avatar options with color schemes (professional tech-themed)
  const avatarOptions = [
    { id: 1, bg: "bg-blue-600", initials: "BS" },
    { id: 2, bg: "bg-purple-600", initials: "PR" },
    { id: 3, bg: "bg-indigo-600", initials: "IN" },
    { id: 4, bg: "bg-cyan-600", initials: "CY" },
    { id: 5, bg: "bg-teal-600", initials: "TE" },
    { id: 6, bg: "bg-green-600", initials: "GR" },
    { id: 7, bg: "bg-emerald-600", initials: "EM" },
    { id: 8, bg: "bg-orange-600", initials: "OR" },
  ];

  const currentAvatar =
    avatarOptions.find((a) => a.id === selectedAvatar) || avatarOptions[0];

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar.id);
    setShowAvatarModal(false);
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
                className={`h-16 w-16 rounded-full ${currentAvatar.bg} shadow-md flex items-center justify-center text-white font-bold text-xl cursor-pointer transition-all duration-300`}
                onClick={() => setShowAvatarModal(true)}
              >
                {(user?.name || "U").charAt(0).toUpperCase()}
              </motion.div>

              {/* Edit Icon Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
                    Select a color theme for your profile picture
                  </p>
                </div>

                {/* Avatar Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-4 gap-4">
                    {avatarOptions.map((avatar, index) => (
                      <motion.button
                        key={avatar.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleAvatarSelect(avatar)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative h-14 rounded-lg flex items-center justify-center font-semibold text-white transition-all duration-300 ${
                          selectedAvatar === avatar.id
                            ? `${avatar.bg} ring-2 ring-blue-400 shadow-lg`
                            : `${avatar.bg} hover:shadow-md`
                        }`}
                      >
                        {avatar.initials.charAt(0)}
                        {selectedAvatar === avatar.id && (
                          <motion.div
                            layoutId="avatar-check"
                            className="absolute -top-2 -right-2 w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center"
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
                        className={`h-20 w-20 rounded-full ${currentAvatar.bg} flex items-center justify-center text-white font-bold text-2xl shadow-lg`}
                      >
                        {(user?.name || "U").charAt(0).toUpperCase()}
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
                    Close
                  </button>
                  <button
                    onClick={() => setShowAvatarModal(false)}
                    className="flex-1 rounded-lg bg-blue-600 text-white py-2 font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    Confirm
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
