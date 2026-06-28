import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { User, Mail, Shield, Briefcase, FileText, CheckCircle2, Upload, Image, Calendar, Phone, Trash2, MapPin, Building, Award, Hash } from 'lucide-react';
import { Avatar } from '../components/Avatar';

export const Profile: React.FC = () => {
  const { currentUser, updateProfile } = useApp();
  
  // Local edit states
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [role, setRole] = useState(currentUser?.role || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [dob, setDob] = useState(currentUser?.dob || '');
  const [contact, setContact] = useState(currentUser?.contact || '');
  const [age, setAge] = useState(currentUser?.age || '');
  const [company, setCompany] = useState(currentUser?.company || '');
  const [designation, setDesignation] = useState(currentUser?.designation || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  
  const [feedback, setFeedback] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setRole(currentUser.role || '');
      setBio(currentUser.bio || '');
      setAvatar(currentUser.avatar || '');
      setDob(currentUser.dob || '');
      setContact(currentUser.contact || '');
      setAge(currentUser.age || '');
      setCompany(currentUser.company || '');
      setDesignation(currentUser.designation || '');
      setAddress(currentUser.address || '');
    }
  }, [currentUser]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, role, bio, avatar, dob, contact, age, company, designation, address });
    setFeedback('Profile details updated successfully!');
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleRemoveAvatar = () => {
    setAvatar('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl text-white">Your Squad Profile</h2>
        <p className="text-xs text-slate-500 mt-1">Manage your corporate credentials, personal bio, and visual avatar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Profile Card Sidebar */}
        <div className="md:col-span-4 glass-card p-6 flex flex-col items-center text-center space-y-4">
          <div className="relative flex flex-col items-center gap-3">
            <Avatar
              name={name || 'User'}
              src={avatar}
              className="w-24 h-24 text-3xl shadow-2xl border-2 border-white/10"
            />
            {avatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-semibold bg-rose-500/10 border border-rose-500/10 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Remove Photo
              </button>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-white">{name || 'Your Name'}</h3>
            <span className="text-xs text-[#818CF8] font-semibold">{role || 'Collaborator'}</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed italic">
            "{bio || 'Add a personal bio summary under details form...'}"
          </p>

          <div className="w-full pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Privileges</span>
            <span className="flex items-center gap-1 font-bold text-emerald-400 uppercase bg-emerald-500/20 border border-emerald-500/10 px-2 py-0.5 rounded">
              <Shield className="w-3 h-3" /> ADMIN
            </span>
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="md:col-span-8 glass-card p-6 sm:p-8 rounded-2xl">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2 px-4 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-500"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2 px-4 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Professional Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  <span>Role / Squad Title</span>
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="E.g., Senior Software Architect"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2 px-4 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-500"
                />
              </div>

              {/* Photo Upload Zone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5 text-slate-500" />
                  <span>Profile Photo</span>
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  className={`border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#818CF8] bg-[#818CF8]/10'
                      : 'border-white/10 hover:border-[#818CF8]/40 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Upload className="w-4 h-4 text-[#818CF8]" />
                  <div className="text-center">
                    <p className="text-xs font-semibold text-slate-200">
                      Upload from Gallery
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Supports PNG, JPG, GIF (Drag-and-drop or Click)
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Date of Birth</span>
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2 px-4 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-500"
                />
              </div>

              {/* Contact Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Contact Number</span>
                </label>
                <input
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="E.g., +1 (555) 019-2834"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2 px-4 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Age */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-500" />
                  <span>Age</span>
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="E.g., 28"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2 px-4 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-500"
                />
              </div>

              {/* Company Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>Company Name</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="E.g., TaskFlow Corp"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2 px-4 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-500"
                />
              </div>

              {/* Designation */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-slate-500" />
                  <span>Designation</span>
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="E.g., Lead Architect"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2 px-4 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Office / Home Address</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="E.g., 1600 Amphitheatre Parkway, Mountain View, CA"
                className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2 px-4 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-500"
              />
            </div>

            {/* Bio summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Executive Bio Summary</span>
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A brief bio that your team can view when reviewing workspace assignments..."
                className="w-full bg-white/5 border border-white/10 focus:border-[#818CF8] rounded-xl py-2 px-4 text-xs text-slate-200 outline-none transition-all resize-none placeholder:text-slate-500"
              />
            </div>

            {feedback && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 mt-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            <div className="pt-4 flex items-center justify-end border-t border-white/10">
              <button
                type="submit"
                className="py-2.5 px-6 bg-[#818CF8] hover:bg-[#818CF8]/90 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-500/10 cursor-pointer active:scale-95 transition-all"
              >
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
