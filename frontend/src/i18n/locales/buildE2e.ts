/** E2E adımları — TR/EN metin çiftleri (i18n anahtarları: e2e.step.{id}.{screen|control|mock}) */
export type E2eTriple = { id: number; screen: string; control: string; mock: string }

export function expandE2eKeys(rows: E2eTriple[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const r of rows) {
    out[`e2e.step.${r.id}.screen`] = r.screen
    out[`e2e.step.${r.id}.control`] = r.control
    out[`e2e.step.${r.id}.mock`] = r.mock
  }
  return out
}
