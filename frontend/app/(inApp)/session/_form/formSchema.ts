// Ministry of Health — Appendix Z (נספח ז)
// This type is the single source of truth for both the form UI and the AI fill prompt.

export interface MoHFormData {
  // ── Patient ──────────────────────────────────────────────────────────────
  patient: {
    name: string
    id: string
    address: string
    phone: string
    emergencyContact: string
    emergencyPhone: string
    hmo: string
    age: string
  }

  // ── Pre-resuscitation ─────────────────────────────────────────────────────
  preResuscitation: {
    date: string             // DD/MM/YYYY
    timeFound: string        // HH:MM
    timeStarted: string      // HH:MM
    timeTeamArrived: string  // HH:MM
    location: string
    witnessTeamMedical: boolean
    witnessTeamNursing: boolean
    witnessFamily: boolean
    witnessOther: boolean
    witnessOtherText: string
    reasonCardiacArrest: boolean
    reasonRespiratoryArrest: boolean
    consciousness: 'מעורפל' | 'ללא הכרה' | ''
    responsive: 'כן' | 'לא' | ''
    respiratoryStatus: 'נושם' | 'לא נושם' | 'מונשם' | ''
    backgroundCardiac: boolean
    backgroundRespiratory: boolean
    backgroundTrauma: boolean
    backgroundElectrolyte: boolean
    backgroundOther: string
  }

  // ── Heart Rhythm table ────────────────────────────────────────────────────
  heartRhythm: {
    slots: Array<{ time: string; assessment: string }>
  }

  // ── Resuscitation process (meds + procedures) ─────────────────────────────
  resuscitationProcess: {
    meds: Array<{ name: string; dose: string; times: string[] }>
    procedures: boolean[]
    defibrillationTimes: string[]
    defibrillationEnergies: string[]
    ivAccess: boolean
    procedureOther: string
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  summary: {
    endTime: string
    deathDeclared: 'כן' | 'לא' | ''
    spontaneousBreathing: 'כן' | 'לא' | 'מונשם' | ''
    heartRateEnd: string
    saturation: string
    etco2End: string
    bpEnd: string
    consciousnessEnd: 'מעורפל' | 'ללא הכרה' | 'מורדם' | ''
    transferredTo: string
    transferMethod: string
    transferTime: string
    notTransferred: boolean
  }

  // ── Staff ─────────────────────────────────────────────────────────────────
  staff: {
    member1: string
    member2: string
    member3: string
    approver: string
  }

  // ── Sign-off ──────────────────────────────────────────────────────────────
  signed: boolean
  signedBy: string
  signedAt: string
}

export const EMPTY_FORM: MoHFormData = {
  patient: { name: '', id: '', address: '', phone: '', emergencyContact: '', emergencyPhone: '', hmo: '', age: '' },
  preResuscitation: {
    date: '', timeFound: '', timeStarted: '', timeTeamArrived: '', location: '',
    witnessTeamMedical: false, witnessTeamNursing: false, witnessFamily: false,
    witnessOther: false, witnessOtherText: '',
    reasonCardiacArrest: false, reasonRespiratoryArrest: false,
    consciousness: '', responsive: '', respiratoryStatus: '',
    backgroundCardiac: false, backgroundRespiratory: false,
    backgroundTrauma: false, backgroundElectrolyte: false, backgroundOther: '',
  },
  heartRhythm: {
    slots: Array.from({ length: 5 }, () => ({ time: '', assessment: '' })),
  },
  resuscitationProcess: {
    meds: [
      { name: 'ADRENALINE',       dose: '', times: Array<string>(9).fill('') },
      { name: 'ATROPINE',         dose: '', times: Array<string>(9).fill('') },
      { name: 'AMIODARONE',       dose: '', times: Array<string>(9).fill('') },
      { name: 'Lidocaine HCl 2%', dose: '', times: Array<string>(9).fill('') },
      { name: 'Midazolam',        dose: '', times: Array<string>(9).fill('') },
      { name: 'BICARBONATE',      dose: '', times: Array<string>(9).fill('') },
      { name: 'MAGNESIUM',        dose: '', times: Array<string>(9).fill('') },
      { name: 'Flumazenil',       dose: '', times: Array<string>(9).fill('') },
      { name: 'Naloxone',         dose: '', times: Array<string>(9).fill('') },
      { name: 'DOPAMINE',         dose: '', times: Array<string>(9).fill('') },
      { name: 'אחר',              dose: '', times: Array<string>(9).fill('') },
    ],
    procedures: Array<boolean>(11).fill(false),
    defibrillationTimes: Array<string>(9).fill(''),
    defibrillationEnergies: Array<string>(9).fill(''),
    ivAccess: false,
    procedureOther: '',
  },
  summary: {
    endTime: '', deathDeclared: '',
    spontaneousBreathing: '', heartRateEnd: '',
    saturation: '', etco2End: '', bpEnd: '',
    consciousnessEnd: '',
    transferredTo: '', transferMethod: '', transferTime: '', notTransferred: false,
  },
  staff: { member1: '', member2: '', member3: '', approver: '' },
  signed: false, signedBy: '', signedAt: '',
}
