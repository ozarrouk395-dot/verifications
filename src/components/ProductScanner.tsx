import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Barcode, CheckCircle, AlertTriangle, XCircle, Search, ShieldAlert, FileText, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface VerificationResult {
  productName: string;
  brand: string;
  barcode: string;
  officialPrice: number;
  suspicionLevel: 'منخفضة' | 'متوسطة' | 'عالية' | 'غير قابلة للتحديد';
  matches: { feature: string; status: 'مطابق' | 'غير مطابق' | 'مشتبه به'; referenceFile: string }[];
  advice: string;
}

interface ProductScannerProps {
  onReportFraud?: (data: { productName: string; brand: string; barcode: string; officialPrice: number }) => void;
}

export const ProductScanner: React.FC<ProductScannerProps> = ({ onReportFraud }) => {
  const [streamActive, setStreamActive] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Start Camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err) {
      console.error(err);
      setCameraError('تعذر الوصول إلى الكاميرا. يرجى التأكد من منح الإذن أو إدخال الباركود يدوياً.');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  // Barcode detection interval loop
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (streamActive && 'BarcodeDetector' in window) {
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'qr_code', 'upc_a', 'upc_e', 'code_128']
      });

      interval = setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              setScannedBarcode(code);
              stopCamera();
              handleAnalyze(code);
            }
          } catch (e) {
            // Frame detection error, ignore in stream loop
          }
        }
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [streamActive]);

  // Capture snapshot from video
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(dataUrl);
      stopCamera();
      handleAnalyze(scannedBarcode || '6131234567890');
    }
  };

  // Analyze Product authenticity
  const handleAnalyze = (code: string) => {
    setIsAnalyzing(true);
    setResult(null);

    // Mocking RAG verification process from Drive reference files
    setTimeout(() => {
      setIsAnalyzing(false);
      setResult({
        productName: 'زيت المائدة الممتاز 5 لتر',
        brand: 'العافية',
        barcode: code,
        officialPrice: 650,
        suspicionLevel: 'عالية',
        matches: [
          { feature: 'الشعار والخط الطباعي', status: 'غير مطابق', referenceFile: 'مراجع_التقليد_العافية_2024.pdf' },
          { feature: 'شريط الأمان على الغطاء', status: 'مشتبه به', referenceFile: 'دليل_فحص_العبوات_المغشوشة.docx' },
          { feature: 'صيغة تاريخ الصلاحية والرقم التسلسلي', status: 'مطابق', referenceFile: 'قائمة_الأسعار_الرسمية_والمقارنة.xlsx' },
        ],
        advice: 'مؤشرات تدل على وجود عدم تطابق في شعار المنتج وشريط الحماية مقارنة بالمواصفة المعتمدة في المجلد. ننصح بعدم الشراء والإبلاغ الفوري.',
      });
    }, 1800);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 text-right">
      {/* 3D Action Card */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-teal-600 via-emerald-700 to-slate-900 p-5 text-white border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2 font-readex">
              <Barcode className="w-5 h-5 text-emerald-300" />
              <span>فحص أصالة المنتجات والباركود</span>
            </h2>
            <p className="text-xs text-emerald-100/90 mt-1">
              مطابقة بصرية لمواصفات العبوة والشعار والباركود مع مراجع Drive
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Camera Viewport with 3D Scanning Beam */}
          <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 shadow-inner">
            {cameraError ? (
              <div className="p-4 text-center text-rose-400 text-xs flex flex-col items-center">
                <AlertTriangle className="w-8 h-8 mb-2" />
                {cameraError}
              </div>
            ) : streamActive ? (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Animated 3D Scanning Beam Effect */}
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan-beam pointer-events-none" />

                {/* Guidance overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-48 h-48 border-2 border-dashed border-emerald-400/80 rounded-3xl relative flex items-center justify-center">
                    <span className="text-[11px] bg-slate-950/80 text-emerald-300 px-3 py-1 rounded-full font-medium border border-emerald-500/30">
                      وجّه الكاميرا نحو الباركود أو الشعار
                    </span>
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-emerald-400 -mr-0.5 -mt-0.5 rounded-tr-lg" />
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-emerald-400 -ml-0.5 -mt-0.5 rounded-tl-lg" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-emerald-400 -mr-0.5 -mb-0.5 rounded-br-lg" />
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-emerald-400 -ml-0.5 -mb-0.5 rounded-bl-lg" />
                  </div>
                </div>
              </>
            ) : capturedImage ? (
              <div className="relative w-full h-full">
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                {isAnalyzing && (
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8] animate-scan-beam" />
                )}
              </div>
            ) : (
              <div className="text-center text-slate-500 p-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-7 h-7 text-emerald-400/60" />
                </div>
                <p className="text-xs text-slate-400 font-medium">اضغط على زر الكاميرا لبدء الفحص المباشر</p>
                <p className="text-[10px] text-slate-600 mt-1">يدعم قراءة الباركود EAN-13 وتفاصيل العبوة</p>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Camera Controls with 3D tactile buttons */}
          <div className="flex gap-2">
            {!streamActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="flex-1 btn-3d btn-3d-neon text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition"
              >
                <Camera className="w-4 h-4" />
                <span>تشغيل ماسح الكاميرا الذكي</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 btn-3d bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>التقاط صورة للفحص والمقارنة</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-medium transition border border-white/10 btn-3d"
                >
                  إيقاف
                </button>
              </>
            )}
          </div>

          {/* Manual Input Fallback */}
          <div className="pt-3 border-t border-white/10">
            <label className="block text-slate-300 text-xs font-semibold mb-1.5">
              أو أدخل رقم الباركود يدوياً
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="مثال: 6131234567890"
                className="flex-1 bg-slate-900/70 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono tracking-wider"
              />
              <button
                type="button"
                disabled={!manualBarcode.trim() || isAnalyzing}
                onClick={() => handleAnalyze(manualBarcode)}
                className="btn-3d bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>تحقق</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Loading with 3D Spinner */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-3xl border border-emerald-500/20 text-center space-y-3 shadow-xl"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
          <h4 className="text-sm font-bold text-white font-readex">جاري مقارنة العبوة مع مراجع الأصالة في Drive...</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            نطابق أبعاد الشعار، خط الطباعة، ومعايير شريط الأمان الليزري بدقة.
          </p>
        </motion.div>
      )}

      {/* Result Card with 3D Circular Gauge & Depth */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="glass-panel rounded-3xl border border-white/15 overflow-hidden shadow-2xl"
        >
          {/* Header Status with 3D Gradient */}
          <div
            className={`p-5 text-white flex items-center justify-between border-b border-white/10 ${
              result.suspicionLevel === 'عالية'
                ? 'bg-gradient-to-r from-rose-700 via-rose-600 to-slate-900'
                : result.suspicionLevel === 'متوسطة'
                  ? 'bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900'
            }`}
          >
            <div>
              <span className="text-xs opacity-90 block">درجة الاشتباه بالتقليد</span>
              <span className="text-2xl font-bold font-readex">{result.suspicionLevel}</span>
            </div>

            {/* Circular Gauge Representation */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" className="stroke-white/20" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  className={result.suspicionLevel === 'عالية' ? 'stroke-rose-300' : 'stroke-emerald-300'}
                  strokeWidth="3"
                  strokeDasharray="88"
                  strokeDashoffset={result.suspicionLevel === 'عالية' ? '20' : '60'}
                  strokeLinecap="round"
                />
              </svg>
              <ShieldAlert className="w-6 h-6 absolute" />
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Summary */}
            <div className="border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base font-readex">{result.productName}</h3>
              <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
                <span>العلامة: <strong className="text-emerald-400 font-semibold">{result.brand}</strong></span>
                <span>الباركود: <strong className="font-mono text-slate-200">{result.barcode}</strong></span>
              </div>
            </div>

            {/* Verification Items with 3D pill tags */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2">علامات الفحص المرجعية:</h4>
              <div className="space-y-2">
                {result.matches.map((item, index) => (
                  <div key={index} className="bg-slate-900/60 p-3 rounded-2xl border border-white/5 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-200">{item.feature}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'مطابق'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : item.status === 'غير مطابق'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                      <FileText className="w-3 h-3 text-slate-400" />
                      المرجع: {item.referenceFile}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Advice */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5 text-xs text-emerald-200 leading-relaxed">
              <span className="font-bold block mb-1 text-emerald-400">توصية المساعد:</span>
              {result.advice}
            </div>

            {/* Action to Report */}
            {onReportFraud && (
              <button
                type="button"
                onClick={() =>
                  onReportFraud({
                    productName: result.productName,
                    brand: result.brand,
                    barcode: result.barcode,
                    officialPrice: result.officialPrice,
                  })
                }
                className="w-full btn-3d bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30"
              >
                <span>بلّغ عن هذا المنتج (تعبئة تلقائية للنموذج)</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
