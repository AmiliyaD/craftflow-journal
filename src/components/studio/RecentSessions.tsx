import { MOODS, formatDuration, formatSessionDate, type Session } from "@/lib/sessions";

export function RecentSessions({ sessions }: { sessions: Session[] }) {
  return (
    <section>
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow">History</p>
          <h2 className="display-title mt-2 text-3xl md:text-4xl">Recent sessions</h2>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="glass mt-6 rounded-2xl p-8 text-center">
          <p className="display-title text-xl">No sessions saved yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Start a session and it will show up here.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {sessions.slice(0, 6).map((s) => {
            const mood = MOODS.find((m) => m.key === s.mood);
            return (
              <article
                key={s.id}
                className="glass card-hover flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5 text-left"
              >
                <div className="min-w-0">
                  <p className="eyebrow">{formatSessionDate(s.startedAt)}</p>
                  <p className="display-title mt-2 text-2xl tabular-nums">
                    {formatDuration(s.durationMs)}
                  </p>
                  {s.skills.length > 0 && (
                    <p className="mt-1.5 text-xs text-muted-foreground">{s.skills.join(" · ")}</p>
                  )}
                </div>
                <div className="flex max-w-md items-center gap-3">
                  {mood && <span className="text-lg">{mood.emoji}</span>}
                  {s.notes && (
                    <p className="text-xs leading-relaxed text-muted-foreground italic">
                      &ldquo;{s.notes}&rdquo;
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
