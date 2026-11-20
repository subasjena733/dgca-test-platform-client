import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, Circle, XCircle, ChevronDown, ChevronUp, StickyNote, ListOrdered } from "lucide-react";
import api from "../../services/api";

export default function StudentPracticePage() {
  const { lessonId } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [subject, setSubject] = useState("ALL");
  const [difficulty, setDifficulty] = useState("ALL");
  const [topic, setTopic] = useState("ALL");
  const [questions, setQuestions] = useState([]);
  const [topicOptions, setTopicOptions] = useState([]);
  const [index, setIndex] = useState(0);
  const [solutions, setSolutions] = useState({});
  const [progress, setProgress] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [notesOpen, setNotesOpen] = useState({});
  const [noteStatus, setNoteStatus] = useState({});
  const [statusBoardOpen, setStatusBoardOpen] = useState(false);
  const loadRequestId = useRef(0);
  const [lessonTitle, setLessonTitle] = useState("");
  const [checking, setChecking] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const topics = useMemo(() => [...new Set(topicOptions.map((q) => q.topic).filter(Boolean))], [topicOptions]);
  const current = questions[index];
  const currentId = current?._id;
  const solution = currentId ? solutions[currentId] : null;

  const loadQuestions = useCallback(async () => {
    const requestId = ++loadRequestId.current;
    setLoading(true); setError(""); setIndex(0); setSolutions({}); setProgress({}); setFeedback(null); setNotesOpen({});
    try {
      if (lessonId) {
        const { data } = await api.get(`/lessons/${lessonId}/dpp/questions`);
        if (requestId !== loadRequestId.current) return;
        setLessonTitle(data.lesson.title); setQuestions(data.questions); setSubjects([]); setTopicOptions([]);
        if (data.questions.length) {
          const saved = await api.get("/questions/practice/progress", { params: { questionIds: data.questions.map((q) => q._id).join(",") } });
          if (requestId !== loadRequestId.current) return;
          setProgress(Object.fromEntries(saved.data.map((item) => [item.questionId, item])));
        }
        return;
      }
      setLessonTitle("");
      const [subjectsRes, questionsRes, topicRes] = await Promise.all([
        api.get("/subjects"),
        api.get("/questions/practice", { params: { subject, difficulty, topic, limit: 50 } }),
        api.get("/questions/practice", { params: { subject, difficulty, topic: "ALL", limit: 50 } }),
      ]);
      if (requestId !== loadRequestId.current) return;
      setSubjects(subjectsRes.data); setQuestions(questionsRes.data); setTopicOptions(topicRes.data);
      if (questionsRes.data.length) {
        const saved = await api.get("/questions/practice/progress", { params: { questionIds: questionsRes.data.map((q) => q._id).join(",") } });
        if (requestId !== loadRequestId.current) return;
        setProgress(Object.fromEntries(saved.data.map((item) => [item.questionId, item])));
      }
    } catch (e) { if (requestId === loadRequestId.current) setError(e.response?.data?.message || "Could not load practice questions."); }
    finally { if (requestId === loadRequestId.current) setLoading(false); }
  }, [subject, difficulty, topic, lessonId]);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  async function chooseOption(option) {
    if (!current || checking) return;
    setChecking(true); setError("");
    try {
      const response = await api.post(`/questions/practice/${current._id}/answer`, { selectedOption: option });
      setFeedback({ questionId: current._id, selectedOption: option, correct: response.data.correct, correctOption: response.data.correctOption });
      setProgress((old) => ({ ...old, [current._id]: response.data.progress }));
    } catch (e) { setError(e.response?.data?.message || "Could not check your answer."); }
    finally { setChecking(false); }
  }

  async function showAnswer() {
    if (!current || solutions[current._id] || revealing) return;
    setRevealing(true); setError("");
    try {
      const response = await api.get(`/questions/practice/${current._id}/solution`);
      setSolutions((old) => ({ ...old, [current._id]: response.data }));
    } catch (e) { setError(e.response?.data?.message || "Could not load the answer."); }
    finally { setRevealing(false); }
  }

  function moveTo(nextIndex) {
    const target = Math.max(0, Math.min(questions.length - 1, nextIndex));
    if (target !== index && currentId) setSolutions((old) => { const next = { ...old }; delete next[currentId]; return next; });
    setIndex(target); setFeedback(null); setError("");
  }
  async function updateProgress(id, updates) {
    setProgress((old) => ({ ...old, [id]: { ...old[id], questionId: id, status: old[id]?.status || "unattempted", markedForRevision: old[id]?.markedForRevision || false, note: old[id]?.note || "", ...updates } }));
    try {
      const response = await api.put(`/questions/practice/${id}/progress`, updates);
      setProgress((old) => ({ ...old, [id]: response.data }));
    } catch (e) { setError(e.response?.data?.message || "Could not save your question progress."); }
  }

  async function saveQuestionNote(id, note) {
    setNoteStatus((old) => ({ ...old, [id]: "Saving…" }));
    try {
      const { data } = await api.put(`/questions/practice/${id}/progress`, { note });
      setProgress((old) => ({ ...old, [id]: data }));
      setNoteStatus((old) => ({ ...old, [id]: "Saved" }));
    } catch (e) {
      setNoteStatus((old) => ({ ...old, [id]: e.response?.data?.message || "Could not save note." }));
      setError(e.response?.data?.message || "Could not save your question note.");
    }
  }

  return <main className="min-h-screen bg-slate-50 px-4 pb-12 pt-0 sm:px-6">
    <div className="mx-auto max-w-5xl">
      <Link to={lessonId?"/student/lessons":"/student"} className="mt-5 mb-0 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft size={16}/>{lessonId?"Lecture library":"Dashboard"}</Link>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.18em] text-blue-700">{lessonId?"Lecture DPP":"Daily practice"}</p><h1 className="mt-2 text-3xl font-black text-slate-900">{lessonId?lessonTitle||"Loading lecture…":"Build your DGCA knowledge"}</h1><p className="mt-2 text-slate-600">Choose an answer for instant feedback, or reveal the solution whenever you need it.</p></div><div className="rounded-2xl bg-white px-5 py-3 shadow-sm"><div className="text-xs font-bold uppercase text-slate-400">{lessonId?"DPP progress":"Session progress"}</div><div className="mt-1 font-bold text-slate-800">{questions.length ? `${index + 1} / ${questions.length}` : "Ready when you are"}</div></div></div>
      {!lessonId&&<div className="mb-6 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="text-sm font-semibold text-slate-600">Subject<select value={subject} onChange={(e)=>setSubject(e.target.value)} className="mt-1 block min-w-48 rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900"><option value="ALL">All subjects</option>{subjects.map(s=><option key={s._id} value={s.subjectName}>{s.subjectName}</option>)}</select></label>
        <label className="text-sm font-semibold text-slate-600">Difficulty<select value={difficulty} onChange={(e)=>setDifficulty(e.target.value)} className="mt-1 block min-w-40 rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900"><option value="ALL">Any level</option>{["Easy","Medium","Hard"].map(x=><option key={x}>{x}</option>)}</select></label>
        <label className="text-sm font-semibold text-slate-600">Topic<select value={topic} onChange={(e)=>setTopic(e.target.value)} className="mt-1 block min-w-40 rounded-lg border border-slate-300 bg-white p-2.5 text-slate-900"><option value="ALL">All topics</option>{topics.map(x=><option key={x}>{x}</option>)}</select></label>
      </div>}
      {questions.length > 0 && <div className="mb-4"><button type="button" onClick={()=>setStatusBoardOpen((open)=>!open)} aria-expanded={statusBoardOpen} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"><ListOrdered size={17}/>{statusBoardOpen?"Hide question status":"Show question status"}<span className="text-slate-400">{statusBoardOpen?"−":"+"}</span></button>{statusBoardOpen&&<nav aria-label="Question status and navigation" className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4">{questions.map((q, i) => { const status = progress[q._id]?.status; const revision = progress[q._id]?.markedForRevision; const fill = status === "correct" ? "rgba(34,197,94,0.45)" : status === "wrong" ? "rgba(244,63,94,0.45)" : undefined; const shadow = revision ? "0 0 0 4px #facc15" : index === i ? "0 0 0 2px #3b82f6, 0 0 0 4px white" : undefined; return <button key={q._id} onClick={()=>moveTo(i)} aria-label={`Question ${i + 1}${status ? `, ${status} attempt` : ""}${revision ? ", marked for revision" : ""}`} aria-current={index===i?"step":undefined} style={{ ...(fill ? { backgroundColor: fill } : {}), ...(shadow ? { boxShadow: shadow } : {}) }} className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${status==="correct"?"text-emerald-900":status==="wrong"?"text-rose-900":"bg-slate-100 text-slate-600"}`}>{i+1}</button>; })}<span className="ml-auto flex items-center gap-3 self-center text-xs text-slate-500"><span className="text-emerald-700">● Correct</span><span className="text-rose-700">● Wrong</span><span className="text-yellow-600">◯ Revision</span></span></nav>}</div>}
      {error && <div className="mb-4 rounded-xl bg-rose-50 p-4 text-rose-700">{error}</div>}
      {loading ? <div className="rounded-2xl bg-white p-12 text-center text-slate-500">Loading your questions…</div> : current ? <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-6 py-4 text-xs font-bold uppercase tracking-wide"><span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">{current.subject}</span><span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">{current.topic}</span><span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">{current.difficulty}</span></div>
        <div className="p-6 sm:p-9"><div className="flex gap-3"><span style={{ backgroundColor: progress[current._id]?.status === "correct" ? "rgba(34,197,94,0.45)" : progress[current._id]?.status === "wrong" ? "rgba(244,63,94,0.45)" : undefined, boxShadow: progress[current._id]?.markedForRevision ? "0 0 0 4px #facc15" : undefined }} className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${progress[current._id]?.status==="correct"?"text-emerald-900":progress[current._id]?.status==="wrong"?"text-rose-900":"bg-blue-50 text-blue-600"}`}><CircleHelp size={21}/></span><h2 className="text-xl font-bold leading-relaxed text-slate-900">{current.questionText}</h2></div>{current.imageUrl && <img src={current.imageUrl} alt="Question illustration" className="mt-5 max-h-72 rounded-xl object-contain"/>}
          <div className="mt-7 grid gap-3">{current.options?.filter((option)=>option.text?.trim()).map((option)=>{const activeFeedback=feedback?.questionId===current._id?feedback:null;const isCorrect=(activeFeedback&&option.label===activeFeedback.correctOption)||(solution&&option.label===solution.correctOption);const isWrong=activeFeedback&&option.label===activeFeedback.selectedOption&&!activeFeedback.correct;return <button key={option.label} disabled={checking||Boolean(activeFeedback)} onClick={()=>chooseOption(option.label)} className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${isCorrect?"border-emerald-400 bg-emerald-50":isWrong?"border-rose-400 bg-rose-50":"border-slate-200 hover:border-blue-400 hover:bg-blue-50"}`}><span className="font-black text-slate-500">{option.label}</span><span className="text-slate-800">{option.text}</span>{isCorrect&&<CheckCircle2 size={19} className="ml-auto shrink-0 text-emerald-600"/>}{isWrong&&<XCircle size={19} className="ml-auto shrink-0 text-rose-600"/>}</button>;})}</div>
          {feedback?.questionId===current._id&&<div className={`mt-5 flex items-center gap-2 rounded-xl p-4 font-bold ${feedback.correct?"bg-emerald-50 text-emerald-800":"bg-rose-50 text-rose-800"}`}>{feedback.correct?<CheckCircle2 size={20}/>:<XCircle size={20}/>} {feedback.correct?"Correct!":"That’s not correct. The correct option is highlighted."}</div>}
          {solution&&<div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-5"><h3 className="font-bold text-slate-900">Answer: {solution.correctOption}</h3>{solution.explanation&&<p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{solution.explanation}</p>}{solution.explanationImageUrl&&<img src={solution.explanationImageUrl} alt="Answer explanation" className="mt-4 max-h-72 rounded-xl object-contain"/>}{solution.solutionVideoUrl&&<div className="mt-4"><a href={solution.solutionVideoUrl} target="_blank" rel="noreferrer" className="font-bold text-blue-700 underline">Watch solution video ↗</a></div>}</div>}
          <section className="mt-6"><button type="button" onClick={()=>setNotesOpen((old)=>({...old,[current._id]:!old[current._id]}))} aria-expanded={Boolean(notesOpen[current._id])} className="inline-flex items-center gap-2 rounded-lg px-1 py-2 text-sm font-bold text-slate-700 hover:text-blue-700"><StickyNote size={17}/>{progress[current._id]?.note?.trim()?"View note":"Add a note"}{notesOpen[current._id]?<ChevronUp size={16}/>:<ChevronDown size={16}/>}</button>{notesOpen[current._id]&&<div className="mt-2"><label className="block text-sm font-bold text-slate-700">My note<textarea value={progress[current._id]?.note||""} maxLength={5000} onChange={(e)=>{setProgress((old)=>({...old,[current._id]:{...old[current._id],questionId:current._id,note:e.target.value}}));setNoteStatus((old)=>({...old,[current._id]:"Unsaved changes"}));}} onBlur={(e)=>saveQuestionNote(current._id,e.target.value)} rows={3} placeholder="Write a reminder or key point for this question…" className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"/></label><div className="mt-2 flex items-center gap-3"><button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={()=>saveQuestionNote(current._id,progress[current._id]?.note||"")} disabled={noteStatus[current._id]==="Saving…"} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{noteStatus[current._id]==="Saving…"?"Saving…":"Save note"}</button><span aria-live="polite" className="text-xs text-slate-500">{noteStatus[current._id]||"Notes also save when you leave the field."}</span></div></div>}</section>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><button onClick={()=>updateProgress(current._id,{markedForRevision:!progress[current._id]?.markedForRevision})} aria-pressed={Boolean(progress[current._id]?.markedForRevision)} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 font-bold ${progress[current._id]?.markedForRevision?"border-yellow-400 bg-yellow-50 text-yellow-800":"border-slate-300 text-slate-700 hover:bg-slate-50"}`}><Circle size={17} className={progress[current._id]?.markedForRevision?"fill-yellow-400 text-yellow-500":""}/>{progress[current._id]?.markedForRevision?"Marked for revision":"Mark for revision"}</button><div className="flex flex-wrap gap-2"><button onClick={showAnswer} disabled={revealing||Boolean(solution)} className="rounded-xl border border-blue-200 px-4 py-3 font-bold text-blue-700 hover:bg-blue-50 disabled:opacity-50">{revealing?"Loading…":"Show Answer"}</button><button onClick={()=>moveTo(index-1)} disabled={index===0} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft size={16}/>Previous</button><button onClick={()=>moveTo(index+1)} disabled={index===questions.length-1} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Next<ArrowRight size={16}/></button></div></div>
          {checking&&<p className="mt-3 text-right text-sm text-slate-500">Checking answer…</p>}
        </div>
      </article> : !loading && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><CircleHelp className="mx-auto text-slate-400" size={32}/><h2 className="mt-3 text-xl font-bold text-slate-800">{lessonId?"No DPP questions assigned yet":"No questions match this selection yet"}</h2><p className="mt-2 text-slate-500">{lessonId?"Your instructor has not added practice questions for this lecture yet.":"Try another subject or difficulty, or check back as your instructors add questions."}</p></div>}
    </div>
  </main>;
}
