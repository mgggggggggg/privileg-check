import React, { useEffect, useMemo, useState } from "react";

// Privileg‑Check – v1.6 (React + Tailwind)
// • Stabile Personen‑ID (pc_person_id) → gleicher Browser/Tabs updaten denselben Punkt
// • Rate‑Limit: max. 10 Updates/Minute (lokal, pro Browser)
// • Nach Speichern: Scroll zur Grafik + Punkt sofort aktualisiert
// • Eigener Punkt: orange (#f59e0b) + größerer goldgelber Ring (#FFD54A)
// • Pastell‑Buttons: Nein (links, rose‑200) | Ja (rechts, emerald‑200)
// • Teilnehmerzahl links über der Grafik
// • Detail‑Overlay: links Nein, rechts Ja; Labels „x Nein“ / „y Ja“ nur falls > 0
// • Veröffentlichung: startet mit 0 Teilnahmen (kein Demo-Seed)

const DEMO_KEY = "pc_demo_submissions_v1";
const RATE_KEY = "pc_rate"; // für Rate‑Limit (10/min)

function loadDemo() {
  try { return JSON.parse(localStorage.getItem(DEMO_KEY) || "[]"); } catch { return []; }
}
function saveDemo(list) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(list));
}

function getRateWindow(windowMs = 60000) {
  try {
    const now = Date.now();
    const arr = JSON.parse(localStorage.getItem(RATE_KEY) || "[]");
    const pruned = arr.filter((t) => now - t < windowMs);
    if (pruned.length !== arr.length) localStorage.setItem(RATE_KEY, JSON.stringify(pruned));
    return pruned;
  } catch { return []; }
}
function canSubmitNow(limit = 10, windowMs = 60000) {
  return getRateWindow(windowMs).length < limit;
}
function recordSubmit(windowMs = 60000) {
  const arr = getRateWindow(windowMs);
  arr.push(Date.now());
  localStorage.setItem(RATE_KEY, JSON.stringify(arr));
}

const QUESTIONS = [
  { id: 1, de: "Ich konnte als Kind in einem ruhigen Zimmer mit einem eigenen Schreibtisch lernen.", en: "As a child, I had a quiet room with my own desk to study." },
  { id: 2, de: "Meine Eltern konnten mir bei Hausaufgaben helfen oder jemanden dafür bezahlen.", en: "My parents could help with homework or pay someone to do so." },
  { id: 3, de: "Ich wurde in der Schule ermutigt, später zu studieren.", en: "At school I was encouraged to go to university." },
  { id: 4, de: "Wir mussten uns zu Hause keine Sorgen machen, ob am Monatsende genug Geld für Essen oder Kleidung da ist.", en: "At home we didn't worry about having enough money for food or clothing at month-end." },
  { id: 5, de: "Ich konnte an Klassenfahrten oder Ausflügen teilnehmen, ohne dass es am Geld gescheitert ist.", en: "I could join school trips without money being a blocker." },
  { id: 6, de: "Ich hatte zuhause Heizung, fließendes Wasser und funktionierendes Internet.", en: "I had heating, running water and reliable internet at home." },
  { id: 7, de: "Ich wurde selten oder nie gefragt: „Wo kommst du wirklich her?“", en: "I was rarely or never asked: 'Where are you really from?'" },
  { id: 8, de: "Ich kann öffentlich Händchen halten mit der Person, die ich liebe, ohne mir Sorgen zu machen.", en: "I can hold hands in public with the person I love without worry." },
  { id: 9, de: "Ich habe noch nie eine unangenehme Reaktion erhalten, wenn ich über meinen Glauben gesprochen habe.", en: "I have never received unpleasant reactions when speaking about my faith." },
  { id: 10, de: "Ich sehe regelmäßig Menschen im Fernsehen oder in den sozialen Medien, die so aussehen oder sprechen wie ich.", en: "I regularly see people on TV/social media who look or speak like me." },
  { id: 11, de: "Ich werde bei Ärzt*innen oder in Kliniken ernst genommen, wenn ich über meine Beschwerden spreche.", en: "Doctors/clinics take me seriously when I report symptoms." },
  { id: 12, de: "Mein Name wird meistens richtig ausgesprochen – ohne komische Kommentare.", en: "People usually pronounce my name correctly without odd remarks." },
  { id: 13, de: "Ich werde in Geschäften, bei der Polizei oder in Behörden freundlich behandelt.", en: "I am treated politely in shops, by police or public offices." },
  { id: 14, de: "Ich musste noch nie, bevor ich das erste Mal an einen neuen Ort gehe, nachschauen, ob es dort einen Aufzug oder barrierefreien Zugang gibt.", en: "I never had to check for elevators or step-free access before going somewhere new." },
  { id: 15, de: "Ich musste mir noch nie anhören, wie ich aussehe oder wie mein Körper „besser“ aussehen könnte.", en: "I haven't had to hear how I look or how my body 'should' look." },
  { id: 16, de: "Ich habe noch nie Diskriminierung wegen meiner sexuellen Orientierung erlebt.", en: "I have never experienced discrimination due to sexual orientation." },
  { id: 17, de: "Ich musste nie neben Schule oder Studium arbeiten, um meine Familie finanziell zu unterstützen.", en: "I never had to work alongside school/university to support my family." },
  { id: 18, de: "Ich finde Kleidung in meiner Größe und meinem Stil, ohne lange suchen zu müssen.", en: "I can find clothing in my size and style without searching long." },
  { id: 19, de: "Ich wurde noch nie grundlos von der Polizei kontrolliert oder schief angeschaut.", en: "I have never been stopped or eyed by police without reason." },
  { id: 20, de: "Ich kann offen über meine Identität oder meine Meinung sprechen, ohne Angst vor Ablehnung.", en: "I can speak openly about my identity or opinions without fear of rejection." },
  { id: 21, de: "Ich hatte noch nie Angst davor, dass ich die Stelle nicht bekomme, sobald der Chef im Bewerbungsgespräch sieht, wie ich aussehe.", en: "I never feared losing a job chance because of how I look when seen by the interviewer." },
  { id: 22, de: "Ich kann mich alleine durch die Stadt oder nachts auf dem Heimweg sicher fühlen.", en: "I can feel safe alone in the city or at night on my way home." },
  { id: 23, de: "Ich konnte in meiner Freizeit ohne Barrieren an Sport oder Hobbys teilnehmen.", en: "I could join sports/hobbies in my free time without barriers." },
  { id: 24, de: "Ich musste mir vor dem Studium oder der Ausbildung keine Sorgen machen, wie ich das finanziere.", en: "Before university/vocational training, funding it wasn't a concern." },
  { id: 25, de: "Ich kenne Menschen, die mir bei beruflichen oder privaten Problemen weiterhelfen können.", en: "I know people who can help me with professional or private issues." },
];

export default function App() {
  const [lang, setLang] = useState("de");
  const [answers, setAnswers] = useState(Array(25).fill(null)); // neutral
  const [submissions, setSubmissions] = useState([]);
  const [justSubmittedId, setJustSubmittedId] = useState(null);
  const [hp, setHp] = useState(""); // Honeypot
  const [showDetails, setShowDetails] = useState(false);

  // Stabile Personen‑ID je Browser
  useEffect(() => {
    if (!localStorage.getItem("pc_person_id")) {
      localStorage.setItem("pc_person_id", crypto.randomUUID());
    }
  }, []);

// Demo-Datenset für Präsentation: 50 Teilnahmen, Score 15–23 + 1–2 Ausreißer bei 10
useEffect(() => {
  const demo = [];

  // 48 „normale“ Teilnehmer mit Score zwischen 15 und 23
  for (let i = 0; i < 48; i++) {
    const score = Math.floor(15 + Math.random() * 9); // 15..23
    const answers = Array.from({ length: 25 }, (_, idx) => idx < score);
    // Antworten mischen, damit die "Nein"-Antworten nicht nur am Ende stehen
    for (let j = answers.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [answers[j], answers[k]] = [answers[k], answers[j]];
    }
    demo.push({ id: crypto.randomUUID(), score, answers });
  }

  // 2 Ausreißer mit Score um 10
  for (let i = 0; i < 2; i++) {
    const score = 10;
    const answers = Array.from({ length: 25 }, (_, idx) => idx < score);
    for (let j = answers.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [answers[j], answers[k]] = [answers[k], answers[j]];
    }
    demo.push({ id: crypto.randomUUID(), score, answers });
  }

  localStorage.setItem(DEMO_KEY, JSON.stringify(demo));
  localStorage.removeItem(RATE_KEY);
  setSubmissions(demo);

  if (!localStorage.getItem("pc_person_id")) {
    localStorage.setItem("pc_person_id", crypto.randomUUID());
  }
  setJustSubmittedId(localStorage.getItem("pc_person_id"));
}, []);

  // Cross‑Tab Sync
  useEffect(() => {
    function onStorage(e) {
      if (e.key === DEMO_KEY) {
        setSubmissions(loadDemo());
        setJustSubmittedId(localStorage.getItem("pc_person_id"));
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isComplete = useMemo(() => answers.every(v => v !== null), [answers]);

  // Runtime‑Checks
  useEffect(() => {
    console.assert(QUESTIONS.length === 25, "QUESTIONS muss 25 Einträge haben");
    const bad = submissions.filter(s => !Array.isArray(s.answers) || s.answers.length !== 25 || s.score !== s.answers.filter(Boolean).length);
    console.assert(bad.length === 0, "Ungültige Datensätze gefunden", bad);
  }, [submissions]);

  function submit() {
    if (hp.trim() !== "") return; // Bot?
    if (!isComplete) return;
    if (!canSubmitNow(10, 60000)) {
      alert(lang === 'de' ? 'Limit erreicht: Max. 10 Aktualisierungen pro Minute.' : 'Rate limit: max 10 updates per minute.');
      return;
    }

    const personId = localStorage.getItem("pc_person_id");
    const existing = loadDemo();
    const payload = { id: personId, score: answers.filter(Boolean).length, answers: answers.map(Boolean) };
    const idx = existing.findIndex(s => s.id === personId);
    if (idx >= 0) existing[idx] = payload; else existing.push(payload);
    saveDemo(existing);
    recordSubmit(60000);
    setSubmissions(existing); // sofortiges Re‑Render
    setJustSubmittedId(personId);

    // Scroll zur Grafik
    const el = document.getElementById("chart-section");
    if (el) el.scrollIntoView({ behavior: "smooth" }); else window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen text-stone-800 bg-stone-50">
      <header className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Privileg‑Check (Kamine 13.8.2025)</h1>
        <LangSwitch lang={lang} setLang={setLang} />
      </header>

      <main className="max-w-4xl mx-auto px-4 pb-24">
        {/* Grafik */}
        <section id="chart-section" className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm mb-6">
          <ChartDistribution
            submissions={submissions}
            justSubmittedId={justSubmittedId}
            total={submissions.length}
            leftLabel={lang === 'de' ? 'Weniger Privilegien' : 'Fewer privileges'}
            rightLabel={lang === 'de' ? 'Mehr Privilegien' : 'More privileges'}
          />
          <div className="mt-4">
            <button onClick={() => setShowDetails(true)} className="text-sm underline">
              {lang === 'de' ? 'Detailauswertung anzeigen' : 'Show details'}
            </button>
          </div>
        </section>

        {/* Fragen */}
        <section className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-3">{lang === 'de' ? 'Hier kannst du selbst an der Übung teilnehmen' : 'Here you can take part in the exercise yourself'}</h2>
          <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); submit(); }}>
            <label className="hidden" aria-hidden>
              {lang === 'de' ? 'Lass dieses Feld leer' : 'Leave this field empty'}<input value={hp} onChange={(e) => setHp(e.target.value)} />
            </label>

            {QUESTIONS.map((q, idx) => (
              <div key={q.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-stone-100 pb-3">
                <div className="text-sm leading-snug">{lang === "de" ? q.de : q.en}</div>
                <div className="flex gap-2 justify-start sm:justify-end mt-2 sm:mt-0">
                  <Toggle
                    kind="no"
                    pressed={answers[idx] === false}
                    onPress={() => setAnswers((a) => a.map((v, i) => (i === idx ? false : v)))}
                  >{lang === 'de' ? 'Nein' : 'No'}</Toggle>
                  <Toggle
                    kind="yes"
                    pressed={answers[idx] === true}
                    onPress={() => setAnswers((a) => a.map((v, i) => (i === idx ? true : v)))}
                  >{lang === 'de' ? 'Ja' : 'Yes'}</Toggle>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-end mt-4">
              <button
                type="submit"
                className="bg-amber-600 text-white px-4 py-2 rounded-xl ring-1 ring-amber-600 ring-offset-1 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={lang === 'de' ? 'Ergebnis speichern' : 'Save result'}
                disabled={!isComplete}
                title={!isComplete ? (lang === 'de' ? 'Bitte alle Fragen beantworten' : 'Please answer all questions') : ''}
              >{lang === 'de' ? 'Ergebnis speichern' : 'Save result'}</button>
            </div>
          </form>
        </section>
      </main>

      {showDetails && (
        <DetailsModal lang={lang} perQuestion={aggregatePerQuestion(submissions)} onClose={() => setShowDetails(false)} />
      )}
    </div>
  );
}

function LangSwitch({ lang, setLang }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-stone-500">{lang === "de" ? "Sprache" : "Language"}</span>
      <div className="inline-flex rounded-xl border border-stone-200 overflow-hidden">
        <button onClick={() => setLang("de")} className={`px-3 py-1 text-sm ${lang === "de" ? "bg-stone-200" : "bg-white"}`}>DE</button>
        <button onClick={() => setLang("en")} className={`px-3 py-1 text-sm ${lang === "en" ? "bg-stone-200" : "bg-white"}`}>EN</button>
      </div>
    </div>
  );
}

function Toggle({ pressed, onPress, children, kind }) {
  // Pastellfarben: Ja = Grün, Nein = Rot; neutral = Weiß
  const active = pressed
    ? (kind === 'yes' ? 'bg-emerald-200 border-emerald-300 text-emerald-900' : 'bg-rose-200 border-rose-300 text-rose-900')
    : 'bg-white border-stone-300 text-stone-800';
  return (
    <button type="button" onClick={onPress} className={`px-3 py-1 rounded-lg border ${active}`} aria-pressed={pressed}>{children}</button>
  );
}

function aggregatePerQuestion(submissions) {
  const arr = Array.from({ length: 25 }, () => ({ yes: 0, no: 0 }));
  submissions.forEach(s => (s.answers || []).forEach((v, i) => { if (v) arr[i].yes++; else arr[i].no++; }));
  return arr;
}

function ChartDistribution({ submissions, justSubmittedId, total, leftLabel, rightLabel }) {
  const width = 860, height = 220, pad = 40;
  const xScale = (v) => pad + (v / 25) * (width - pad * 2);
  const yScale = (v) => height / 2 - v * 8;
  const points = submissions.map((s, idx) => ({ x: s.score, y: (idx % 9) - 4, self: s.id === justSubmittedId }));

  return (
    <div>
      {/* Teilnehmerzahl links ÜBER der Grafik */}
      <div className="mb-2 text-sm text-stone-600">
        <span>{leftLabel === 'Weniger Privilegien' ? 'Teilnahmen insgesamt' : 'Total participations'}: </span>
        <b className="text-stone-800">{total}</b>
      </div>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Achse */}
          <line x1={pad} x2={width - pad} y1={height - pad} y2={height - pad} stroke="#e7e5e4" strokeWidth={2} />
          {/* Pastell‑Verlauf unten: rot → grün */}
          <defs>
            <linearGradient id="pcg" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#fecaca" />
              <stop offset="100%" stopColor="#bbf7d0" />
            </linearGradient>
          </defs>
          <rect x={pad} y={height - pad + 8} width={width - pad * 2} height={8} fill="url(#pcg)" rx={4} />

          {/* Ticks + Zahlen */}
          {Array.from({ length: 26 }, (_, i) => (
            <g key={i}>
              <line x1={xScale(i)} x2={xScale(i)} y1={height - pad} y2={height - pad + 6} stroke="#d6d3d1" />
              {i % 5 === 0 && (
                <text x={xScale(i)} y={height - pad - 6} textAnchor="middle" fontSize={11} fill="#78716c">{i}</text>
              )}
            </g>
          ))}

          {/* Punkte */}
          {points.map((p, i) => (
            <g key={i}>
              {/* alle Punkte gleich groß */}
              <circle cx={xScale(p.x)} cy={yScale(p.y)} r={4} fill={p.self ? "#f59e0b" : "#a8a29e"} opacity={0.95} />
              {/* eigener Punkt mit größerem goldgelben Ring */}
              {p.self && (
                <circle cx={xScale(p.x)} cy={yScale(p.y)} r={9} fill="transparent" stroke="#FFD54A" strokeWidth={3} />
              )}
            </g>
          ))}

          {/* Links/Rechts Labels */}
          <text x={pad} y={height - pad - 26} fontSize={12} fill="#57534e" textAnchor="start">{leftLabel}</text>
          <text x={width - pad} y={height - pad - 26} fontSize={12} fill="#57534e" textAnchor="end">{rightLabel}</text>

          {/* 0/25 */}
          <text x={pad} y={height - pad + 32} fontSize={11} fill="#78716c" textAnchor="start">0</text>
          <text x={width - pad} y={height - pad + 32} fontSize={11} fill="#78716c" textAnchor="end">25</text>
        </svg>
      </div>
    </div>
  );
}

function DetailsModal({ lang, perQuestion, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg max-w-3xl w-full max-h-[80vh] overflow-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{lang === 'de' ? 'Detailauswertung' : 'Detailed results'}</h3>
          <button onClick={onClose} className="text-sm underline">{lang === 'de' ? 'Schließen' : 'Close'}</button>
        </div>
        <div className="space-y-3">
          {perQuestion.map((pq, i) => {
            const total = pq.yes + pq.no;
            const leftPct = total ? (pq.no / total) * 100 : 0; // LINKS: Nein
            const rightPct = 100 - leftPct; // RECHTS: Ja
            return (
              <div key={i}>
                <div className="text-xs mb-1">{lang === 'de' ? QUESTIONS[i].de : QUESTIONS[i].en}</div>
                <div className="flex w-full h-6 rounded overflow-hidden border border-stone-200">
                  <div className="bg-rose-200 text-rose-900 text-xs flex items-center justify-start px-2" style={{ width: `${leftPct}%` }}>{pq.no > 0 ? `${pq.no} ${lang === 'de' ? 'Nein' : 'No'}` : ''}</div>
                  <div className="bg-emerald-200 text-emerald-900 text-xs flex items-center justify-end px-2" style={{ width: `${rightPct}%` }}>{pq.yes > 0 ? `${pq.yes} ${lang === 'de' ? 'Ja' : 'Yes'}` : ''}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
