"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { Tabs, Tab } from "@heroui/tabs";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@ui/providers/AuthProvider";
import { LoadingSpinner } from "@ui/components/LoadingSpinner";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/generator");
    }
  }, [isAuthenticated, authLoading, router]);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setMessage(null);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Use the auth hook to handle login
        login(result.token, result.user);
        setMessage({ type: "success", text: "Login successful! Redirecting..." });

        // Redirect to dashboard or home
        setTimeout(() => {
          router.push("/generator");
        }, 1500);
      } else {
        setMessage({ type: "error", text: result.message || "Login failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setMessage(null);

    // Client-side validation
    const newErrors: Record<string, string> = {};
    
    if (!registerData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    if (!registerData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!registerData.password) {
      newErrors.password = "Password is required";
    } else if (registerData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
          first_name: registerData.firstName,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Use the auth hook to handle login
        login(result.token, result.user);
        setMessage({ type: "success", text: "Registration successful! Redirecting..." });

        // Redirect to dashboard or home
        setTimeout(() => {
          router.push("/generator");
        }, 1500);
      } else {
        setMessage({ type: "error", text: result.message || "Registration failed" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Don't render the form if already authenticated (will redirect)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-foreground/60">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-background/80 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center justify-center gap-2">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                className="text-primary-500"
                fill="currentColor"
              >
                <circle cx="20" cy="20" r="18" className="fill-primary-500" />
                <circle cx="12" cy="12" r="3" className="fill-white" />
                <text x="12" y="15" textAnchor="middle" className="fill-primary-500 text-xs font-bold">7</text>
                <circle cx="28" cy="12" r="3" className="fill-white" />
                <text x="28" y="15" textAnchor="middle" className="fill-primary-500 text-xs font-bold">15</text>
                <circle cx="20" cy="20" r="3" className="fill-white" />
                <text x="20" y="23" textAnchor="middle" className="fill-primary-500 text-xs font-bold">23</text>
                <circle cx="12" cy="28" r="3" className="fill-white" />
                <text x="12" y="31" textAnchor="middle" className="fill-primary-500 text-xs font-bold">11</text>
                <circle cx="28" cy="28" r="3" className="fill-white" />
                <text x="28" y="31" textAnchor="middle" className="fill-primary-500 text-xs font-bold">3</text>
              </svg>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                EasyLotto
              </span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-foreground/60">
            Sign in to access your smart lottery tools
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-center ${
              message.type === "success"
                ? "bg-success-500/20 text-success-500 border border-success-500/30"
                : "bg-danger-500/20 text-danger-500 border border-danger-500/30"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Auth Card */}
        <Card className="p-6">
          <CardHeader className="pb-6">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as "login" | "register")}
              className="w-full"
              classNames={{
                tabList: "w-full",
                tab: "flex-1",
              }}
            >
              <Tab key="login" title="Sign In" />
              <Tab key="register" title="Create Account" />
            </Tabs>
          </CardHeader>

          <CardBody>
            {activeTab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="email"
                  label="Email"
                  placeholder="Enter your email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  isRequired
                  isInvalid={!!errors.email}
                  errorMessage={errors.email}
                />

                <Input
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  isRequired
                  isInvalid={!!errors.password}
                  errorMessage={errors.password}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-foreground/40" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-foreground/40" />
                      )}
                    </button>
                  }
                />

                <Button
                  type="submit"
                  color="primary"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                  isDisabled={!loginData.email || !loginData.password}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <Input
                  type="text"
                  label="First Name"
                  placeholder="Enter your first name"
                  value={registerData.firstName}
                  onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                  isRequired
                  isInvalid={!!errors.firstName}
                  errorMessage={errors.firstName}
                />

                <Input
                  type="email"
                  label="Email"
                  placeholder="Enter your email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  isRequired
                  isInvalid={!!errors.email}
                  errorMessage={errors.email}
                />

                <Input
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="Create a password (min 8 characters)"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  isRequired
                  isInvalid={!!errors.password}
                  errorMessage={errors.password}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-foreground/40" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-foreground/40" />
                      )}
                    </button>
                  }
                />

                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  isRequired
                  isInvalid={!!errors.confirmPassword}
                  errorMessage={errors.confirmPassword}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5 text-foreground/40" />
                      ) : (
                        <EyeIcon className="w-5 h-5 text-foreground/40" />
                      )}
                    </button>
                  }
                />

                <Button
                  type="submit"
                  color="primary"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                  isDisabled={
                    !registerData.firstName ||
                    !registerData.email ||
                    !registerData.password ||
                    !registerData.confirmPassword
                  }
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            )}
          </CardBody>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-foreground/60">
          <Link href="/" className="hover:text-foreground">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
