// Last Update: 5 Apr 2026 - 09:35 (UTC) - Fixed Error Handling
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Bot, User, Loader2, Info, ExternalLink, GraduationCap, Sparkles, MessageSquare, BookOpen, MapPin, Calendar, Menu, X, Image as ImageIcon, Trash2, Globe, ChevronRight } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { getChatResponseStream } from './services/gemini';
import { cn } from './lib/utils';

// --- Types ---
interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
  sources?: { title: string; uri: string }[];
}

type Language = 'th' | 'en';

// --- Translations ---
const TRANSLATIONS = {
  th: {
    welcome: "ยินดีต้อนรับสู่",
    assistant: "Kasetsart Assistant",
    description: "ระบบช่วยเหลือนิสิตอัจฉริยะ พร้อมตอบทุกคำถามเกี่ยวกับมหาวิทยาลัยเกษตรศาสตร์",
    startBtn: "เริ่มต้นใช้งาน",
    placeholder: "ถามอะไรก็ได้เกี่ยวกับ มก. ...",
    processing: "กำลังประมวลผล...",
    error: "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง",
    quotaExceeded: "โควต้าเต็ม (Quota Exceeded)",
    links: "ลิงก์สำคัญ",
    faq: "คำถามที่พบบ่อย",
    beta: "เบต้า",
    university: "มหาวิทยาลัยเกษตรศาสตร์",
    knowledge: "ศาสตร์แห่งแผ่นดิน",
    disclaimer: "ข้อมูลอาจมีการคลาดเคลื่อน โปรดตรวจสอบจากแหล่งข้อมูลทางการ",
    calendarLink: "ปฏิทินการศึกษา",
    gradeLink: "คำนวณเกรด",
    examLink: "ตารางสอบ",
    quickActions: [
      { label: 'ปฏิทินการศึกษา', query: 'ขอปฏิทินการศึกษาปีล่าสุดหน่อย' },
      { label: 'การลงทะเบียน', query: 'ขั้นตอนการลงทะเบียนเรียนทำยังไง' },
      { label: 'แผนที่วิทยาเขต', query: 'ขอแผนที่มหาวิทยาลัยเกษตรศาสตร์ บางเขน' },
      { label: 'รถตะลัย', query: 'ตารางเดินรถตะลัยสายต่างๆ' },
    ],
  },
  en: {
    welcome: "Welcome to",
    assistant: "Kasetsart Assistant",
    description: "Intelligent student assistant system, ready to answer all questions about Kasetsart University.",
    startBtn: "Start Now",
    placeholder: "Ask anything about KU...",
    processing: "Processing...",
    error: "Connection error. Please try again.",
    quotaExceeded: "Quota Exceeded",
    links: "Important Links",
    faq: "FAQ",
    beta: "BETA",
    university: "Kasetsart University",
    knowledge: "Knowledge of the Land",
    disclaimer: "Information may be inaccurate. Please check official sources.",
    calendarLink: "Academic Calendar",
    gradeLink: "Grade Calculation",
    examLink: "Exam Schedule",
    quickActions: [
      { label: 'Academic Calendar', query: 'Show me the latest academic calendar' },
      { label: 'Registration', query: 'How to register for classes?' },
      { label: 'Campus Map', query: 'Show me the Kasetsart University Bangkhen map' },
      { label: 'KU Bus', query: 'KU bus routes and schedules' },
    ],
  }
};

// --- Components ---

const MessageAvatar = ({ role }: { role: 'user' | 'model' }) => {
  const [error, setError] = useState(false);
  
  const userImg = "/avatars/user.png";
  const botImg = "/avatars/bot.png";

  return (
    <div className={cn(
      "w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-lg overflow-hidden",
      role === 'user' 
        ? "bg-slate-800 border border-white/5" 
        : "bg-emerald-600 text-white"
    )}>
      {!error ? (
        <img 
          src={role === 'user' ? userImg : botImg} 
          alt={role === 'user' ? "User" : "AI"} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setError(true)}
        />
      ) : (
        role === 'user' ? <User size={20} /> : <Bot size={20} />
      )}
    </div>
  );
};

const Stars = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 300 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 3 + 1}px`,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 5}s`,
    }));
  }, []);

  return (
    <>
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            '--duration': star.duration,
            animationDelay: star.delay,
          } as any}
        />
      ))}
    </>
  );
};

const Planets = () => {
  return (
    <>
      {/* Emerald Green Planet - Top Right */}
      <div 
        className="planet bg-emerald-500/20" 
        style={{ 
          width: '35vw', 
          height: '35vw', 
          top: '-5%', 
          right: '-10%', 
          '--duration': '60s' 
        } as any} 
      />
      {/* Deep Ocean Teal Planet - Bottom Left */}
      <div 
        className="planet bg-teal-600/20" 
        style={{ 
          width: '30vw', 
          height: '30vw', 
          bottom: '-10%', 
          left: '-5%', 
          '--duration': '80s' 
        } as any} 
      />
      {/* Soft Universe Blue Planet - Middle Right */}
      <div 
        className="planet bg-blue-400/20" 
        style={{ 
          width: '25vw', 
          height: '25vw', 
          top: '30%', 
          right: '10%', 
          '--duration': '70s' 
        } as any} 
      />
    </>
  );
};

const ShootingStars = () => {
  const [meteors, setMeteors] = useState<{ id: number; top: string; left: string; delay: string }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now();
      const newMeteor = {
        id,
        top: `${Math.random() * 40}%`,
        left: `${Math.random() * 80}%`,
        delay: '0s',
      };
      setMeteors((prev) => [...prev, newMeteor]);
      setTimeout(() => {
        setMeteors((prev) => prev.filter((m) => m.id !== id));
      }, 3000);
    }, 8000); // Infrequent shooting stars

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {meteors.map((meteor) => (
        <div
          key={meteor.id}
          className="shooting-star"
          style={{
            top: meteor.top,
            left: meteor.left,
          }}
        />
      ))}
    </>
  );
};

const GalaxyBackground = () => {
  return (
    <div className="galaxy-bg">
      <div className="nebula" />
      <Stars />
      <ShootingStars />
      <Planets />
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>('th');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    // Initial message removed as per user request
  }, [lang]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setImageMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (textOverride?: string) => {
    const userMessage = textOverride || input.trim();
    if ((!userMessage && !selectedImage) || isLoading) return;

    const currentImage = selectedImage;
    const currentMimeType = imageMimeType;

    setInput('');
    setSelectedImage(null);
    setImageMimeType(null);
    
    setMessages((prev) => [...prev, { 
      role: 'user', 
      text: userMessage, 
      image: currentImage || undefined 
    }]);
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      let imageBase64 = '';
      if (currentImage) {
        imageBase64 = currentImage.split(',')[1];
      }

      const stream = await getChatResponseStream(userMessage, history, imageBase64, currentMimeType || undefined, lang);
      
      setMessages((prev) => [...prev, { role: 'model', text: '' }]);
      
      let fullText = '';
      let sources: { title: string; uri: string }[] = [];

      for await (const chunk of stream) {
        const chunkText = chunk.text || "";
        fullText += chunkText;
        
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (lastIndex >= 0 && newMessages[lastIndex].role === 'model') {
            newMessages[lastIndex] = { ...newMessages[lastIndex], text: fullText };
          }
          return newMessages;
        });

        const chunkSources = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks
          ?.map((c: any) => c.web)
          .filter(Boolean);
        
        if (chunkSources && chunkSources.length > 0) {
          sources = chunkSources;
        }
      }

      if (sources.length > 0) {
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (lastIndex >= 0 && newMessages[lastIndex].role === 'model') {
            newMessages[lastIndex] = { ...newMessages[lastIndex], sources };
          }
          return newMessages;
        });
      }

    } catch (error: any) {
      console.error('Chat Error:', error);
      const errorMessage = error.message || t.error;
      
      setMessages((prev) => [
        ...prev,
        { 
          role: 'model', 
          text: `❌ **Error:** ${errorMessage}`
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      <GalaxyBackground />

      <AnimatePresence mode="wait">
        {!hasStarted ? (
          <motion.div
            key={`welcome-${lang}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-start p-6 pt-32 sm:pt-40 text-center overflow-y-auto"
          >
            <div className="absolute top-6 right-6 flex gap-4">
              <button 
                onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
                className="p-2 rounded-full glass-panel hover:scale-110 transition-transform font-bold tracking-widest"
              >
                <Globe size={20} />
              </button>
            </div>

            <div className="max-w-2xl w-full space-y-8 sm:space-y-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="relative"
              >
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                <img 
                  src="https://upload.wikimedia.org/wikipedia/th/5/51/Logo_ku_th.svg" 
                  alt="KU Logo" 
                  className="relative w-32 h-32 sm:w-64 sm:h-64 object-contain mx-auto drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              <div className="space-y-4 sm:space-y-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h1 className="text-3xl sm:text-7xl font-black tracking-widest text-glow font-display">
                    {t.assistant}
                  </h1>
                  <p className="text-slate-400 mt-4 sm:mt-6 text-base sm:text-xl max-w-lg mx-auto leading-relaxed font-semibold">
                    {t.description}
                  </p>
                </motion.div>

                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setHasStarted(true)}
                  className="mt-6 sm:mt-10 px-8 sm:px-12 py-4 sm:py-5 bg-emerald-600 text-white rounded-full font-black text-lg sm:text-xl btn-glow hover:bg-emerald-500 transition-all flex items-center gap-4 mx-auto tracking-widest uppercase"
                >
                  {t.startBtn}
                  <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key={`chat-${lang}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex-1 flex flex-col items-start justify-start h-full"
          >
        {/* Header */}
        <header className="p-3 sm:p-4 flex items-center justify-between sticky top-0 z-40 w-full bg-transparent">
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <Menu size={20} className="sm:w-6 sm:h-6" />
            </button>
            <div className="flex items-center gap-2 sm:gap-4">
              <img 
                src="https://upload.wikimedia.org/wikipedia/th/5/51/Logo_ku_th.svg" 
                alt="KU Logo" 
                className="w-10 h-10 sm:w-16 sm:h-16 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <h1 className="text-sm sm:text-lg font-black tracking-tighter font-display text-white leading-none">
                  K a s e t s a r t⠀U n i v e r si t y
                </h1>
                <span className="text-[10px] sm:text-[15px] font-bold text-emerald-400/80 uppercase tracking-[0.2em] mt-1">
                  {t.assistant}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
              className="p-2.5 rounded-xl glass-panel hover:bg-emerald-500/20 transition-all hover:scale-110 shadow-lg border-emerald-500/20"
            >
              <Globe size={22} className="text-emerald-400" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden p-2 sm:p-4 pt-0 gap-2 sm:gap-4 w-full">
          {/* Sidebar */}
          <aside className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 glass-panel m-4 transition-transform duration-500 transform lg:relative lg:translate-x-0 lg:m-0 rounded-3xl bg-transparent",
            isSidebarOpen ? "translate-x-0" : "-translate-x-[120%]"
          )}>
            <div className="flex flex-col h-full p-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[15px] font-black text-slate-500 uppercase tracking-widest">{t.faq}</h3>
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-slate-400">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                {t.quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      handleSend(action.query);
                      setIsSidebarOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-500/10 border border-emerald-500/5 hover:border-emerald-500/30 transition-all group shadow-[0_0_10px_rgba(16,185,129,0.02)]"
                  >
                    <p className="text-[15px] font-bold tracking-wide text-slate-400 group-hover:text-emerald-400 uppercase">{action.label}</p>
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-white/5">
                <h3 className="text-[15px] font-black text-slate-500 uppercase tracking-widest mb-6">{t.links}</h3>
                <div className="space-y-4">
                  <a href="https://www.ku.ac.th" target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm text-slate-400 hover:text-emerald-400 transition-colors font-bold tracking-widest uppercase">
                    KU Official <ExternalLink size={14} />
                  </a>
                  <a href="https://registrar.ku.ac.th" target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm text-slate-400 hover:text-emerald-400 transition-colors font-bold tracking-widest uppercase">
                    Registrar <ExternalLink size={14} />
                  </a>
                  <a href="https://registrar.ku.ac.th/calendar" target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm text-slate-400 hover:text-emerald-400 transition-colors font-bold tracking-widest uppercase">
                    {(t as any).calendarLink} <ExternalLink size={14} />
                  </a>
                  <a href="https://fna.csc.ku.ac.th/grade/" target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm text-slate-400 hover:text-emerald-400 transition-colors font-bold tracking-widest uppercase">
                    {(t as any).gradeLink} <ExternalLink size={14} />
                  </a>
                  <a href="https://regis.src.ku.ac.th/res/table_test/index.php?fbclid=PARlRTSAQdPN5leHRuA2FlbQIxMABzcnRjBmFwcF9pZA8xMjQwMjQ1NzQyODc0MTQAAadxiyvhI7ZmHIzE5SDvN5tJl6x0izgXnN6DfeKbiKNeNLCuoTliEHze98v77A_aem_3TJd3Y9RuYCplYZC0kskPg" target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm text-slate-400 hover:text-emerald-400 transition-colors font-bold tracking-widest uppercase">
                    {(t as any).examLink} <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Chat Area */}
          <main className="flex-1 flex flex-col min-w-0 glass-panel rounded-3xl overflow-hidden bg-transparent">
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-8 scroll-smooth"
            >
              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx}
                  className={cn(
                    "flex w-full gap-4",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <MessageAvatar role={msg.role} />
                  
                  <div className={cn(
                    "flex flex-col max-w-[85%] sm:max-w-[70%]",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "px-4 py-3 sm:px-6 sm:py-4 rounded-2xl sm:rounded-3xl leading-relaxed font-semibold tracking-wide",
                      msg.role === 'user' 
                        ? "text-sm sm:text-base chat-bubble-user rounded-tr-none" 
                        : "text-sm sm:text-base chat-bubble-model rounded-tl-none"
                    )}>
                      {msg.image && (
                        <img 
                          src={msg.image} 
                          alt="Uploaded" 
                          className="max-w-full rounded-xl mb-4 border border-white/10" 
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="markdown-body prose prose-invert max-w-none">
                        <Markdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ node, ...props }) => (
                              <a {...props} target="_blank" rel="noreferrer" />
                            )
                          }}
                        >
                          {msg.text}
                        </Markdown>
                      </div>
                    </div>

                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.sources.slice(0, 3).map((source, sIdx) => (
                          <a
                            key={sIdx}
                            href={source.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-all font-bold tracking-widest uppercase"
                          >
                            <ExternalLink size={12} />
                            {source.title.length > 25 ? source.title.substring(0, 25) + '...' : source.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {messages.length <= 1 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 max-w-2xl lg:max-w-6xl mx-auto space-y-8">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center space-y-4"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 glass-panel">
                      <Sparkles className="text-emerald-400" size={28} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold font-display tracking-widest">{t.faq}</h2>
                    <p className="text-slate-400 text-xs sm:text-sm font-semibold">{t.description}</p>
                  </motion.div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full max-w-lg lg:max-w-6xl">
                    {t.quickActions.map((action, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => handleSend(action.query)}
                        className="p-3 sm:p-3.5 glass-panel rounded-xl text-left hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/50 transition-all group shadow-[0_0_10px_rgba(16,185,129,0.05)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="p-1 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform group-hover:shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                            <MessageSquare size={12} />
                          </div>
                          <ChevronRight size={12} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
                        </div>
                        <p className="font-bold text-slate-300 group-hover:text-emerald-400 transition-colors tracking-wide text-[13px] sm:text-[15px] uppercase">{action.label}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
              
              {isLoading && (
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-600 flex items-center justify-center shrink-0 overflow-hidden shadow-lg">
                    <img 
                      src="/avatars/bot.png" 
                      alt="AI" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="bg-white/5 border border-white/10 px-4 py-3 sm:px-6 sm:py-4 rounded-2xl sm:rounded-3xl rounded-tl-none flex items-center gap-2 sm:gap-3">
                    <Loader2 size={16} className="animate-spin text-emerald-400" />
                    <span className="text-sm sm:text-base font-bold tracking-widest text-slate-400 uppercase">{t.processing}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 sm:p-6 bg-gradient-to-t from-black/20 to-transparent">
              <div className="max-w-7xl mx-auto w-full">
                <div className="relative">
                  {selectedImage && (
                    <div className="absolute bottom-full left-0 mb-4 p-2 glass-panel rounded-2xl shadow-2xl flex items-center gap-3">
                      <img src={selectedImage} alt="Preview" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                      <button 
                        onClick={() => { setSelectedImage(null); setImageMimeType(null); }}
                        className="p-2 bg-white/5 text-slate-400 hover:text-red-400 rounded-xl transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center glass-panel rounded-full p-1.5 sm:p-2 focus-within:ring-2 ring-emerald-500/50 transition-all bg-transparent shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 sm:p-3 text-slate-400 hover:text-emerald-400 transition-all"
                    >
                      <ImageIcon size={20} className="sm:w-[22px] sm:h-[22px]" />
                    </button>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={t.placeholder}
                      className="flex-1 px-2 sm:px-4 py-2 sm:py-3 bg-transparent text-sm sm:text-base text-slate-200 placeholder:text-slate-500 focus:outline-none font-bold tracking-widest"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={(!input.trim() && !selectedImage) || isLoading}
                      className="p-3 sm:p-4 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 disabled:opacity-30 transition-all shadow-lg btn-glow"
                    >
                      <Send size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
                
                <p className="text-[10px] text-slate-500 text-center mt-4 tracking-widest font-bold uppercase">
                  {t.disclaimer}
                </p>
              </div>
            </div>
          </main>
        </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
