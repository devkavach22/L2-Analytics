import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from "framer-motion";
import { 
  Input, Select, Button as AntButton, Tooltip, Progress, 
  message, Empty, Modal, Tag
} from "antd";
import { 
  FileTextOutlined, 
  CloudDownloadOutlined, 
  CheckCircleFilled, 
  ClockCircleFilled, 
  ThunderboltFilled,
  SafetyCertificateOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  ReloadOutlined,
  PieChartOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  CloseCircleFilled, 
  WarningFilled
} from "@ant-design/icons";
import { Sparkles, Activity, Layers, FileOutput, Bot, Zap, Search, TrendingUp, Timer } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- IMPORT AXIOS INSTANCE ---
import Instance from "@/lib/axiosInstance"; 

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getUserId = (user: any) => {
    if (!user) return null;
    return user._id || user.id || user.userId;
};

// --- VISUAL COMPONENTS ---
const NeuralBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const nodes: any[] = [];
    const nodeCount = 35; 
    class Node {
      x: number; y: number; vx: number; vy: number; size: number;
      constructor() {
        this.x = Math.random() * width; this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.15; this.vy = (Math.random() - 0.5) * 0.15;
        this.size = Math.random() * 2 + 0.5;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(249, 115, 22, 0.4)"; ctx.fill();
      }
    }
    for (let i = 0; i < nodeCount; i++) nodes.push(new Node());
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);
      nodes.forEach((node) => { node.update(); node.draw(); });
      ctx.strokeStyle = "rgba(249, 115, 22, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    }
    animate();
    const handleResize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-60" />;
};

const GlowCard = ({ children, className = "", onClick }: any) => {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/60 bg-white/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group hover:shadow-[0_8px_30px_rgb(249,115,22,0.1)]",
        className
      )}
    >
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-orange-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      {children}
    </motion.div>
  );
};

const SpotlightSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }
  return (
    <div className={cn("relative group overflow-hidden", className)} onMouseMove={handleMouseMove}>
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{ background: useMotionTemplate`radial-gradient(500px circle at ${mouseX}px ${mouseY}px, rgba(249, 115, 22, 0.06), transparent 80%)` }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

// --- DATA CONSTANTS ---
const REPORT_TYPES = [
  { value: "Risk Assessment", label: "Risk Assessment" },
  { value: "Technical Review", label: "Technical Review" },
  { value: "Executive Summary", label: "Executive Summary" },
  { value: "Market Trend Analysis", label: "Market Trend Analysis" },
  { value: "Strategic Audit", label: "Strategic Audit" },
  { value: "Legal Compliance Check", label: "Legal Compliance Check" },
  { value: "Financial Review", label: "Financial Review" },
  { value: "General Analysis", label: "Strategic Analysis" },
  { value: "Criminal Investigation", label: "Criminal Investigation" },
  { value: "Interview Report", label: "Interview Report" },
  { value: "Forensic Audit", label: "Forensic Audit" },
];

const QUICK_TEMPLATES = [
  { label: "Quarterly Audit", type: "Financial Review" },
  { label: "Competitor Analysis", type: "Market Trend Analysis" },
  { label: "GDPR Compliance", type: "Legal Compliance Check" },
];

export default function AISearch() {
  // Input State
  const [inputType, setInputType] = useState<"keyword" | "file">("keyword");
  const [topic, setTopic] = useState("");
  
  // Workspace State
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [workspaceFiles, setWorkspaceFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [reportType, setReportType] = useState("Executive Summary");
  
  // Processing State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState("");
  
  // Data State
  const [reports, setReports] = useState<any[]>([]);
  
  // Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentReport, setCurrentReport] = useState<any>(null);

  const [stats, setStats] = useState({ successRate: 100, totalTimeSaved: 0 });

  // --- EFFECT: LOAD USER & HISTORY ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed.user || parsed);
      } catch (e) {
        console.error("Failed to load user", e);
      }
    }

    const savedReports = localStorage.getItem("user_reports");
    if (savedReports) {
      try {
        setReports(JSON.parse(savedReports));
      } catch (e) { console.error(e); }
    }
  }, []);

  // --- EFFECT: FETCH FILES ---
  useEffect(() => {
    if (currentUser) {
        fetchWorkspaceFiles();
    }
  }, [currentUser]);

  // --- EFFECT: SAVE HISTORY & CALCULATE DYNAMIC STATS ---
  useEffect(() => {
    localStorage.setItem("user_reports", JSON.stringify(reports));
    
    // LOGIC: Success Rate should be (Success / Total Attempts) * 100
    const total = reports.length;
    const successCount = reports.filter(r => r.status === 'Ready').length;
    const rate = total === 0 ? 100 : Math.round((successCount / total) * 100);
    const hoursSaved = (total * 0.4).toFixed(1);

    setStats({ successRate: rate, totalTimeSaved: Number(hoursSaved) });
  }, [reports]);

  // --- API HANDLERS ---
  const fetchWorkspaceFiles = async () => {
    const uid = getUserId(currentUser);
    if (!uid) return;

    setIsLoadingFiles(true);
    try {
      // Instance automatically adds Authorization header
      const [filesRes, foldersRes] = await Promise.all([
          Instance.get('/auth/files'),
          Instance.get('/auth/folders')
      ]);

      const rawFolders = foldersRes.data.folders || foldersRes.data || [];
      const rawFiles = filesRes.data.files || filesRes.data || [];
      const myFolders = rawFolders.filter((f: any) => (f.userId || f.user) === uid);

      const transformedFiles = rawFiles
          .map((f: any) => {
              let folderId = f.folderId || f.folder;
              if (typeof folderId === 'object' && folderId !== null) {
                  folderId = folderId._id || folderId.id;
              }
              let folderName = "Uncategorized";
              const parentFolder = myFolders.find((fold: any) => (fold._id || fold.id) === folderId);
              if (parentFolder) folderName = parentFolder.name;

              return {
                  id: f._id || f.id,
                  name: f.fileName || f.originalName || f.name || "Untitled",
                  extension: f.extension || (f.fileName || f.originalName || f.name || "").split('.').pop() || "file",
                  type: (f.extension || "").toLowerCase(),
                  userId: f.userId || f.user,
                  folderName: folderName,
                  createdAt: f.createdAt
              };
          })
          .filter((f: any) => f.userId === uid)
          .reverse();

      setWorkspaceFiles(transformedFiles);
      setIsLoadingFiles(false);

    } catch (error) {
      console.error("Error fetching workspace files:", error);
      setIsLoadingFiles(false);
    }
  };

  const handleRefreshFiles = () => {
    fetchWorkspaceFiles();
    message.success("Workspace synced");
  };

  const handleGenerate = async () => {
    // Validation
    if (inputType === "keyword" && !topic.trim()) return message.error("Please enter a topic.");
    if (inputType === "file" && !selectedFileId) return message.error("Please select a file from your workspace.");

    setIsGenerating(true);
    setProgress(5);
    setGenerationStep("Initializing AI Agents...");

    // Basic details for the report entry
    const selectedFileObj = workspaceFiles.find(f => f.id === selectedFileId);
    const selectedFileName = inputType === 'file' 
      ? selectedFileObj?.name || "Unknown File"
      : topic;
    
    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });

    // --- FORM DATA CONSTRUCTION ---
    const formData = new FormData();
    formData.append("reportType", reportType);
    
    // --- MODE SELECTION ---
    if (inputType === "keyword") {
        formData.append("keyword", topic);
    } else {
        // Send fileId to backend, backend handles data retrieval
        formData.append("fileId", selectedFileId || "");
        setGenerationStep("Analyzing Workspace File...");
    }

    try {
        // --- START ANALYSIS ---
        const interval = setInterval(() => {
            setProgress((prev) => (prev >= 90 ? prev : prev + Math.floor(Math.random() * 10)));
        }, 500);
      
        // Send Request
        const response = await Instance.post("/auth/report/analyze", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        });
      
        clearInterval(interval);
        setProgress(100);
        setGenerationStep("Compiling PDF...");
        
        // Extract Data
        // Prioritize response data structure
        const downloadLink = response.data?.downloadUrl || response.data?.data?.generatedReportPath;

        // SUCCESS ENTRY
        const newReport = {
            id: Date.now(),
            title: selectedFileName,
            type: reportType,
            format: "PDF",
            date: formattedDate,
            timestamp: timestamp,
            status: "Ready", 
            downloadUrl: downloadLink 
        };

        setReports((prev) => [newReport, ...prev]);
        setCurrentReport(newReport);
        
        setTimeout(() => {
            setIsGenerating(false);
            setProgress(0);
            setGenerationStep("");
            setShowSuccessModal(true);
            message.success("Report stored in Generated Reports");
        }, 800);

        setTopic("");
        setSelectedFileId(null);
      
    } catch (error: any) {
        console.error("Report Generation Failed:", error);
        setIsGenerating(false);
        setProgress(0);
        setGenerationStep("");

        const failedReport = {
            id: Date.now(),
            title: selectedFileName,
            type: reportType,
            format: "N/A",
            date: formattedDate,
            timestamp: timestamp,
            status: "Failed",
            downloadUrl: null
        };
        
        setReports((prev) => [failedReport, ...prev]);
        
        // Detailed Error Message
        const errorMsg = error.response?.data?.msg || error.response?.data?.message || error.message || "Analysis Failed";
        message.error(`Failed: ${errorMsg}`);
    }
  };

  const downloadReport = (report: any) => {
    if (report.status !== "Ready") return message.error("Cannot download failed reports.");
    if (report.downloadUrl) {
        // If the backend returns a relative path (e.g. /api/pdf/...), 
        // using window.open works if proxy is set up or if it's a full URL.
        // If your Axios instance has a baseURL, you might need to prepend it here manually
        // IF the backend only returns '/api/...'.
        // However, based on user request, we use the link as provided.
        window.open(report.downloadUrl, "_blank");
    } else {
        message.info("Download link expired or invalid.");
    }
  };

  const getFileIcon = (type: string) => {
      if(type.includes('pdf')) return <FilePdfOutlined className="text-red-500" />;
      if(type.includes('doc')) return <FileWordOutlined className="text-blue-500" />;
      if(type.includes('xls')) return <FileExcelOutlined className="text-green-500" />;
      if(['jpg','png','jpeg'].some(x => type.includes(x))) return <FileImageOutlined className="text-purple-500" />;
      return <FileTextOutlined className="text-slate-400" />;
  };

  const getSuccessColor = (rate: number) => {
      if (rate >= 90) return { stroke: "#22c55e", text: "text-green-500" }; 
      if (rate >= 50) return { stroke: "#f97316", text: "text-orange-500" }; 
      return { stroke: "#ef4444", text: "text-red-500" }; 
  };

  const successColors = getSuccessColor(stats.successRate);

  return (
    <div className="min-h-screen bg-[#FFFBF6] text-slate-900 font-sans flex flex-col relative overflow-x-hidden selection:bg-orange-100 selection:text-orange-900">
      
      {/* Visual Layers */}
      <NeuralBackground />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-25 mix-blend-soft-light pointer-events-none z-0" />
      <div className="fixed -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-orange-200/20 to-rose-200/20 rounded-full blur-[100px] z-0" />
      <div className="fixed -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-amber-200/20 to-yellow-100/20 rounded-full blur-[100px] z-0" />

      <div className="relative z-50">
        <Header isAuthenticated={true} />
      </div>

      {/* SUCCESS MODAL */}
      <Modal
        open={showSuccessModal}
        footer={null}
        onCancel={() => setShowSuccessModal(false)}
        centered
        width={400}
        className="rounded-[24px] overflow-hidden"
        closeIcon={<div className="bg-slate-100 rounded-full p-1 hover:bg-slate-200 transition-colors"><DeleteOutlined className="text-slate-500"/></div>}
      >
        <div className="text-center p-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleFilled className="text-5xl text-green-500 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Report Ready!</h2>
            <p className="text-slate-500 mb-6">
                Your <span className="font-bold text-slate-700">{currentReport?.type}</span> has been successfully generated and stored in the <span className="font-mono text-xs bg-slate-100 px-1 rounded">generated_reports</span> folder.
            </p>
            
            <div className="space-y-3">
                <AntButton 
                    type="primary" 
                    size="large" 
                    icon={<CloudDownloadOutlined />} 
                    onClick={() => { downloadReport(currentReport); setShowSuccessModal(false); }}
                    className="w-full h-12 bg-slate-900 hover:bg-orange-600 border-none rounded-xl font-bold shadow-lg shadow-slate-900/20"
                >
                    Download PDF Now
                </AntButton>
                <AntButton 
                    type="text" 
                    onClick={() => setShowSuccessModal(false)}
                    className="text-slate-400 hover:text-slate-600 font-medium"
                >
                    Close
                </AntButton>
            </div>
        </div>
      </Modal>

      <main className="relative z-10 flex-grow container mx-auto px-4 pt-32 pb-24 max-w-7xl">
        
        {/* --- HEADER --- */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center md:text-left flex flex-col md:flex-row justify-between items-end">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-white shadow-sm backdrop-blur-md text-slate-600 text-xs font-bold uppercase tracking-widest mb-4">
               <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"/> AI Intelligence Core
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Generate <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-600">Insights</span>
            </h1>
            <p className="text-slate-500 mt-4 max-w-xl text-lg font-medium leading-relaxed">
              Connect your workspace or input keywords. Our AI agents will synthesize comprehensive reports in seconds.
            </p>
          </div>
          
          {/* Quick Stat Pill */}
          <div className="hidden md:flex items-center gap-6 bg-white/40 p-2 rounded-2xl border border-white/50 backdrop-blur-sm mt-6 md:mt-0">
             <div className="px-4 py-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reports Generated</div>
                <div className="text-2xl font-black text-slate-800">{reports.length}</div>
             </div>
             <div className="h-8 w-px bg-slate-200/50" />
             <div className="px-4 py-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Est. Time Saved</div>
                <div className="text-2xl font-black text-orange-600">{stats.totalTimeSaved}h</div>
             </div>
          </div>
        </motion.div>

        {/* --- MAIN GENERATOR INTERFACE --- */}
        <div className="mb-16 relative z-20">
          <SpotlightSection className="rounded-[2.5rem] shadow-2xl shadow-orange-900/5">
             <GlowCard className="border-0 shadow-none bg-white/80 backdrop-blur-2xl"> 
               <div className="p-2 md:p-10">
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    
                    {/* LEFT: CONFIGURATION */}
                    <div className="xl:col-span-8 space-y-8">
                       {/* Input Toggle */}
                       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                              <div className="bg-gradient-to-br from-orange-500 to-rose-500 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
                                <Bot size={26} />
                              </div>
                              <div>
                                <h2 className="text-xl font-bold text-slate-800 m-0">Parameters</h2>
                                <p className="text-sm text-slate-400 font-medium">Configure your analysis source</p>
                              </div>
                          </div>
                          
                          <div className="bg-slate-100/80 p-1.5 rounded-xl flex items-center self-stretch sm:self-auto">
                            <button onClick={() => setInputType("keyword")} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${inputType === "keyword" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}>
                              <Search size={14} /> Keyword
                            </button>
                            <button onClick={() => setInputType("file")} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${inputType === "file" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}>
                              <FolderOpenOutlined /> Workspace
                            </button>
                          </div>
                       </div>

                       <div className="space-y-6 bg-slate-50/60 p-8 rounded-3xl border border-slate-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Dynamic Input */}
                            <div className="md:col-span-2 space-y-3">
                              <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                  {inputType === "keyword" ? <Layers size={14}/> : <FolderOpenOutlined />}
                                  {inputType === "keyword" ? "Target Entity" : "Select Source File"}
                                </label>
                                {inputType === "file" && (
                                   <button onClick={handleRefreshFiles} className="text-[10px] font-bold bg-white px-2 py-1 rounded border border-slate-200 text-slate-500 hover:text-orange-600 hover:border-orange-200 transition-colors flex items-center gap-1">
                                     <ReloadOutlined spin={isLoadingFiles} /> SYNC
                                   </button>
                                )}
                              </div>

                              {inputType === "keyword" ? (
                                <Input 
                                  size="large" 
                                  placeholder="Type a company, topic, or keyword..." 
                                  value={topic} 
                                  onChange={(e) => setTopic(e.target.value)} 
                                  className="h-14 rounded-xl text-base font-medium border-slate-200 shadow-sm focus:border-orange-500 hover:border-orange-300" 
                                />
                              ) : (
                                <Select
                                  size="large"
                                  className="w-full h-14 custom-select-lg"
                                  placeholder="Select a document from your workspace..."
                                  loading={isLoadingFiles}
                                  value={selectedFileId}
                                  onChange={setSelectedFileId}
                                  options={workspaceFiles.map(f => ({ 
                                    value: f.id, 
                                    label: (
                                      <div className="flex items-center justify-between w-full pr-4 py-1">
                                        <div className="flex items-center gap-3">
                                          <div className="bg-slate-50 p-1.5 rounded text-lg">
                                              {getFileIcon(f.type)}
                                          </div>
                                          <div className="flex flex-col text-left">
                                              <span className="font-semibold text-slate-700 leading-tight">{f.name}</span>
                                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                  <FolderOpenOutlined style={{fontSize: 9}}/> {f.folderName}
                                              </span>
                                          </div>
                                        </div>
                                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold border border-slate-200">
                                            {f.extension.toUpperCase()}
                                        </span>
                                      </div>
                                    ) 
                                  }))}
                                  notFoundContent={
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={isLoadingFiles ? "Loading..." : "No files found in workspace"} />
                                  }
                                />
                              )}
                            </div>

                            {/* Report Type */}
                            <div className="md:col-span-2 space-y-3">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Output Format</label>
                              <Select 
                                size="large" 
                                value={reportType} 
                                onChange={setReportType} 
                                className="w-full h-14" 
                                options={REPORT_TYPES} 
                                popupClassName="rounded-xl font-medium p-1"
                              />
                            </div>
                          </div>

                          {/* Quick Actions / Helpers */}
                          {inputType === "keyword" && (
                            <div className="pt-2">
                              <span className="text-xs font-bold text-slate-400 mr-3 flex items-center gap-1 mb-3"><Sparkles size={12} className="text-orange-400"/> Suggested Templates:</span>
                              <div className="flex flex-wrap gap-2">
                                 {QUICK_TEMPLATES.map((t, idx) => (
                                   <Tag key={idx} className="cursor-pointer px-4 py-2 rounded-lg border border-slate-200 hover:border-orange-300 hover:text-orange-700 hover:bg-orange-50/50 transition-all text-slate-600 bg-white shadow-sm font-semibold text-xs border-dashed" onClick={() => { setInputType("keyword"); setTopic(t.label); setReportType(t.type); }}>
                                      {t.label}
                                   </Tag>
                                 ))}
                              </div>
                            </div>
                          )}
                          {inputType === "file" && (
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex gap-3 text-xs text-blue-800/80 font-medium">
                               <div className="mt-0.5 bg-white p-1 rounded-full shadow-sm text-blue-500 h-fit"><SafetyCertificateOutlined /></div>
                               <p className="leading-relaxed">Files are securely streamed from your encrypted workspace. No temporary copies are stored on the search server.</p>
                            </div>
                          )}
                       </div>

                       <div className="flex items-center justify-end">
                          <AntButton 
                            type="primary" 
                            size="large" 
                            onClick={handleGenerate} 
                            loading={isGenerating} 
                            icon={!isGenerating && <ThunderboltFilled />} 
                            className="bg-slate-900 hover:bg-slate-800 border-none h-14 px-10 rounded-xl text-base font-bold shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                          >
                            {isGenerating ? "Analyzing Data..." : "Generate Report"}
                          </AntButton>
                       </div>
                    </div>

                    {/* RIGHT: LIVE PREVIEW / STATUS */}
                    <div className="xl:col-span-4 flex flex-col h-full min-h-[400px]">
                        <div className="flex-grow bg-slate-900 rounded-[2rem] p-8 relative overflow-hidden shadow-2xl flex flex-col justify-between">
                            {/* Animated Bg */}
                            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:2rem_2rem]" />
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500 rounded-full blur-[80px] opacity-20 animate-pulse" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-2 text-white font-bold tracking-wide text-sm uppercase">
                                       <Activity size={16} className="text-green-400" /> System Status
                                    </div>
                                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
                                </div>

                                <AnimatePresence mode="wait">
                                  {!isGenerating ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 text-center mt-10">
                                        <div className="w-24 h-24 bg-white/10 rounded-full mx-auto flex items-center justify-center backdrop-blur-md border border-white/10 text-white/50">
                                           <Zap size={40} />
                                        </div>
                                        <div>
                                          <h3 className="text-white font-bold text-xl">Agents Idle</h3>
                                          <p className="text-slate-400 text-sm mt-2">Waiting for input stream...</p>
                                        </div>
                                    </motion.div>
                                  ) : (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                        <div>
                                           <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase">
                                              <span>Progress</span>
                                              <span className="text-white">{progress}%</span>
                                           </div>
                                           <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                              <motion.div 
                                                className="h-full bg-gradient-to-r from-orange-500 to-rose-500" 
                                                initial={{ width: 0 }} 
                                                animate={{ width: `${progress}%` }}
                                              />
                                           </div>
                                        </div>

                                        <div className="space-y-3">
                                           {[0, 1, 2].map(i => (
                                              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                                                 <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
                                                 <div className="h-2 bg-slate-700 rounded w-2/3 opacity-50" />
                                              </div>
                                           ))}
                                        </div>

                                        <div className="bg-black/30 p-4 rounded-xl font-mono text-xs text-green-400 border-l-2 border-green-500">
                                          <span className="text-slate-500 mr-2">$</span>
                                          {generationStep}
                                          <span className="animate-pulse">_</span>
                                        </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                  </div>
               </div>
             </GlowCard>
          </SpotlightSection>
        </div>

        {/* --- DYNAMIC STATS & HISTORY --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* LEFT: LIVE METRICS */}
          <div className="md:col-span-4 space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-orange-500" /> Performance
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
               {/* Stat Card 1: Success Rate (Dynamic Color) */}
               <GlowCard className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Success Rate</p>
                    <div className={`text-3xl font-black mt-1 transition-colors duration-500 ${successColors.text}`}>
                        {stats.successRate}%
                    </div>
                  </div>
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <Progress type="circle" percent={stats.successRate} width={60} strokeWidth={10} strokeColor={successColors.stroke} format={() => null} />
                    {stats.successRate >= 90 ? (
                         <CheckCircleFilled className={`absolute text-lg ${successColors.text}`} />
                    ) : (
                         <WarningFilled className={`absolute text-lg ${successColors.text}`} />
                    )}
                  </div>
               </GlowCard>

               {/* Stat Card 2: Time Saved */}
               <GlowCard className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Efficiency Gain</p>
                    <div className="text-3xl font-black text-slate-800 mt-1">{stats.totalTimeSaved}h</div>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                     <Timer size={24} />
                  </div>
               </GlowCard>

               {/* Stat Card 3: Total Reports */}
               <GlowCard className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Total Reports</p>
                    <div className="text-3xl font-black text-slate-800 mt-1">{reports.length}</div>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-500">
                     <PieChartOutlined style={{ fontSize: '24px' }} />
                  </div>
               </GlowCard>
            </div>
          </div>

          {/* RIGHT: HISTORY LIST */}
          <div className="md:col-span-8">
             <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <ClockCircleFilled className="text-orange-500" /> Recent Activity
                 </h3>
                 {reports.length > 0 && (
                   <Tooltip title="Clear History">
                     <AntButton type="text" danger icon={<DeleteOutlined />} onClick={() => { setReports([]); localStorage.removeItem("user_reports"); }} />
                   </Tooltip>
                 )}
             </div>

             <div className="space-y-4">
                <AnimatePresence>
                  {reports.length > 0 ? (
                    reports.map((report, index) => (
                      <motion.div key={report.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                        <div className={cn(
                             "group rounded-2xl p-4 border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-5",
                             report.status === "Failed" ? "bg-red-50 border-red-100 hover:border-red-200" : "bg-white border-slate-100 hover:border-orange-200 hover:shadow-lg"
                        )}>
                          
                          {/* Icon Box */}
                          <div className={cn(
                              "w-14 h-14 rounded-2xl border flex items-center justify-center shadow-sm transition-transform",
                              report.status === "Failed" ? "bg-white border-red-100" : "bg-gradient-to-br from-slate-50 to-white border-slate-100 group-hover:scale-105"
                          )}>
                              {report.status === "Failed" ? <CloseCircleFilled className="text-red-500 text-xl" /> : <FileOutput size={24} className="text-slate-400 group-hover:text-orange-500 transition-colors" />}
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={cn("font-bold text-lg line-clamp-1 transition-colors", report.status === "Failed" ? "text-red-700" : "text-slate-700 group-hover:text-orange-600")}>
                                    {report.title}
                                </h4>
                                <Tag color={report.status === "Ready" ? "success" : "error"} className="border-0 font-bold text-[10px] rounded-md px-1.5 py-0.5 uppercase">
                                  {report.status}
                                </Tag>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                                <span className="flex items-center gap-1"><Layers size={12}/> {report.type}</span>
                                <span className="flex items-center gap-1"><ClockCircleFilled style={{fontSize: 10}}/> {report.date}</span>
                                {report.status === "Ready" && <span className="flex items-center gap-1 text-xs bg-slate-50 px-1 rounded"><FolderOpenOutlined style={{fontSize: 10}}/> /generated_reports</span>}
                              </div>
                          </div>

                          {/* Action */}
                          {report.status === "Ready" && (
                            <AntButton 
                              type="default" 
                              shape="round" 
                              icon={<CloudDownloadOutlined />} 
                              onClick={() => downloadReport(report)} 
                              className="border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-200 font-bold shadow-sm"
                            >
                              Download
                            </AntButton>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="bg-white/50 border border-dashed border-slate-200 rounded-3xl p-12 text-center">
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-slate-400 font-medium">No intelligence reports generated yet.</span>} />
                    </div>
                  )}
                </AnimatePresence>
             </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};