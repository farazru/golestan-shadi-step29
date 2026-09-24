import Link from "next/link";
import { isAlocomUrl } from "@/lib/alocom";

export function ClassJoin({
  meetingUrl,
  roomId,
}: {
  meetingUrl?: string | null;
  roomId?: string | null;
}) {
  if (meetingUrl && isAlocomUrl(meetingUrl)) {
    return (
      <a
        href={meetingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary inline-flex min-h-11 items-center rounded-full px-4 text-sm"
      >
        ورود به کلاس الوکام
      </a>
    );
  }
  if (meetingUrl) {
    return (
      <a
        href={meetingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary inline-flex min-h-11 items-center rounded-full px-4 text-sm"
      >
        ورود به کلاس
      </a>
    );
  }
  if (roomId) {
    return (
      <Link href={`/classroom/${roomId}`} className="text-sm font-bold underline">
        کلاس آزمایشی
      </Link>
    );
  }
  return <span className="empty">لینک کلاس هنوز آماده نیست</span>;
}
