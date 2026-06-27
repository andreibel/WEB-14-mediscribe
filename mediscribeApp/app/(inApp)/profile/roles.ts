// Roles allowed by the public.users.role CHECK constraint, with Hebrew labels
// for the picker. Keep ROLE_VALUES in sync with the DB constraint.

export const ROLE_VALUES = [
  "physician",
  "nurse",
  "charge-nurse",
  "paramedic",
  "admin",
] as const;

export type Role = (typeof ROLE_VALUES)[number];

export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "physician", label: "רופא/ה" },
  { value: "nurse", label: "אח/ות" },
  { value: "charge-nurse", label: "אח/ות אחראי/ת" },
  { value: "paramedic", label: "פרמדיק/ית" },
  { value: "admin", label: "מנהל/ת" },
];

export function isRole(value: string): value is Role {
  return (ROLE_VALUES as readonly string[]).includes(value);
}