import { db } from "@/db";
import { studentProfiles, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isBirthdayToday } from "@/lib/year";
import { safeQuery } from "@/lib/db-safe";

export async function BirthdayBoard() {
  const rows = await safeQuery(
    () =>
      db
        .select({
          firstName: user.firstName,
          image: user.image,
          grade: user.grade,
          birth: studentProfiles.dateOfBirth,
        })
        .from(studentProfiles)
        .innerJoin(user, eq(studentProfiles.studentId, user.id)),
    [],
  );

  const today = rows.filter((r) => isBirthdayToday(r.birth));

  return (
    <section className="school-card rounded-3xl p-6">
      <p className="text-center text-lg font-semibold">
        از صمیم قلب تولدتان را تبریک می‌گوییم
      </p>
      {today.length === 0 ? (
        <p className="mt-4 text-center text-sm text-teal-800/60">امروز تولد هیچ‌کدام از بچه‌ها نیست.</p>
      ) : (
        <ul className="mt-5 flex flex-wrap justify-center gap-6">
          {today.map((s, i) => (
            <li key={i} className="flex w-24 flex-col items-center gap-2 text-center text-sm">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-mint text-3xl font-extrabold text-ink shadow">
                {s.image && s.image.startsWith("/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image} alt="" className="h-20 w-20 rounded-full object-cover" />
                ) : s.image && s.image.length <= 4 ? (
                  s.image
                ) : (
                  s.firstName?.[0] ?? "·"
                )}
              </span>
              <span>
                {s.firstName}
                {s.grade ? <span className="block text-[11px] text-slate-500">{s.grade}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
