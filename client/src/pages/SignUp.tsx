import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { AuthLayout } from "../components/auth";
import LokamLogo from "../../assets/LOKAM_PRIMARY_LOGO_BLACK.svg";

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
  });
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.fullName) {
      setFormError("Full name is required");
      return false;
    }
    if (!formData.email) {
      setFormError("Email is required");
      return false;
    }
    if (!formData.password) {
      setFormError("Password is required");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords don't match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!validateForm()) {
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        organization_name: formData.organizationName || undefined,
      });

      navigate("/dashboard");
    } catch (err: any) {
      console.error("Registration failed:", err);
      // Error is already handled in AuthContext
    }
  };

  return (
    <AuthLayout variant="signup">
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
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-600">
            Join LokamSpace to manage your feedback calls and campaigns
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
            <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              required
              className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@company.com"
              required
              className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="organizationName" className="text-sm font-medium text-gray-700">
              Organization Name (Optional)
            </label>
            <Input
              id="organizationName"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              placeholder="Your Company"
              className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium transition-colors" 
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </motion.form>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            Sign in
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
