import { useState, FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg">
        <div className="flex justify-center mb-6">
          <img src={LokamLogo} alt="Lokam Logo" className="h-16" />
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome to LokamSpace</h1>
          <p className="text-sm text-gray-500 mt-2">
            Enter your credentials to access your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(error || formError) && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              {error || formError}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <a
                href="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
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
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="text-center text-sm">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </div>

        <div className="text-center text-xs mt-4 text-gray-500">
          <span>Terms of Use</span> | <span>Privacy Policy</span>
        </div>
      </Card>
    </div>
  );
}
