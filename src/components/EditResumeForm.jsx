import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, ChevronRight, User, Briefcase, GraduationCap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Parse "MM/YYYY" or "YYYY" into a sortable number (higher = more recent)
// Returns Infinity if empty/invalid so those entries go to the TOP (index 0) of descending list
function parseDateToNum(str) {
  if (!str || !str.trim()) return Infinity;
  const mmyyyy = str.match(/^(\d{1,2})[\/\-](\d{4})$/);
  if (mmyyyy) return parseInt(mmyyyy[2]) * 100 + parseInt(mmyyyy[1]);
  const yyyy = str.match(/^(\d{4})$/);
  if (yyyy) return parseInt(yyyy[1]) * 100;
  return Infinity;
}

function sortExperience(list) {
  return [...list].sort((a, b) => {
    const endA = parseDateToNum(a.end);
    const endB = parseDateToNum(b.end);
    if (endB !== endA) return endB - endA;
    return parseDateToNum(b.start) - parseDateToNum(a.start);
  });
}

function sortEducation(list) {
  return [...list].sort((a, b) => parseDateToNum(b.year) - parseDateToNum(a.year));
}

export default function EditResumeForm({ resumeData, onConfirm, onChange, t }) {
  const [data, setData] = useState({
    ...resumeData,
    experience: sortExperience(resumeData.experience || []),
    education: sortEducation(resumeData.education || []),
  });
  const [newExpId, setNewExpId] = useState(null);
  const [newEduId, setNewEduId] = useState(null);
  const newExpRef = useRef(null);
  const newEduRef = useRef(null);

  const set = (field, value) => setData(d => {
    const updated = { ...d, [field]: value };
    onChange?.(updated);
    return updated;
  });

  const updateExp = (i, field, value) => {
    const updated = [...(data.experience || [])];
    updated[i] = { ...updated[i], [field]: value };
    set("experience", updated); // no sort while typing
  };
  const addExp = () => {
    const newEntry = { title: "", company: "", start: "", end: "", description: "", _id: Date.now() };
    const updated = [newEntry, ...(data.experience || [])];
    set("experience", updated);
    setNewExpId(newEntry._id);
    setTimeout(() => { newExpRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 50);
  };
  const removeExp = (i) => set("experience", data.experience.filter((_, idx) => idx !== i));

  const updateEdu = (i, field, value) => {
    const updated = [...(data.education || [])];
    updated[i] = { ...updated[i], [field]: value };
    set("education", updated); // no sort while typing
  };
  const addEdu = () => {
    const newEntry = { degree: "", institution: "", year: "", _id: Date.now() };
    const updated = [newEntry, ...(data.education || [])];
    set("education", updated);
    setNewEduId(newEntry._id);
    setTimeout(() => { newEduRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 50);
  };
  const removeEdu = (i) => set("education", data.education.filter((_, idx) => idx !== i));

  const updateSkill = (i, value) => {
    const updated = [...(data.skills || [])];
    updated[i] = value;
    set("skills", updated);
  };
  const addSkill = () => set("skills", [...(data.skills || []), ""]);
  const removeSkill = (i) => set("skills", (data.skills || []).filter((_, idx) => idx !== i));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-3xl mx-auto"
    >
      <div>
        <h2 className="font-semibold text-xl">{t.title}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
      </div>

      {/* Personal */}
      <Section icon={<User className="w-4 h-4" />} title={t.personal}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={t.name} value={data.name || ""} onChange={v => set("name", v)} />
          <Field label={t.email} value={data.email || ""} onChange={v => set("email", v)} />
          <Field label={t.phone} value={data.phone || ""} onChange={v => set("phone", v)} />
        </div>
        <div className="mt-3">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.summary}</label>
          <Textarea
            value={data.summary || ""}
            onChange={e => set("summary", e.target.value)}
            placeholder={t.summaryPlaceholder}
            className="text-sm resize-none min-h-[80px]"
          />
        </div>
      </Section>

      {/* Experience */}
      <Section icon={<Briefcase className="w-4 h-4" />} title={t.experience}>
        <Button variant="outline" size="sm" onClick={addExp} className="gap-1.5 w-full rounded-xl border-dashed">
          <Plus className="w-4 h-4" /> {t.addPosition}
        </Button>
        {(data.experience || []).map((exp, i) => {
          const isNew = exp._id && exp._id === newExpId;
          return (
          <div
            key={exp._id || i}
            ref={isNew ? newExpRef : null}
            className={`border rounded-lg p-4 space-y-3 relative transition-all duration-300 ${isNew ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20" : "border-border bg-white"}`}
          >
            <button onClick={() => removeExp(i)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label={t.jobTitle} value={exp.title || ""} onChange={v => updateExp(i, "title", v)} />
              <Field label={t.company} value={exp.company || ""} onChange={v => updateExp(i, "company", v)} />
              <Field label={t.from} value={exp.start || ""} onChange={v => updateExp(i, "start", v)} />
              <Field label={t.to} value={exp.end || ""} onChange={v => updateExp(i, "end", v)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t.description}</label>
              <Textarea
                value={exp.description || ""}
                onChange={e => updateExp(i, "description", e.target.value)}
                placeholder={t.descPlaceholder}
                className="text-sm resize-none min-h-[60px]"
              />
            </div>
          </div>
          );
        })}
      </Section>

      {/* Education */}
      <Section icon={<GraduationCap className="w-4 h-4" />} title={t.education}>
        <Button variant="outline" size="sm" onClick={addEdu} className="gap-1.5 w-full rounded-xl border-dashed">
          <Plus className="w-4 h-4" /> {t.addEdu}
        </Button>
        {(data.education || []).map((edu, i) => {
          const isNew = edu._id && edu._id === newEduId;
          return (
          <div
            key={edu._id || i}
            ref={isNew ? newEduRef : null}
            className={`border rounded-lg p-4 relative transition-all duration-300 ${isNew ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20" : "border-border bg-white"}`}
          >
            <button onClick={() => removeEdu(i)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label={t.degree} value={edu.degree || ""} onChange={v => updateEdu(i, "degree", v)} />
              <Field label={t.institution} value={edu.institution || ""} onChange={v => updateEdu(i, "institution", v)} />
              <Field label={t.year} value={edu.year || ""} onChange={v => updateEdu(i, "year", v)} />
            </div>
          </div>
          );
        })}
      </Section>

      {/* Skills */}
      <Section icon={<Star className="w-4 h-4" />} title={t.skills}>
        <div className="space-y-2">
          {(data.skills || []).map((skill, i) => (
            <div key={i} className="flex gap-2">
              <Input value={skill} onChange={e => updateSkill(i, e.target.value)} placeholder={t.skillPlaceholder} className="text-sm h-9" />
              <button onClick={() => removeSkill(i)} className="text-muted-foreground hover:text-destructive flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={addSkill} className="h-8 gap-1 text-xs w-full">
            <Plus className="w-3 h-3" /> {t.addSkill}
          </Button>
        </div>
      </Section>

      <div className="flex justify-end pb-8 border-t border-border pt-6">
        <Button onClick={() => onConfirm(data)} className="gap-2">
          {t.next}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="font-medium text-sm text-foreground uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
      <Input value={value} onChange={e => onChange(e.target.value)} className="text-sm" />
    </div>
  );
}