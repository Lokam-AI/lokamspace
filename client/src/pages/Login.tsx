import { useState, FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion } from "framer-motion";
import { AuthLayout } from "../components/auth";
import LokamLogo from "../../assets/LOKAM_PRIMARY_LOGO_BLACK.svg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError("Email and password are required");
      return;
    }

    try {
      await login({ email, password });
      // Navigation is now handled in the AuthContext
    } catch (err) {
      // Error is already handled in AuthContext
      console.error("Login failed:", err);
    }
  };

  return (
    <AuthLayout variant="login">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-6"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <motion.img 
            src={LokamLogo} 
            alt="Lokam Logo" 
            className="h-12"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
        </div>
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600">
            Enter your credentials to access your account
          </p>
        </div>

        {/* Form */}
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {(error || formError) && (
            <motion.div 
              className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error || formError}
            </motion.div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <a
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium transition-colors" 
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </motion.form>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            Sign up for free
          </a>
        </div>

        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-100">
          <a href="#" className="hover:text-gray-700 transition-colors">Terms of Use</a>
          {" | "}
          <a href="#" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
