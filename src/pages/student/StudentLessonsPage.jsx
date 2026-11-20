import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock3, FileText, PlayCircle, StickyNote, X } from "lucide-react";
import api from "../../services/api";

function getYouTubeId(value) {
  try {
    const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let id = "";
    if (host === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] || "";
    else if (["youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com"].includes(host) || host.endsWith(".youtube.com")) {
      if (url.pathname === "/watch") id = url.searchParams.get("v") || "";
      else id = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?]+)/)?.[1] || "";
    }
    if (!id && /^[\w-]{11}$/.test(value.trim())) id = value.trim();
    return /^[\w-]{11}$/.test(id) ? id : "";
  } catch { return ""; }
}

export default function StudentLessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState("ALL");
  const [notes, setNotes] = useState({});
  const [noteStatus, setNoteStatus] = useState({});
  const [pdfOpening, setPdfOpening] = useState({});
  const [activeLesson, setActiveLesson] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { api.get("/subjects").then((r) => setSubjects(r.data)).catch(() => {}); }, []);
  useEffect(() => {
    api.get("/lessons", { params: { subject } })
      .then((r) => { setLessons(r.data); setError(""); })
      .catch((e) => setError(e.response?.data?.message || "Could not load lessons."));
  }, [subject]);
  useEffect(() => {
    if (!lessons.length) { setNotes({}); return; }
    api.get("/lessons/notes", { params: { lessonIds: lessons.map((lesson) => lesson._id).join(",") } })
      .then((r) => setNotes(Object.fromEntries(r.data.map((item) => [item.lessonId, item.note]))))
      .catch(() => {});
  }, [lessons]);
  useEffect(() => {
    if (!activeLesson) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => { if (event.key === "Escape") setActiveLesson(null); };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeLesson]);

  async function saveNote(lessonId, note) {
    setNoteStatus((old) => ({ ...old, [lessonId]: "Saving…" }));
    try {
      const { data } = await api.put(`/lessons/${lessonId}/note`, { note });
      setNotes((old) => ({ ...old, [lessonId]: data.note }));
      setNoteStatus((old) => ({ ...old, [lessonId]: "Saved" }));
    } catch (e) { setNoteStatus((old) => ({ ...old, [lessonId]: e.response?.data?.message || "Could not save note." })); }
  }

  async function openPdf(lessonId) {
    const tab = window.open("about:blank", "_blank");
    if (!tab) { setError("Allow pop-ups to open the lecture PDF."); return; }
    tab.opener = null;
    setPdfOpening((old) => ({ ...old, [lessonId]: true }));
    try {
      const { data } = await api.get(`/lessons/${lessonId}/pdf`);
      tab.location.href = data.url;
    } catch (e) {
      tab.close(); setError(e.response?.data?.message || "Could not retrieve the lecture PDF.");
    } finally { setPdfOpening((old) => ({ ...old, [lessonId]: false })); }
  }

  return <>
    <main className="min-h-screen bg-slate-50 px-4 pb-12 pt-[5mm] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link to="/student" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft size={16}/>Dashboard</Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm font-bold uppercase tracking-[.18em] text-indigo-700">Learning library</p><h1 className="mt-2 text-3xl font-black text-slate-900">Lecture videos</h1><p className="mt-2 text-slate-600">Learn each concept at your own pace, then put it into practice.</p></div>
          <select value={subject} onChange={(e)=>setSubject(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold"><option value="ALL">All subjects</option>{subjects.map((s)=><option key={s._id} value={s.subjectName}>{s.subjectName}</option>)}</select>
        </div>
        {error&&<p className="mt-6 rounded-xl bg-rose-50 p-4 text-rose-700">{error}</p>}
        {lessons.length ? <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson)=>{
            const youtubeId=getYouTubeId(lesson.videoUrl);
            return <article key={lesson._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {youtubeId ? <button type="button" onClick={()=>setActiveLesson(lesson)} aria-label={`Play ${lesson.title}`} className="group relative block aspect-video w-full overflow-hidden bg-slate-900 text-white"><img src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105"/><span className="absolute inset-0 bg-slate-950/25 transition group-hover:bg-slate-950/40"/><span className="absolute inset-0 flex items-center justify-center"><PlayCircle size={62} className="drop-shadow-lg transition group-hover:scale-110"/></span></button> : <div className="flex aspect-video items-center justify-center bg-slate-100 p-6 text-center text-sm text-slate-600"><div><PlayCircle size={36} className="mx-auto mb-2 text-slate-400"/><p>This video link can’t be embedded here.</p><p className="mt-1 text-xs">Ask the instructor to add a YouTube video URL with embedding enabled.</p></div></div>}
              <div className="p-5">
                <div className="text-xs font-bold uppercase tracking-wide text-indigo-700">{lesson.subject}{lesson.topic?` · ${lesson.topic}`:""}</div>
                <h2 className="mt-2 text-xl font-bold text-slate-900">{lesson.title}</h2>
                {lesson.description&&<details className="mt-2 rounded-lg border border-slate-200"><summary className="cursor-pointer px-3 py-2 text-sm font-bold text-slate-700">Summary</summary><p className="whitespace-pre-wrap px-3 pb-3 text-sm leading-6 text-slate-600">{lesson.description}</p></details>}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-sm text-slate-500">{lesson.duration&&<><Clock3 size={14}/>{lesson.duration}</>}</span>
                  <div className="flex flex-wrap gap-2">
                    {lesson.hasPdf&&<button type="button" onClick={()=>openPdf(lesson._id)} disabled={pdfOpening[lesson._id]} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"><FileText size={15}/>{pdfOpening[lesson._id]?"Opening…":"Open PDF"}</button>}
                    {lesson.questionIds?.length>0?<Link to={`/student/lessons/${lesson._id}/dpp`} className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100">Start DPP ({lesson.questionIds.length})</Link>:<span className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-400">DPP coming soon</span>}
                  </div>
                </div>
                {lesson.instructions&&<details className="mt-4 rounded-lg border border-slate-200"><summary className="cursor-pointer px-3 py-2.5 text-sm font-bold text-slate-700">Teacher instructions</summary><p className="whitespace-pre-wrap px-3 pb-3 text-sm leading-6 text-slate-600">{lesson.instructions}</p></details>}
                <details className="mt-3 rounded-lg border border-slate-200"><summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm font-bold text-slate-700"><StickyNote size={15}/>{notes[lesson._id]?.trim()?"My notes":"Add notes"}</summary><div className="px-3 pb-3"><textarea value={notes[lesson._id]||""} maxLength={5000} onChange={(e)=>{setNotes((old)=>({...old,[lesson._id]:e.target.value}));setNoteStatus((old)=>({...old,[lesson._id]:"Unsaved changes"}));}} onBlur={(e)=>saveNote(lesson._id,e.target.value)} rows={3} placeholder="Write your notes for this lecture…" className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"/><div className="mt-2 flex items-center gap-3"><button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={()=>saveNote(lesson._id,notes[lesson._id]||"")} disabled={noteStatus[lesson._id]==="Saving…"} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{noteStatus[lesson._id]==="Saving…"?"Saving…":"Save note"}</button><span aria-live="polite" className="text-xs text-slate-500">{noteStatus[lesson._id]||"Notes also save when you leave the field."}</span></div></div></details>
              </div>
            </article>;
          })}
        </div> : !error&&<div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center"><PlayCircle size={36} className="mx-auto text-indigo-400"/><h2 className="mt-3 text-xl font-bold">Your classroom is getting ready</h2><p className="mt-2 text-slate-500">Published lecture videos will appear here.</p></div>}
      </div>
    </main>
    {activeLesson&&<div role="dialog" aria-modal="true" aria-label={activeLesson.title} onClick={(event)=>{if(event.target===event.currentTarget)setActiveLesson(null);}} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-3 sm:p-5">
      <div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-slate-900 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-slate-900 px-4 py-2 text-white sm:px-5"><h2 className="truncate font-bold">{activeLesson.title}</h2><button type="button" onClick={()=>setActiveLesson(null)} aria-label="Close video player" className="rounded-full p-2 hover:bg-white/10"><X size={22}/></button></div>
        <div className="mx-auto aspect-video bg-black" style={{width:"min(100%, 110vh)"}}><iframe key={activeLesson._id} className="h-full w-full" src={`https://www.youtube.com/embed/${getYouTubeId(activeLesson.videoUrl)}?autoplay=1`} title={activeLesson.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/></div>
        <section className="bg-white p-3 sm:p-4"><label className="block text-sm font-bold text-slate-800">My lecture notes<textarea value={notes[activeLesson._id]||""} maxLength={5000} onChange={(e)=>{setNotes((old)=>({...old,[activeLesson._id]:e.target.value}));setNoteStatus((old)=>({...old,[activeLesson._id]:"Unsaved changes"}));}} onBlur={(e)=>saveNote(activeLesson._id,e.target.value)} rows={2} placeholder="Write notes while watching…" className="mt-1.5 w-full rounded-xl border border-slate-300 p-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"/></label><div className="mt-2 flex items-center gap-3"><button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={()=>saveNote(activeLesson._id,notes[activeLesson._id]||"")} disabled={noteStatus[activeLesson._id]==="Saving…"} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{noteStatus[activeLesson._id]==="Saving…"?"Saving…":"Save note"}</button><span aria-live="polite" className="text-xs text-slate-500">{noteStatus[activeLesson._id]||"Notes also save when you leave the field."}</span></div></section>
      </div>
    </div>}
  </>;
}
