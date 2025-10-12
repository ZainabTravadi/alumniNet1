import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  Briefcase,
  Calendar,
  MapPin,
  Check,
  Link,
  Globe,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";

// Simple select wrapper
const Select = ({ label, children, ...props }: any) => (
  <div className="space-y-2">
    <Label htmlFor={props.id}>{label}</Label>
    <select
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm 
                 ring-offset-background placeholder:text-muted-foreground 
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
                 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 
                 transition-colors"
      {...props}
    >
      {children}
    </select>
  </div>
);

export const ProfileCompletionCard = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const loadingAuth = false;

  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isMentor, setIsMentor] = useState(false);
  const [expertiseString, setExpertiseString] = useState("");
  const [languagesString, setLanguagesString] = useState("");
  const [availability, setAvailability] = useState("Evenings & Weekends");
  const [responseTime, setResponseTime] = useState("Under 8 hours");

  useEffect(() => {
    if (!loadingAuth && !user) navigate("/");
  }, [user, loadingAuth, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const expertiseArray = expertiseString
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      const languagesArray = languagesString
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);

      const profileData = {
        displayName,
        title,
        company,
        batch,
        department,
        location,
        bio,
        linkedinUrl,
        isMentor,
        availability,
        responseTime,
        expertise: expertiseArray,
        languages: languagesArray,
        avatarUrl: "",
        menteesCount: 0,
        rating: 5,
      };

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, profileData);
      navigate("/dashboard");
    } catch (error) {
      console.error("🔥 Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingAuth || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero text-foreground">
        Loading authentication state...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Glass Card */}
      <div
        className="glass-card rounded-2xl w-full max-w-4xl p-8 lg:p-10 flex flex-col justify-between"
        style={{
          backdropFilter: "blur(20px)",
          background: "rgba(45, 20, 76, 0.12)",
          border: "1px solid rgba(147, 51, 234, 0.25)",
          height: "85vh", // slightly bigger
        }}
      >
        {/* Header */}
        <div className="text-center space-y-2 mb-4">
          <Zap className="w-8 h-8 text-primary mx-auto" />
          <h2 className="text-3xl font-bold text-foreground">
            Complete Your Profile
          </h2>
          <p className="text-muted-foreground">
            Fill in your professional details to connect with alumni.
          </p>
        </div>

        {/* Scrollable Form Area */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto pr-2 space-y-5 flex-1"
          style={{ maxHeight: "58vh" }}
        >
          <div className="grid grid-cols-2 gap-4">
            <InputWithIcon
              id="displayName"
              label="Full Name"
              icon={<Users />}
              value={displayName}
              onChange={setDisplayName}
            />
            <InputWithIcon
              id="batch"
              label="Batch Year"
              icon={<Calendar />}
              value={batch}
              onChange={setBatch}
            />
            <InputWithIcon
              id="title"
              label="Current Title"
              icon={<Briefcase />}
              value={title}
              onChange={setTitle}
            />
            <InputWithIcon
              id="company"
              label="Company"
              icon={<Briefcase />}
              value={company}
              onChange={setCompany}
            />
            <InputWithIcon
              id="department"
              label="Department"
              value={department}
              onChange={setDepartment}
            />
            <InputWithIcon
              id="location"
              label="Location"
              icon={<MapPin />}
              value={location}
              onChange={setLocation}
            />
          </div>

          <InputWithIcon
            id="expertise"
            label="Expertise (Comma-separated)"
            icon={<TrendingUp />}
            value={expertiseString}
            onChange={setExpertiseString}
          />
          <InputWithIcon
            id="languages"
            label="Languages (Comma-separated)"
            icon={<Globe />}
            value={languagesString}
            onChange={setLanguagesString}
          />
          <InputWithIcon
            id="linkedin"
            label="LinkedIn URL"
            icon={<Link />}
            value={linkedinUrl}
            onChange={setLinkedinUrl}
          />
          <Textarea
            id="bio"
            placeholder="Write a short professional bio..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <div className="flex items-center gap-2">
            <Checkbox
              id="isMentor"
              checked={isMentor}
              onCheckedChange={(checked) => setIsMentor(checked === true)}
            />
            <Label htmlFor="isMentor" className="text-sm">
              I’m open to mentoring others 💡
            </Label>
          </div>

          {isMentor && (
            <div className="grid grid-cols-2 gap-4">
              <Select
                id="availability"
                label="Availability"
                value={availability}
                onChange={(e: any) => setAvailability(e.target.value)}
              >
                <option value="Evenings & Weekends">Evenings & Weekends</option>
                <option value="Flexible during day">Flexible during day</option>
                <option value="Weekends only">Weekends only</option>
                <option value="Limited">Limited</option>
              </Select>

              <Select
                id="responseTime"
                label="Response Time"
                value={responseTime}
                onChange={(e: any) => setResponseTime(e.target.value)}
              >
                <option value="Under 8 hours">Under 8 hours</option>
                <option value="12 - 24 hours">12 - 24 hours</option>
                <option value="24 - 48 hours">24 - 48 hours</option>
                <option value="Over 48 hours">Over 48 hours</option>
              </Select>
            </div>
          )}
        </form>

        {/* Button inside the card (fixed at bottom of card) */}
        <div className="pt-4 border-t border-border flex justify-end">
          <Button
            onClick={handleSubmit}
            variant="gradient"
            size="lg"
            disabled={loading}
            className="px-8 py-4 font-semibold text-lg shadow-lg rounded-xl"
          >
            {loading ? "Saving..." : "Complete Profile"}
            <Check className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Helper Input Component with Icons
const InputWithIcon = ({
  id,
  label,
  icon,
  value,
  onChange,
  placeholder,
}: any) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
      )}
      <Input
        id={id}
        value={value}
        placeholder={placeholder || label}
        onChange={(e) => onChange(e.target.value)}
        className={icon ? "pl-10" : ""}
      />
    </div>
  </div>
);
