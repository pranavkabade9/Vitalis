import React from 'react';
import { useAuth } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import { ICONS } from '../constants';
import { motion } from 'motion/react';
import { firebaseConfigExtended } from '../lib/firebase';

export default function Login() {
  const { signInWithGoogle, signInAsGuest, loading, loginError } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    await signInWithGoogle();
    setIsAuthenticating(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row overflow-x-hidden">
      {/* Left Side: Login Form */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col items-center justify-center p-4 sm:p-10 lg:p-16 relative overflow-y-auto lg:overflow-hidden shrink-0 min-h-screen">
        <div className="absolute top-0 left-0 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-100/30 via-transparent to-transparent pointer-events-none" />
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-md w-full relative z-10 py-10 lg:py-0"
        >
          <motion.div variants={itemVariants} className="flex items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-8 lg:mb-16">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-[1.25rem] bg-brand-500 shadow-2xl shadow-brand-500/40 flex items-center justify-center text-white rotate-3">
              <ICONS.Activity size={24} className="sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Vitalis</h1>
              <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-[0.3em] text-brand-500 mt-1">Health Engine</p>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] sm:rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 p-8 sm:p-10 lg:p-12 shadow-[0_48px_80px_-16px_rgba(0,0,0,0.12)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600" />
            
            <div className="text-left mb-8 lg:mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">Get Started</h2>
              <p className="text-slate-500 mt-2 font-medium text-base sm:text-lg">Continue to your health workspace.</p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {loginError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold flex flex-col gap-2 overflow-hidden shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <ICONS.AlertCircle size={20} className="shrink-0" />
                    <span>{loginError}</span>
                  </div>
                  {loginError.includes('Authorized Domains') && (
                    <a 
                      href={`https://console.firebase.google.com/project/${firebaseConfigExtended.projectId}/authentication/settings`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-8 text-xs underline hover:text-red-700 dark:hover:text-red-300 transition-colors inline-block"
                    >
                      Open Firebase Console →
                    </a>
                  )}
                </motion.div>
              )}

              <button 
                onClick={handleGoogleSignIn}
                disabled={isAuthenticating || loading}
                className="group relative w-full flex items-center justify-center gap-4 py-5 bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] font-bold text-slate-800 dark:text-slate-200 hover:border-brand-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:scale-[1.02] transition-all duration-300 active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAuthenticating ? (
                  <div className="w-6 h-6 border-3 border-slate-200 border-t-brand-500 rounded-full animate-spin" />
                ) : (
                  <>
                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                    </div>
                    <span className="text-lg">Continue with Google</span>
                  </>
                )}
              </button>

              <div className="relative py-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
                <div className="relative flex justify-center text-[11px] uppercase font-black tracking-[0.4em] text-slate-400 bg-white dark:bg-slate-900 px-6">Or</div>
              </div>

              <button 
                onClick={signInAsGuest}
                className="w-full py-5 bg-brand-500/10 text-brand-600 dark:text-brand-400 border-2 border-brand-500/20 rounded-[1.5rem] font-bold text-lg hover:bg-brand-500/20 hover:scale-[1.02] transition-all duration-300 active:scale-95 flex items-center justify-center gap-3"
              >
                <ICONS.Footprints size={20} className="text-brand-500" />
                Continue as Guest
              </button>
            </div>

            <p className="mt-12 text-center text-xs text-slate-400 leading-relaxed font-semibold">
              No sign-up needed • Start instantly
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side: Detailed About Content */}
      <div className="flex-1 bg-slate-50 dark:bg-[#020617] py-20 lg:py-0 px-8 lg:px-20 flex flex-col items-center justify-start lg:h-screen lg:overflow-y-auto scroll-smooth custom-scrollbar relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-brand-500/5 dark:bg-brand-600/10 blur-[180px] rounded-full -mr-96 -mt-96 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-600/5 blur-[140px] rounded-full -ml-40 -mb-40" />
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl w-full relative z-10 mx-auto py-24 sm:py-32"
        >
          {/* 1. HERO SECTION */}
          <div className="text-center mb-40">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-brand-400">The Vision</span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-6xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85] mb-12"
            >
              YOUR SMART <br />
              <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-600 dark:from-brand-400 dark:via-indigo-400 dark:to-emerald-400 bg-clip-text text-transparent italic">HEALTH COMPANION</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="text-slate-600 dark:text-slate-400 text-xl lg:text-2xl font-medium leading-relaxed max-w-3xl mx-auto"
            >
              A structured, rule-based health monitoring system designed to help you track, understand, and improve your daily health with clarity and consistency.
            </motion.p>
          </div>

          {/* 2. WHAT THIS APP DOES & WHY DIFFERENT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-48">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-10 lg:p-12 rounded-[3.5rem] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.05] shadow-xl shadow-slate-200/20 dark:shadow-none transition-all group"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 dark:text-brand-400">
                  <ICONS.Activity size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">What it does</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed mb-8">
                Monitor key metrics like heart rate, blood pressure, sleep, and hydration. Compare inputs with medically defined ranges and get meaningful feedback <span className="text-slate-900 dark:text-white font-bold italic">without relying on unpredictable AI.</span>
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Transparency</span>
                <span className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Precision</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-10 lg:p-12 rounded-[3.5rem] bg-gradient-to-br from-indigo-50 to-brand-50 dark:from-indigo-600/20 dark:to-brand-600/20 border border-brand-100 dark:border-white/10 hover:border-brand-500/30 transition-all group shadow-xl shadow-brand-500/5 dark:shadow-none"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <ICONS.ShieldAlert size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Why it's different</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "No AI dependency → Predictable logic",
                  "Rule-based system → Consistent results",
                  "Minimalist UI → Zero clutter",
                  "User-focused → Built for clarity"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium text-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* 3. HOW IT WORKS (STEP FLOW) */}
          <div className="mb-48 px-4 lg:px-0">
            <div className="text-center mb-32">
              <h3 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6 uppercase italic">How it works</h3>
              <p className="text-slate-500 font-medium text-lg">Simple 4-step precision monitoring</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-24">
              {[
                { step: "01", title: "INPUT DATA", desc: "Enter vitals, sleep, water, and activity." },
                { step: "02", title: "EVALUATE", desc: "System compares data with medical thresholds." },
                { step: "03", title: "FEEDBACK", desc: "Receive instant alerts and status updates." },
                { step: "04", title: "TRACK", desc: "Analyze progress over time via visual logs." }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative group"
                >
                  <div className="text-[100px] lg:text-[120px] font-black text-slate-900/[0.05] dark:text-white/[0.12] absolute -top-16 lg:-top-24 -left-2 lg:-left-8 pointer-events-none group-hover:text-brand-500/[0.15] transition-colors leading-none tracking-tighter">
                    {item.step}
                  </div>
                  <div className="relative pt-6 lg:pt-10 z-10">
                    <h4 className="text-[12px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.3em] mb-4">{item.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-sm lg:text-base">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 4. KEY FEATURES (GRID) */}
          <div className="mb-48">
            <h3 className="text-5xl font-black text-slate-900 dark:text-white mb-20 tracking-tight text-center uppercase">THE ENGINE CORE</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <AboutItem icon={<ICONS.Activity size={20} />} title="Vital Monitoring" description="Track heart rate, blood pressure, and weight with medical precision." delay={0.1} />
              <AboutItem icon={<ICONS.Moon size={20} />} title="Lifestyle Insights" description="Sleep cycles, water intake, and movement patterns monitored daily." delay={0.2} />
              <AboutItem icon={<ICONS.Pill size={20} />} title="Medication Tracker" description="Add doses, set reminders, and maintain consistency easily." delay={0.3} />
              <AboutItem icon={<ICONS.ShieldAlert size={20} />} title="Smart Alerts" description="Get notified instantly when metrics fall outside safe thresholds." delay={0.4} />
              <AboutItem icon={<ICONS.TrendingUp size={20} />} title="Health Score" description="Understand your daily state with a single, clear health indicator." delay={0.5} />
              <AboutItem icon={<ICONS.History size={20} />} title="Trends & Logs" description="Review your journey through interactive charts and historical logs." delay={0.6} />
            </div>
          </div>

          {/* 5. PRIVACY & FOR WHO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mb-32 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter">Your data is yours</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xl font-medium leading-relaxed">
                We believe health data should be private. All information is completely isolated per user. Guest data is assigned unique tokens to ensure zero cross-over. Your privacy is pre-built into the logic.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-10 rounded-[3rem] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-8 shadow-xl shadow-slate-200/20 dark:shadow-none"
            >
              <h4 className="text-slate-900 dark:text-white font-bold opacity-50 uppercase tracking-widest text-[10px]">Optimized For</h4>
              <div className="space-y-6">
                {[
                  "Individuals tracking daily health",
                  "Habit-driven professionals",
                  "Users who value logic over AI noise"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <ICONS.Check size={16} />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-bold">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="pt-12 flex items-center justify-between border-t border-slate-200 dark:border-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-700">© 2026 Vitalis Health Engine</p>
            <div className="flex gap-1.5">
              <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-800" />
              <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-800" />
              <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-800" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureRow({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex gap-5 items-start"
    >
      <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90 mb-1">{title}</h4>
        <p className="text-[13px] font-medium text-slate-500 leading-snug">{description}</p>
      </div>
    </motion.div>
  );
}

function AboutItem({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="flex gap-4 p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-brand-500/20 transition-all duration-300 group shadow-lg shadow-slate-200/10 dark:shadow-none"
    >
      <div className="w-10 h-10 shrink-0 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500">
        {icon}
      </div>
      <div>
        <h3 className="text-[13px] font-bold text-slate-900 dark:text-white mb-1 tracking-tight">{title}</h3>
        <p className="text-[11px] font-medium text-slate-500 leading-snug">{description}</p>
      </div>
    </motion.div>
  );
}

