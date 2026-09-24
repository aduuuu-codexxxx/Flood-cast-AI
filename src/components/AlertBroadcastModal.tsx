import React, { useState } from 'react';
import { 
  X, 
  Send, 
  PhoneCall, 
  Radio, 
  CheckCircle2, 
  ShieldAlert, 
  Copy, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface AlertBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcastSuccess: (details: { district: string; message: string; mode: string }) => void;
  onSwitchToReceiver: () => void;
}

export const AlertBroadcastModal: React.FC<AlertBroadcastModalProps> = ({
  isOpen,
  onClose,
  onBroadcastSuccess,
  onSwitchToReceiver,
}) => {
  const [district, setDistrict] = useState('Majuli');
  const [severity, setSeverity] = useState<'CRITICAL' | 'WARNING'>('CRITICAL');
  const [mode, setMode] = useState<'both' | 'sms' | 'voice'>('both');
  const [language, setLanguage] = useState<'en' | 'as' | 'bn' | 'hi'>('en');
  const [sent, setSent] = useState(false);

  const getTemplateMessage = () => {
    if (language === 'as') {
      return `[জরুৰী সতৰ্কবাণী - FloodCast AI] ${district} জিলাত ব্ৰহ্মপুত্ৰৰ পানী বিপদসীমাৰ ওপৰেৰে বৈছে। ঘৰ বা চালত আৱদ্ধ হ'লে তলৰ লিংকত ক্লিক কৰি আপোনাৰ লাইভ অৱস্থান শ্বেয়াৰ কৰক যাতে NDRF নাওঁ প্ৰেৰণ কৰিব পৰা যায়: https://floodcast.ai/sos?dist=${district}`;
    }
    if (language === 'bn') {
      return `[জরুরী সতর্কতা - FloodCast AI] ${district} জেলায় নদীর জল বিপদসীমার উপরে। আপনি বা আপনার পরিবার আটকে থাকলে উদ্ধারকারী নৌকার জন্য আপনার লাইভ লোকেশন শেয়ার করুন: https://floodcast.ai/sos?dist=${district}`;
    }
    if (language === 'hi') {
      return `[आपातकालीन चेतावनी - FloodCast AI] ${district} में बाढ़ का जलस्तर खतरे के निशान से ऊपर है। अगर आप पानी में फंसे हैं, तो बचाव नाव के लिए तुरंत अपनी लाइव लोकेशन साझा करें: https://floodcast.ai/sos?dist=${district}`;
    }
    return `[EMERGENCY FLOOD ALERT - FloodCast AI] Severe surge alert for ${district}. River gauges exceeded Danger Level. If trapped or requiring boat evacuation, tap to share your LIVE GPS location immediately: https://floodcast.ai/sos?dist=${district}`;
  };

  const [customMessage, setCustomMessage] = useState(getTemplateMessage());

  // Update when language or district changes
  React.useEffect(() => {
    setCustomMessage(getTemplateMessage());
  }, [district, language]);

  if (!isOpen) return null;

  const handleBroadcast = () => {
    setSent(true);
    setTimeout(() => {
      onBroadcastSuccess({
        district,
        message: customMessage,
        mode,
      });
      setSent(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/30 text-red-400 flex items-center justify-center border border-red-500/50">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Emergency Broadcast Transmission</h3>
              <p className="text-[11px] text-slate-400">FloodCast AI Multi-Channel Siren & SMS Hub</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Target District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-red-500"
            >
              <option value="Majuli">Majuli (Island & Riverbanks)</option>
              <option value="Dhemaji">Dhemaji (Subansiri Corridor)</option>
              <option value="Barpeta">Barpeta (Beki Plains)</option>
              <option value="Morigaon">Morigaon (Kopili Confluence)</option>
              <option value="Cachar">Cachar (Silchar / Barak Valley)</option>
              <option value="Dhubri">Dhubri (Downstream Basin)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-red-500"
            >
              <option value="en">English (Universal)</option>
              <option value="as">অসমীয়া (Assamese)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-400 font-semibold text-xs mb-1">
            Broadcast Payload (Includes Citizen Live GPS Sharing Link)
          </label>
          <textarea
            rows={4}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl p-3 text-xs focus:outline-none focus:border-cyan-500 leading-relaxed"
          />
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Recipients will open this link on their mobile to share live GPS location.
          </span>
          <button
            onClick={() => {
              onClose();
              onSwitchToReceiver();
            }}
            className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
          >
            <span>Preview Receiver View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="pt-2 flex items-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleBroadcast}
            disabled={sent}
            className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {sent ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>TRANSMITTED TO 48,200 PHONES</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>TRANSMIT FLOOD WARNING</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
