// frontend/src/pages/About.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Code, Bell, Calendar, Shield, Quote, FileText, Anchor, Target, Zap } from 'lucide-react';

const About = () => {
  // Framer Motion animation variants for staggered loading
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const features = [
    {
      icon: <BookOpen className="w-8 h-8 text-blue-600" />,
      title: "Smart Organization",
      description: "Navigate seamlessly through a hierarchical structure tailored exactly to your Academic Year and enrolled Subjects. Never get lost in scattered folders again.",
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      icon: <FileText className="w-8 h-8 text-indigo-600" />,
      title: "Centralized Resources",
      description: "Instant access to Notes, Syllabi, Video Lectures, and References via embedded Google Drive links. Everything you need for a subject, centralized in one place.",
      bg: "bg-indigo-50",
      border: "border-indigo-100"
    },
    {
      icon: <Bell className="w-8 h-8 text-red-600" />,
      title: "Live Announcements Feed",
      description: "Real-time updates for Exams, Events, and General info. Critical alerts are securely pinned to the top of your dashboard so you never miss a deadline.",
      bg: "bg-red-50",
      border: "border-red-100"
    },
    {
      icon: <Calendar className="w-8 h-8 text-orange-600" />,
      title: "Holiday Tracker",
      description: "Plan your study schedule and downtime effectively with an integrated, up-to-date calendar of all upcoming academic breaks and institutional holidays.",
      bg: "bg-orange-50",
      border: "border-orange-100"
    },
    {
      icon: <Quote className="w-8 h-8 text-purple-600" />,
      title: "Daily Motivation",
      description: "Start every login session with a fresh perspective. Our dynamically updated 'Quote of the Day' keeps you focused and inspired to tackle your workload.",
      bg: "bg-purple-50",
      border: "border-purple-100"
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Secure & Frictionless Access",
      description: "One-click Google Single Sign-On (SSO) alongside robust JWT authentication ensures your sessions are deeply protected while keeping daily access effortless.",
      bg: "bg-green-50",
      border: "border-green-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center items-center space-x-3 mb-6">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg">
              <Anchor className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
              Study<span className="text-indigo-600">Harbour</span>
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            A unified digital port designed to eliminate academic friction. Built by a student, tailored for students.
          </p>
        </motion.div>

        {/* Vision Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-3xl shadow-2xl p-10 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <Target className="w-96 h-96" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center space-x-3 mb-4">
              <Zap className="w-8 h-8 text-yellow-300" />
              <h2 className="text-3xl font-bold">Our Vision</h2>
            </div>
            <p className="text-xl leading-relaxed text-indigo-50">
              To completely eliminate the wasted time spent searching for fragmented notes, hunting down holiday schedules, and missing crucial exam announcements. Study Harbour aims to be the single source of truth for your academic journey, ensuring you can focus entirely on learning, rather than logistics. Drop anchor here, and find everything you need.
            </p>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="space-y-8">
          <motion.h3 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-900 text-center"
          >
            Everything You Need, In One Place
          </motion.h3>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`p-8 rounded-2xl bg-white border ${feature.border} shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-start`}
              >
                <div className={`p-4 rounded-xl ${feature.bg} mb-6`}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Footer Note */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-gray-200 text-center"
        >
          <div className="flex justify-center items-center space-x-2 text-gray-500 font-medium bg-white py-3 px-6 rounded-full shadow-sm inline-flex border border-gray-100">
            <Code className="w-5 h-5 text-indigo-500" />
            <span>MERN Stack Architecture</span>
            <span className="mx-2">•</span>
            <span>RESTful API</span>
            <span className="mx-2">•</span>
            <span>Role-Based Admin Controls</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default About;
