"use client";

import { useState, useTransition } from "react";
import {
  Volume2,
  VolumeX,
  Radio,
  BellRing,
  Crosshair,
  Check,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";
import {
  PROTOCOL_SETTINGS_KEY,
  type ProtocolSettings,
} from "@/lib/preferences";
import { saveProtocolDefaults } from "./actions";

type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Global defaults for the protocol panel. These persist to the signed-in user's
 * account (users.preferences.protocol) so they follow them across devices.
 *
 * `initial` is loaded server-side from Supabase. Each toggle updates optimistically,
 * writes through the saveProtocolDefaults server action, and mirrors the value into
 * the localStorage key the in-session panel reads — so an open session reflects the
 * change immediately without a round-trip.
 */
export function ProtocolDefaults({ initial }: { initial: ProtocolSettings }) {
  const [settings, setSettings] = useState<ProtocolSettings>(initial);
  const [state, setState] = useState<SaveState>("idle");
  const [, startTransition] = useTransition();

  function update(patch: Partial<ProtocolSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next); // optimistic

    // Mirror into the localStorage key the in-session panel reads, so an active
    // session picks up the new default without waiting on the DB.
    try {
      localStorage.setItem(PROTOCOL_SETTINGS_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota/availability errors */
    }

    setState("saving");
    startTransition(async () => {
      const res = await saveProtocolDefaults(next);
      setState(res.ok ? "saved" : "error");
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        dir="rtl"
        className="flex flex-col gap-1 rounded-xl border border-[#E8E2D9] bg-[#FFFEF9] p-2 dark:border-[#2E2A27] dark:bg-[#1C1917]"
      >
        <Toggle
          size="md"
          icon={Radio}
          label="זיהוי פרוטוקול אוטומטי"
          on={settings.autoDetect}
          onClick={() => update({ autoDetect: !settings.autoDetect })}
        />
        <Toggle
          size="md"
          icon={Crosshair}
          label="מעקב מצלמה אחר השלב הנוכחי"
          on={settings.follow}
          onClick={() => update({ follow: !settings.follow })}
        />
        <Toggle
          size="md"
          icon={settings.sound ? Volume2 : VolumeX}
          label="צליל התראה"
          on={settings.sound}
          onClick={() => update({ sound: !settings.sound })}
        />
        <Toggle
          size="md"
          icon={BellRing}
          label="התראות דפדפן"
          on={settings.browserNotify}
          onClick={() => update({ browserNotify: !settings.browserNotify })}
        />
      </div>

      <SaveStatus state={state} />
    </div>
  );
}

function SaveStatus({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  if (state === "saving") {
    return (
      <span className="flex items-center gap-1.5 self-end text-[12px] text-[#8A7E72] dark:text-[#9A8F82]">
        <Loader2 size={13} className="animate-spin" /> Saving…
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="flex items-center gap-1.5 self-end text-[12px] font-medium text-[#0e7a5f] dark:text-[#34d399]">
        <Check size={13} strokeWidth={2.5} /> Saved
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 self-end text-[12px] font-medium text-[#C0492B] dark:text-[#E08A6E]">
      <TriangleAlert size={13} strokeWidth={2.5} /> Couldn’t save — try again
    </span>
  );
}

export default ProtocolDefaults;