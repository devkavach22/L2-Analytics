// src/pages/about/Press.tsx
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Button } from "../../components/ui/button";

import {
  Newspaper,
  Download,
  Image,
  Mic2,
  Share2,
  Globe,
  Mail,
  ArrowRight,
  Calendar,
  Search,
  TrendingUp,
  FileText,
  Camera,
  Video,
  Award,
  Zap,
  Sparkles,
  CheckCircle2,
  Link,
  PenTool,
  Users,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const Press: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

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
        ".resource-card",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".resources-section",
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

  const mediaResources = [
    {
      icon: Image,
      title: "Brand Assets",
      desc: "Download our official logos, color palettes, and usage guidelines",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Camera,
      title: "High-Res Photos",
      desc: "Office shots, team photos, and product photography for print",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: FileText,
      title: "Executive Bios",
      desc: "Backgrounds and headshots of our leadership team",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Video,
      title: "B-Roll Footage",
      desc: "Video assets of our technology and workspace for broadcast",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: TrendingUp,
      title: "Fact Sheet",
      desc: "Key company statistics, history, and growth milestones",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: PenTool,
      title: "Press Kit",
      desc: "Complete zip package containing all essential media assets",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Mic2,
      title: "Spokespeople",
      desc: "List of subject matter experts available for interviews",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: Link,
      title: "Media Contacts",
      desc: "Direct lines to our PR team for urgent inquiries",
      color: "from-indigo-500 to-purple-500",
    },
  ];

  const pressValues = [
    {
      icon: Zap,
      title: "Innovation",
      desc: "Breaking news on our latest technological breakthroughs",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Globe,
      title: "Impact",
      desc: "Stories about how we're changing industries globally",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: CheckCircle2,
      title: "Transparency",
      desc: "Open and honest communication with our community",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Award,
      title: "Recognition",
      desc: "Celebrating our wins and industry acknowledgments",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const categories = [
    { id: "all", name: "All Stories", icon: Newspaper },
    { id: "press-release", name: "Press Releases", icon: FileText },
    { id: "news", name: "In The News", icon: Globe },
    { id: "product", name: "Product Updates", icon: Zap },
    { id: "awards", name: "Awards", icon: Award },
  ];

  const newsArticles = [
    {
      title: "Company Secures $50M Series B Funding",
      category: "press-release",
      date: "Oct 24, 2025",
      source: "Business Wire",
      readTime: "4 min read",
      excerpt:
        "Investment led by TopTier Ventures to accelerate global expansion and AI product development.",
      tags: ["Funding", "Growth", "Series B"],
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "The Future of Tech: Interview with our CEO",
      category: "news",
      date: "Oct 15, 2025",
      source: "TechCrunch",
      readTime: "8 min read",
      excerpt:
        "Our CEO discusses the roadmap for the next decade and how we plan to revolutionize the industry.",
      tags: ["Interview", "Vision", "Leadership"],
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Launching Version 4.0: A New Era",
      category: "product",
      date: "Sep 30, 2025",
      source: "Official Blog",
      readTime: "5 min read",
      excerpt:
        "Introducing our most powerful update yet, featuring real-time collaboration and AI assistance.",
      tags: ["Product", "Launch", "AI"],
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Named 'Best Place to Work' for 3rd Year",
      category: "awards",
      date: "Sep 12, 2025",
      source: "Forbes",
      readTime: "3 min read",
      excerpt:
        "Recognized for our outstanding company culture, benefits, and employee satisfaction scores.",
      tags: ["Culture", "Award", "HR"],
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Strategic Partnership with MegaCorp Announced",
      category: "press-release",
      date: "Aug 20, 2025",
      source: "PR Newswire",
      readTime: "4 min read",
      excerpt:
        "A landmark partnership that integrates our technology with MegaCorp's global infrastructure.",
      tags: ["Partnership", "Enterprise", "B2B"],
      color: "from-pink-500 to-rose-500",
    },
    {
      title: "Top 10 Startups to Watch in 2025",
      category: "news",
      date: "Aug 05, 2025",
      source: "Wired",
      readTime: "6 min read",
      excerpt:
        "Featured in Wired's annual list of companies that are reshaping the technology landscape.",
      tags: ["Feature", "Startup", "Trend"],
      color: "from-yellow-500 to-orange-500",
    },
  ];

  const filteredNews =
    selectedCategory === "all"
      ? newsArticles
      : newsArticles.filter((article) => article.category === selectedCategory);

  const inquiryProcess = [
    {
      number: "01",
      title: "Submit Request",
      desc: "Send your inquiry via our dedicated press email or form.",
      icon: Mail,
      color: "from-orange-500 to-red-500",
    },
    {
      number: "02",
      title: "Team Review",
      desc: "Our PR team reviews your request within 24 hours.",
      icon: Search,
      color: "from-blue-500 to-cyan-500",
    },
    {
      number: "03",
      title: "Coordination",
      desc: "We coordinate with executives or gather necessary assets.",
      icon: Share2,
      color: "from-purple-500 to-pink-500",
    },
    {
      number: "04",
      title: "Interview/Asset",
      desc: "We facilitate the interview or deliver high-res materials.",
      icon: Mic2,
      color: "from-green-500 to-emerald-500",
    },
    {
      number: "05",
      title: "Publication",
      desc: "We help promote your story across our social channels.",
      icon: Globe,
      color: "from-yellow-500 to-orange-500",
    },
  ];

  const stats = [
    { value: "200+", label: "Press Mentions" },
    { value: "50+", label: "Industry Awards" },
    { value: "1M+", label: "Monthly Reach" },
    { value: "15", label: "Global Partners" },
  ];

  const coverage = [
    {
      quote:
        "This company is redefining what it means to build scalable software. A true unicorn in the making.",
      author: "TechCrunch",
      role: "Editor in Chief",
      logo: "TC",
      rating: 5,
    },
    {
      quote:
        "The level of innovation coming out of this team is unprecedented. They are setting the standard for the industry.",
      author: "Forbes",
      role: "Senior Tech Reporter",
      logo: "F",
      rating: 5,
    },
    {
      quote:
        "One of the most transparent and community-focused companies we've had the pleasure of covering.",
      author: "Wired",
      role: "Technology Columnist",
      logo: "W",
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
          {[Newspaper, Mic2, Globe, Sparkles, Camera, TrendingUp].map(
            (Icon, i) => (
              <Icon
                key={i}
                className="floating-icon absolute text-orange-400/20"
                size={Math.random() * 30 + 30}
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 80 + 10}%`,
                }}
              />
            )
          )}
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
              <Newspaper className="w-5 h-5 text-orange-400" />
              <span className="text-orange-300 font-semibold">
                Newsroom & Media Center
              </span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
              <span className="block">Our Stories,</span>
              <span className="block bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 bg-clip-text text-transparent">
                Shared With The World
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-4xl mx-auto leading-relaxed">
              The latest news, press releases, and updates from our team.
              Explore our journey and download official media resources.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Button
                className="px-8 py-5 text-base font-bold bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50 transition-all"
                onClick={() =>
                  document
                    .getElementById("latest-news")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Read Latest News
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <Button
                variant="outline"
                className="px-8 py-5 text-base font-bold rounded-full border-2 border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
              >
                <Download className="mr-2 w-5 h-5" />
                Download Press Kit
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-orange-500" />
                <span>Global Coverage</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />
                <span>Award Winning</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 fill-orange-500 text-orange-500" />
                <span>Public Relations Team</span>
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

      {/* FOCUS AREAS */}
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
                Focus
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              The core pillars that drive our narrative and impact.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pressValues.map((value, idx) => (
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

      {/* MEDIA RESOURCES */}
      <section className="resources-section py-24 px-6 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Media Resources
            </h2>
            <p className="text-lg text-gray-400">
              Everything you need to cover our story, available for download.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mediaResources.map((resource, idx) => (
              <div key={idx} className="resource-card group relative">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${resource.color} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl`}
                />
                <div className="relative p-8 rounded-3xl bg-gray-900 border border-gray-800 group-hover:border-transparent transition-all h-full">
                  <resource.icon className="w-12 h-12 text-orange-400 mb-4" />
                  <h3 className="text-lg font-bold mb-2">{resource.title}</h3>
                  <p className="text-gray-400 text-sm">{resource.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 border border-gray-700"
          >
            <h3 className="text-2xl font-bold mb-8 text-center">
              Need something specific?
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-orange-500" />
                <span className="text-gray-300">press@company.com</span>
              </div>
              <div className="hidden md:block text-gray-600">|</div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-orange-500" />
                <span className="text-gray-300">
                  24h Turnaround for urgent requests
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* LATEST NEWS */}
      <section id="latest-news" className="py-24 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Latest News
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Press releases, feature stories, and company updates.
            </p>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                    selectedCategory === cat.id
                      ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.name}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNews.map((article, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${article.color} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl`}
                />
                <div className="relative bg-gray-800 rounded-3xl p-8 border border-gray-700 group-hover:border-transparent transition-all h-full">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold leading-tight">
                      {article.title}
                    </h3>
                  </div>

                  <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    {article.excerpt}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {article.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Globe className="w-4 h-4" />
                      {article.source}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FileText className="w-4 h-4" />
                      {article.readTime}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-900 rounded-full text-xs text-gray-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full hover:scale-105 transition-transform">
                    Read Full Story
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredNews.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No news items found in this category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* INQUIRY PROCESS */}
      <section className="py-24 px-6 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Media Inquiries
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              How we handle press requests to ensure timely and accurate coverage.
            </p>
          </motion.div>

          <div className="space-y-8">
            {inquiryProcess.map((step, idx) => (
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

      {/* FEATURED COVERAGE */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Featured Coverage
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              What leading publications are saying about us.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coverage.map((c, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-800 border border-gray-700 rounded-3xl p-8 shadow-lg relative"
              >
                <div className="absolute -top-6 left-6 h-12 w-12 bg-white rounded-full flex items-center justify-center font-black text-black border-4 border-gray-800">
                  {c.logo}
                </div>

                <div className="flex gap-1 mb-4 mt-2">
                  {[...Array(c.rating)].map((_, i) => (
                    <Sparkles
                      key={i}
                      className="w-4 h-4 text-orange-500 fill-orange-500"
                    />
                  ))}
                </div>

                <p className="text-gray-300 text-sm mb-6 leading-relaxed italic">
                  "{c.quote}"
                </p>

                <div>
                  <h4 className="font-bold text-white">{c.author}</h4>
                  <p className="text-gray-500 text-sm">{c.role}</p>
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
            Get The Full Story
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg text-white/90 mb-10"
          >
            Download our full press kit or contact us for inquiries.
          </motion.p>

          <Button
            className="px-10 py-5 text-lg font-bold rounded-full bg-white text-orange-600 hover:bg-gray-200 transition-all"
            onClick={() => (window.location.href = "mailto:press@company.com")}
          >
            Contact PR Team
            <Mail className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Press;