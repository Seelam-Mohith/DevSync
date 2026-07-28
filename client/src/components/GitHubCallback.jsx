import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

const GitHubCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Completing GitHub login...");

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }

    if (!token) {
      navigate("/login?error=No token received from GitHub", { replace: true });
      return;
    }

    const completeAuth = async () => {
      try {
        localStorage.setItem("devsync_token", token);

        const { data } = await api.get("/user/profile");

        if (data?.user) {
          localStorage.setItem("devsync_user", JSON.stringify(data.user));
        }

        window.location.href = "/dashboard";
      } catch {
        navigate("/login?error=Failed to fetch user profile", { replace: true });
      }
    };

    completeAuth();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
      <div className="text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto" />
        <p className="text-slate-400 text-sm">{status}</p>
      </div>
    </div>
  );
};

export default GitHubCallback;
