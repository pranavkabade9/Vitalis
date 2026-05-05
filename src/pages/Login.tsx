import React from 'react';
import { useAuth } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import { ICONS } from '../constants';
import { motion } from 'motion/react';

export default function Login() {
  const { signInWithGoogle, signInAsGuest, loading } = useAuth();
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col overflow-x-hidden">
      {/* Top Section: Hero Login */}
      <div className="min-h-screen flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-100/30 via-transparent to-transparent pointer-events-none" />
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-md w-full relative z-10"
        >
          <motion.div variants={itemVariants} className="flex items-center justify-center lg:justify-start gap-4 mb-16">
            <div className="w-14 h-14 rounded-[1.25rem] bg-brand-500 shadow-2xl shadow-brand-500/40 flex items-center justify-center text-white rotate-3">
              <ICONS.Activity size={32} />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Vitalis</h1>
              <p className="text-[10px] uppercase font-black tracking-[0.3em] text-brand-500 mt-1">Health Engine</p>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 p-10 lg:p-12 shadow-[0_48px_80px_-16px_rgba(0,0,0,0.12)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600" />
            
            <div className="text-left mb-12">
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">Get Started</h2>
              <p className="text-slate-500 mt-3 font-medium text-lg">Continue to your health workspace.</p>
            </div>

            <div className="space-y-5">
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

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-12 flex flex-col items-center gap-4 cursor-default group"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-brand-500 transition-colors">Discover the Vision</p>
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-brand-500"
            >
              <ICONS.ChevronDown size={20} />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Section: About Detail Area */}
      <div className="bg-[#020617] py-24 lg:py-40 px-8 lg:px-16 flex flex-col items-center relative overflow-hidden">
        {/* Apple-style background glow */}
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-brand-600/10 blur-[180px] rounded-full -mr-96 -mt-96 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/5 blur-[140px] rounded-full -ml-40 -mb-40" />

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl w-full relative z-10 mx-auto"
        >
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-400">The Blueprint</span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-6xl lg:text-9xl font-black text-white tracking-tighter leading-[0.8] mb-12"
            >
              ZERO SETUP <br /> REQUIRED
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="text-slate-400 text-xl lg:text-2xl font-medium leading-relaxed max-w-2xl mx-auto"
            >
              Start your journey instantly. No login or complicated setup required to begin—just use Guest Mode and upgrade later to sync across devices.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="p-10 lg:p-14 rounded-[3.5rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all"
            >
              <h3 className="text-3xl font-black text-white mb-10 tracking-tight">Why Vitalis?</h3>
              <div className="space-y-10">
                <FeatureRow icon={<ICONS.ShieldAlert size={18} />} title="STAY PRIVATE" description="Your health data remains local and secure." delay={0.6} />
                <FeatureRow icon={<ICONS.Activity size={18} />} title="AVOID UNCERTAINTY" description="Rule-based monitoring for clear medical insights." delay={0.7} />
                <FeatureRow icon={<ICONS.TrendingUp size={18} />} title="BUILD CONSISTENCY" description="Daily tracking leads to long-term wellness." delay={0.8} />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="p-10 lg:p-14 rounded-[3.5rem] bg-gradient-to-br from-brand-600 to-indigo-700 shadow-2xl shadow-brand-500/20 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white mb-12">
                <ICONS.Activity size={32} />
              </div>
              <h3 className="text-4xl font-black text-white mb-6 tracking-tighter leading-[0.9]">Simple & <br />Accessible</h3>
              <p className="text-white/80 text-xl font-medium leading-relaxed mb-12">
                A clean, easy-to-use interface that adapts to your life. Your data is always with you.
              </p>
              <div className="flex gap-4">
                <span className="px-6 py-2 rounded-2xl bg-white/10 text-white text-[11px] font-black uppercase tracking-widest border border-white/10">Responsive</span>
                <span className="px-6 py-2 rounded-2xl bg-white/10 text-white text-[11px] font-black uppercase tracking-widest border border-white/10">Clean UI</span>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <ICONS.Activity size={16} />
              </div>
              <span className="text-lg font-black text-white tracking-widest uppercase">Vitalis</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              © 2026 Vitalis • Precision Health Logic
            </p>
          </motion.div>
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
      className="flex gap-4 p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 group"
    >
      <div className="w-10 h-10 shrink-0 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500">
        {icon}
      </div>
      <div>
        <h3 className="text-[13px] font-bold text-white mb-1 tracking-tight">{title}</h3>
        <p className="text-[11px] font-medium text-slate-500 leading-snug">{description}</p>
      </div>
    </motion.div>
  );
}

