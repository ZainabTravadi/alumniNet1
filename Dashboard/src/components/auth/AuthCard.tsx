"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, ArrowRight, Users } from "lucide-react";
import networkingIllustration from "@/assets/networking-illustration.jpg";
import { useNavigate } from "react-router-dom";
import { auth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export const AuthCard = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    
    // 🔒 HARDCODED ADMIN EMAIL
    const ADMIN_EMAIL = "admin@gmail.com"; 
    
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Component remains permanently in 'Sign In' mode
    const isSignUp = false;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Use the hardcoded ADMIN_EMAIL and the user-entered password
            await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
            navigate("/dashboard"); // or navigate to a dedicated admin dashboard route
        } catch (error: any) {
            console.error("🔥 Auth error:", error.message);
            // Display a generic error for security if needed, but alert(error.message) is fine for now
            alert("Login failed: " + error.message);
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
                            Admin Access 🔒
                        </h1>
                        <p className="text-base text-primary-foreground/80 max-w-md text-center mb-4">
                            Login to the Super Admin Control Panel.
                        </p>
                        <div className="flex items-center gap-2 text-primary-foreground/70 mt-2">
                            <Users className="w-5 h-5" />
                            <span className="text-sm font-medium">Control AlumniNet Platform</span>
                        </div>
                    </div>

                    {/* Right Pane — Form */}
                    <div className="flex-1 p-10 bg-background/60 backdrop-blur-md">
                        <div className="max-w-md mx-auto">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-foreground mb-2">
                                    Admin Sign In
                                </h2>
                                <p className="text-muted-foreground">
                                    Enter the password for the dedicated admin account.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email - READ-ONLY Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground">
                                            {/* Using a visually distinct lock icon for admin field */}
                                            <Lock className="w-5 h-5" /> 
                                        </div>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={ADMIN_EMAIL} // 🔒 Hardcoded value
                                            readOnly // Disable user input
                                            className="pl-11 bg-muted/50 border-primary/50 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Password - INPUT Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter admin password"
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

                                {/* Forgot Password - Kept for UX */}
                                <div className="text-right">
                                    <button
                                        type="button"
                                        className="text-sm text-primary hover:text-primary-glow transition"
                                        onClick={() => alert("Contact technical support for admin password reset.")}
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
                                    {loading ? "Authenticating..." : "Sign In"}
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};