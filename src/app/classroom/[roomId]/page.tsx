import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { ClassroomClient } from "./classroom-client";

export default async function ClassroomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role === "parent") redirect("/dashboard");
  const { roomId } = await params;

  return <ClassroomClient roomId={roomId} />;
}
