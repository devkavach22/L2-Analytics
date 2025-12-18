// src/pages/about/Careers.tsx
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Button } from "../../components/ui/button";

import {
  Users,
  Briefcase,
  Heart,
  Trophy,
  Zap,
  Globe,
  Coffee,
  Rocket,
  ArrowRight,
  MapPin,
  //   Clock,
  DollarSign,
  TrendingUp,
  Code2,
  Palette,
  Cpu,
  BarChart3,
  Headphones,
  //   Shield,
  GraduationCap,
  Home,
  Calendar,
  Plane,
  Gift,
  Sparkles,
  Target,
  Star,
  CheckCircle2,
  //   Building,
  //   Award,
  Mountain,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const Careers: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );

      gsap.fromTo(
        ".benefit-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".benefits-section",
            start: "top 80%",
            once: true,
          },
        }
      );

      gsap.to(".floating-icon", {
        y: "random(-15, 15)",
        rotation: "random(-5, 5)",
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.5,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const benefits = [
    {
      icon: DollarSign,
      title: "Competitive Salary",
      desc: "Industry-leading compensation packages with regular reviews",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Heart,
      title: "Health & Wellness",
      desc: "Comprehensive health insurance for you and your family",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: Home,
      title: "Remote Flexibility",
      desc: "Work from anywhere with flexible hours and hybrid options",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: GraduationCap,
      title: "Learning Budget",
      desc: "$2,000 annual budget for courses, conferences, and books",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Calendar,
      title: "Unlimited PTO",
      desc: "Take the time you need to recharge and stay productive",
      color: "from-orange-500 to-yellow-500",
    },
    {
      icon: Plane,
      title: "Travel Opportunities",
      desc: "Work retreats, conferences, and team offsites worldwide",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: Coffee,
      title: "Modern Office",
      desc: "State-of-the-art workspace with free snacks and drinks",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Gift,
      title: "Stock Options",
      desc: "Equity ownership in the company for all employees",
      color: "from-pink-500 to-rose-500",
    },
  ];

  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      desc: "We're building products that make a real difference",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Users,
      title: "Collaborative",
      desc: "Best ideas win, regardless of title or tenure",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Zap,
      title: "Fast-Paced",
      desc: "Move quickly, learn from failures, iterate constantly",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Trophy,
      title: "Excellence",
      desc: "We set high standards and help each other achieve them",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const departments = [
    { id: "all", name: "All Positions", icon: Briefcase },
    { id: "engineering", name: "Engineering", icon: Code2 },
    { id: "design", name: "Design", icon: Palette },
    { id: "product", name: "Product", icon: Cpu },
    { id: "sales", name: "Sales", icon: TrendingUp },
    { id: "marketing", name: "Marketing", icon: BarChart3 },
    { id: "support", name: "Support", icon: Headphones },
  ];

  const openPositions = [
    {
      title: "Senior Full-Stack Engineer",
      department: "engineering",
      location: "Remote / San Francisco",
      type: "Full-time",
      salary: "$150K - $200K",
      description:
        "Build scalable web applications with React, Node.js, and modern cloud infrastructure",
      requirements: [
        "5+ years experience",
        "React & Node.js",
        "Cloud platforms (AWS/GCP)",
      ],
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Product Designer",
      department: "design",
      location: "Remote / New York",
      type: "Full-time",
      salary: "$120K - $160K",
      description: "Design beautiful, intuitive interfaces that users love",
      requirements: [
        "3+ years experience",
        "Figma proficiency",
        "Design systems",
      ],
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "DevOps Engineer",
      department: "engineering",
      location: "Remote",
      type: "Full-time",
      salary: "$140K - $180K",
      description:
        "Build and maintain CI/CD pipelines, infrastructure, and monitoring systems",
      requirements: ["4+ years experience", "Kubernetes", "Terraform"],
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Product Manager",
      department: "product",
      location: "Remote / Austin",
      type: "Full-time",
      salary: "$130K - $170K",
      description: "Drive product strategy and roadmap for our core platform",
      requirements: [
        "3+ years PM experience",
        "Technical background",
        "Data-driven",
      ],
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Marketing Manager",
      department: "marketing",
      location: "Remote / Boston",
      type: "Full-time",
      salary: "$100K - $140K",
      description: "Lead marketing campaigns and grow our brand presence",
      requirements: [
        "3+ years marketing",
        "B2B SaaS experience",
        "Analytics skills",
      ],
      color: "from-pink-500 to-rose-500",
    },
    {
      title: "Sales Development Rep",
      department: "sales",
      location: "Remote",
      type: "Full-time",
      salary: "$60K - $90K + Commission",
      description: "Generate and qualify leads for our enterprise sales team",
      requirements: ["1+ years sales", "Tech industry", "Strong communication"],
      color: "from-yellow-500 to-orange-500",
    },
  ];

  const filteredPositions =
    selectedDepartment === "all"
      ? openPositions
      : openPositions.filter((pos) => pos.department === selectedDepartment);

  const hiringProcess = [
    {
      number: "01",
      title: "Apply Online",
      desc: "Submit your resume and portfolio through our careers portal",
      icon: Briefcase,
      color: "from-orange-500 to-red-500",
    },
    {
      number: "02",
      title: "Phone Screen",
      desc: "15-20 minute call with our recruiting team",
      icon: Headphones,
      color: "from-blue-500 to-cyan-500",
    },
    {
      number: "03",
      title: "Technical Interview",
      desc: "Deep dive into your skills with the hiring manager",
      icon: Code2,
      color: "from-purple-500 to-pink-500",
    },
    {
      number: "04",
      title: "Team Interview",
      desc: "Meet your potential teammates and discuss culture fit",
      icon: Users,
      color: "from-green-500 to-emerald-500",
    },
    {
      number: "05",
      title: "Offer",
      desc: "Receive your offer and join the team!",
      icon: Trophy,
      color: "from-yellow-500 to-orange-500",
    },
  ];

  const stats = [
    { value: "150+", label: "Team Members" },
    { value: "25+", label: "Countries" },
    { value: "4.9/5", label: "Glassdoor Rating" },
    { value: "95%", label: "Employee Satisfaction" },
  ];

  const perks = [
    "🏥 Premium health, dental, vision",
    "💰 401(k) with 4% match",
    "👶 Parental leave (16 weeks)",
    "🎓 Education reimbursement",
    "🏋️ Gym membership",
    "🖥️ Latest tech equipment",
    "🌴 Company retreats",
    "🎉 Team events & activities",
  ];

  const testimonials = [
    {
      quote:
        "Best career decision I've made. The team is brilliant, the culture is supportive, and I'm learning every day.",
      author: "Sarah Chen",
      role: "Senior Engineer",
      avatar: "👩‍💻",
      rating: 5,
    },
    {
      quote:
        "I love the autonomy and trust. We're empowered to make decisions and move fast without bureaucracy.",
      author: "Marcus Johnson",
      role: "Product Designer",
      avatar: "👨‍🎨",
      rating: 5,
    },
    {
      quote:
        "The work-life balance is real. I can work remotely, travel, and still deliver great work. It's amazing.",
      author: "Emily Rodriguez",
      role: "Marketing Manager",
      avatar: "👩‍💼",
      rating: 5,
    },
  ];

  return (
    <main
      ref={sectionRef}
      className="relative min-h-screen bg-gray-950 text-white overflow-hidden"
    >
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            style={{ y, opacity }}
            className="absolute top-20 left-20 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-3xl"
          />
          <motion.div
            style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "30%"]) }}
            className="absolute bottom-20 right-20 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-3xl"
          />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2Y5NzMxNiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
        </div>

        {/* Floating Icons */}
        <div className="absolute inset-0 pointer-events-none">
          {[Rocket, Heart, Trophy, Sparkles, Star, Mountain].map((Icon, i) => (
            <Icon
              key={i}
              className="floating-icon absolute text-orange-400/20"
              size={Math.random() * 30 + 30}
              style={{
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div ref={heroRef} className="text-center max-w-6xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500/10 backdrop-blur-sm rounded-full border border-orange-500/30 mb-8"
            >
              <Sparkles className="w-5 h-5 text-orange-400" />
              <span className="text-orange-300 font-semibold">
                We're Hiring!
              </span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
              <span className="block">Build Your Career</span>
              <span className="block bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 bg-clip-text text-transparent">
                With Purpose
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-4xl mx-auto leading-relaxed">
              Join a team of passionate innovators building products that
              matter. We're looking for talented people who want to make an
              impact.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Button
                className="px-8 py-5 text-base font-bold bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50 transition-all"
                onClick={() =>
                  document
                    .getElementById("open-positions")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                View Open Positions
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <Button
                variant="outline"
                className="px-8 py-5 text-base font-bold rounded-full border-2 border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
              >
                <Users className="mr-2 w-5 h-5" />
                Meet The Team
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                <span>150+ Team Members</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-orange-500" />
                <span>25+ Countries</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-orange-500 text-orange-500" />
                <span>4.9/5 on Glassdoor</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="py-12 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-black mb-2">
                  {stat.value}
                </div>
                <p className="text-white/90 text-sm md:text-base">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
                Values
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              These principles guide everything we do and everyone we hire
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${value.color} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl`}
                />
                <div className="relative p-8 rounded-3xl bg-gray-800 border border-gray-700 group-hover:border-transparent transition-all h-full text-center">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform`}
                  >
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-gray-400 text-sm">{value.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="benefits-section py-24 px-6 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Amazing Benefits
            </h2>
            <p className="text-lg text-gray-400">
              We invest in our people because they're our greatest asset
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="benefit-card group relative">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${benefit.color} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl`}
                />
                <div className="relative p-8 rounded-3xl bg-gray-900 border border-gray-800 group-hover:border-transparent transition-all h-full">
                  <benefit.icon className="w-12 h-12 text-orange-400 mb-4" />
                  <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                  <p className="text-gray-400 text-sm">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Perks */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 border border-gray-700"
          >
            <h3 className="text-2xl font-bold mb-8 text-center">
              And Even More...
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {perks.map((perk, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{perk}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* OPEN POSITIONS */}
      <section id="open-positions" className="py-24 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Open Positions
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Find your perfect role and join our growing team
            </p>

            {/* Department Filter */}
            <div className="flex flex-wrap gap-3 justify-center">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                    selectedDepartment === dept.id
                      ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  <dept.icon className="w-4 h-4" />
                  {dept.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Positions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPositions.map((position, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${position.color} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl`}
                />
                <div className="relative bg-gray-800 rounded-3xl p-8 border border-gray-700 group-hover:border-transparent transition-all h-full">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold">{position.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${position.color} text-white`}
                    >
                      {position.type}
                    </span>
                  </div>

                  <p className="text-gray-400 mb-6 text-sm">
                    {position.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      {position.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <DollarSign className="w-4 h-4" />
                      {position.salary}
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs text-gray-500 mb-2">Requirements:</p>
                    <div className="flex flex-wrap gap-2">
                      {position.requirements.map((req, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-900 rounded-full text-xs text-gray-400"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full hover:scale-105 transition-transform">
                    Apply Now
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredPositions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No positions found in this department
              </p>
            </div>
          )}
        </div>
      </section>

      {/* HIRING PROCESS */}
      <section className="py-24 px-6 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Our Hiring Process
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              A transparent, respectful process designed to find the best mutual
              fit
            </p>
          </motion.div>

          <div className="space-y-8">
            {hiringProcess.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="group"
              >
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div
                    className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-2xl`}
                  >
                    <step.icon className="w-16 h-16 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <span
                        className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br ${step.color}`}
                      >
                        {step.number}
                      </span>
                      <h3 className="text-2xl font-bold">{step.title}</h3>
                    </div>
                    <p className="text-gray-400 text-base">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              What Our Team Says
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Hear directly from the people building our future
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-lg relative"
              >
                <div className="absolute -top-6 left-6 text-4xl">
                  {t.avatar}
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-orange-400 fill-orange-400"
                    />
                  ))}
                </div>

                <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                  “{t.quote}”
                </p>

                <div>
                  <h4 className="font-bold text-white">{t.author}</h4>
                  <p className="text-gray-500 text-sm">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 px-6 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black mb-6"
          >
            Ready To Build The Future?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg text-white/90 mb-10"
          >
            We're always looking for passionate, talented people to join our
            mission.
          </motion.p>

          <Button
            className="px-10 py-5 text-lg font-bold rounded-full bg-white text-orange-600 hover:bg-gray-200 transition-all"
            onClick={() =>
              document
                .getElementById("open-positions")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            View Open Positions
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Careers;
