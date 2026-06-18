"use client";

import { Volume2, VolumeX, Radio, BellRing, Crosshair } from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";
import { useProtocolSettings } from "@/app/(inApp)/session/_protocol/settings";

/**
 * Global defaults for the protocol panel — the exact same localStorage-backed
 * settings the in-session panel reads/writes, just reachable without an
 * active session.
 */
export function ProtocolDefaults() {
  const [settings, updateSettings] = useProtocolSettings();

  return (
    <div
      dir="rtl"
      className="flex flex-col gap-1 rounded-xl border border-[#E8E2D9] bg-[#FFFEF9] p-2 dark:border-[#2E2A27] dark:bg-[#1C1917]"
    >
      <Toggle
        size="md"
        icon={Radio}
        label="זיהוי פרוטוקול אוטומטי"
        on={settings.autoDetect}
        onClick={() => updateSettings({ autoDetect: !settings.autoDetect })}
      />
      <Toggle
        size="md"
        icon={Crosshair}
        label="מעקב מצלמה אחר השלב הנוכחי"
        on={settings.follow}
        onClick={() => updateSettings({ follow: !settings.follow })}
      />
      <Toggle
        size="md"
        icon={settings.sound ? Volume2 : VolumeX}
        label="צליל התראה"
        on={settings.sound}
        onClick={() => updateSettings({ sound: !settings.sound })}
      />
      <Toggle
        size="md"
        icon={BellRing}
        label="התראות דפדפן"
        on={settings.browserNotify}
        onClick={() => updateSettings({ browserNotify: !settings.browserNotify })}
      />
    </div>
  );
}

export default ProtocolDefaults;
