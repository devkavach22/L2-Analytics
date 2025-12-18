import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Shield, ArrowRight, CheckCircle2, Flame, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import Instance from "@/lib/axiosInstance";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Kavachlogo from "@/assets/KavachLogo.png";

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- COMPONENT: GLASS CARD ---
const GlassCard = ({ children, className = "" }: any) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[32px] border border-orange-100/60 bg-white/60 backdrop-blur-xl shadow-xl shadow-orange-900/5",
        className
      )}
    >
       <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent opacity-50" />
       {children}
    </div>
  );
};

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [activeTab, setActiveTab] = useState("login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = { email: loginEmail, password: loginPassword };

    try {
      const response = await Instance.post('/auth/login', payload);
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
      }
      localStorage.setItem("user", JSON.stringify(response.data));
      toast({ title: "Access Granted", description: response.data.message || "Welcome back to Kavach." });
      navigate("/dashboard");

    } catch (error: any) {
      toast({ title: "Login Error", description: error.response?.data?.message || "Invalid credentials.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = { name: signupName, email: signupEmail, password: signupPassword, role: "user" };

    try {
      const response = await Instance.post('/auth/register', payload);
      localStorage.setItem("registrationData", JSON.stringify(response.data));
      toast({ title: "Account Created", description: "Please log in to continue." });
      setLoginEmail(signupEmail);
      setSignupName(""); setSignupEmail(""); setSignupPassword("");
      setActiveTab("login");

    } catch (error: any) {
      toast({ title: "Signup Error", description: error.response?.data?.message || "Registration failed.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FFF8F0] relative overflow-hidden p-4 md:p-8 font-sans selection:bg-orange-200 selection:text-orange-900">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-gradient-to-r from-orange-200 to-amber-100 rounded-full blur-[100px] opacity-50" 
        />
        <motion.div 
            animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
            className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-l from-red-200 to-orange-100 rounded-full blur-[100px] opacity-50" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-soft-light"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-5xl relative z-10"
      >
        <GlassCard className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] bg-white/70">
          
          {/* === Left Column: Form Section === */}
          <div className="flex flex-col justify-center p-8 md:p-12">
            <img
            src={Kavachlogo}
            className="h-16 w-auto ml-6 pb-2 object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
            alt="Kavach Logo"
          />    
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 border border-orange-100 rounded-xl p-1 mb-8">
                <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm text-slate-500 font-bold transition-all">Login</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm text-slate-500 font-bold transition-all">Sign Up</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent key="login" value="login" className="mt-0 focus-visible:outline-none">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                    <div className="mb-6">
                      <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome back</h2>
                      <p className="text-slate-500 font-medium">Enter your credentials to decrypt your vault.</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-5">
                      <div className="space-y-2 group">
                        <Label htmlFor="email" className="text-slate-700 font-bold group-focus-within:text-orange-600">Email Address</Label>
                        <Input
                          id="email" type="email" placeholder="name@company.com" required
                          className="bg-white border-orange-100 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 transition-all duration-300"
                          value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 group">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="password" className="text-slate-700 font-bold group-focus-within:text-orange-600">Password</Label>
                          <a href="/forgot_password" className="text-sm text-orange-600 hover:text-orange-700 font-bold hover:underline">Forgot?</a>
                        </div>
                        <div className="relative">
                          <Input
                            id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required
                            className="bg-white border-orange-100 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 pr-10 transition-all duration-300"
                            value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02]" disabled={isLoading}>
                         {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Access Dashboard"}
                         {!isLoading && <ArrowRight size={18} className="ml-2" />}
                      </Button>
                    </form>
                  </motion.div>
                </TabsContent>

                <TabsContent key="signup" value="signup" className="mt-0 focus-visible:outline-none">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                    <div className="mb-6">
                      <h2 className="text-3xl font-black text-slate-900 mb-2">Initialize Account</h2>
                      <p className="text-slate-500 font-medium">Secure your digital workspace in seconds.</p>
                    </div>
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2 group">
                        <Label htmlFor="fullname" className="text-slate-700 font-bold group-focus-within:text-orange-600">Full Name</Label>
                        <Input
                          id="fullname" placeholder="John Doe" required
                          className="bg-white border-orange-100 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 transition-all duration-300"
                          value={signupName} onChange={(e) => setSignupName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 group">
                        <Label htmlFor="signup-email" className="text-slate-700 font-bold group-focus-within:text-orange-600">Email Address</Label>
                        <Input
                          id="signup-email" type="email" placeholder="name@company.com" required
                          className="bg-white border-orange-100 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 transition-all duration-300"
                          value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 group">
                        <Label htmlFor="signup-password" className="text-slate-700 font-bold group-focus-within:text-orange-600">Password</Label>
                        <Input
                          id="signup-password" type="password" placeholder="Create a strong password" required
                          className="bg-white border-orange-100 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl h-12 transition-all duration-300"
                          value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-300 hover:scale-[1.02]" disabled={isLoading}>
                         {isLoading ? "Creating Account..." : "Create Secure Account"}
                         {!isLoading && <CheckCircle2 size={18} className="ml-2" />}
                      </Button>
                    </form>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>

          {/* === Right Column: Visual === */}
          <div className="relative hidden lg:flex flex-col items-center justify-center p-12 overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 border-l border-orange-100">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            
            {/* Animated Circles */}
            <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
               transition={{ duration: 8, repeat: Infinity }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-orange-300 to-red-300 rounded-full blur-[80px] opacity-40"
            />

            <div className="relative z-10 text-center space-y-10">
              <div className="relative h-48 w-48 mx-auto">
                 {/* Floating Shield Graphic */}
                 <motion.div 
                   animate={{ y: [0, -15, 0] }}
                   transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                   className="relative z-10 w-full h-full bg-white/40 backdrop-blur-md rounded-[40px] border border-white/60 shadow-2xl shadow-orange-500/20 flex items-center justify-center"
                 >
                    <Shield className="w-20 h-20 text-orange-500" />
                 </motion.div>
                 
                 {/* Orbiting Elements */}
                 <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                   className="absolute -inset-8 border border-orange-200 rounded-full border-dashed"
                 />
                 <motion.div 
                   animate={{ rotate: -360 }}
                   transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                   className="absolute -inset-16 border border-orange-100 rounded-full border-dashed opacity-60"
                 />
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                  Military-Grade <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                    Protection.
                  </span>
                </h3>
                <p className="text-slate-600 text-lg font-medium leading-relaxed">
                    Kavach ensures your documents are encrypted, processed efficiently, and always accessible.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}