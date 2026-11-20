import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import api from "../../services/api";

const blank = { title: "", subject: "", topic: "", duration: "", videoUrl: "", description: "", instructions: "" };

function LessonPdfUpload({ lesson, onUploaded }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function upload() {
    if (!file) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await api.post(`/lessons/${lesson._id}/pdf`, file, { headers: { "Content-Type": "application/pdf" } });
      setMessage("PDF saved."); setFile(null); onUploaded();
    } catch (e) { setError(e.response?.data?.message || "Could not upload the PDF."); }
    finally { setBusy(false); }
  }

  async function removePdf() {
    if (!window.confirm(`Delete the PDF attached to “${lesson.title}” from Supabase Storage?`)) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await api.delete(`/lessons/${lesson._id}/pdf`);
      setMessage("PDF deleted."); setFile(null); onUploaded();
    } catch (e) { setError(e.response?.data?.message || "Could not delete the PDF."); }
    finally { setBusy(false); }
  }

  return <div className="flex flex-wrap items-center gap-2">
    <span className="text-xs font-semibold text-slate-500">{lesson.pdfPath||lesson.pdfUrl?"PDF attached":"No PDF attached"}</span>
    <input type="file" accept="application/pdf,.pdf" onChange={(e)=>{setFile(e.target.files?.[0]||null);setError("");setMessage("");}} className="max-w-64 text-xs file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-2 file:py-1.5 file:font-semibold"/>
    <button type="button" onClick={upload} disabled={!file||busy} className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-40">{busy?"Uploading…":lesson.pdfPath||lesson.pdfUrl?"Replace PDF":"Upload PDF"}</button>
    {(lesson.pdfPath||lesson.pdfUrl)&&<button type="button" onClick={removePdf} disabled={busy} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-40"><Trash2 size={13}/>Delete PDF</button>}
    {message&&<span className="text-xs text-emerald-700">{message}</span>}{error&&<span className="text-xs text-rose-700">{error}</span>}
  </div>;
}

function LessonEditForm({ lesson, subjects, onSaved }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: lesson.title,
    subject: lesson.subject,
    topic: lesson.topic || "",
    duration: lesson.duration || "",
    videoUrl: lesson.videoUrl,
    description: lesson.description || "",
    instructions: lesson.instructions || "",
  });

  async function save(e) {
    e.preventDefault(); setSaving(true); setError("");
    try {
      await api.put(`/lessons/${lesson._id}`, form);
      setOpen(false); await onSaved();
    } catch (e) { setError(e.response?.data?.message || "Could not update this lecture."); }
    finally { setSaving(false); }
  }

  return <div className="mt-3">
    <button type="button" onClick={()=>setOpen((value)=>!value)} className="rounded-lg border px-3 py-2 text-xs font-bold text-slate-700">{open?"Cancel edit":"Edit lecture"}</button>
    {open&&<form onSubmit={save} className="mt-3 grid gap-3 rounded-xl bg-slate-50 p-4 md:grid-cols-2">
      <label className="text-xs font-semibold">Title<input required maxLength="160" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} className="mt-1 w-full rounded-lg border bg-white p-2.5 text-sm"/></label>
      <label className="text-xs font-semibold">Subject<select value={form.subject} onChange={(e)=>setForm({...form,subject:e.target.value})} className="mt-1 w-full rounded-lg border bg-white p-2.5 text-sm">{subjects.map((subject)=><option key={subject._id} value={subject.subjectName}>{subject.subjectName}</option>)}</select></label>
      <label className="text-xs font-semibold">Topic<input value={form.topic} onChange={(e)=>setForm({...form,topic:e.target.value})} className="mt-1 w-full rounded-lg border bg-white p-2.5 text-sm"/></label>
      <label className="text-xs font-semibold">Duration<input value={form.duration} onChange={(e)=>setForm({...form,duration:e.target.value})} className="mt-1 w-full rounded-lg border bg-white p-2.5 text-sm"/></label>
      <label className="text-xs font-semibold md:col-span-2">YouTube video URL<input required type="url" value={form.videoUrl} onChange={(e)=>setForm({...form,videoUrl:e.target.value})} className="mt-1 w-full rounded-lg border bg-white p-2.5 text-sm"/></label>
      <label className="text-xs font-semibold md:col-span-2">Description<textarea rows="2" maxLength="2000" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} className="mt-1 w-full rounded-lg border bg-white p-2.5 text-sm"/></label>
      <label className="text-xs font-semibold md:col-span-2">Teacher instructions<textarea rows="2" maxLength="5000" value={form.instructions} onChange={(e)=>setForm({...form,instructions:e.target.value})} className="mt-1 w-full rounded-lg border bg-white p-2.5 text-sm"/></label>
      {error&&<p className="text-sm text-rose-700 md:col-span-2">{error}</p>}
      <div className="md:col-span-2"><button type="submit" disabled={saving} className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving?"Saving…":"Save changes"}</button></div>
    </form>}
  </div>;
}

function LessonDppEditor({ lesson, subjects }) {
  const [isOpen, setIsOpen] = useState(false);
  const [questionSubject, setQuestionSubject] = useState(lesson.subject);
  const [questions, setQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState(lesson.questionIds || []);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    api.get("/questions", { params: { subject: questionSubject } })
      .then((response) => setQuestions(response.data))
      .catch((e) => setError(e.response?.data?.message || "Could not load questions."));
  }, [isOpen, questionSubject]);

  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return questions;
    return questions.filter((question) => `${question.questionCode} ${question.topic} ${question.questionText}`.toLowerCase().includes(query));
  }, [questions, search]);

  function toggleQuestion(id) {
    setSelectedIds((old) => old.includes(id) ? old.filter((item) => item !== id) : [...old, id]);
  }

  async function save() {
    setSaving(true); setError(""); setMessage("");
    try {
      await api.put(`/lessons/${lesson._id}/dpp`, { questionIds: selectedIds });
      setMessage("DPP saved.");
    } catch (e) { setError(e.response?.data?.message || "Could not save this DPP."); }
    finally { setSaving(false); }
  }

  return <details className="mt-4 border-t border-slate-100 pt-3" onToggle={(e) => setIsOpen(e.currentTarget.open)}>
    <summary className="cursor-pointer text-sm font-bold text-blue-700">Manage DPP ({selectedIds.length} questions)</summary>
    <div className="mt-3 space-y-3">
      <div className="flex flex-wrap gap-3"><select value={questionSubject} onChange={(e) => setQuestionSubject(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">{subjects.map((subject) => <option key={subject._id} value={subject.subjectName}>{subject.subjectName}</option>)}</select><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find questions" className="min-w-48 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"/></div>
      <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">{filteredQuestions.map((question) => <label key={question._id} className="flex cursor-pointer gap-2 rounded-md p-2 hover:bg-slate-50"><input type="checkbox" checked={selectedIds.includes(question._id)} onChange={() => toggleQuestion(question._id)} className="mt-1"/><span><span className="font-semibold">{question.questionCode} · {question.topic}</span><span className="block text-sm text-slate-600">{question.questionText}</span></span></label>)}{!filteredQuestions.length&&<p className="p-2 text-sm text-slate-500">No questions found for this subject.</p>}</div>
      <div className="flex flex-wrap items-center gap-3"><button type="button" onClick={save} disabled={saving} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving?"Saving…":"Save DPP"}</button>{message&&<span className="text-sm font-semibold text-emerald-700">{message}</span>}{error&&<span className="text-sm text-rose-700">{error}</span>}</div>
    </div>
  </details>;
}

export default function LessonManagementPage() {
  const [subjects, setSubjects] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState(blank);
  const [pdfFile, setPdfFile] = useState(null);
  const pdfInputRef = useRef(null);
  const [publishing, setPublishing] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    const [subjectResponse, lessonResponse] = await Promise.all([api.get("/subjects"), api.get("/lessons")]);
    setSubjects(subjectResponse.data); setLessons(lessonResponse.data);
    if (!form.subject && subjectResponse.data[0]) setForm((old) => ({ ...old, subject: subjectResponse.data[0].subjectName }));
  }
  useEffect(() => { refresh().catch(() => setError("Could not load the lesson library.")); }, []);

  async function add(e) {
    e.preventDefault();
    if (publishing) return;
    setPublishing(true); setError(""); setMessage("");
    try {
      const { data: lesson } = await api.post("/lessons", form);
      let uploadFailed = false;
      if (pdfFile) {
        try {
          await api.post(`/lessons/${lesson._id}/pdf`, pdfFile, { headers: { "Content-Type": "application/pdf" } });
        } catch (uploadError) {
          uploadFailed = true;
          setError(`Lecture was created, but its PDF upload failed: ${uploadError.response?.data?.message || "Please retry from the lecture list."}`);
        }
      }
      setForm((old) => ({ ...blank, subject: old.subject }));
      setPdfFile(null);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
      if (!uploadFailed) setMessage("Lesson published to the student library.");
      await refresh();
    } catch (e) { setError(e.response?.data?.message || "Could not save this lesson."); }
    finally { setPublishing(false); }
  }
  async function toggle(lesson) {
    try { await api.patch(`/lessons/${lesson._id}`, { published: !lesson.published }); await refresh(); }
    catch (e) { setError(e.response?.data?.message || "Could not update lesson."); }
  }
  async function moveLesson(index, direction) {
    const targetIndex = index + direction;
    if (savingOrder || targetIndex < 0 || targetIndex >= lessons.length) return;
    const reordered = [...lessons];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setLessons(reordered);
    setSavingOrder(true); setError(""); setMessage("");
    try {
      const { data } = await api.put("/lessons/order", { lessonIds: reordered.map((lesson) => lesson._id) });
      setLessons(data);
      setMessage("Lecture sequence saved.");
    } catch (e) {
      setError(e.response?.data?.message || "Could not save lecture sequence.");
      await refresh().catch(() => {});
    } finally { setSavingOrder(false); }
  }
  async function remove(lesson) {
    if (!window.confirm(`Permanently remove “${lesson.title}” and its attached Supabase PDF?`)) return;
    try {
      await api.delete(`/lessons/${lesson._id}`);
      await refresh();
    } catch (e) {
      if (e.response?.data?.code === "PDF_DELETE_FAILED") {
        const removeAnyway = window.confirm("Supabase could not delete the PDF. Remove this lecture anyway? The lecture will be removed, but its PDF will remain in Supabase Storage.");
        if (removeAnyway) {
          try { await api.delete(`/lessons/${lesson._id}`, { data: { removeAnyway: true } }); await refresh(); }
          catch (retryError) { setError(retryError.response?.data?.message || "Could not remove lesson."); }
        }
      } else {
        setError(e.response?.data?.message || "Could not remove lesson.");
      }
    }
  }

  return <AdminLayout><div className="mx-auto max-w-6xl">
    <div className="mb-7"><p className="text-sm font-bold uppercase tracking-[.18em] text-blue-700">Teaching resources</p><h1 className="mt-2 text-3xl font-black text-slate-900">Lecture library</h1><p className="mt-2 text-slate-600">Add YouTube lectures, teacher instructions, PDF resources, and DPP questions.</p></div>
    {error&&<div className="mb-4 rounded-xl bg-rose-50 p-4 text-rose-700">{error}</div>}{message&&<div className="mb-4 rounded-xl bg-emerald-50 p-4 text-emerald-700">{message}</div>}
    <form onSubmit={add} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
      <h2 className="text-xl font-bold md:col-span-2">Add a lecture</h2>
      <label className="text-sm font-semibold">Lesson title<input required maxLength="160" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} className="mt-1 w-full rounded-lg border p-3" placeholder="e.g. Principles of Flight: Lift"/></label>
      <label className="text-sm font-semibold">Subject<select required value={form.subject} onChange={(e)=>setForm({...form,subject:e.target.value})} className="mt-1 w-full rounded-lg border bg-white p-3">{subjects.map((s)=><option key={s._id} value={s.subjectName}>{s.subjectName}</option>)}</select></label>
      <label className="text-sm font-semibold">Topic<input value={form.topic} onChange={(e)=>setForm({...form,topic:e.target.value})} className="mt-1 w-full rounded-lg border p-3" placeholder="Optional topic"/></label>
      <label className="text-sm font-semibold">Duration<input value={form.duration} onChange={(e)=>setForm({...form,duration:e.target.value})} className="mt-1 w-full rounded-lg border p-3" placeholder="e.g. 24 min"/></label>
      <label className="text-sm font-semibold md:col-span-2">YouTube video URL<input required type="url" value={form.videoUrl} onChange={(e)=>setForm({...form,videoUrl:e.target.value})} className="mt-1 w-full rounded-lg border p-3" placeholder="https://www.youtube.com/watch?v=…"/><span className="mt-1 block font-normal text-slate-500">Use a public or unlisted video with embedding enabled.</span></label>
      <label className="text-sm font-semibold md:col-span-2">General instructions<textarea rows="3" maxLength="5000" value={form.instructions} onChange={(e)=>setForm({...form,instructions:e.target.value})} className="mt-1 w-full rounded-lg border p-3" placeholder="Instructions from the instructor for this lecture"/></label>
      <label className="text-sm font-semibold md:col-span-2">PDF attachment<input ref={pdfInputRef} type="file" accept="application/pdf,.pdf" onChange={(e)=>{const file=e.target.files?.[0]||null;if(file&&file.size>25*1024*1024){setError("PDF must be 25 MB or smaller.");setPdfFile(null);e.target.value="";return;}setError("");setPdfFile(file);}} className="mt-1 block w-full rounded-lg border p-3 file:mr-3 file:rounded-md file:border-0 file:bg-rose-50 file:px-3 file:py-2 file:font-bold file:text-rose-700"/><span className="mt-1 block font-normal text-slate-500">Upload a PDF up to 25 MB. It will be stored in the private Supabase lecture bucket.</span></label>
      <label className="text-sm font-semibold md:col-span-2">Description<textarea rows="3" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} className="mt-1 w-full rounded-lg border p-3" placeholder="What will students learn?"/></label>
      <div className="md:col-span-2"><button type="submit" disabled={publishing} className="rounded-lg bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">{publishing?"Publishing…":"Publish lecture"}</button></div>
    </form>
    <section className="mt-8"><h2 className="mb-2 text-xl font-bold">All lectures <span className="text-slate-400">({lessons.length})</span></h2><p className="mb-4 text-sm text-slate-500">Use the arrows to set the order students see lectures in the library.</p><div className="space-y-3">{lessons.map((lesson,index)=><article key={lesson._id} className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="flex flex-col"><button type="button" aria-label={`Move ${lesson.title} up`} title="Move up" onClick={()=>moveLesson(index,-1)} disabled={savingOrder||index===0} className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowUp size={16}/></button><button type="button" aria-label={`Move ${lesson.title} down`} title="Move down" onClick={()=>moveLesson(index,1)} disabled={savingOrder||index===lessons.length-1} className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowDown size={16}/></button></div><div><div className="font-bold">{lesson.title}</div><div className="mt-1 text-sm text-slate-500">{lesson.subject}{lesson.topic?` · ${lesson.topic}`:""} · {lesson.published?"Published":"Hidden"}</div></div></div><div className="flex gap-2"><button onClick={()=>toggle(lesson)} className="rounded-lg border px-3 py-2 text-sm font-semibold">{lesson.published?"Unpublish":"Publish"}</button><button onClick={()=>remove(lesson)} className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700">Remove</button></div></div>
      {!lesson.published&&<LessonEditForm lesson={lesson} subjects={subjects} onSaved={refresh}/>}
      <div className="mt-3"><LessonPdfUpload lesson={lesson} onUploaded={()=>refresh().catch(()=>{})}/></div>
      <LessonDppEditor key={lesson._id} lesson={lesson} subjects={subjects}/>
    </article>)}</div></section>
  </div></AdminLayout>;
}
