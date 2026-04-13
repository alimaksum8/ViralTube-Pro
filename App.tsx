
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  TrendingUp, 
  Sparkles, 
  Globe, 
  Tag, 
  Copy, 
  Check, 
  History, 
  Search, 
  ExternalLink,
  AlertCircle,
  Loader2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { generateYouTubeContent } from './services/geminiService';
import { YouTubeContent, LoadingStatus } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COUNTRIES = [
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'US', name: 'USA', flag: '🇺🇸' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
];

const CATEGORIES = [
  { id: 'Seni dan Hiburan', name: 'Seni & Hiburan', icon: '🎭' },
  { id: 'Musik', name: 'Musik & Audio', icon: '🎵' },
  { id: 'Permainan', name: 'Gaming', icon: '🎮' },
  { id: 'Teknologi', name: 'Teknologi', icon: '💻' },
];

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy} 
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200",
        copied 
          ? "bg-green-500 text-white shadow-lg shadow-green-200" 
          : "bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95"
      )}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Tersalin' : 'Salin'}
    </button>
  );
};

const PlatformScoreBar: React.FC<{ name: string; score: number; color: string }> = ({ name, score, color }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
      <span>{name}</span>
      <span className="text-slate-900">{score}%</span>
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={cn("h-full rounded-full", color)}
      />
    </div>
  </div>
);

const ResultCard: React.FC<{ title: string; content: string; icon: React.ReactNode; color: string }> = ({ title, content, icon, color }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
    <div className={cn("px-6 py-4 flex justify-between items-center border-b border-slate-100", color)}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg text-white">
          {icon}
        </div>
        <h3 className="font-bold text-white text-sm uppercase tracking-wide">{title}</h3>
      </div>
      <CopyButton text={content} />
    </div>
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex-1 bg-slate-50 rounded-2xl p-4 text-sm text-slate-600 font-medium leading-relaxed border border-slate-100 overflow-y-auto max-h-64 scrollbar-hide select-all">
        {content}
      </div>
    </div>
  </div>
);

export default function App() {
  const [topic, setTopic] = useState('');
  const [country, setCountry] = useState('ID');
  const [category, setCategory] = useState('Seni dan Hiburan');
  const [isFuturePrediction, setIsFuturePrediction] = useState(false);
  const [status, setStatus] = useState<LoadingStatus>(LoadingStatus.IDLE);
  const [result, setResult] = useState<YouTubeContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{topic: string, date: string}[]>([]);
  const isApiKeyMissing = !process.env.GEMINI_API_KEY;

  useEffect(() => {
    const savedHistory = localStorage.getItem('viraltube_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setStatus(LoadingStatus.LOADING);
    setError(null);
    
    try {
      const data = await generateYouTubeContent(topic, country, category, isFuturePrediction);
      setResult(data);
      setStatus(LoadingStatus.SUCCESS);
      
      const newHistory = [{ topic, date: new Date().toISOString() }, ...history].slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem('viraltube_history', JSON.stringify(newHistory));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal menghubungkan ke AI. Silakan coba lagi.');
      setStatus(LoadingStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-rose-100 selection:text-rose-900">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
            <Video className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900">ViralTube <span className="text-rose-600">Pro</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">AI Analytics Engine</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isApiKeyMissing && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold uppercase tracking-wider">
              <AlertCircle className="w-3 h-3" />
              API Key Missing
            </div>
          )}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Live Trends Active</span>
          </div>
        </div>
      </nav>

      {isApiKeyMissing && (
        <div className="bg-amber-500 text-white px-6 py-2 text-center text-[10px] font-black uppercase tracking-[0.2em]">
          ⚠️ Gemini API Key is missing. Please set GEMINI_API_KEY in the Settings menu to enable AI features.
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Optimalkan Konten Anda 🚀</h2>
              <p className="text-slate-500 font-medium">Gunakan AI untuk menganalisis tren YouTube real-time dan buat aset viral dalam hitungan detik.</p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-8">
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                <button 
                  onClick={() => setIsFuturePrediction(false)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all",
                    !isFuturePrediction ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Tren Saat Ini
                </button>
                <button 
                  onClick={() => setIsFuturePrediction(true)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all",
                    isFuturePrediction ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Prediksi Masa Depan
                </button>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Wilayah</label>
                    <div className="relative">
                      <select 
                        value={country} 
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold appearance-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                      >
                        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                      </select>
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                    <div className="relative">
                      <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold appearance-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                      >
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                      </select>
                      <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Topik / Kata Kunci</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={topic} 
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Misal: Review Gadget Terbaru..."
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <button 
                  disabled={status === LoadingStatus.LOADING}
                  className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {status === LoadingStatus.LOADING ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Menganalisis Tren...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Viral Assets
                    </>
                  )}
                </button>
              </form>

              {history.length > 0 && (
                <div className="pt-6 border-top border-slate-100 space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <History className="w-3 h-3" /> Riwayat Terakhir
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {history.map((h, i) => (
                      <button 
                        key={i} 
                        onClick={() => setTopic(h.topic)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 transition-colors"
                      >
                        {h.topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 border rounded-2xl flex items-start gap-3",
                  error.startsWith("QUOTA_EXCEEDED") 
                    ? "bg-amber-50 border-amber-100 text-amber-700" 
                    : "bg-rose-50 border-rose-100 text-rose-700"
                )}
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div className="space-y-2">
                  <p className="text-xs font-bold">{error.replace("QUOTA_EXCEEDED: ", "")}</p>
                  {error.startsWith("QUOTA_EXCEEDED") && (
                    <a 
                      href="https://aistudio.google.com/app/plan_and_billing" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block text-[10px] font-black uppercase tracking-widest underline decoration-2 underline-offset-4 hover:text-amber-900 transition-colors"
                    >
                      Cek Dashboard Quota →
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {status === LoadingStatus.IDLE && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-4 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-12"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-10 h-10 text-slate-300" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900">Siap Untuk Viral?</h3>
                    <p className="text-slate-400 max-w-xs mx-auto">Masukkan topik di sebelah kiri untuk mulai menganalisis tren YouTube terbaru.</p>
                  </div>
                </motion.div>
              )}

              {status === LoadingStatus.LOADING && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-6 bg-white rounded-[3rem] border border-slate-200 p-12"
                >
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-rose-600 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900">Membaca Algoritma...</h3>
                    <p className="text-slate-400 max-w-xs mx-auto">Gemini AI sedang menelusuri data real-time dari Google Trends dan YouTube.</p>
                  </div>
                </motion.div>
              )}

              {status === LoadingStatus.SUCCESS && result && (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  {/* Platform Scores */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-rose-600" /> Platform Interest Index
                      </h3>
                      <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Updated Just Now
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      <PlatformScoreBar name="YouTube" score={result.platformScores.youtube} color="bg-rose-500" />
                      <PlatformScoreBar name="TikTok" score={result.platformScores.tiktok} color="bg-slate-900" />
                      <PlatformScoreBar name="Google Search" score={result.platformScores.google} color="bg-blue-500" />
                      <PlatformScoreBar name="DeepSeek" score={result.platformScores.deepseek} color="bg-indigo-500" />
                    </div>
                  </div>

                  {/* Titles */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 ml-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-rose-600" /> Rekomendasi Judul Viral
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {result.titles.map((title, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between group hover:border-rose-200 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">#{i+1}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{result.youtubeTrendingScores[i]}% Trending Potential</span>
                            </div>
                            <p className="text-base font-bold text-slate-900 leading-tight">{title}</p>
                          </div>
                          <CopyButton text={title} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description & Tags */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResultCard 
                      title="Deskripsi SEO" 
                      content={result.description} 
                      icon={<ArrowRight className="w-5 h-5" />}
                      color="bg-slate-800"
                    />
                    <div className="space-y-6">
                      <ResultCard 
                        title="Hashtags" 
                        content={result.platformTags} 
                        icon={<Tag className="w-5 h-5" />}
                        color="bg-rose-600"
                      />
                      <ResultCard 
                        title="Metadata Tags" 
                        content={result.metadataTags} 
                        icon={<Search className="w-5 h-5" />}
                        color="bg-indigo-600"
                      />
                    </div>
                  </div>

                  {/* Grounding Sources */}
                  {result.groundingSources && result.groundingSources.length > 0 && (
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl">
                          <Globe className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-widest">Sumber Data Real-time</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified by Google Search</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {result.groundingSources.map((source, i) => (
                          <a 
                            key={i} 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors group"
                          >
                            <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors truncate pr-4">{source.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 transition-colors shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-200 rounded-lg flex items-center justify-center">
              <Video className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ViralTube Pro v2.0</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-colors">Privacy Policy</a>
            <a href="#" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-colors">Terms of Service</a>
            <a href="#" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
