import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Select, Card, Button as AntButton, Tooltip, Badge, Progress, Statistic, Row, Col, Tabs, Tag } from "antd";
import { 
  FileTextOutlined, 
  CloudDownloadOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  SettingOutlined,
  ThunderboltFilled,
  SafetyCertificateOutlined
} from "@ant-design/icons";
import { Sparkles, Activity, Layers, FileOutput, Bot, Cpu, Zap, Archive } from "lucide-react";

// IMPORTANT: User requested imports
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// --- MOCK DATA ---
const RECENT_REPORTS = [
  {
    id: 1,
    title: "Q3 Cybersecurity Threat Analysis",
    type: "Audit Log",
    format: "PDF",
    date: "10 mins ago",
    status: "Ready",
    size: "2.4 MB"
  },
  {
    id: 2,
    title: "Neural Network Performance Metrics",
    type: "Technical Deep Dive",
    format: "CSV",
    date: "2 hours ago",
    status: "Ready",
    size: "850 KB"
  },
  {
    id: 3,
    title: "Global AI Regulatory Compliance",
    type: "Executive Summary",
    format: "PDF",
    date: "1 day ago",
    status: "Archived",
    size: "1.2 MB"
  },
];

const REPORT_TYPES = [
  { value: "summary", label: "Executive Summary" },
  { value: "technical", label: "Technical Deep Dive" },
  { value: "audit", label: "Security Audit Log" },
  { value: "market", label: "Market Analysis" },
];

const QUICK_TEMPLATES = [
  { label: "Weekly Security Sweep", type: "audit" },
  { label: "Competitor Market Shift", type: "market" },
  { label: "Server Load Optimization", type: "technical" },
];

export default function AISearch() {
  const [topic, setTopic] = useState("");
  const [reportType, setReportType] = useState("summary");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState("");
  const [reports, setReports] = useState(RECENT_REPORTS);
  const [activeTab, setActiveTab] = useState("1");

  // Simulate Report Generation Process
  const handleGenerate = () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setProgress(0);
    
    // Simulation Timeline
    const steps = [
      { p: 20, label: "Initializing Kavach Agents..." },
      { p: 45, label: "Querying Internal Data Lake..." },
      { p: 70, label: "Synthesizing Key Insights..." },
      { p: 90, label: "Formatting & Exporting..." },
      { p: 100, label: "Finalizing..." }
    ];

    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep >= steps.length) {
        clearInterval(interval);
        completeGeneration();
        return;
      }
      setProgress(steps[currentStep].p);
      setGenerationStep(steps[currentStep].label);
      currentStep++;
    }, 800);
  };

  const completeGeneration = () => {
    setIsGenerating(false);
    const newReport = {
      id: Date.now(),
      title: topic,
      type: REPORT_TYPES.find(t => t.value === reportType)?.label || "Report",
      format: "PDF",
      date: "Just now",
      status: "Ready",
      size: "1.5 MB"
    };
    setReports([newReport, ...reports]);
    setTopic("");
  };

  const handleTemplateClick = (templateLabel: string, type: string) => {
    setTopic(templateLabel);
    setReportType(type);
  };

  // Background Animation
  const glowVariants = {
    initial: { opacity: 0.5, scale: 0.8 },
    animate: {
      opacity: [0.4, 0.8, 0.4],
      scale: [1, 1.2, 1],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          variants={glowVariants}
          initial="initial"
          animate="animate"
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-200/30 rounded-full blur-[120px]"
        />
        <motion.div
          variants={glowVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 2 }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-200/20 rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-20">
        {/* UPDATED: Passed isAuthenticated={true} so the correct User Menu (Dashboard, AI Search, History) loads */}
        <Header isAuthenticated={true} />
      </div>
        <br/>
        <br/>
      <main className="relative z-10 flex-grow container mx-auto px-4 py-20 max-w-7xl">
        
        {/* --- PAGE TITLE --- */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-2 text-orange-600 font-bold tracking-wide text-xs uppercase">
              <Sparkles size={14} />
              <span>Intelligence Center</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              Report <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Generator</span>
            </h1>
            <p className="text-slate-500 mt-2 max-w-xl">
              Configure parameters below to deploy AI agents. Reports are generated in real-time using your connected data sources.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2 text-sm font-medium text-slate-600">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Systems Operational
             </div>
          </div>
        </motion.div>

        {/* --- GENERATION CONSOLE --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-12 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur opacity-20 transform translate-y-4" />
          
          <Card className="rounded-3xl border-0 shadow-2xl relative overflow-hidden">
             {/* Decorative Top Bar */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-red-500" />
             
             <div className="p-2 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* LEFT: Input Area */}
                  <div className="lg:col-span-8 space-y-6">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="bg-orange-50 p-2 rounded-lg">
                           <Bot className="text-orange-600" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 m-0">Report Configuration</h2>
                     </div>

                     <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Subject</label>
                            <Input
                              size="large"
                              placeholder="Describe the report scope..."
                              value={topic}
                              onChange={(e) => setTopic(e.target.value)}
                              prefix={<Layers size={18} className="text-slate-400 mr-2" />}
                              className="rounded-xl py-3"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Format Type</label>
                            <Select
                              size="large"
                              value={reportType}
                              onChange={setReportType}
                              className="w-full"
                              options={REPORT_TYPES}
                            />
                          </div>
                        </div>

                        {/* Quick Templates */}
                        <div>
                          <span className="text-xs font-medium text-slate-400 mr-3">Quick Start:</span>
                          <div className="inline-flex flex-wrap gap-2 mt-2">
                             {QUICK_TEMPLATES.map((t, idx) => (
                               <Tag 
                                 key={idx} 
                                 className="cursor-pointer px-3 py-1 rounded-full border-slate-200 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all text-slate-600 bg-slate-50"
                                 onClick={() => handleTemplateClick(t.label, t.type)}
                               >
                                  {t.label}
                               </Tag>
                             ))}
                          </div>
                        </div>
                     </div>

                     <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-xs text-slate-400 hidden md:flex gap-4">
                           <span className="flex items-center gap-1"><SafetyCertificateOutlined /> Encrypted Processing</span>
                           <span className="flex items-center gap-1"><Cpu size={14} /> Dedicated GPU Cluster</span>
                        </div>
                        <AntButton 
                          type="primary" 
                          size="large"
                          onClick={handleGenerate}
                          loading={isGenerating}
                          icon={<ThunderboltFilled />}
                          className="bg-gradient-to-r from-orange-500 to-red-600 border-none h-12 px-8 rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
                        >
                          {isGenerating ? "Synthesizing..." : "Initialize Agent"}
                        </AntButton>
                     </div>
                  </div>

                  {/* RIGHT: Progress / Status Area */}
                  <div className="lg:col-span-4 bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-center">
                      <AnimatePresence mode="wait">
                        {!isGenerating ? (
                           <motion.div 
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className="text-center space-y-4"
                           >
                              <div className="w-16 h-16 bg-white rounded-full shadow-sm mx-auto flex items-center justify-center text-slate-300">
                                 <Zap size={28} />
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-700">Ready to Generate</h3>
                                <p className="text-xs text-slate-400 mt-1">Estimate time: ~12 seconds</p>
                              </div>
                           </motion.div>
                        ) : (
                           <motion.div
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className="w-full"
                           >
                              <div className="flex justify-between mb-2 text-sm font-bold text-slate-700">
                                <span className="flex items-center gap-2">
                                   <Activity size={16} className="text-orange-500 animate-spin" /> 
                                   Processing
                                </span>
                                <span>{progress}%</span>
                              </div>
                              <Progress 
                                percent={progress} 
                                strokeColor={{ '0%': '#f97316', '100%': '#dc2626' }} 
                                showInfo={false} 
                                strokeWidth={12}
                                className="mb-4"
                              />
                              <p className="text-xs text-center text-slate-500 animate-pulse font-mono">
                                {">"} {generationStep}
                              </p>
                           </motion.div>
                        )}
                      </AnimatePresence>
                  </div>

                </div>
             </div>
          </Card>
        </motion.div>

        {/* --- LOWER DASHBOARD --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* SIDEBAR: Stats & Info */}
          <div className="md:col-span-4 space-y-6">
            <Card className="rounded-2xl border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow">
               <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                 <ClockCircleOutlined className="text-orange-500" />
                 Generation Metrics
               </h3>
               <Row gutter={[16, 16]}>
                 <Col span={12}>
                   <Statistic 
                     title="Reports (Mo)" 
                     value={42} 
                     prefix={<FileTextOutlined />}
                     valueStyle={{ fontSize: '20px', fontWeight: 700 }}
                   />
                 </Col>
                 <Col span={12}>
                   <Statistic 
                     title="Avg Latency" 
                     value="1.2s" 
                     prefix={<ThunderboltFilled className="text-yellow-500" />}
                     valueStyle={{ fontSize: '20px', fontWeight: 700 }}
                   />
                 </Col>
               </Row>
            </Card>

            <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Bot size={80} />
               </div>
               <h4 className="font-bold text-lg mb-2">Agent Status</h4>
               <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center justify-between">
                     <span>Data Miner</span>
                     <Badge status="processing" text={<span className="text-slate-300">Idle</span>} />
                  </li>
                  <li className="flex items-center justify-between">
                     <span>Synthesizer</span>
                     <Badge status="success" text={<span className="text-green-400">Active</span>} />
                  </li>
                  <li className="flex items-center justify-between">
                     <span>Formatter</span>
                     <Badge status="default" text={<span className="text-slate-500">Offline</span>} />
                  </li>
               </ul>
            </div>
          </div>

          {/* MAIN: Report List */}
          <div className="md:col-span-8">
             <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 min-h-[500px]">
                <Tabs 
                   activeKey={activeTab} 
                   onChange={setActiveTab}
                   items={[
                      { key: '1', label: <span><FileTextOutlined /> All Reports</span> },
                      { key: '2', label: <span><CheckCircleOutlined /> Completed</span> },
                      { key: '3', label: <span><Archive size={14} className="inline mr-1"/> Archived</span> },
                   ]}
                />
                
                <div className="mt-4 space-y-3">
                  <AnimatePresence>
                    {reports.map((report, index) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                      >
                        <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-orange-200 hover:shadow-md transition-all duration-300">
                           {/* Icon */}
                           <div className={`
                              w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                              ${report.format === 'PDF' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}
                           `}>
                              {report.format === 'PDF' ? <FileTextOutlined /> : <FileOutput size={18} />}
                           </div>

                           {/* Details */}
                           <div className="flex-1">
                              <h4 className="font-bold text-slate-700 group-hover:text-orange-600 transition-colors">
                                 {report.title}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                 <span className="font-medium bg-white px-2 py-0.5 rounded border border-slate-100">{report.type}</span>
                                 <span>{report.size}</span>
                                 <span>{report.date}</span>
                              </div>
                           </div>

                           {/* Actions */}
                           <div className="flex items-center gap-2">
                              {report.status === "Ready" && (
                                 <Tooltip title="Download">
                                    <AntButton 
                                       type="text" 
                                       shape="circle" 
                                       icon={<CloudDownloadOutlined />} 
                                       className="text-slate-400 hover:text-orange-600 hover:bg-orange-50"
                                    />
                                 </Tooltip>
                              )}
                              <Tooltip title="Settings">
                                 <AntButton 
                                    type="text" 
                                    shape="circle" 
                                    icon={<SettingOutlined />} 
                                    className="text-slate-400 hover:text-slate-700"
                                 />
                              </Tooltip>
                           </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {reports.length === 0 && (
                     <div className="text-center py-20 text-slate-400">
                        <Archive size={40} className="mx-auto mb-3 opacity-20" />
                        <p>No reports found.</p>
                     </div>
                  )}
                </div>
             </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};