import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  RefreshCw, 
  Flame, 
  Waves, 
  MapPin, 
  HelpCircle,
  Compass,
  AlertTriangle
} from 'lucide-react';
import { AssistantChatMessage } from '../types/floodcast';

interface AIAssistantProps {
  initialPrompt?: string;
  onSelectCoordinates?: (lat: number, lng: number) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  initialPrompt,
  onSelectCoordinates,
}) => {
  const [messages, setMessages] = useState<AssistantChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Hello! I am **FloodCast AI**, your intelligent Assam Flood Hydrology & Emergency Dispatch Assistant.\n\nI have real-time access to active citizen SOS beacons, rescue boat dispatchers (NDRF/SDRF), CWC river gauges (Neamatighat, Guwahati, Dhubri), hill rainfall triggers, and submerged highways.\n\nHow can I help you today? You can ask about:\n- **Live SOS Distress:** *“Who is trapped in Majuli right now and which boat is nearest?”*\n- **CWC River Telemetry:** *“What is the water level trend at Neamatighat?”*\n- **Evacuation Protocol:** *“What is the SOP for rooftop helicopter evacuation?”*\n- **Highways:** *“Is NH-715 Kaziranga submerged?”*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'FloodCast Core Engine',
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speechSynthesisPlaying, setSpeechSynthesisPlaying] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'as' | 'bn' | 'hi'>('en');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Handle external initialPrompt if passed
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage: AssistantChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          language: selectedLanguage,
          conversationHistory: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        const assistantMessage: AssistantChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: data.source || 'gemini-3.8-flash',
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Empty response');
      }
    } catch (err: any) {
      console.error('Assistant error:', err);
      const errorMessage: AssistantChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `**FloodCast AI System Notice:** Network or API request error. Please verify your connection or try again shortly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'Error Handler',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Web Speech API: Voice recognition
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'bn' ? 'bn-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // Text to Speech
  const readMessageAloud = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speechSynthesisPlaying) {
      window.speechSynthesis.cancel();
      setSpeechSynthesisPlaying(false);
      return;
    }

    // Strip markdown formatting for cleaner speech
    const cleanText = text.replace(/[*_#`[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeechSynthesisPlaying(false);
    utterance.onerror = () => setSpeechSynthesisPlaying(false);

    setSpeechSynthesisPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Sample prompt pills
  const promptPills = [
    { label: '🚨 Active SOS List & Boat Dispatch', prompt: 'List all active citizen SOS alerts and recommend the closest available rescue boats.' },
    { label: '🌊 Neamatighat & Dhubri Gauges', prompt: 'What are the current water levels and danger level breaches at Neamatighat and Dhubri river gauges?' },
    { label: '🚁 Helicopter Rescue SOP', prompt: 'What is the standard procedure to request and prepare for an IAF helicopter winch rescue on a submerged roof?' },
    { label: '🛣️ Kaziranga Highway Submersion', prompt: 'What is the traffic and submersion status on NH-715 through Kaziranga National Park?' },
    { label: 'অসমীয়া: উদ্ধাৰৰ বাবে কি কৰিব?', prompt: 'অসমত বানপানীৰ সময়ত সুৰক্ষিত থাকিবলৈ কি কি পদক্ষেপ ল’ব লাগে?' },
    { label: '💊 Water Purification Dosage', prompt: 'What are the emergency dosage guidelines for chlorine / halogen tablets and preventing waterborne diseases?' },
  ];

  return (
    <div className="max-w-5xl mx-auto h-[740px] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-white text-base">FloodCast AI Intelligent Copilot</h3>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                <Sparkles className="w-3 h-3 mr-0.5" />
                <span>Gemini 3.8 Flash Powered</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Assam Hydrology, SOS Telemetry & Emergency Rescue Coordination Engine
            </p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Language:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
          >
            <option value="en">English</option>
            <option value="as">অসমীয়া (Assamese)</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>
        </div>
      </div>

      {/* Suggested prompt chips */}
      <div className="bg-slate-950/60 px-4 py-2 border-b border-slate-800/80 overflow-x-auto flex items-center space-x-2 scrollbar-none text-xs">
        <span className="text-slate-500 font-semibold shrink-0">Quick Queries:</span>
        {promptPills.map((pill, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(pill.prompt)}
            className="shrink-0 px-2.5 py-1 bg-slate-800/80 hover:bg-purple-900/40 hover:border-purple-500/50 text-slate-300 rounded-lg border border-slate-700 transition-colors"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                }`}
              >
                {isUser ? 'YOU' : <Bot className="w-4 h-4" />}
              </div>

              {/* Message bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm space-y-2 leading-relaxed ${
                  isUser
                    ? 'bg-cyan-600/90 text-white rounded-tr-none'
                    : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-wrap font-sans space-y-2">
                  {msg.content.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx}>
                      {paragraph.split('**').map((part, bIdx) =>
                        bIdx % 2 === 1 ? (
                          <strong key={bIdx} className="text-cyan-300 font-semibold">
                            {part}
                          </strong>
                        ) : (
                          part
                        )
                      )}
                    </p>
                  ))}
                </div>

                {/* Footer metadata & buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/40 text-[10px] text-slate-400">
                  <span className="flex items-center space-x-1.5">
                    <span>{msg.timestamp}</span>
                    {msg.source && <span>&bull; {msg.source}</span>}
                  </span>

                  {!isUser && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => readMessageAloud(msg.content)}
                        className="hover:text-purple-300 transition-colors p-1"
                        title="Read message aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(msg.id, msg.content)}
                        className="hover:text-purple-300 transition-colors p-1"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-slate-300 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>FloodCast AI is evaluating hydrology models and SOS telemetry...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input box */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-3 rounded-xl border text-xs transition-colors shrink-0 ${
              isListening
                ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={isListening ? 'Listening...' : 'Voice mic input'}
          >
            {isListening ? <Mic className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            placeholder="Ask FloodCast AI (e.g., 'Who is trapped in Majuli?', 'Status of Neamatighat gauge', 'SDRF boat capacity')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center space-x-1.5 transition-colors shadow-lg shadow-purple-600/30 disabled:opacity-50 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  );
};
