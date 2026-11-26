import Link from "next/link";
import { lessonWord, type CourseCard } from "@/lib/members";

const grad = ["#5a2a44", "#1f5f8b", "#2e6b4f", "#8c3b4f", "#b0612a", "#3a2a4f"];

export default function CourseTile({ c, i = 0, showProgress = false }: { c: CourseCard; i?: number; showProgress?: boolean }) {
  const total = c.lessons.length;
  const pct = total ? Math.round((c.done / total) * 100) : 0;
  return (
    <Link className="mv-tile" href={`/membros/curso/${c.id}`}>
      <div
        className="mv-thumb"
        style={{ backgroundImage: `${c.image ? `url(${c.image}),` : ""}linear-gradient(150deg,${grad[i % grad.length]},#11141f)` }}
      >
        <span className="mv-badge">{c.category}</span>
        <span className="mv-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z" /></svg></span>
        {!c.image && <b className="mv-thumb-title">{c.title}</b>}
      </div>
      {(showProgress || c.done > 0) && <div className="mv-bar" aria-label={`${pct}% concluído`}><i style={{ width: `${pct}%` }} /></div>}
      <div className="mv-meta">
        <b>{c.title}</b>
        <span>{showProgress && c.nextLesson ? `Próxima: ${c.nextLesson.title}` : c.subtitle ?? ""}</span>
        <small>{lessonWord(total)}{c.totalMinutes ? ` · ${c.totalMinutes} min` : ""}{c.level ? ` · ${c.level}` : ""}</small>
      </div>
    </Link>
  );
}
