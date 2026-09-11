import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";
import useAuth from "./useAuth";

const SESSION_KEY = "devsync_onboarding_dismissed";
const FRESH_LOGIN_KEY = "devsync_just_logged_in";

const useOnboardingModal = () => {
  const { user, updateUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem(FRESH_LOGIN_KEY);
    const sessionDismissed = sessionStorage.getItem(SESSION_KEY);

    if (!justLoggedIn) return;

    sessionStorage.removeItem(FRESH_LOGIN_KEY);

    if (sessionDismissed) return;

    if (user && user.showOnboarding === false) return;

    const timer = setTimeout(() => setIsOpen(true), 600);
    return () => clearTimeout(timer);
  }, [user]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    sessionStorage.setItem(SESSION_KEY, "true");
  }, []);

  const handleDontShowAgain = useCallback(async () => {
    setIsOpen(false);
    sessionStorage.setItem(SESSION_KEY, "true");

    try {
      const { data } = await api.patch("/user/onboarding-preference", {
        showOnboarding: false,
      });
      if (data?.user) {
        updateUser(data.user);
      }
    } catch {
      // silently fail — the preference sync is best-effort
    }
  }, [updateUser]);

  return { isOpen, handleClose, handleDontShowAgain };
};

export default useOnboardingModal;
