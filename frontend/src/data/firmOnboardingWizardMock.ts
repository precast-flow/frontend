/**
 * firm-02 — İlk firma kurulum sihirbazı (mock).
 * Tam doldurulmuş tek örnek tenant (Acme).
 */

export type ShiftPolicyId = 'single' | 'two' | 'three'

export type FirmWizardFormState = {
  legalName: string
  shortName: string
  taxId: string
  logoFileName: string | null
  shiftPolicy: ShiftPolicyId
  factoryCode: string
  factoryName: string
  factoryCity: string
  adminName: string
  adminEmail: string
  adminPhone: string
}

/** MOCK — sihirbaz açılışında dolu örnek */
export const WIZARD_SEED: FirmWizardFormState = {
  legalName: 'Acme Prefabrik A.Ş.',
  shortName: 'Acme',
  taxId: '1234567890',
  logoFileName: null,
  shiftPolicy: 'three',
  factoryCode: 'IST-HAD',
  factoryName: 'Hadımköy Üretim Tesisi',
  factoryCity: 'İstanbul',
  adminName: 'Ayşe Yılmaz',
  adminEmail: 'ayse.yilmaz@acme-prefabrik.example',
  adminPhone: '+90 532 000 00 00',
}

export const SHIFT_POLICY_OPTIONS: { id: ShiftPolicyId; labelKey: string; hintKey: string }[] = [
  { id: 'single', labelKey: 'firmWizard.shift.single', hintKey: 'firmWizard.shift.singleHint' },
  { id: 'two', labelKey: 'firmWizard.shift.two', hintKey: 'firmWizard.shift.twoHint' },
  { id: 'three', labelKey: 'firmWizard.shift.three', hintKey: 'firmWizard.shift.threeHint' },
]
