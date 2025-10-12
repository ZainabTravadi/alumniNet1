import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Users } from "lucide-react";
import networkingIllustration from "@/assets/networking-illustration.jpg";
import { useNavigate } from "react-router-dom";

// Firebase imports
import { auth, db } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const AuthCard = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          alert("Passwords do not match ❌");
          setLoading(false);
          return;
        }

        // 🔹 Create new user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // 🔹 Store profile with default fields
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          createdAt: new Date(),
          // Default profile fields
          availability: "",
          avatarUrl: "",
          batch: "",
          bio: "",
          company: "",
          department: "",
          displayName: "",
          expertise: [],
          isMentor: false,
          languages: [],
          linkedinUrl: "",
          location: "",
          menteesCount: 0,
          rating: 0,
          responseTime: "",
          title: "",
        });

        console.log("✅ User signed up and profile created:", user);
        navigate("/complete-profile");
      } else {
        // 🔹 Sign in existing user
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log("✅ User signed in:", userCredential.user);
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("🔥 Auth error:", error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero relative overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-glow animate-glow" />

      {/* Glass card container */}
      <div
        className="glass-card rounded-2xl w-full max-w-3xl overflow-hidden animate-fade-in-up relative z-10"
        style={{
          backdropFilter: "blur(20px)",
          background: "rgba(45, 20, 76, 0.1)",
          border: "1px solid rgba(147, 51, 234, 0.2)",
        }}
      >
        <div className="flex flex-col lg:flex-row min-h-[500px]">
          {/* Left side (Image + text) */}
          <div className="flex-1 bg-gradient-primary relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-glow opacity-40" />
            <div className="relative z-10 p-8 lg:p-12 text-center flex flex-col items-center justify-center">
              <img
                src={networkingIllustration}
                alt="Alumni Networking Platform"
                className="w-full max-w-md mx-auto opacity-90 rounded-xl mb-8"
                style={{
                  filter: "drop-shadow(0 10px 30px rgba(147, 51, 234, 0.4))",
                }}
              />
              <h1 className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
                Hello! 👋
              </h1>
              <p className="text-lg max-w-md text-center bg-clip-text text-transparent bg-gradient-to-r from-white/40 via-white/70 to-white/40 animate-pulse mb-4">
                Connect with your alumni network and build meaningful professional relationships
              </p>
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Join 10,000+ Alumni</span>
              </div>
            </div>
          </div>

          {/* Right side (Form) */}
          <div className="flex-1 bg-background/10 p-8 lg:p-12 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto space-y-8">
              {/* Header */}
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-foreground">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-muted-foreground">
                  {isSignUp
                    ? "Join the alumni network and start connecting"
                    : "Sign in to your alumni account"}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Email Address
                  </Label>
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
                  <Label htmlFor="password" className="text-foreground font-medium">
                    Password
                  </Label>
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-11"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Forgot Password */}
                {!isSignUp && (
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-sm text-primary hover:text-primary-glow transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full py-4 font-semibold text-lg"
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : isSignUp
                    ? "Create Account"
                    : "Sign In"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                {/* Toggle Mode */}
                <div className="text-center">
                  <span className="text-sm text-muted-foreground">
                    {isSignUp
                      ? "Already have an account? "
                      : "Don't have an account? "}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-primary hover:text-primary-glow font-medium transition-colors"
                  >
                    {isSignUp ? "Sign In" : "Create Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
