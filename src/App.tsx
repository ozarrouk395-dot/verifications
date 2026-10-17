/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, MessageSquare, ShieldCheck, AlertCircle, FileText, Settings, Sparkles, Moon, Sun, Flame, Box } from 'lucide-react';
import { Onboarding3DScene } from './components/Onboarding3DScene';
import { ChatInterface } from './components/ChatInterface';
import { ReportForm } from './components/ReportForm';
import { ProductScanner } from './components/ProductScanner';
import { SettingsView } from './components/SettingsView';

const slides = [
  {
    title: "اعرف السعر الرسمي فوراً",
    subtitle: "قارن أسعار الجملة والتجزئة الحقيقية بدقة من مراجع Google Drive المعتمدة بدون تخمين.",
    tag: "مقارنة دقيقة",
  },
  {
    title: "تحقّق من أصالة المنتج",
    subtitle: "امسح الباركود وافحص العبوة والشعار بمطابقة بصرية مباشرة لكشف المنتجات المقلدة.",
    tag: "حماية المستهلك",
  },
  {
    title: "بلّغ عن الغلاء أو الفساد",
    subtitle: "سجّل بلاغات ميدانية موثقة بالموقع الجغرافي والصور وأرسلها لجدول البيانات بنقرة واحدة.",
    tag: "رقابة ميدانية",
  },
  {
    title: "مساعد ذكي يفهمك",
    subtitle: "ذكاء اصطناعي فائق يفهم لهجتك وأسماء السلع البديلة ويجيبك حصرياً من ملفاتك الخاصة.",
    tag: "ذكاء مدعوم",
  },
];

export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<'chat' | 'verify' | 'report' | 'my-reports' | 'settings'>('chat');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Pre-fill state for reports forwarded from scanner
  const [reportPrefill, setReportPrefill] = useState<{
    productName?: string;
    brand?: string;
    officialPrice?: number;
    reportType?: string;
  } | undefined>(undefined);

  const handleReportFromScanner = (data: { productName: string; brand: string; barcode: string; officialPrice: number }) => {
    setReportPrefill({
      productName: data.productName,
      brand: data.brand,
      officialPrice: data.officialPrice,
      reportType: 'منتج مقلد',
    });
    setActiveTab('report');
  };

  const handleResetOnboarding = () => {
    setCurrentSlide(0);
    setInitialized(false);
  };

  // --- 1. 3D ONBOARDING EXPERIENCE ---
  if (!initialized) {
    return (
      <div className="min-h-screen mesh-gradient-dark bg-grain text-slate-100 flex flex-col justify-between p-4 sm:p-6 overflow-hidden relative select-none">
        {/* Glow Spheres */}
        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        {/* Top Header / Skip */}
        <div className="flex items-center justify-between z-10 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 border border-emerald-300/40">
              <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white font-readex">مساعد الأسعار</span>
              <span className="text-[10px] text-emerald-400 block -mt-1 font-mono">3D AI Edition</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setInitialized(true)}
            className="text-xs font-semibold text-slate-400 hover:text-white transition px-3 py-1.5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10"
          >
            تخطي
          </button>
        </div>

        {/* Central 3D Interactive WebGL Stage */}
        <div className="my-auto flex flex-col items-center justify-center z-10 w-full max-w-md mx-auto">
          <Onboarding3DScene currentSlide={currentSlide} />

          {/* Slide Text Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="text-center px-4"
            >
              <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 mb-3 shadow-xs">
                {slides[currentSlide].tag}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 font-readex tracking-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
                {slides[currentSlide].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          <div className="flex gap-2.5 mt-6 mb-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentSlide ? 'w-8 bg-emerald-400 neon-glow-mint' : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
                aria-label={`شريحة ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions (3D Buttons) */}
        <div className="w-full max-w-md mx-auto flex items-center gap-3 z-10 pb-2">
          {currentSlide > 0 && (
            <button
              type="button"
              onClick={() => setCurrentSlide((s) => s - 1)}
              className="px-5 py-3.5 rounded-2xl text-xs font-bold text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-white/10 transition btn-3d"
            >
              سابق
            </button>
          )}

          {currentSlide < slides.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentSlide((s) => s + 1)}
              className="flex-1 btn-3d btn-3d-neon text-white font-bold py-3.5 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 transition"
            >
              <span>التالي</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setInitialized(true)}
              className="flex-1 btn-3d btn-3d-neon text-white font-bold py-3.5 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>ابدأ الآن مباشرة</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- 2. MAIN APPLICATION INTERFACE ---
  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? 'mesh-gradient-dark text-slate-100' : 'mesh-gradient-light text-slate-800'
      } bg-grain pb-28 pt-3 px-3 sm:px-6 transition-colors duration-300`}
    >
      {/* Top Glass Navigation Bar */}
      <header className="max-w-2xl mx-auto mb-4 glass-panel rounded-2xl px-4 py-3 flex items-center justify-between border border-white/10 shadow-lg sticky top-3 z-30">
        <div className="flex items-center gap-2.5">
          {/* 3D App Icon */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 border border-emerald-300/40 transform hover:rotate-6 transition">
            <Flame className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white font-readex tracking-tight">مساعد الأسعار والبلاغات</h1>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>متصل بقاعدة Drive</span>
            </div>
          </div>
        </div>

        {/* Theme & Mode Switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDarkMode((d) => !d)}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 transition"
            title={isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <ChatInterface />
            </motion.div>
          )}

          {activeTab === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <ProductScanner onReportFraud={handleReportFromScanner} />
            </motion.div>
          )}

          {activeTab === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <ReportForm initialData={reportPrefill} />
            </motion.div>
          )}

          {activeTab === 'my-reports' && (
            <motion.div
              key="my-reports"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="glass-panel p-6 rounded-3xl border border-white/10 text-center max-w-xl mx-auto shadow-2xl space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white font-readex">سجل بلاغاتي الميدانية</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                يتم مزامنة كافة البلاغات التي ترسلها مباشرة مع ملف Google Sheets المحدد (المعرف: 1VsjUOG3l7...).
              </p>

              {/* Sample Staggered Cards */}
              <div className="space-y-2.5 pt-2 text-right">
                <div className="p-3.5 bg-slate-900/70 border border-white/5 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition">
                  <div>
                    <span className="text-xs font-bold text-white block">زيت المائدة 5 لتر</span>
                    <span className="text-[10px] text-slate-400">سوبرماركت البركة • تم التثبيت بـ GPS</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-bold border border-amber-500/30">
                    قيد المتابعة
                  </span>
                </div>

                <div className="p-3.5 bg-slate-900/70 border border-white/5 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition">
                  <div>
                    <span className="text-xs font-bold text-white block">سميد ممتاز 25 كغ</span>
                    <span className="text-[10px] text-slate-400">حي النخيل • مبالغة في السعر (+150 دج)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full font-bold border border-emerald-500/30">
                    تم التوثيق
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <SettingsView onResetOnboarding={handleResetOnboarding} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating 3D Navigation Bar (Dock) */}
      <nav className="fixed bottom-3 left-3 right-3 max-w-lg mx-auto glass-panel border border-white/15 rounded-3xl p-2 flex items-center justify-around shadow-2xl z-40">
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition duration-200 ${
            activeTab === 'chat'
              ? 'text-emerald-400 font-bold bg-white/5 scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px]">المحادثة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('verify')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition duration-200 ${
            activeTab === 'verify'
              ? 'text-emerald-400 font-bold bg-white/5 scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px]">فحص الأصالة</span>
        </button>

        {/* Central 3D Floating Action Button for Reports */}
        <button
          type="button"
          onClick={() => setActiveTab('report')}
          className={`-mt-6 w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white transition duration-200 shadow-xl border border-emerald-300/40 btn-3d ${
            activeTab === 'report'
              ? 'bg-gradient-to-tr from-amber-500 to-emerald-400 scale-110 shadow-emerald-500/40'
              : 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:scale-105 shadow-emerald-500/25 animate-float-subtle'
          }`}
          title="تقديم بلاغ جديد"
        >
          <AlertCircle className="w-6 h-6" />
          <span className="text-[9px] font-bold mt-0.5">بلاغ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my-reports')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition duration-200 ${
            activeTab === 'my-reports'
              ? 'text-emerald-400 font-bold bg-white/5 scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px]">بلاغاتي</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition duration-200 ${
            activeTab === 'settings'
              ? 'text-emerald-400 font-bold bg-white/5 scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">الإعدادات</span>
        </button>
      </nav>
    </div>
  );
}
