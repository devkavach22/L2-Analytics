import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, KeyRound, AlertTriangle, Send, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Kavachlogo from "@/assets/KavachLogo.png";

// Import your custom Axios Instance
import Instance from "@/lib/axiosInstance"; 

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- COMPONENTS ---
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-slate-50">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-200/30 rounded-full blur-[120px] animate-blob mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-200/30 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
    </div>
  );
};

const GlassCard = ({ children, className = "" }: any) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[32px] border border-white/60 bg-white/70 backdrop-blur-2xl shadow-2xl shadow-slate-200/50",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent opacity-70" />
      {children}
    </div>
  );
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  // State
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Step 1: Verify Email & Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setIsLoading(true);
      
      // API Call: POST /forgot-password
      // Removed "/auth" prefix to match your API snippet
      const response = await Instance.post("/forgot-password", { 
        email: email 
      });
      
      setIsLoading(false);
      setSuccessMsg(response.data.message || `OTP sent to ${email}`);
      
      // Transition to OTP step after short delay
      setTimeout(() => {
        setStep("otp");
        setSuccessMsg("");
      }, 1000);

    } catch (err: any) {
      setIsLoading(false);
      console.error("Forgot Password Error:", err);

      if (err.response?.status === 404) {
        setError("This email is not registered with us.");
      } else {
        setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
      }
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (otp.length < 4) {
      setError("Please enter a valid OTP");
      return;
    }

    try {
      setIsLoading(true);

      // API Call: PUT /verify-otp
      // Removed "/auth" prefix to match your API snippet
      const response = await Instance.put("/verify-otp", { 
        email: email, 
        otp: otp 
      });

      setIsLoading(false);
      
      // Navigate to Reset Password page
      navigate("/reset-password", { 
        state: { 
          email: email, 
          verified: true
        } 
      });

    } catch (err: any) {
      setIsLoading(false);
      console.error("Verify OTP Error:", err);
      
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center relative overflow-hidden font-sans selection:bg-orange-200 selection:text-orange-900">
      
      <AnimatedBackground />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: "easeOut" }} 
        className="w-full max-w-md relative z-10 px-2"
      >
        <GlassCard className="p-8 md:p-10">
          
          <div className="flex flex-col items-center justify-center mb-8 relative">
            <img src={Kavachlogo} alt="Kavach Logo" className="h-16 w-auto object-contain mb-6 drop-shadow-sm" />
            
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
              <div className="relative w-20 h-20 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/10 group hover:scale-105 transition-transform">
                <KeyRound className="w-10 h-10 text-orange-500 group-hover:rotate-12 transition-transform duration-300" strokeWidth={1.5} />
              </div>
              <motion.div 
                className="absolute -right-2 -bottom-2 bg-blue-100 p-1.5 rounded-full border border-white shadow-sm"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                  <Mail size={14} className="text-blue-600" />
              </motion.div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              {step === "email" ? "Forgot Password?" : "Enter OTP"}
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              {step === "email" 
                ? "Enter your registered email to receive a code." 
                : `We sent a code to ${email}`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.form 
                key="email-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOTP} 
                className="space-y-6"
              >
                <div className="space-y-2 group">
                  <Label htmlFor="email" className="text-slate-700 font-bold group-focus-within:text-orange-600 transition-colors ml-1">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors w-5 h-5" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@company.com" 
                      value={email} 
                      onChange={(e) => { setEmail(e.target.value); setError(""); }} 
                      className="bg-slate-50/50 border-slate-200 text-slate-900 pl-10 placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl h-12 transition-all duration-300 font-medium"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200 flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 text-sm text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
                  </motion.div>
                )}

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-orange-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send OTP <Send size={16} /></>}
                </Button>
              </motion.form>
            ) : (
              <motion.form 
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOTP} 
                className="space-y-6"
              >
                <div className="space-y-2 group">
                  <Label htmlFor="otp" className="text-slate-700 font-bold group-focus-within:text-orange-600 transition-colors ml-1">One-Time Password</Label>
                  <div className="relative">
                    <Input 
                      id="otp" 
                      type="text" 
                      placeholder="• • • • • •" 
                      maxLength={6}
                      value={otp} 
                      onChange={(e) => { 
                        // Only allow numbers
                        const val = e.target.value.replace(/\D/g, '');
                        setOtp(val); 
                        setError(""); 
                      }} 
                      className="bg-slate-50/50 border-slate-200 text-slate-900 text-center text-2xl tracking-[0.5em] font-bold focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl h-14 transition-all duration-300"
                    />
                  </div>
                  <div className="flex justify-end">
                     <button type="button" onClick={() => { setStep("email"); setError(""); setOtp(""); }} className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline">
                        Change Email?
                     </button>
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200 flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                  </motion.div>
                )}

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-orange-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Proceed"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <Link to="/auth" className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors text-sm font-bold group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Login
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}