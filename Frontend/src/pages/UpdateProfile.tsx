import React, { useRef, useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { FaUser, FaEnvelope, FaGraduationCap, FaBuilding, FaBriefcase, FaMapMarkerAlt, FaLinkedin, FaTwitter, FaGithub, FaGlobe, FaPhone, FaStar, FaCamera } from "react-icons/fa";

const initialProfile = {
  name: "",
  email: "",
  bio: "",
  avatar: "",
  graduationYear: "",
  department: "",
  company: "",
  position: "",
  location: "",
  linkedin: "",
  twitter: "",
  github: "",
  website: "",
  phone: "",
  skills: "",
};

export default function UpdateProfile() {
  const [profile, setProfile] = useState(initialProfile);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfile((prev) => ({ ...prev, avatar: file.name }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profile updated!");
  };

  const handlePlusClick = () => setShowOptions((v) => !v);
  const handleOption = (type: "camera" | "gallery") => {
    setShowOptions(false);
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#232526] to-[#414345] py-8">
      <Card className="w-full max-w-2xl p-8 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-md border border-white/20">
        <h2 className="text-3xl font-bold mb-8 text-center text-white tracking-wide">Edit Profile</h2>
        <div className="flex flex-col items-center mb-8 relative">
          <div className="relative flex items-center justify-center w-32 h-32">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg bg-white/20"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg flex items-center justify-center bg-white/20 text-white text-lg font-semibold">
                <FaUser className="text-4xl opacity-60" />
              </div>
            )}
            <button
              type="button"
              className="absolute bottom-2 right-2 bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center border-2 border-white shadow hover:bg-primary/90 focus:outline-none z-20"
              onClick={e => { e.stopPropagation(); handlePlusClick(); }}
              aria-label="Change profile picture"
            >
              <FaCamera className="text-lg" />
            </button>
            {showOptions && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white border rounded shadow-lg z-30 p-2 flex flex-col min-w-[160px] animate-fade-in"
                onClick={e => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="text-left px-3 py-2 hover:bg-accent rounded text-gray-800"
                  onClick={() => handleOption("camera")}
                >
                  Take Photo
                </button>
                <button
                  type="button"
                  className="text-left px-3 py-2 hover:bg-accent rounded text-gray-800"
                  onClick={() => handleOption("gallery")}
                >
                  Choose from Gallery
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>
        {/* Personal Info Section */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Full Name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Email"
              name="email"
              type="email"
              value={profile.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="md:col-span-2">
            <Textarea
              className="w-full rounded-lg bg-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Short Bio"
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <div className="relative">
            <FaGraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Graduation Year"
              name="graduationYear"
              type="number"
              value={profile.graduationYear}
              onChange={handleChange}
              min="1900"
              max="2099"
            />
          </div>
          <div className="relative">
            <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Department"
              name="department"
              value={profile.department}
              onChange={handleChange}
            />
          </div>
          <div className="relative">
            <FaBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Current Company/Organization"
              name="company"
              value={profile.company}
              onChange={handleChange}
            />
          </div>
          <div className="relative">
            <FaBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Current Position/Job Title"
              name="position"
              value={profile.position}
              onChange={handleChange}
            />
          </div>
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Location/City"
              name="location"
              value={profile.location}
              onChange={handleChange}
            />
          </div>
          <div className="relative">
            <FaLinkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="LinkedIn"
              name="linkedin"
              type="url"
              value={profile.linkedin}
              onChange={handleChange}
            />
          </div>
          <div className="relative">
            <FaTwitter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Twitter"
              name="twitter"
              type="url"
              value={profile.twitter}
              onChange={handleChange}
            />
          </div>
          <div className="relative">
            <FaGithub className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="GitHub"
              name="github"
              type="url"
              value={profile.github}
              onChange={handleChange}
            />
          </div>
          <div className="relative">
            <FaGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Personal Website"
              name="website"
              type="url"
              value={profile.website}
              onChange={handleChange}
            />
          </div>
          <div className="relative">
            <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Phone Number"
              name="phone"
              type="tel"
              value={profile.phone}
              onChange={handleChange}
            />
          </div>
          <div className="relative md:col-span-2">
            <FaStar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              placeholder="Skills/Interests (comma separated)"
              name="skills"
              value={profile.skills}
              onChange={handleChange}
            />
          </div>
          <div className="md:col-span-2 flex justify-center gap-4 mt-4">
            <Button type="submit" className="w-40">Update</Button>
            <Button type="button" variant="outline" className="w-40" onClick={() => window.location.reload()}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
