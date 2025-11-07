import React, { useEffect, useRef, useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import { Shield, Brain, Heart, BookOpen, Mail, Lock, LifeBuoy } from "lucide-react";
import { Wand2, KeyRound, CalendarSearch, BarChart3 } from "lucide-react";
import { MessageSquare, Send, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Tip bucket data — swap these with CMS/MDX or API later
const cyberTips = [
  {
    icon: <Lock className="w-6 h-6" />, 
    title: "Use strong, unique passwords",
    body: "Adopt a password manager and enable MFA everywhere you can.",
  },
  {
    icon: <Shield className="w-6 h-6" />, 
    title: "Keep software updated",
    body: "Turn on auto‑updates for OS, browser, and critical apps.",
  },
  {
    icon: <BookOpen className="w-6 h-6" />, 
    title: "Spot phishing",
    body: "Verify sender, hover links, and never share one‑time codes.",
  },
];

const wellnessTips = [
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Daily reset",
    body: "5‑minute box breathing or a short walk to decompress.",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Boundaries online",
    body: "Mute toxic feeds, set app limits, and prioritize sleep.",
  },
  {
    icon: <LifeBuoy className="w-6 h-6" />,
    title: "Know when to escalate",
    body: "Share crisis resources clearly; encourage seeking professional help.",
  },
];

// --- AI Chat Widget (client-side UI + safety guard) ---
function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Hi! I’m the CyberWellness AI guide. I can help with cybersecurity basics and digital wellbeing. I don’t provide medical or legal advice." },
  ]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages, open]);

  // very simple crisis keyword screen (client-side) — always route urgent help
  function looksLikeCrisis(text: string) {
    const t = text.toLowerCase();
    return /(suicide|kill myself|self-harm|self harm|hurt myself|ending my life)/.test(t);
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);

    // Safety-first: redirect crises to hotlines rather than the model
    if (looksLikeCrisis(text)) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I’m really sorry you’re feeling this way. I can’t help with situations like this, but you’re not alone. If you’re in the U.S., please call or text 988 (Suicide & Crisis Lifeline) right now, or dial 911 if you’re in immediate danger. If you’re outside the U.S., contact your local emergency number or a trusted person nearby.",
        },
      ]);
      return;
    }

    setSending(true);
    try {
      // Call your server route that talks to your LLM provider.
      // Create /app/api/ai/route.ts (Next.js) or /api/ai (Express) using the sample below.
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: `You are a helpful educator for cybersecurity and digital wellbeing. Be practical and concise.
- Do NOT provide medical or legal advice.
- If the user asks for diagnosis, treatment, or legal guidance, respond with a gentle disclaimer and encourage seeking a licensed professional.
- For mental health crises, recommend contacting local emergency services and in the U.S. the 988 Lifeline.
- Keep tone supportive, non-judgmental, and clear.`,
          messages,
          topic: "cybersecurity_and_wellness",
        }),
      });
      if (!res.ok) throw new Error("AI request failed");
      const json = await res.json();
      const reply = json.reply || "Sorry, I couldn’t generate a response.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I ran into a problem. Please try again in a moment." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Floating open button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 rounded-2xl bg-emerald-500 text-slate-900 px-4 py-3 shadow-lg hover:bg-emerald-400"
        aria-label="Open AI Assistant"
      >
        <div className="flex items-center gap-2"><MessageSquare className="w-5 h-5"/> Ask AI</div>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-6">
          <div className="w-full sm:max-w-xl rounded-2xl border border-slate-800 bg-slate-950 shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <div className="text-sm text-slate-300">CyberWellness AI (educational only)</div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-slate-800" aria-label="Close"><X className="w-5 h-5 text-slate-300"/></button>
            </div>

            <div ref={boxRef} className="px-4 py-3 space-y-3 max-h-[45vh] overflow-y-auto">
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                  <div className={`inline-block rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-emerald-600 text-slate-900' : 'bg-slate-900 text-slate-100 border border-slate-800'}`}>{m.content}</div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex items-center gap-2 p-3 border-t border-slate-800"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
                placeholder="Ask about phishing, passwords, burnout…"
                aria-label="Your message"
              />
              <button
                type="submit"
                disabled={sending}
                className="rounded-xl bg-emerald-500 text-slate-900 px-3 py-2 text-sm hover:bg-emerald-400 disabled:opacity-50"
              >
                <div className="flex items-center gap-1"><Send className="w-4 h-4"/>{sending ? 'Sending…' : 'Send'}</div>
              </button>
            </form>

            <div className="px-4 pb-3 text-[11px] text-slate-500">
              Educational use only. Not medical/legal advice. For crises, call local emergency services; U.S.: 988.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- AI Tool Components ---
function PhishingAnalyzer(){
  const [text, setText] = useState("");
  const [out, setOut] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function run(){
    if(!text.trim()) return;
    setLoading(true); setOut(null);
    try{
      const res = await fetch('/api/ai', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
        system: `You are a cybersecurity educator. Analyze messages for phishing red flags. Never click or fetch links. Never ask the user to open attachments. Output a short list of red flags and a risk rating (Low/Med/High).` ,
        messages: [{ role:'user', content: `Analyze this for phishing red flags. Respond in bullets with a final risk rating.

${text}` }],
        topic: 'phishing_analyzer'
      })});
      const json = await res.json();
      setOut(json.reply || 'No response.');
    }catch{ setOut('Something went wrong.'); }
    finally{ setLoading(false); }
  }
  return (
    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-center gap-2 text-slate-100"><Mail className="w-5 h-5 text-emerald-400"/><h3 className="text-lg font-medium">Phishing Analyzer</h3></div>
      <p className="text-sm text-slate-300 mt-1">Paste a suspicious email or DM (remove personal info). We’ll highlight red flags. We don’t open links.</p>
      <Textarea value={text} onChange={e=>setText(e.target.value)} className="mt-3 bg-slate-950 border-slate-800 min-h-[120px]" placeholder="Paste text here (no attachments or links will be opened)"/>
      <div className="mt-3 flex gap-3">
        <Button onClick={run} disabled={loading} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900">{loading?'Analyzing…':'Analyze'}</Button>
        <Button variant="outline" className="border-slate-700 text-slate-200" onClick={()=>setText('')}>Clear</Button>
      </div>
      {out && <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm whitespace-pre-wrap">{out}</div>}
    </div>
  );
}

function PasswordCoach(){
  const [sample, setSample] = useState("");
  const [score, setScore] = useState<{bits:number; label:string}>({bits:0, label:'Weak'});
  useEffect(()=>{
    // Simple entropy estimate (educational): bits ≈ log2(pool^length)
    const s = sample; const L = s.length; if(!L){ setScore({bits:0,label:'Weak'}); return; }
    let pool=0; if(/[a-z]/.test(s)) pool+=26; if(/[A-Z]/.test(s)) pool+=26; if(/[0-9]/.test(s)) pool+=10; if(/[^A-Za-z0-9]/.test(s)) pool+=33;
    const bits = Math.round(Math.log2(Math.max(pool,1)) * L);
    const label = bits<40?'Weak':bits<60?'OK':bits<80?'Strong':'Very strong';
    setScore({bits,label});
  },[sample]);
  return (
    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-center gap-2 text-slate-100"><KeyRound className="w-5 h-5 text-emerald-400"/><h3 className="text-lg font-medium">Password Strength Coach</h3></div>
      <p className="text-sm text-slate-300 mt-1">Type a <strong>sample</strong> structure (e.g., <code>HorseBattery!77</code>). Don’t use a real password.</p>
      <Input value={sample} onChange={e=>setSample(e.target.value)} className="mt-3 bg-slate-950 border-slate-800" placeholder="Sample passphrase (not your real one)"/>
      <div className="mt-2 text-sm text-slate-300">Entropy estimate: <span className="font-medium">{score.bits} bits</span> — {score.label}</div>
      <div className="mt-2 text-xs text-slate-400">Tip: Prefer long passphrases (4–5 random words). Use a password manager. Turn on MFA.</div>
    </div>
  );
}

function EventsQA(){
  const [q, setQ] = useState("");
  const [a, setA] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function ask(){
    if(!q.trim()) return; setLoading(true); setA(null);
    try{
      const eventsRes = await fetch('/api/events', { cache:'no-store' });
      const { events } = eventsRes.ok ? await eventsRes.json() : { events: [] };
      const context = JSON.stringify(events?.slice(0,20) || []);
      const res = await fetch('/api/ai', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
        system: `You answer questions about community events using ONLY the provided JSON context. If the answer is not in context, say you don't know.`,
        messages: [ { role:'system', content:`Context: ${context}` }, { role:'user', content:q } ],
        topic: 'events_qa'
      })});
      const json = await res.json(); setA(json.reply || 'No answer.');
    }catch{ setA('Something went wrong.'); }
    finally{ setLoading(false); }
  }
  return (
    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-center gap-2 text-slate-100"><CalendarSearch className="w-5 h-5 text-emerald-400"/><h3 className="text-lg font-medium">Events Q&A</h3></div>
      <p className="text-sm text-slate-300 mt-1">Ask about dates, locations, and formats for upcoming workshops (answers use site data only).</p>
      <div className="mt-3 flex gap-3">
        <Input value={q} onChange={e=>setQ(e.target.value)} className="flex-1 bg-slate-950 border-slate-800" placeholder="e.g., When is the next Phishing 101?"/>
        <Button onClick={ask} disabled={loading} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900">{loading?'Thinking…':'Ask'}</Button>
      </div>
      {a && <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm whitespace-pre-wrap">{a}</div>}
    </div>
  );
}

function AdminInsights(){
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function run(){
    setLoading(true); setSummary(null);
    try{
      // Demo: summarize common topics from recent on-page AI chat messages if available
      const log = (window as any).__cw_messages || [];
      const res = await fetch('/api/ai', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
        system: `You are an assistant that summarizes user questions to inform future lesson planning. Provide top 3 themes with suggested new lessons.`,
        messages: [{ role:'user', content: `Here are recent questions: ${JSON.stringify(log).slice(0,4000)}` }],
        topic: 'admin_insights'
      })});
      const json = await res.json(); setSummary(json.reply || 'No insights.');
    }catch{ setSummary('Something went wrong.'); }
    finally{ setLoading(false); }
  }
  return (
    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-center gap-2 text-slate-100"><BarChart3 className="w-5 h-5 text-emerald-400"/><h3 className="text-lg font-medium">Admin Insights (demo)</h3></div>
      <p className="text-sm text-slate-300 mt-1">Summarize common questions to plan new lessons. (Use server logs in production.)</p>
      <Button onClick={run} disabled={loading} className="mt-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900">{loading?'Summarizing…':'Generate insights'}</Button>
      {summary && <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm whitespace-pre-wrap">{summary}</div>}
    </div>
  );
}

export default function CyberWellnessLanding() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        {/* NAV */}
        <header className="sticky top-0 backdrop-blur bg-slate-950/40 border-b border-slate-800/50 z-50">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-400" />
              <span className="font-semibold">CyberWellness</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
              <a href="#learn" className="hover:text-white">Learn</a>
              <a href="#wellness" className="hover:text-white">Wellness</a>
              <a href="#workshops" className="hover:text-white">Workshops</a>
              <a href="#resources" className="hover:text-white">Resources</a>
              <a href="#ai" className="hover:text-white">AI Tools</a>
              <a href="#contact" className="hover:text-white">Contact</a>
            </nav>
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-900">Get Started</Button>
          </div>
        </header>

        {/* HERO */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <motion.h1
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6}}
                className="text-3xl md:text-5xl font-bold leading-tight"
              >
                Practical cybersecurity and mental wellness for everyone
              </motion.h1>
              <p className="mt-4 text-slate-300">
                Community‑driven lessons, checklists, and workshops that make
                staying safe online—and mentally resilient—simple and actionable.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-900">Start Learning</Button>
                <Button variant="outline" className="border-slate-700 text-slate-200">See Curriculum</Button>
              </div>
            </div>
            <motion.div
              initial={{opacity: 0, scale: 0.98}}
              animate={{opacity: 1, scale: 1}}
              transition={{duration: 0.6}}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl"
            >
              <div className="grid grid-cols-2 gap-4">
                {["Phishing 101","Passwords","MFA","Privacy","Burnout","Sleep"].map((t,i)=> (
                  <Card key={i} className="bg-slate-900/60 border-slate-800">
                    <CardContent className="p-4 text-center text-sm">{t}</CardContent>
                  </Card>
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-400">
                Built with accessibility first: semantic HTML, keyboard navigation,
                and high‑contrast design.
              </p>
            </motion.div>
          </div>
        </section>

        {/* CYBERSECURITY SECTION */}
        <section id="learn" className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2"><Shield className="w-6 h-6 text-emerald-400"/> Cybersecurity Basics</h2>
          <p className="mt-2 text-slate-300">Bite‑size modules you can teach in an hour or less—perfect for community sessions.</p>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cyberTips.map((t, i) => (
              <Card key={i} className="bg-slate-900/60 border-slate-800">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    {t.icon}
                    <h3 className="font-medium">{t.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{t.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* WELLNESS SECTION */}
        <section id="wellness" className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2"><Brain className="w-6 h-6 text-emerald-400"/> Mental Health & Digital Wellbeing</h2>
          <p className="mt-2 text-slate-300">Reduce online stress and support healthier habits with actionable micro‑practices.</p>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wellnessTips.map((t, i) => (
              <Card key={i} className="bg-slate-900/60 border-slate-800">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    {t.icon}
                    <h3 className="font-medium">{t.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{t.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Crisis banner (non‑diagnostic, non‑medical, informational) */}
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-300">
              If you or someone you know is in immediate danger, call local emergency services. In the U.S., dial <strong>911</strong>. For mental health crises, call or text <strong>988</strong> (Suicide & Crisis Lifeline).
            </p>
          </div>
        </section>

        {/* WORKSHOPS */}
        <section id="workshops" className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2"><BookOpen className="w-6 h-6 text-emerald-400"/> Free Workshops</h2>
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-900/60 border-slate-800">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium">Phishing 101: Spot the Red Flags</h3>
                <p className="mt-2 text-sm text-slate-300">Hands‑on patterns, live examples, and a community quiz.</p>
                <Button className="mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900">Enroll</Button>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-slate-800">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium">Digital Boundaries & Burnout</h3>
                <p className="mt-2 text-sm text-slate-300">Create tech‑life boundaries and a weekly reset ritual.</p>
                <Button className="mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900">Enroll</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* RESOURCES */}
        <section id="resources" className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2"><BookOpen className="w-6 h-6 text-emerald-400"/> Starter Resources</h2>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Password manager picks","Browser privacy setup","Community presentation deck","Printable checklists","Local support directory","Student edition"].map((t, i) => (
              <Card key={i} className="bg-slate-900/60 border-slate-800">
                <CardContent className="p-5 flex flex-col gap-2">
                  <h3 className="font-medium">{t}</h3>
                  <Button variant="outline" className="w-fit border-slate-700 text-slate-200">Open</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* AI TOOLS */}
        <section id="ai" className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2"><Wand2 className="w-6 h-6 text-emerald-400"/> AI Tools</h2>
          <p className="mt-2 text-slate-300">These assistants keep content educational (no medical/legal advice) and never click links. Crisis queries are redirected to 988/local services.</p>

          {/* 1) Lesson Helper */}
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center gap-2 text-slate-100"><Wand2 className="w-5 h-5 text-emerald-400"/><h3 className="text-lg font-medium">Lesson Helper</h3></div>
            <p className="text-sm text-slate-300 mt-1">Ask for a simpler explanation or a quick quiz while reading lessons.</p>
            <div className="mt-3 flex gap-3">
              <Button onClick={()=>document.location.assign('/lessons/phishing-101')} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900">Open Phishing 101</Button>
              <Button variant="outline" className="border-slate-700 text-slate-200" onClick={()=>window.alert('Lesson Helper is enabled on lesson pages via the same /api/ai route.')}>How it works</Button>
            </div>
          </div>

          {/* 2) Phishing Analyzer */}
          <PhishingAnalyzer />

          {/* 3) Password Strength Coach */}
          <PasswordCoach />

          {/* 4) Events Q&A (RAG-lite) */}
          <EventsQA />

          {/* 5) Admin Insights (demo) */}
          <AdminInsights />
        </section>

        {/* CONTACT */}
        <section id="contact" className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2"><Mail className="w-6 h-6 text-emerald-400"/> Stay in the loop</h2>
            <p className="mt-2 text-slate-300">Subscribe for free lessons and community events. (No spam, unsubscribe anytime.)</p>
            <form className="mt-6 grid md:grid-cols-3 gap-3">
              <Input type="email" placeholder="you@example.org" className="bg-slate-950 border-slate-800"/>
              <Input type="text" placeholder="Your city (for local events)" className="bg-slate-950 border-slate-800"/>
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-slate-900">Subscribe</Button>
            </form>

            <div className="mt-6">
              <h3 className="text-lg font-medium">Have a question or want a workshop?</h3>
              <form className="mt-3 grid gap-3">
                <Input type="text" placeholder="Subject" className="bg-slate-950 border-slate-800"/>
                <Textarea placeholder="Tell us what your community needs (e.g., phishing training, privacy setup, burnout)." className="bg-slate-950 border-slate-800 min-h-[120px]"/>
                <Button className="w-fit bg-emerald-500 hover:bg-emerald-400 text-slate-900">Send</Button>
              </form>
            </div>
          </div>
        </section>

        {/* AI Widget mount */}
        <ChatWidget />

        {/* FOOTER */}
        <footer className="border-t border-slate-800/60 py-10 text-sm text-slate-400">
          <div className="mx-auto max-w-6xl px-4 grid md:grid-cols-2 gap-4">
            <p>
              © {new Date().getFullYear()} CyberWellness. Educational information only — not medical or legal advice.
            </p>
            <div className="flex gap-6 md:justify-end">
              <a href="#" className="hover:text-slate-200">Privacy</a>
              <a href="#" className="hover:text-slate-200">Terms</a>
              <a href="#" className="hover:text-slate-200">Accessibility</a>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
