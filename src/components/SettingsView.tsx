import React, { useState } from 'react';
import { RefreshCw, FileText, CheckCircle2, AlertCircle, Database, DollarSign, Globe, Trash2, Eye, ShieldCheck, FileSpreadsheet, Sparkles, Sliders } from 'lucide-react';
import { motion } from 'motion/react';
import config from '../config.json';

interface IndexedFile {
  id: string;
  name: string;
  type: 'جدول أسعار' | 'مراجع منتجات مقلدة' | 'مستندات عامة';
  mimeType: string;
  lastIndexed: string;
  itemCount?: number;
  status: 'نشط' | 'مستبعد';
}

interface SettingsViewProps {
  onResetOnboarding?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetOnboarding }) => {
  const [currency, setCurrency] = useState('دج (DZD)');
  const [country, setCountry] = useState('الجزائر');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // Files catalog mock representing Drive indexing
  const [files, setFiles] = useState<IndexedFile[]>([
    {
      id: config.DRIVE_KNOWLEDGE_FOLDER_ID,
      name: 'مجلد المعرفة العام (Drive Folder)',
      type: 'مستندات عامة',
      mimeType: 'application/vnd.google-apps.folder',
      lastIndexed: '2026-10-17 12:45',
      status: 'نشط',
    },
    {
      id: config.LEGACY_PRICE_SHEET_ID,
      name: 'قائمة_الأسعار_الرسمية_والمقارنة.xlsx',
      type: 'جدول أسعار',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      lastIndexed: '2026-10-17 12:46',
      itemCount: 420,
      status: 'نشط',
    },
    {
      id: 'doc-001',
      name: 'دليل_كشف_الزيوت_والمواد_المغشوشة.pdf',
      type: 'مراجع منتجات مقلدة',
      mimeType: 'application/pdf',
      lastIndexed: '2026-10-17 12:48',
      itemCount: 18,
      status: 'نشط',
    },
    {
      id: 'doc-002',
      name: 'مواصفات_التعبئة_والعلامات_التجارية.docx',
      type: 'مراجع منتجات مقلدة',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      lastIndexed: '2026-10-17 12:50',
      itemCount: 35,
      status: 'نشط',
    },
    {
      id: config.REPORTS_SHEET_ID,
      name: 'جدول_تسجيل_البلاغات_الميدانية (Google Sheets)',
      type: 'جدول أسعار',
      mimeType: 'application/vnd.google-apps.spreadsheet',
      lastIndexed: '2026-10-17 12:52',
      itemCount: 84,
      status: 'نشط',
    },
  ]);

  // Handle re-indexing Drive folder
  const handleSyncDrive = async () => {
    setIsSyncing(true);
    setSyncProgress(25);

    try {
      setSyncProgress(60);
      const res = await fetch('/api/sync-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      setSyncProgress(90);
      await res.json();
      setSyncProgress(100);

      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          lastIndexed: now,
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle excluding a file from AI RAG
  const toggleFileStatus = (id: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: f.status === 'نشط' ? 'مستبعد' : 'نشط' } : f))
    );
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 text-right">
      {/* 3D Header Card */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 p-5 text-white border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2 font-readex">
              <Database className="w-5 h-5 text-emerald-300" />
              <span>إعدادات النظام وقاعدة المعرفة</span>
            </h2>
            <p className="text-xs text-emerald-100/90 mt-1">
              إدارة الفهرسة ومزامنة ملفات Google Drive وتخصيص العملة
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
            <Sliders className="w-5 h-5 text-emerald-300" />
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Preferences Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                العملة المعتمدة
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-emerald-400"
              >
                <option value="دج (DZD)">دينار جزائري - دج (DZD)</option>
                <option value="ر.س (SAR)">ريال سعودي - ر.س (SAR)</option>
                <option value="د.م (MAD)">درهم مغربي - د.م (MAD)</option>
                <option value="د.ت (TND)">دينار تونسي - د.ت (TND)</option>
                <option value="ج.م (EGP)">جنيه مصري - ج.م (EGP)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1.5 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                النطاق الجغرافي
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-emerald-400"
              >
                <option value="الجزائر">الجزائر</option>
                <option value="السعودية">السعودية</option>
                <option value="المغرب">المغرب</option>
                <option value="تونس">تونس</option>
                <option value="مصر">مصر</option>
              </select>
            </div>
          </div>

          {/* Drive Sync Actions with 3D button */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white font-readex">تحديث فهرس Google Drive</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  إعادة مسح المجلد واستخراج جداول الأسعار وتحديث ذاكرة RAG.
                </p>
              </div>
              <button
                type="button"
                disabled={isSyncing}
                onClick={handleSyncDrive}
                className="btn-3d btn-3d-neon text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'جاري الفهرسة...' : 'تحديث الآن'}</span>
              </button>
            </div>

            {/* Sync Progress Bar */}
            {isSyncing && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-emerald-400 font-mono">
                  <span>جاري استخراج السجلات والمطابقة مع Drive...</span>
                  <span>{syncProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${syncProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Discovered Files List (Glassmorphic) */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="px-5 py-3.5 bg-slate-900/60 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white font-readex">الملفات المكتشفة في المجلد</h3>
          </div>
          <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold px-2.5 py-0.5 rounded-full">
            {files.filter((f) => f.status === 'نشط').length} ملف نشط
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {files.map((file) => (
            <div key={file.id} className="p-3.5 hover:bg-white/5 transition flex items-center justify-between gap-3">
              <div className="flex items-start gap-3 overflow-hidden">
                <div className="p-2.5 rounded-2xl bg-slate-800 border border-white/10 text-emerald-400 shrink-0 mt-0.5">
                  {file.type === 'جدول أسعار' ? (
                    <FileSpreadsheet className="w-4 h-4" />
                  ) : file.type === 'مراجع منتجات مقلدة' ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>

                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-100 truncate" title={file.name}>
                    {file.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                    <span className="bg-slate-800 px-2 py-0.5 rounded-md text-emerald-300 font-medium border border-white/5">
                      {file.type}
                    </span>
                    <span>آخر فهرسة: {file.lastIndexed}</span>
                    {file.itemCount && <span className="font-mono text-slate-500">({file.itemCount} سجل)</span>}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => toggleFileStatus(file.id)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-xl transition border btn-3d ${
                    file.status === 'نشط'
                      ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30'
                      : 'border-white/10 text-slate-500 bg-slate-900/60 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30'
                  }`}
                  title={file.status === 'نشط' ? 'استبعاد الملف من الإجابات' : 'إعادة تفعيل الملف'}
                >
                  {file.status === 'نشط' ? 'مشمول' : 'مستبعد'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auxiliary Settings / Reset Onboarding */}
      {onResetOnboarding && (
        <div className="glass-panel p-4 rounded-3xl border border-white/10 text-center shadow-lg">
          <button
            type="button"
            onClick={onResetOnboarding}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center justify-center gap-1.5 mx-auto transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>إعادة عرض الجولة التعريفية ثلاثية الأبعاد (3D Onboarding)</span>
          </button>
        </div>
      )}
    </div>
  );
};
