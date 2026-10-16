import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Shield, FileText, Trash2, Globe, Sparkles } from 'lucide-react';

export const PlayConsoleLegalPage: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const links = [
    {
      id: 'privacy',
      title: 'Google Play Privacy Policy URL',
      badge: 'Play Console Mandatory',
      url: 'https://farmx.acheva.in/privacy.html',
      anchorUrl: 'https://farmx.acheva.in/legal/#privacy',
      desc: 'Discloses foreground & background location usage, Firebase telemetry, phone number masking, and zero ad-tracking.'
    },
    {
      id: 'terms',
      title: 'Terms of Service URL',
      badge: 'Service Agreement',
      url: 'https://farmx.acheva.in/terms.html',
      anchorUrl: 'https://farmx.acheva.in/legal/#terms',
      desc: 'Women-only transit community rules, transparent 85% captain payouts, OTP trip start, and cancellation policy.'
    },
    {
      id: 'delete',
      title: 'Google Play Data Deletion Request URL',
      badge: 'Data Safety Mandatory',
      url: 'https://farmx.acheva.in/delete-account.html',
      anchorUrl: 'https://farmx.acheva.in/legal/#delete-account',
      desc: 'Mandatory Play Store link enabling passengers and captains to request complete profile & telemetry purge.'
    },
    {
      id: 'portal',
      title: 'Master Single-Page Compliance Portal',
      badge: 'All-in-One Site',
      url: 'https://farmx.acheva.in/legal/',
      anchorUrl: 'https://farmx.acheva.in/legal/',
      desc: 'Complete responsive single-page portal with Lady Pilot hero visual, fleet showcase, and interactive forms.'
    }
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-purple-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Google Play Console Compliance Suite
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Play Console Legal & Static Compliance Site
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-3xl">
            Official public URLs for Google Play Store Data Safety, Privacy Policy declarations, and User Account Deletion. Copy these verified URLs directly into your Google Play Console app release forms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://farmx.acheva.in/legal/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition shadow-sm"
          >
            <Globe className="w-4 h-4" />
            Open Live Static Site
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Play Console Copyable Link Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-purple-100/80 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/50">
                  {item.badge}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  200 OK Live
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">{item.desc}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <code className="text-xs font-mono text-purple-800 bg-purple-50/60 px-2.5 py-1.5 rounded-lg truncate flex-1 border border-purple-100">
                {item.url}
              </code>
              <button
                onClick={() => handleCopy(item.url, item.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 text-xs font-semibold transition"
                title="Copy URL"
              >
                {copiedKey === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Static Site IFrame Preview */}
      <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
        <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
            <span className="text-xs font-mono text-slate-300 ml-2">
              https://farmx.acheva.in/legal/
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://farmx.acheva.in/legal/#privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-300 hover:text-white transition"
            >
              #privacy
            </a>
            <a
              href="https://farmx.acheva.in/legal/#terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-300 hover:text-white transition"
            >
              #terms
            </a>
            <a
              href="https://farmx.acheva.in/legal/#delete-account"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-rose-300 hover:text-white transition"
            >
              #delete-account
            </a>
          </div>
        </div>

        <div className="w-full h-[680px] bg-slate-950">
          <iframe
            src="legal.html"
            title="Lady Pilot Play Console Legal Portal"
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
};
export default PlayConsoleLegalPage;
