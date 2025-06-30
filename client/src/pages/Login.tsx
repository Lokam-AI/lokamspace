
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, ArrowLeft, AlertTriangle } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useCapsLockDetection } from "@/hooks/useCapsLockDetection";

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isCapsLockOn = useCapsLockDetection();
  const hasInviteToken = searchParams.get('invite') === 'true';
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleRememberMeChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, rememberMe: checked }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate authentication failure for demo
      if (formData.email === "demo@fail.com") {
        throw new Error("Invalid credentials");
      }
      
      toast.success("Login successful!");
      console.log("Login attempt:", {
        ...formData,
        password: "[REDACTED]"
      });
      
      // Navigate to dashboard after successful login
      navigate("/dashboard");
    } catch (error) {
      // Generic error message for security (no account enumeration)
      toast.error("Email or password incorrect. Please try again.");
      setErrors({ password: "Email or password incorrect" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AutoPulse</span>
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-4 w-4 text-gray-600" />
              </Link>
              <div>
                <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                <CardDescription className="text-gray-600">
                  Sign in to your AutoPulse account
                </CardDescription>
              </div>
            </div>

            {/* Invite Token Notice */}
            {hasInviteToken && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  Have an invitation link?{" "}
                  <Link to="/invite/accept" className="font-medium text-blue-600 hover:text-blue-800">
                    Accept invitation here
                  </Link>
                </p>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                  autoComplete="email"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "border-red-500" : ""}
                    autoComplete="current-password"
                  />
                  {/* Caps Lock Warning */}
                  {isCapsLockOn && formData.password && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="flex items-center space-x-1 text-amber-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs font-medium">Caps Lock</span>
                      </div>
                    </div>
                  )}
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={handleRememberMeChange}
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-700">
                    Remember me
                  </Label>
                </div>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center pt-4 space-y-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign up
                </Link>
              </p>
              
              {/* Accept Invite Link */}
              <p className="text-sm text-gray-600">
                Have an invitation?{" "}
                <Link to="/invite/accept" className="text-blue-600 hover:text-blue-800 font-medium">
                  Accept invite
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
