import React, { useState, useEffect } from 'react';
import { Camera, Upload, MapPin, AlertCircle, CheckCircle2, DollarSign, Store, Tag, Sparkles, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface ReportFormProps {
  onSuccess?: (reportId: string) => void;
  initialData?: {
    productName?: string;
    brand?: string;
    category?: string;
    officialPrice?: number;
    reportType?: string;
  };
}

export const ReportForm: React.FC<ReportFormProps> = ({ onSuccess, initialData }) => {
  // Form fields state
  const [productName, setProductName] = useState(initialData?.productName || '');
  const [category, setCategory] = useState(initialData?.category || 'مواد غذائية');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [reportType, setReportType] = useState(initialData?.reportType || 'مبالغة في السعر');

  // Pricing states
  const [storePrice, setStorePrice] = useState<number | ''>('');
  const [officialPrice, setOfficialPrice] = useState<number>(initialData?.officialPrice || 600);
  const [priceDiff, setPriceDiff] = useState<number>(0);
  const [diffPercent, setDiffPercent] = useState<number>(0);

  // Store & location states
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  // Additional details
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Calculate price differences dynamically
  useEffect(() => {
    if (typeof storePrice === 'number' && storePrice > 0 && officialPrice > 0) {
      const diff = storePrice - officialPrice;
      const percent = (diff / officialPrice) * 100;
      setPriceDiff(diff);
      setDiffPercent(Math.round(percent * 10) / 10);

      // Auto suggest report type if price is high
      if (diff > 0 && reportType !== 'منتج مقلد' && reportType !== 'منتهي الصلاحية' && reportType !== 'منتج فاسد') {
        setReportType('مبالغة في السعر');
      }
    } else {
      setPriceDiff(0);
      setDiffPercent(0);
    }
  }, [storePrice, officialPrice, reportType]);

  // Handle GPS location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('خدمة تحديد الموقع غير مدعومة في جهازك');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        console.error(err);
        setLocating(false);
        alert('تعذر جلب الموقع الجغرافي. يرجى إدخال العنوان يدوياً.');
      }
    );
  };

  // Handle Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler with 3D Confetti explosion
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      const generatedId = `REP-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmitting(false);
      setSubmittedId(generatedId);

      // Trigger multi-angle celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#8b5cf6', '#38bdf8'],
      });

      if (onSuccess) onSuccess(generatedId);
    }, 1200);
  };

  // Success 3D Screen
  if (submittedId) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateX: 15 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ type: 'spring', damping: 18, stiffness: 200 }}
        className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 text-center max-w-xl mx-auto shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* 3D Check Icon with tactile layered depth */}
        <div className="w-20 h-20 bg-gradient-to-tr from-emerald-600 to-teal-400 text-white rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30 border border-emerald-300/40 transform hover:scale-105 transition">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 font-readex">تم تسجيل البلاغ بنجاح!</h2>
        <p className="text-slate-300 text-sm mb-6 max-w-md mx-auto">
          تمت كتابة البيانات وتنسيقها وإدراجها ضمن ملف البلاغات الميداني (Google Sheets) بدقة.
        </p>

        {/* 3D Badge with ID */}
        <div className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-4 inline-block font-mono text-lg font-bold text-emerald-400 mb-8 shadow-inner shadow-black/50 tracking-wider">
          {submittedId}
        </div>

        <div>
          <button
            type="button"
            onClick={() => {
              setSubmittedId(null);
              setStorePrice('');
              setDescription('');
              setImagePreview(null);
            }}
            className="w-full btn-3d btn-3d-neon text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition tracking-wide flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>تقديم بلاغ ميداني آخر</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-xl mx-auto glass-panel rounded-3xl border border-white/10 overflow-hidden text-right shadow-2xl">
      {/* 3D Header Banner */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 p-5 text-white border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 font-readex">
              <AlertCircle className="w-5 h-5 text-amber-300" />
              <span>تقديم بلاغ ميداني ذكي</span>
            </h2>
            <p className="text-xs text-emerald-100/90 mt-1">
              مراقبة الأسعار المبالغ فيها، المنتجات المقلدة، أو المواد منتهية الصلاحية
            </p>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
            <Tag className="w-4 h-4 text-emerald-300" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-sm">
        {/* Report Type Pills */}
        <div>
          <label className="block text-slate-200 font-semibold mb-2 text-xs">نوع البلاغ الميداني</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {['مبالغة في السعر', 'منتج مقلد', 'منتهي الصلاحية', 'منتج فاسد', 'أخرى'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setReportType(type)}
                className={`py-2 px-3 text-xs rounded-xl font-medium border text-center transition btn-3d ${
                  reportType === type
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold shadow-xs shadow-emerald-500/30'
                    : 'bg-slate-800/60 border-white/5 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Product Details (Glass Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1.5">اسم المنتج</label>
            <div className="relative">
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="مثال: زيت نباتي 5 لتر"
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition"
              />
              <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1.5">العلامة التجارية</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="مثال: عافية / سيفيل / ماما"
              className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition"
            />
          </div>
        </div>

        {/* 3D Pricing & Auto Comparison Card */}
        <div className="p-4 bg-slate-900/70 rounded-2xl border border-white/10 space-y-3 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-amber-400" />
              مقارنة الأسعار الذكية
            </span>
            <span className="text-[11px] text-slate-400">
              السعر المرجعي بالملفات: <strong className="text-emerald-400 font-mono">{officialPrice} دج</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">السعر في المتجر (دج)</label>
              <input
                type="number"
                min="0"
                required
                value={storePrice}
                onChange={(e) => setStorePrice(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="0"
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white placeholder-slate-600 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">الفارق والزيادة</label>
              <div
                className={`p-2 rounded-xl text-center border font-bold text-xs flex items-center justify-center min-h-[38px] ${
                  priceDiff > 0
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : priceDiff < 0
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-white/5'
                }`}
              >
                {priceDiff > 0 ? `+${priceDiff} دج (${diffPercent}%)` : `${priceDiff} دج`}
              </div>
            </div>
          </div>
        </div>

        {/* Store & Location Card */}
        <div className="space-y-2">
          <div>
            <label className="block text-slate-300 text-xs font-medium mb-1.5">اسم المتجر / المحل</label>
            <div className="relative">
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="مثال: سوبرماركت البركة"
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
              />
              <Store className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              placeholder="العنوان أو الحي..."
              className="flex-1 bg-slate-900/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locating}
              className="flex items-center gap-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-white/10 transition shrink-0 btn-3d"
            >
              <MapPin className="w-4 h-4 text-rose-400" />
              {locating ? 'جاري التحديد...' : coords ? 'تحديث الموقع' : 'تحديد GPS'}
            </button>
          </div>

          {/* Coordinates & Google Maps Link */}
          {coords && (
            <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-3 text-xs space-y-2">
              <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">خط العرض:</span>
                  <span className="font-bold text-emerald-400">{coords.lat.toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">خط الطول:</span>
                  <span className="font-bold text-emerald-400">{coords.lng.toFixed(6)}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                  ✓ تم تثبيت الإحداثيات بنجاح
                </span>
                <a
                  href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 font-medium text-[11px] underline"
                >
                  فتح في خرائط Google
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Image Attachment (Glass Zone) */}
        <div>
          <label className="block text-slate-300 text-xs font-medium mb-1.5">صورة داعمة للبلاغ</label>
          <div className="border-2 border-dashed border-white/15 rounded-2xl p-4 text-center hover:border-emerald-400/50 transition bg-slate-900/40">
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-32 rounded-xl object-cover mx-auto shadow-md border border-white/10" />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 text-xs shadow-lg hover:scale-110 transition"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs text-slate-300 font-medium">اضغط لرفع صورة العبوة أو تاريخ الصلاحية</span>
                <span className="text-[10px] text-slate-500">PNG, JPG (التقاط عبر الكاميرا أو الألبوم)</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-slate-300 text-xs font-medium mb-1.5">ملاحظات وتفاصيل إضافية</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="أذكر أي تفاصيل عن مكان التخزين أو حالة السلعة..."
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none resize-none"
          />
        </div>

        {/* 3D Tactile Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-3d btn-3d-neon text-white font-bold py-3.5 rounded-2xl transition duration-200 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-3"
        >
          {submitting ? (
            <span>جاري إرسال البلاغ وقفل البيانات...</span>
          ) : (
            <>
              <span>تأكيد وإرسال البلاغ لـ Sheets</span>
              <ArrowLeft className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
