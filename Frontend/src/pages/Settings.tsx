"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ExternalLink } from "lucide-react";
import {
  Lock,
  Shield,
  UserX,
  Download,
  Link,
  Settings as SettingsIcon,
  Check,
  KeyRound,
  Smartphone,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export default function Settings() {
  // --- State ---
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [is2FADialogOpen, setIs2FADialogOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [links, setLinks] = useState({
    linkedin: "",
    github: "",
    twitter: "",
  });

  // Mock Handlers
  const handlePasswordSubmit = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    console.log("Password change submitted with OTP:", otp);
    setIsPasswordDialogOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOtp("");
  };
  const handleLinkChange = (platform: string, value: string) => {
    setLinks((prev) => ({ ...prev, [platform]: value }));
  };

  const handle2FAToggle = () => {
    setIs2FADialogOpen(true);
  };

  const handle2FAConfirm = () => {
    setIs2FAEnabled((prev) => !prev);
    setIs2FADialogOpen(false);
  };

  const handleDownload = () => {
    alert("Preparing your data archive...");
  };

  const handleDeactivate = () => {
    if (confirm("Are you sure you want to deactivate your account?")) {
      console.log("Deactivation initiated");
    }
  };
  const handleRemoveLink = (platform: string) => {
  setLinks((prev) => ({ ...prev, [platform]: "" }));
};


  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">

        {/* Page Header */}
        <div className="border-b pb-4">
          <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <span className="bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">
                            Settings
                        </span>
          </h1>
        </div>

        {/* === Security Section === */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> Security
            </CardTitle>
            <CardDescription>Manage your password and 2FA settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Password */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Password</p>
                <p className="text-sm text-muted-foreground">Change your account password securely.</p>
              </div>
              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <KeyRound className="h-4 w-4 mr-2" /> Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card max-w-md">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and set a new one. An OTP will be required.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3">
                    <Input
                      type="password"
                      placeholder="Current Password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Input
                      type="password"
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                      <Button variant="secondary" onClick={() => alert("OTP sent!")}>
                        Send OTP
                      </Button>
                    </div>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handlePasswordSubmit}>
                      <Check className="h-4 w-4 mr-2" /> Update Password
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* 2FA */}
            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="font-semibold flex items-center gap-1">
                  <Shield className="h-4 w-4" /> Two-Factor Authentication (2FA)
                </p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of protection to your account.
                </p>
              </div>
              <Switch checked={is2FAEnabled} onCheckedChange={handle2FAToggle} />
            </div>

            {/* 2FA Dialog */}
            <Dialog open={is2FADialogOpen} onOpenChange={setIs2FADialogOpen}>
              <DialogContent className="glass-card max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {is2FAEnabled ? "Disable Two-Factor Authentication" : "Enable Two-Factor Authentication"}
                  </DialogTitle>
                  <DialogDescription>
                    {is2FAEnabled
                      ? "Disabling 2FA will make your account less secure."
                      : "Scan the QR code below with your authenticator app, then enter the code to enable 2FA."}
                  </DialogDescription>
                </DialogHeader>

                {!is2FAEnabled && (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                        <Smartphone className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                    <Input type="text" placeholder="Enter 6-digit code" />
                  </div>
                )}

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button variant={is2FAEnabled ? "destructive" : "default"} onClick={handle2FAConfirm}>
                    {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </CardContent>
          </Card>
        
        <Card className="glass-card">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <ExternalLink className="h-5 w-5" /> External Profiles
    </CardTitle>
    <CardDescription>
      Manage your external profile links (LinkedIn, GitHub, Twitter).
    </CardDescription>
  </CardHeader>

  <CardContent className="space-y-4">
    <div className="space-y-4">
      {/* LinkedIn */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={links.linkedin}
            onChange={(e) => handleLinkChange("linkedin", e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!links.linkedin}
          onClick={() => handleRemoveLink("linkedin")}
          className="h-10 mt-6"
        >
          Remove
        </Button>
      </div>

      {/* GitHub */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            type="url"
            placeholder="https://github.com/yourusername"
            value={links.github}
            onChange={(e) => handleLinkChange("github", e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!links.github}
          onClick={() => handleRemoveLink("github")}
          className="h-10 mt-6"
        >
          Remove
        </Button>
      </div>

      {/* Twitter */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="twitter">Twitter</Label>
          <Input
            id="twitter"
            type="url"
            placeholder="https://twitter.com/yourhandle"
            value={links.twitter}
            onChange={(e) => handleLinkChange("twitter", e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!links.twitter}
          onClick={() => handleRemoveLink("twitter")}
          className="h-10 mt-6"
        >
          Remove
        </Button>
      </div>
    </div>

    <Button
      variant="default"
      className="w-full"
      onClick={() => alert("External links updated!")}
    >
      Save Links
    </Button>
  </CardContent>
</Card>




        {/* === Data & Deactivation (unchanged for brevity) === */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" /> Integrations & Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Export Your Data</Label>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <UserX className="h-5 w-5" /> Account Deactivation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleDeactivate}>
              Deactivate Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
