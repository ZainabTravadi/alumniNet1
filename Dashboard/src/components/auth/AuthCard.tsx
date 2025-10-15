"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Users } from "lucide-react";
import networkingIllustration from "@/assets/networking-illustration.jpg";
import { useNavigate } from "react-router-dom";
import { auth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
// Removed 'db' and 'setDoc' as user creation logic is gone
// import { db } from "@/firebase";
// import { doc, setDoc } from "firebase/firestore";

export const AuthCard = () => {
  const navigate = useNavigate();
  // isSignUp state and its setter are removed as the component is now sign-in only
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // confirmPassword state is removed
  const [loading, setLoading] = useState(false);

  // Set the component to be permanently in 'Sign In' mode
  const isSignUp = false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Only the sign-in block remains
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("🔥 Auth error:", error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background/90 to-background relative overflow-hidden">
      {/* Subtle animated background glow */}
      <div className="absolute inset-0 bg-gradient-glow opacity-50 animate-glow" />

      {/* Auth Container */}
      <div className="relative z-10 w-full max-w-5xl rounded-3xl shadow-2xl glass-card overflow-hidden animate-fade-in-up border border-primary/20">
        <div className="flex flex-col lg:flex-row">
          {/* Left Pane — Illustration */}
          <div className="flex-1 bg-gradient-primary flex flex-col items-center justify-center p-10 relative">
            <div className="absolute inset-0 bg-gradient-glow opacity-30 animate-pulse" />
            <img
              src={networkingIllustration}
              alt="Networking Illustration"
              className="w-full max-w-md mx-auto rounded-2xl shadow-lg mb-8 opacity-95"
              style={{
                filter: "drop-shadow(0 10px 30px rgba(147, 51, 234, 0.4))",
              }}
            />
            <h1 className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-3">
              Welcome Back 👋
            </h1>
            <p className="text-base text-primary-foreground/80 max-w-md text-center mb-4">
              Sign in to continue growing your alumni connections.
            </p>
            <div className="flex items-center gap-2 text-primary-foreground/70 mt-2">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">10,000+ Alumni Connected</span>
            </div>
          </div>

          {/* Right Pane — Form */}
          <div className="flex-1 p-10 bg-background/60 backdrop-blur-md">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Sign In
                </h2>
                <p className="text-muted-foreground">
                  Sign in to your alumni account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 pr-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-primary-glow transition"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-primary hover:opacity-90 text-lg font-semibold py-4 transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Sign In"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                {/* Toggle Mode: Removed entirely */}
                {/* <div className="text-center pt-2">
                  ...
                </div> */}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};