import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LockKeyhole, CheckCircle2, ShieldCheck, Check, Eye, EyeOff, Lock } from "lucide-react";
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

function RequirementItem({ isValid, text }: { isValid: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs transition-colors duration-200 ${isValid ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors duration-300 ${isValid ? "bg-emerald-100 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
         {isValid ? <Check className="w-2.5 h-2.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
      </div>
      <span>{text}</span>
    </div>
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Security check: Get email from navigation state
  const email = location.state?.email || ""; 
  
  // Optional: Redirect if no email found in state (security measure)
  useEffect(() => {
    if (!email) {
      navigate("/forgot_password"); 
    }
  }, [email, navigate]);

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(""); 
  
  const [newPasswordChecks, setNewPasswordChecks] = useState({
    minChars: false,
    firstUpper: false,
    hasNumber: false,
    hasSpecial: false,
    match: false,
  });
  
  const [strength, setStrength] = useState({ score: 0, label: "Weak", color: "bg-red-500" });

  useEffect(() => {
    const minChars = newPassword.length >= 8;
    const firstUpper = /^[A-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const match = newPassword === confirm && newPassword.length > 0;

    setNewPasswordChecks({ 
      minChars, firstUpper, hasNumber, hasSpecial, match 
    });

    let score = 0;
    if (minChars) score++;
    if (firstUpper) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    if (score <= 1) setStrength({ score, label: "Weak", color: "bg-red-500" });
    else if (score === 2) setStrength({ score, label: "Medium", color: "bg-amber-500" });
    else if (score >= 3) {
       if(newPassword.length >= 12) setStrength({ score, label: "Strong", color: "bg-emerald-500" });
       else setStrength({ score, label: "Good", color: "bg-emerald-400" });
    }

  }, [newPassword, confirm]);

  const isNewPasswordValid = Object.entries(newPasswordChecks)
    .filter(([key]) => key !== 'match')
    .every(([, value]) => value);

  const isFormValid = isNewPasswordValid && newPasswordChecks.match;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (!isFormValid) return;

    try {
      setLoading(true);
      
      const payload = { 
        email: email, 
        newPassword: newPassword,
        confirmPassword: confirm
      };

      // API Call: POST /reset-password
      // Removed "/auth" prefix to match your API snippet
      await Instance.post("/reset-password", payload);
      
      setLoading(false);
      setIsSubmitted(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => navigate("/auth"), 2000);

    } catch (err: any) {
      setLoading(false);
      console.error("Reset Password Error:", err);
      
      let errorMsg = "An unexpected error occurred.";
      if (err.response) {
        // Handle backend error messages
        errorMsg = err.response.data?.error || err.response.data?.message || `Server Error: ${err.response.status}`;
      } else {
        errorMsg = err.message;
      }
      setApiError(errorMsg);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center relative overflow-hidden font-sans selection:bg-orange-200 selection:text-orange-900">
      
      <AnimatedBackground />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-lg relative z-10 px-4"
      >
        <GlassCard className="p-8 md:p-10 max-h-[95vh] overflow-y-auto custom-scrollbar">
          
          <div className="flex flex-col items-center justify-center mb-6">
            <img src={Kavachlogo} alt="Kavach Logo" className="h-12 w-auto object-contain mb-6 drop-shadow-sm" />
            
            <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all duration-300">
              {isSubmitted ? <ShieldCheck className="w-8 h-8 text-emerald-500" /> : <LockKeyhole className="w-8 h-8 text-orange-500" />}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Set New Password</h2>
                  <p className="text-slate-500 text-sm font-medium">Create a new strong password for <span className="text-orange-600 font-bold">{email}</span></p>
                </div>
                
                {apiError && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200 font-medium" role="alert">
                    {apiError}
                  </motion.div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  
                  <div className="space-y-1.5 group">
                    <Label className="text-slate-700 font-bold group-focus-within:text-orange-600 transition-colors ml-1">New Password</Label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        className="bg-slate-50/50 border-slate-200 text-slate-900 h-11 pl-10 pr-10 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl transition-all" 
                        placeholder="••••••••"
                        required
                      />
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors p-1 rounded hover:bg-slate-100">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {newPassword && (
                      <div className="space-y-1 mt-2 px-1">
                         <div className="flex justify-between text-xs font-bold mb-1">
                            <span className={strength.score > 0 ? "text-slate-700" : "text-slate-400"}>Strength</span>
                            <span className={`${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(strength.score / 4) * 100}%` }}
                              className={`h-full ${strength.color} transition-all duration-300`} 
                            />
                         </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 group">
                    <Label className="text-slate-700 font-bold group-focus-within:text-orange-600 transition-colors ml-1">Re-Enter Password</Label>
                    <div className="relative">
                       <Input 
                        type="password" 
                        value={confirm} 
                        onChange={(e) => setConfirm(e.target.value)} 
                        className={`bg-slate-50/50 border-slate-200 text-slate-900 h-11 pl-10 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 rounded-xl transition-all ${confirm.length > 0 && !newPasswordChecks.match ? 'border-red-500/50' : ''}`} 
                        placeholder="••••••••"
                        required
                      />
                      <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    </div>
                  </div>

                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Requirements</p>
                    <RequirementItem isValid={newPasswordChecks.firstUpper} text="Starts with uppercase letter" />
                    <RequirementItem isValid={newPasswordChecks.hasNumber} text="Contains a number" />
                    <RequirementItem isValid={newPasswordChecks.hasSpecial} text="Contains special character" />
                    <RequirementItem isValid={newPasswordChecks.minChars} text="Min 8 characters long" />
                    <RequirementItem isValid={newPasswordChecks.match} text="Passwords match" />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading || !isFormValid || !!apiError} 
                    className="w-full bg-slate-900 hover:bg-orange-600 text-white h-12 rounded-xl font-bold shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] hover:-translate-y-0.5 mt-2"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                  <div className="inline-flex p-4 rounded-full bg-emerald-100 mb-6 shadow-sm">
                    <CheckCircle2 className="w-16 h-16 text-emerald-600 drop-shadow-sm" />
                  </div>
                </motion.div>
                <h2 className="text-3xl text-slate-900 font-extrabold mt-2">Success!</h2>
                <p className="text-slate-500 font-medium mt-2">Your password has been securely updated.</p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-6 text-center border-t border-slate-100 pt-6">
            <Link to="/auth" className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors font-bold group text-sm">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Login
            </Link>
          </div>
        </GlassCard>
      </motion.div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}