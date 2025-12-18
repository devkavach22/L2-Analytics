import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Lock, Bell, Shield, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- COMPONENT: GLASS CARD ---
const GlassCard = ({ children, className = "" }: any) => {
  return (
    <div className={cn("relative overflow-hidden rounded-[32px] border border-orange-100/60 bg-white/60 backdrop-blur-xl shadow-xl shadow-orange-900/5", className)}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};

export default function Profile() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] text-slate-900 font-sans selection:bg-orange-200 selection:text-orange-900 relative overflow-hidden">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-r from-orange-200 to-amber-100 rounded-full blur-[100px] opacity-50" 
        />
         <motion.div 
            animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
            className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-l from-red-200 to-orange-100 rounded-full blur-[100px] opacity-50" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-soft-light"></div>
      </div>

      <div className="relative z-50"><Header isAuthenticated={true} /></div>

      <main className="flex-1 container mx-auto py-32 px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Profile Settings</h1>
            <p className="text-slate-500 mt-2 font-medium">Manage your account settings and preferences</p>
          </div>

          {/* Profile Information */}
          <GlassCard>
            <div className="p-8">
              <div className="mb-6">
                 <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><User className="w-5 h-5 text-orange-500" /> Profile Information</h2>
                 <p className="text-slate-500 text-sm font-medium">Update your personal details</p>
              </div>
              
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 border-4 border-orange-100 shadow-xl">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-orange-500 to-red-600 text-white">JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" className="border-orange-200 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 font-bold rounded-xl">Change Avatar</Button>
                    <p className="text-sm text-slate-400 mt-2 font-medium">JPG, PNG or GIF. Max size 2MB</p>
                  </div>
                </div>

                <div className="grid gap-6 max-w-xl">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-slate-700 font-bold">Full Name</Label>
                    <Input id="name" defaultValue="John Doe" className="bg-white/50 border-orange-200 text-slate-900 focus:border-orange-500 h-11 rounded-xl" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-slate-700 font-bold">Email</Label>
                    <Input id="email" type="email" defaultValue="john@example.com" className="bg-white/50 border-orange-200 text-slate-900 focus:border-orange-500 h-11 rounded-xl" />
                  </div>
                  <Button className="w-fit bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg shadow-orange-500/20 font-bold rounded-xl">
                     <Save className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Security */}
          <GlassCard>
            <div className="p-8">
              <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Lock className="w-5 h-5 text-red-500" /> Security</h2>
                  <p className="text-slate-500 text-sm font-medium">Manage your password and security settings</p>
              </div>
              <div className="space-y-6 max-w-xl">
                <div className="grid gap-2">
                  <Label htmlFor="current-password" className="text-slate-700 font-bold">Current Password</Label>
                  <Input id="current-password" type="password" className="bg-white/50 border-orange-200 text-slate-900 focus:border-red-500 h-11 rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password" className="text-slate-700 font-bold">New Password</Label>
                  <Input id="new-password" type="password" className="bg-white/50 border-orange-200 text-slate-900 focus:border-red-500 h-11 rounded-xl" />
                </div>
                <Button variant="outline" className="w-fit border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold rounded-xl">Update Password</Button>
              </div>
            </div>
          </GlassCard>

          {/* Notifications */}
          <GlassCard>
            <div className="p-8">
              <div className="mb-6">
                 <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Bell className="w-5 h-5 text-amber-500" /> Notifications</h2>
                 <p className="text-slate-500 text-sm font-medium">Manage your notification preferences</p>
              </div>
              <div className="space-y-4">
                {[
                  { title: "Email Notifications", desc: "Receive email updates about your documents" },
                  { title: "Processing Alerts", desc: "Get notified when document processing is complete" },
                  { title: "Marketing Emails", desc: "Receive updates about new features and tips" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-orange-50/50 border border-orange-100 hover:border-orange-200 transition-colors">
                    <div>
                      <p className="font-bold text-slate-800">{item.title}</p>
                      <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                    </div>
                    <Switch className="data-[state=checked]:bg-orange-500" defaultChecked={i < 2} />
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}