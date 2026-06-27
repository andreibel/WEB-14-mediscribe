import { redirect } from 'next/navigation'

// Sessions now live at /session/[id]. Start one from the dashboard.
export default function SessionIndex() {
  redirect('/dashboard')
}
