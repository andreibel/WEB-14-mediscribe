import {NextResponse, type NextRequest} from "next/server";
import {getUser, unauthorized} from "@/server/http";
import {fillForm, InvalidAIResponseError, type FormFillSegment} from "@/server/ai/form-fill";
import type {MoHFormData} from "@/app/(inApp)/session/_form/formSchema";

// Transport layer only: auth gate, parse body, call the backend, respond.
// Business logic lives in `server/ai/form-fill.ts`.
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return unauthorized();

  const {segments, currentForm} = (await req.json()) as {
    segments: FormFillSegment[];
    currentForm: MoHFormData;
  };

  try {
    const form = await fillForm(segments, currentForm);
    return NextResponse.json({form});
  } catch (error) {
    if (error instanceof InvalidAIResponseError) {
      return NextResponse.json({error: error.message}, {status: 500});
    }
    throw error;
  }
}