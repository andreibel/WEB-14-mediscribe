import { redirect } from "next/navigation";
import { Mail, Stethoscope } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProfileActions } from "./ProfileActions";

type ProfileRow = {
  name: string;
  name_he: string;
  name_en: string | null;
  role: string;
  role_display: string | null;
  initials: string;
  color: string;
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already gates this route, but a server page that needs the
  // user's identity stays defensive in case the session expired mid-request.
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("users")
    .select("name, name_he, name_en, role, role_display, initials, color")
    .eq("id", user.id)
    .maybeSingle();
  const profile = data as ProfileRow | null;

  const email = user.email ?? "";
  const displayName = profile?.name || email || "—";
  const roleLabel = profile?.role_display ?? profile?.role;
  const initials = profile?.initials ?? email.slice(0, 2).toUpperCase();
  const color = profile?.color ?? "#8A7E72";

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 px-4 pt-20 pb-12 bg-[#FAF7F4] dark:bg-[#141210]">
      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#C15F3C]">
        Profile
      </span>

      <section className="flex w-full max-w-md flex-col gap-5">
        <div className="flex items-center gap-4 rounded-xl border border-[#E8E2D9] bg-[#FFFEF9] p-5 dark:border-[#2E2A27] dark:bg-[#1C1917]">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-[18px] font-bold text-white shadow-sm"
            style={{ background: color }}
          >
            {initials}
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-[17px] font-bold tracking-[-0.01em] text-[#1A1A18] dark:text-[#F3EEE6]">
              {displayName}
            </span>
            {profile?.name_en && (
              <span className="truncate text-[12px] text-[#A89D90] dark:text-[#6E665D]">
                {profile.name_en}
              </span>
            )}
            {roleLabel && (
              <span className="flex items-center gap-1.5 text-[12.5px] text-[#8A7E72] dark:text-[#9A8F82]">
                <Stethoscope size={13} strokeWidth={2} />
                {roleLabel}
              </span>
            )}
            <span className="flex items-center gap-1.5 truncate text-[12.5px] text-[#8A7E72] dark:text-[#9A8F82]">
              <Mail size={13} strokeWidth={2} />
              {email}
            </span>
          </div>
        </div>

        <ProfileActions />
      </section>
    </main>
  );
}
