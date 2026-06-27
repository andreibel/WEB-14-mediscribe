/**
 * Backend logic for Soniox transcription auth. No HTTP here — the route handler
 * (`app/api/soniox-token/route.ts`) handles request/response.
 */

/** Thrown when Soniox refuses to issue a temporary key. */
export class SonioxTokenError extends Error {
  constructor() {
    super("Failed to create token");
    this.name = "SonioxTokenError";
  }
}

/**
 * Mint a short-lived, single-use Soniox API key scoped to `userId`, for the
 * browser to open a transcription WebSocket without ever seeing our real key.
 * Throws {@link SonioxTokenError} on failure.
 */
export async function createSonioxToken(userId: string): Promise<string> {
  const res = await fetch("https://api.soniox.com/v1/auth/temporary-api-key", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SONIOX_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      usage_type: "transcribe_websocket",
      expires_in_seconds: 60,
      single_use: true,
      max_session_duration_seconds: 7200,
      client_reference_id: userId,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Soniox token error", res.status, text);
    throw new SonioxTokenError();
  }

  const {api_key} = (await res.json()) as {api_key: string};
  return api_key;
}