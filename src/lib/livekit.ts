import { AccessToken } from "livekit-server-sdk";

export type ClassroomRole = "student" | "teacher" | "manager" | "deputy";

export async function createLiveKitToken({
  roomId,
  identity,
  name,
  role,
  avatar,
}: {
  roomId: string;
  identity: string;
  name: string;
  role: ClassroomRole;
  avatar?: string | null;
}) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error(
      "LIVEKIT_API_KEY / LIVEKIT_API_SECRET are not set. See .env.example.",
    );
  }

  const isStaff = role === "teacher" || role === "manager" || role === "deputy";

  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    name,
    metadata: JSON.stringify({ role, avatar: avatar ?? null }),
    ttl: "2h",
  });

  token.addGrant({
    room: roomId,
    roomJoin: true,
    canPublish: isStaff,
    canSubscribe: true,
    canPublishData: true,
    roomAdmin: isStaff,
  });

  return token.toJwt();
}
