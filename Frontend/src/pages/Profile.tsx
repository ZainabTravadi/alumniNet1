// src/components/Profile.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  DocumentData,
  arrayUnion,
} from "firebase/firestore";

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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  MapPin,
  Building2,
  GraduationCap,
  Edit,
  Plus,
  X,
  Camera,
  Save,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Globe, Users
} from "lucide-react";

//
// -------------------- Types & Initial States --------------------
//

interface CareerItem {
  id: string; // unique id for client-side keys + later edits
  company: string;
  position: string;
  startDate: string; // ISO 'yyyy-mm-dd' from <input type="date">
  endDate: string | null; // null when current
  isCurrent: boolean;
}

interface NotificationMap {
  donationReceipts: boolean;
  emailUpdates: boolean;
  eventReminders: boolean;
  forumReplies: boolean;
  mentorshipRequests: boolean;
  monthlyNewsletter: boolean;
}

interface PrivacyMap {
  allowMentorshipRequests: boolean;
  showCareerHistory: boolean;
  showEmail: boolean;
  showInDirectory: boolean;
  showLinkedIn: boolean;
  showPhone: boolean;
}

interface UserProfileState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  title: string;
  avatarUrl: string;

  batch: string;
  degree: string;
  department: string;

  currentCompany: string;
  currentPosition: string;
  linkedinUrl: string;
  websiteUrl: string; // mapped to portfolioLink in Firestore
  skills: string[]; // mapped to expertise
  availability: string;
}

const INITIAL_PROFILE_STATE: UserProfileState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  bio: "",
  location: "",
  title: "",
  avatarUrl: "",

  batch: "",
  degree: "",
  department: "",

  currentCompany: "",
  currentPosition: "",
  linkedinUrl: "",
  websiteUrl: "",
  skills: [],
  availability: "",
};

const INITIAL_NOTIFICATIONS: NotificationMap = {
  donationReceipts: false,
  emailUpdates: false,
  eventReminders: false,
  forumReplies: false,
  mentorshipRequests: false,
  monthlyNewsletter: false,
};

const INITIAL_PRIVACY: PrivacyMap = {
  allowMentorshipRequests: false,
  showCareerHistory: false,
  showEmail: false,
  showInDirectory: false,
  showLinkedIn: false,
  showPhone: false,
};

//
// -------------------- Profile Component --------------------
//

const USERS_COLLECTION = "users";

const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

const Profile: React.FC = () => {
  // auth + loading + errors
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  // skills-add dialog state
const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
const [newSkill, setNewSkill] = useState("");
const [isSavingSkill, setIsSavingSkill] = useState(false);


  // local data state
  const [profile, setProfile] =
    useState<UserProfileState>(INITIAL_PROFILE_STATE);
  const [careerHistory, setCareerHistory] = useState<CareerItem[]>([]);
  const [notifications, setNotifications] =
    useState<NotificationMap>(INITIAL_NOTIFICATIONS);
  const [privacy, setPrivacy] = useState<PrivacyMap>(INITIAL_PRIVACY);
  const [connectionCount, setConnectionCount] = useState(0); 

  // career-add dialog state
  const [isCareerDialogOpen, setIsCareerDialogOpen] = useState(false);
  const [newCareer, setNewCareer] = useState<CareerItem>({
    id: makeId(),
    company: "",
    position: "",
    startDate: "",
    endDate: null,
    isCurrent: false,
  });

  // saving flags
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingCareer, setIsSavingCareer] = useState(false);

  // Derived: current job info for header
  const currentCareer = useMemo(() => {
    const currentJob = careerHistory.find((j) => j.isCurrent);
    return {
      currentCompany: currentJob?.company || profile.currentCompany || "N/A",
      currentPosition: currentJob?.position || profile.title || "N/A",
    };
  }, [careerHistory, profile.currentCompany, profile.title]);

  //
  // Fetch user doc and map fields
  //
  const fetchUserData = useCallback(
    async (userId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const docRef = doc(db, USERS_COLLECTION, userId);
        const snap = await getDoc(docRef);

        if (!snap.exists()) {
          // new user: keep defaults
          setProfile(INITIAL_PROFILE_STATE);
          setCareerHistory([]);
          setNotifications(INITIAL_NOTIFICATIONS);
          setPrivacy(INITIAL_PRIVACY);
          setConnectionCount(0); 
          setIsLoading(false);
          return;
        }

        const data = snap.data();

        const connections = Array.isArray(data.isConnectedTo) ? data.isConnectedTo : [];
        setConnectionCount(connections.length);

        // Map profile safely (defensive)
        const mappedProfile: UserProfileState = {
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          bio: data.bio ?? "",
          location: data.location ?? "",
          title: data.title ?? "",
          avatarUrl: data.avatarUrl ?? "",
          batch: data.batch ?? "",
          degree: data.degree ?? "",
          department: data.department ?? "",
          currentCompany: "", // computed from careerHistory
          currentPosition: "",
          linkedinUrl: data.linkedinUrl ?? "",
          websiteUrl: data.portfolioLink ?? "",
          skills: Array.isArray(data.expertise) ? data.expertise : [],
          availability: data.availability ?? "",
        };

        // careerHistory expected as array of objects
        const mappedCareer: CareerItem[] = Array.isArray(data.careerHistory)
          ? data.careerHistory.map((c: any, idx: number) => ({
              id: c.id ?? `remote-${idx}`,
              company: c.company ?? "",
              position: c.position ?? "",
              startDate: c.startDate ?? "",
              endDate:
                c.endDate === undefined || c.endDate === null
                  ? null
                  : String(c.endDate),
              isCurrent: Boolean(c.isCurrent),
            }))
          : [];

        const mappedNotifications =
          (Array.isArray(data.notificationSettings) &&
            data.notificationSettings[0]) ||
          INITIAL_NOTIFICATIONS;
        const mappedPrivacy =
          (Array.isArray(data.privacySettings) && data.privacySettings[0]) ||
          INITIAL_PRIVACY;

        setProfile(mappedProfile);
        setCareerHistory(mappedCareer);
        setNotifications(mappedNotifications);
        setPrivacy(mappedPrivacy);
      } catch (err) {
        console.error("fetchUserData error:", err);
        setError("Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    },
    [setProfile, setCareerHistory]
  );

  //
  // Auth listener
  //
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        fetchUserData(user.uid);
      } else {
        setCurrentUserId(null);
        setIsLoading(false);
        setError("No user is currently logged in. Please sign in to view your profile. 🔒");
      }
    });
    return () => unsub();
  }, [fetchUserData]);

  //
  // Helper local state updaters
  //
  const handleInputChange = (field: keyof UserProfileState, value: string) =>
    setProfile((prev) => ({ ...prev, [field]: value }));

  const handleSkillAdd = (skill: string) => {
    if (!skill) return;
    setProfile((prev) =>
      prev.skills.includes(skill) ? prev : { ...prev, skills: [...prev.skills, skill] }
    );
  };

  const handleSkillRemove = (skillToRemove: string) =>
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));

  const handleNotificationChange = (key: keyof NotificationMap, value: boolean) =>
    setNotifications((prev) => ({ ...prev, [key]: value }));

  const handlePrivacyChange = (key: keyof PrivacyMap, value: boolean) =>
    setPrivacy((prev) => ({ ...prev, [key]: value }));

  //
  // Save whole profile (core fields + nested arrays)
  //
  const handleSaveProfile = async () => {
    if (!currentUserId) {
      alert("Not authenticated. Cannot save profile.");
      return;
    }

    setIsSavingProfile(true);

    const dataToSave: DocumentData = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      bio: profile.bio,
      location: profile.location,
      title: profile.title,
      avatarUrl: profile.avatarUrl,
      batch: profile.batch,
      degree: profile.degree,
      department: profile.department,
      linkedinUrl: profile.linkedinUrl,
      portfolioLink: profile.websiteUrl,
      expertise: profile.skills,
      availability: profile.availability,
      careerHistory: careerHistory.map((c) => ({
        id: c.id,
        company: c.company,
        position: c.position,
        startDate: c.startDate,
        endDate: c.endDate,
        isCurrent: c.isCurrent,
      })),
      notificationSettings: [notifications],
      privacySettings: [privacy],
    };

    try {
      const docRef = doc(db, USERS_COLLECTION, currentUserId);
      await setDoc(docRef, dataToSave, { merge: true });
      alert("Profile saved successfully! 🎉");
      setIsEditing(false);
    } catch (err) {
      console.error("handleSaveProfile error:", err);
      alert("Failed to save profile. Check console for details.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  //
  // Add career item flow
  //
  const openAddCareerDialog = () => {
    setNewCareer({
      id: makeId(),
      company: "",
      position: "",
      startDate: "",
      endDate: null,
      isCurrent: false,
    });
    setIsCareerDialogOpen(true);
  };

  const saveNewCareer = async () => {
    // validation
    if (!newCareer.position.trim() || !newCareer.company.trim() || !newCareer.startDate) {
      alert("Please provide position, company and start date.");
      return;
    }
    if (!currentUserId) {
      alert("Not authenticated.");
      return;
    }

    setIsSavingCareer(true);

    try {
      const docRef = doc(db, USERS_COLLECTION, currentUserId);
      const docSnap = await getDoc(docRef);

      // make a clean object for Firestore (no functions)
      const careerForFirestore = {
        id: newCareer.id,
        company: newCareer.company,
        position: newCareer.position,
        startDate: newCareer.startDate,
        endDate: newCareer.endDate,
        isCurrent: newCareer.isCurrent,
      };

      if (docSnap.exists()) {
        // if the doc exists, append using arrayUnion to avoid read-modify-write races
        await updateDoc(docRef, {
          careerHistory: arrayUnion(careerForFirestore),
        });
        // update local state by appending
        setCareerHistory((prev) => [...prev, careerForFirestore]);
      } else {
        // create doc with careerHistory array
        await setDoc(docRef, { careerHistory: [careerForFirestore] }, { merge: true });
        setCareerHistory((prev) => [...prev, careerForFirestore]);
      }

      setIsCareerDialogOpen(false);
      setNewCareer({
        id: makeId(),
        company: "",
        position: "",
        startDate: "",
        endDate: null,
        isCurrent: false,
      });
    } catch (err) {
      console.error("saveNewCareer error:", err);
      alert("Failed to add position. Check console.");
    } finally {
      setIsSavingCareer(false);
    }
  };

  //
  // Remove career item (client-side + firestore)
  //
  const removeCareer = async (id: string) => {
    if (!currentUserId) {
      alert("Not authenticated.");
      return;
    }
    const confirmed = confirm("Remove this position?");
    if (!confirmed) return;
    try {
      // update local first for snappy UX
      setCareerHistory((prev) => prev.filter((c) => c.id !== id));
      // rewrite the careerHistory array in firestore (safe)
      const docRef = doc(db, USERS_COLLECTION, currentUserId);
      // set full array (merge)
      await setDoc(
        docRef,
        {
          careerHistory: careerHistory.filter((c) => c.id !== id),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("removeCareer error:", err);
      alert("Failed to remove position. Check console.");
      // re-fetch to recover inconsistent state
      if (currentUserId) fetchUserData(currentUserId);
    }
  };
  const saveNewSkill = async () => {
  const skill = newSkill.trim();
  if (!skill) {
    alert("Please enter a skill.");
    return;
  }
  if (!currentUserId) {
    alert("Not authenticated.");
    return;
  }

  setIsSavingSkill(true);
  try {
    const docRef = doc(db, USERS_COLLECTION, currentUserId);

    // Write to Firestore immediately
    await updateDoc(docRef, {
      expertise: arrayUnion(skill),
    });

    // Update local state
    setProfile((prev) =>
      prev.skills.includes(skill)
        ? prev
        : { ...prev, skills: [...prev.skills, skill] }
    );

    setIsSkillDialogOpen(false);
    setNewSkill("");
  } catch (err) {
    console.error("saveNewSkill error:", err);
    alert("Failed to add skill. Check console.");
  } finally {
    setIsSavingSkill(false);
  }
};


  
  

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-500">
        Error: {error}
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 animate-fade-in">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-primary via-primary to-primary-foreground bg-clip-text text-transparent">
                Profile
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Manage your profile information and preferences
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                if (isEditing) {
                  // Cancel edits: re-fetch original data
                  if (currentUserId) fetchUserData(currentUserId);
                }
                setIsEditing((v) => !v);
              }}
              variant={isEditing ? "outline" : "default"}
              className={!isEditing ? "bg-gradient-primary hover:opacity-90" : ""}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>

            {isEditing && (
              <Button
                onClick={handleSaveProfile}
                className="bg-gradient-primary hover:opacity-90"
                disabled={isSavingProfile}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSavingProfile ? "Saving..." : "Save"}
              </Button>
            )}
          </div>
        </div>

        {/* Overview */}
<Card className="glass-card animate-slide-up p-6">
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

    {/* Left Section — Profile */}
    <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 flex-1">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile.avatarUrl || "/placeholder-avatar.jpg"} />
          <AvatarFallback className="text-2xl">
            {(profile.firstName?.[0] ?? "?") + (profile.lastName?.[0] ?? "?")}
          </AvatarFallback>
        </Avatar>
        {isEditing && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
            onClick={() => alert("Avatar upload not implemented.")}
          >
            <Camera className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <h2 className="text-2xl font-bold">
          {profile.firstName} {profile.lastName}
        </h2>
        <p className="text-lg text-muted-foreground">{currentCareer.currentPosition}</p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building2 className="h-4 w-4" />
            {currentCareer.currentCompany}
          </span>
          <span className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            {profile.batch ? `Class of ${profile.batch}` : "Class year N/A"} • {profile.department || "Dept N/A"}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {profile.location || "Location N/A"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {profile.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
          {profile.skills.length > 4 && (
            <Badge variant="outline">+{profile.skills.length - 4} more</Badge>
          )}
        </div>
      </div>
    </div>

    {/* Right Section — Connection Card */}
    <Card className="glass-card w-full md:w-[250px] shrink-0">
      <CardContent className="p-4 flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Connections</p>
          <p className="text-3xl font-bold text-primary">
            {connectionCount.toLocaleString()}
          </p>
        </div>
        <Users className="h-8 w-8 text-primary" />
      </CardContent>
    </Card>
  </div>
</Card>

        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-scale-in">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="career">Career History</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* Personal */}
          <TabsContent value="personal" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your basic information and bio</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={profile.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} disabled={!isEditing} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={profile.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} disabled={!isEditing} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={profile.email} onChange={(e) => handleInputChange("email", e.target.value)} disabled={!isEditing} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={profile.phone} onChange={(e) => handleInputChange("phone", e.target.value)} disabled={!isEditing} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={profile.location} onChange={(e) => handleInputChange("location", e.target.value)} disabled={!isEditing} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batch">Graduation Year</Label>
                    <Select value={profile.batch} onValueChange={(value) => handleInputChange("batch", value)} disabled={!isEditing}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => currentYear - i).map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={profile.bio} onChange={(e) => handleInputChange("bio", e.target.value)} disabled={!isEditing} className="min-h-[100px]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <div className="relative">
                      <i className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground">
                        <Lock className="h-4 w-4" />
                      </i>
                      <Input id="linkedin" value={profile.linkedinUrl} onChange={(e) => handleInputChange("linkedinUrl", e.target.value)} disabled={!isEditing} className="pl-10" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Personal Website</Label>
                    <div className="relative">
                      <i className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground">
                        <Globe className="h-4 w-4" />
                      </i>
                      <Input id="website" value={profile.websiteUrl} onChange={(e) => handleInputChange("websiteUrl", e.target.value)} disabled={!isEditing} className="pl-10" />
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-4">
                  <Label>Skills & Expertise</Label>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        {isEditing && (
                          <button onClick={() => handleSkillRemove(skill)} className="ml-1 h-3 w-3 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                            <X className="h-2 w-2" />
                          </button>
                        )}
                      </Badge>
                    ))}

                    {isEditing && (
  <Button
    variant="outline"
    size="sm"
    className="h-6 text-xs"
    onClick={() => setIsSkillDialogOpen(true)}
  >
    <Plus className="h-3 w-3 mr-1" />
    Add Skill
  </Button>
)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Career */}
          <TabsContent value="career" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex justify-between items-center w-full">
                  <div>
                    <CardTitle>Career History</CardTitle>
                    <CardDescription>Track your professional journey and share your experience</CardDescription>
                  </div>

                  <div>
                    <Button size="sm" variant="outline" disabled={!isEditing} onClick={openAddCareerDialog}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Position
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-6">
                  {careerHistory.length === 0 && <div className="text-sm text-muted-foreground">No positions added.</div>}

                  {careerHistory.map((job, index) => (
                    <div key={job.id} className="relative">
                      {index !== careerHistory.length - 1 && <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />}
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-4 w-4 text-primary-foreground" />
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{job.position}</h4>
                            <div className="flex items-center gap-2">
                              {job.isCurrent && <Badge className="bg-green-100 text-green-800">Current</Badge>}
                              {isEditing && (
                                <button title="Remove" onClick={() => removeCareer(job.id)} className="text-sm text-destructive hover:underline">
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="text-muted-foreground">
                            <div className="font-medium">{job.company}</div>
                            <div className="text-sm">{job.startDate} - {job.isCurrent ? "Present" : (job.endDate || "N/A")}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notification Preferences</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-6">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}</h4>
                        <p className="text-sm text-muted-foreground">
                          {key === "emailUpdates" ? "Receive general updates via email" : ""}
                        </p>
                      </div>
                      <Switch checked={value} onCheckedChange={(checked) => handleNotificationChange(key as keyof NotificationMap, checked)} disabled={!isEditing} />
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <div className="flex justify-end pt-6">
                    <Button className="bg-gradient-primary hover:opacity-90" onClick={handleSaveProfile} disabled={isSavingProfile}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Privacy Settings</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-6">
                  {Object.entries(privacy).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {value ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                        <div>
                          <h4 className="font-medium">{key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}</h4>
                          <p className="text-sm text-muted-foreground">{key === "showEmail" ? "Display your email address on your profile" : ""}</p>
                        </div>
                      </div>
                      <Switch checked={value} onCheckedChange={(checked) => handlePrivacyChange(key as keyof PrivacyMap, checked)} disabled={!isEditing} />
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <div className="flex justify-end pt-6">
                    <Button className="bg-gradient-primary hover:opacity-90" onClick={handleSaveProfile} disabled={isSavingProfile}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Career Add Dialog (shadcn Dialog) */}
      <Dialog open={isCareerDialogOpen} onOpenChange={setIsCareerDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Position</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label htmlFor="position">Position</Label>
              <Input id="position" value={newCareer.position} onChange={(e) => setNewCareer((p) => ({ ...p, position: e.target.value }))} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={newCareer.company} onChange={(e) => setNewCareer((p) => ({ ...p, company: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="startDate">Start Date</Label>
                <Input type="date" id="startDate" value={newCareer.startDate} onChange={(e) => setNewCareer((p) => ({ ...p, startDate: e.target.value }))} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="endDate">End Date</Label>
                <Input type="date" id="endDate" value={newCareer.endDate ?? ""} onChange={(e) => setNewCareer((p) => ({ ...p, endDate: e.target.value }))} disabled={newCareer.isCurrent} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="isCurrent">Currently Working Here</Label>
              <Switch id="isCurrent" checked={newCareer.isCurrent} onCheckedChange={(checked) => setNewCareer((p) => ({ ...p, isCurrent: checked, endDate: checked ? null : p.endDate }))} />
            </div>
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsCareerDialogOpen(false)} disabled={isSavingCareer}>Cancel</Button>
            <Button className="bg-gradient-primary hover:opacity-90" onClick={saveNewCareer} disabled={isSavingCareer}>
              <Save className="h-4 w-4 mr-2" />
              {isSavingCareer ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skill Add Dialog */}
<Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Add New Skill</DialogTitle>
    </DialogHeader>

    <div className="space-y-3 mt-2">
      <div className="space-y-1">
        <Label htmlFor="skillInput">Skill Name</Label>
        <Input
          id="skillInput"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="e.g. React, Java, UI/UX Design"
        />
      </div>
    </div>

    <DialogFooter className="mt-4 flex justify-end gap-3">
      <Button
        variant="outline"
        onClick={() => setIsSkillDialogOpen(false)}
        disabled={isSavingSkill}
      >
        Cancel
      </Button>
      <Button
        className="bg-gradient-primary hover:opacity-90"
        onClick={saveNewSkill}
        disabled={isSavingSkill}
      >
        <Save className="h-4 w-4 mr-2" />
        {isSavingSkill ? "Saving..." : "Save"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </div>
  );
};

export default Profile;
