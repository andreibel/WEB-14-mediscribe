import {NextResponse} from "next/server";
import {getUser, unauthorized} from "@/server/http";
import {createSonioxToken, SonioxTokenError} from "@/server/transcription/soniox";

// Transport layer only. Business logic lives in `server/transcription/soniox.ts`.
export async function POST() {
  const user = await getUser();
  if (!user) return unauthorized();

  try {
    const api_key = await createSonioxToken(user.id);
    return NextResponse.json({api_key});
  } catch (error) {
    if (error instanceof SonioxTokenError) {
      return NextResponse.json({error: error.message}, {status: 502});
    }
    throw error;
  }
}
