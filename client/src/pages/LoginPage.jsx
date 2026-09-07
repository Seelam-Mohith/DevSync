import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Input from "../components/ui/input";
import { Button } from "../components/ui/button";
import useAuth from "../hooks/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", avatar: "Aria" });

  const avatarSeeds = [
    "Aria", "Blake", "Cody", "Drew", "Eden", "Finn", "Gia", "Hugo",
    "Ivy", "Jade", "Kai", "Luna", "Milo", "Nova", "Owen", "Rhea",
  ];
  const [error, setError] = useState(searchParams.get("error") || "");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (searchParams.get("error")) {
      const url = new URL(window.location);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url);
    }
  }, [searchParams]);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      // Validate form
      if (!form.email || !form.password) {
        setError("Email and password are required");
        setPending(false);
        return;
      }

      if (isRegister && !form.name) {
        setError("Name is required for registration");
        setPending(false);
        return;
      }

      if (isRegister && !form.avatar) {
        setError("Please select an avatar");
        setPending(false);
        return;
      }

      if (form.password.length < 6) {
        setError("Password must be at least 6 characters long");
        setPending(false);
        return;
      }

      console.log("[LOGIN] Submitting", { email: form.email, mode: isRegister ? "register" : "login" });

      if (isRegister) {
        await register(form);
      } else {
        await login({ email: form.email, password: form.password });
      }

      console.log("[LOGIN] Success, navigating to dashboard");
      const inviteCode = searchParams.get("invite");
      navigate(inviteCode ? `/invite/${inviteCode}` : "/dashboard");
    } catch (requestError) {
      const errorMessage =
        requestError?.response?.data?.message ||
        requestError?.message ||
        (isRegister ? "Registration failed. Please try again." : "Login failed. Please check your credentials.");

      console.error("[LOGIN] Error", { message: errorMessage, status: requestError?.response?.status });
      setError(errorMessage);
    } finally {
      setPending(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute top-10 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
        animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl"
        animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, delay: 2 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">
                Dev Sync
              </h1>
            </div>
            <p className="text-slate-400">Code rhythm, visible.</p>
          </motion.div>

          {/* Form Card */}
          <motion.div variants={itemVariants}>
            <Card glow className="overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10" />
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl text-center text-slate-100">
                  {isRegister ? "Create Account" : "Welcome Back"}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <form className="space-y-4" onSubmit={onSubmit}>
                  {isRegister && (
                    <motion.div variants={itemVariants}>
                      <Input
                        name="name"
                        placeholder="Full Name"
                        value={form.name}
                        onChange={onChange}
                        required
                      />
                    </motion.div>
                  )}
                  <motion.div variants={itemVariants}>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={form.email}
                      onChange={onChange}
                      required
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <Input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={form.password}
                      onChange={onChange}
                      minLength={6}
                      required
                    />
                  </motion.div>

                  {isRegister && (
                    <motion.div variants={itemVariants} className="space-y-2">
                      <p className="text-xs text-slate-400 text-center">Choose your avatar</p>
                      <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
                        {avatarSeeds.map((seed) => (
                          <motion.button
                            key={seed}
                            type="button"
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setForm((prev) => ({ ...prev, avatar: seed }))}
                            className={`rounded-lg overflow-hidden transition-all duration-200 ${
                              form.avatar === seed
                                ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-[#0f172a] scale-110"
                                : "opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={`https://api.dicebear.com/10.x/toon-head/svg?seed=${seed}`}
                              alt={seed}
                              className="w-full h-auto"
                            />
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3"
                    >
                      {error}
                    </motion.p>
                  )}

                  <motion.div variants={itemVariants}>
                    <Button type="submit" className="w-full" disabled={pending}>
                      {pending ? (
                        <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                          ⏳
                        </motion.span>
                      ) : isRegister ? (
                        "Create Account"
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </motion.div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-[#0f172a] px-2 text-slate-500">or continue with</span>
                    </div>
                  </div>

                  <motion.a
                    variants={itemVariants}
                    href={`${import.meta.env.VITE_API_BASE_URL || "/api"}/auth/github`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Continue with GitHub
                  </motion.a>

                  <motion.button
                    variants={itemVariants}
                    type="button"
                    className="w-full text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200"
                    onClick={() => setIsRegister((prev) => !prev)}
                  >
                    {isRegister
                      ? "Already have an account? Sign in"
                      : "Don't have an account? Create one"}
                  </motion.button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

        </motion.div>
      </motion.div>
      <footer className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-white/5 py-3">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4">
          <p className="text-xs text-slate-500">
            Built by <span className="text-slate-300 font-medium">Mohith</span>
          </p>
          <a
            href="https://github.com/seelammohith2222"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <GitBranch size={12} />
            seelammohith2222
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
