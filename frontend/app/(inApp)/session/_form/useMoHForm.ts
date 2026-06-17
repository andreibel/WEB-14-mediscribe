import type { Dispatch, SetStateAction } from 'react'
import type { MoHFormData } from './formSchema'

/**
 * Encapsulates every mutation against MoHFormData so MoHForm.tsx only deals
 * with layout. All updaters are immutable and operate via the `setData` setter
 * passed in by the parent (the form is fully controlled).
 */
export function useMoHForm(setData: Dispatch<SetStateAction<MoHFormData>>) {
  function set<K extends keyof MoHFormData>(section: K, patch: Partial<MoHFormData[K]>) {
    setData(prev => ({ ...prev, [section]: { ...(prev[section] as object), ...patch } }))
  }

  function updateMedName(mi: number, name: string) {
    setData(prev => {
      const meds = [...prev.resuscitationProcess.meds]
      meds[mi] = { ...meds[mi], name }
      return { ...prev, resuscitationProcess: { ...prev.resuscitationProcess, meds } }
    })
  }

  function updateMedDose(mi: number, dose: string) {
    setData(prev => {
      const meds = [...prev.resuscitationProcess.meds]
      meds[mi] = { ...meds[mi], dose }
      return { ...prev, resuscitationProcess: { ...prev.resuscitationProcess, meds } }
    })
  }

  function updateMedTime(mi: number, ti: number, time: string) {
    setData(prev => {
      const meds = [...prev.resuscitationProcess.meds]
      const times = [...meds[mi].times]
      times[ti] = time
      meds[mi] = { ...meds[mi], times }
      return { ...prev, resuscitationProcess: { ...prev.resuscitationProcess, meds } }
    })
  }

  function updateProc(pi: number, val: boolean) {
    setData(prev => {
      const procedures = [...prev.resuscitationProcess.procedures]
      procedures[pi] = val
      return { ...prev, resuscitationProcess: { ...prev.resuscitationProcess, procedures } }
    })
  }

  function updateDefiTime(ti: number, val: string) {
    setData(prev => {
      const defibrillationTimes = [...prev.resuscitationProcess.defibrillationTimes]
      defibrillationTimes[ti] = val
      return { ...prev, resuscitationProcess: { ...prev.resuscitationProcess, defibrillationTimes } }
    })
  }

  function updateDefiEnergy(ei: number, val: string) {
    setData(prev => {
      const defibrillationEnergies = [...prev.resuscitationProcess.defibrillationEnergies]
      defibrillationEnergies[ei] = val
      return { ...prev, resuscitationProcess: { ...prev.resuscitationProcess, defibrillationEnergies } }
    })
  }

  function updateHeartSlot(i: number, patch: Partial<MoHFormData['heartRhythm']['slots'][0]>) {
    setData(prev => {
      const slots = [...prev.heartRhythm.slots]
      slots[i] = { ...slots[i], ...patch }
      return { ...prev, heartRhythm: { slots } }
    })
  }

  function handleSign() {
    const now = new Date()
    setData(prev => ({
      ...prev,
      signed: true,
      signedAt: now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
    }))
  }

  return {
    set, updateMedName, updateMedDose, updateMedTime, updateProc,
    updateDefiTime, updateDefiEnergy, updateHeartSlot, handleSign,
  }
}
