import { RoomServiceClient, EgressClient, EncodedFileOutput, EncodedFileType } from "livekit-server-sdk";

function host() {
  const url = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL || "";
  return url.replace(/^wss:/, "https:").replace(/^ws:/, "http:");
}

export function roomService() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) throw new Error("LiveKit keys are missing.");
  return new RoomServiceClient(host(), apiKey, apiSecret);
}

export async function setCanPublish(roomId: string, identity: string, canPublish: boolean) {
  const svc = roomService();
  await svc.updateParticipant(roomId, identity, undefined, {
    canPublish,
    canSubscribe: true,
    canPublishData: true,
    canUpdateMetadata: true,
  } as never);
}

export async function muteAllExcept(roomId: string, keepIdentity: string) {
  const svc = roomService();
  const parts = await svc.listParticipants(roomId);
  for (const p of parts) {
    if (p.identity === keepIdentity) continue;
    try {
      await svc.updateParticipant(roomId, p.identity, undefined, {
        canPublish: false,
        canSubscribe: true,
        canPublishData: true,
      } as never);
    } catch {
      /* participant may have left */
    }
  }
}

export async function startRecording(roomId: string) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) throw new Error("LiveKit keys are missing.");
  const egress = new EgressClient(host(), apiKey, apiSecret);
  return egress.startRoomCompositeEgress(roomId, {
    file: new EncodedFileOutput({
      fileType: EncodedFileType.MP4,
      filepath: `recordings/${roomId}-{time}.mp4`,
    }),
  });
}
