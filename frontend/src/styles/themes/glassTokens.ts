/**
 * Glass tema token’ları → CSS custom properties (`glassmorphism.css`).
 * `html[data-ui-template="glass"]` ile uygulanır (önyüklemede sabitlenir).
 *
 * @see promts/22-ui-glass-tema-migrasyon/glass-02-token-css-katman-mimari.md
 */
export const glassTokens = {
  /* Canonical (legacy isimler) */
  'glass.bg.primary': 'var(--glass-bg-primary)',
  'glass.bg.panel': 'var(--glass-bg-panel)',
  'glass.bg.panelStrong': 'var(--glass-bg-panel-strong)',
  'glass.bg.widget': 'var(--glass-bg-widget)',
  'glass.border.soft': 'var(--glass-border-soft)',
  'glass.border.muted': 'var(--glass-border-muted)',
  'glass.text.primary': 'var(--glass-text-primary)',
  'glass.text.muted': 'var(--glass-text-muted)',
  'glass.accent.primary': 'var(--glass-accent-primary)',
  'glass.accent.secondary': 'var(--glass-accent-secondary)',
  'glass.shadow.soft': 'var(--glass-shadow-soft)',
  'glass.shadow.elevated': 'var(--glass-shadow-elevated)',
  'glass.blur.sm': 'var(--glass-blur-sm)',
  'glass.blur.md': 'var(--glass-blur-md)',
  'glass.blur.lg': 'var(--glass-blur-lg)',

  /* glass-02 — semantik yüzey / border / metin */
  'glass.surface.page': 'var(--glass-surface-page)',
  'glass.surface.panel': 'var(--glass-surface-panel)',
  'glass.surface.panelStrong': 'var(--glass-surface-panel-strong)',
  'glass.surface.widget': 'var(--glass-surface-widget)',
  'glass.border.default': 'var(--glass-border-default)',
  'glass.border.subtle': 'var(--glass-border-subtle)',
  'glass.text.secondary': 'var(--glass-text-secondary)',
  'glass.text.disabled': 'var(--glass-text-disabled)',

  /* Durum ve gölge */
  'glass.state.hoverOverlay': 'var(--glass-state-hover-overlay)',
  'glass.state.activeOverlay': 'var(--glass-state-active-overlay)',
  'glass.state.selectedBg': 'var(--glass-state-selected-bg)',
  'glass.shadow.raise': 'var(--glass-shadow-raise)',
  'glass.shadow.inset': 'var(--glass-shadow-inset)',
} as const

export type GlassTokenKey = keyof typeof glassTokens

/** glass-03 — isteğe bağlı Tailwind ile birleştirilecek yardımcı sınıf adları */
export const glassPrimitiveClasses = {
  btnPrimary: 'gm-glass-btn-primary',
  btnSecondary: 'gm-glass-btn-secondary',
  btnGhost: 'gm-glass-btn-ghost',
  btnDanger: 'gm-glass-btn-danger',
  cardInset: 'gm-glass-card-inset',
  control: 'gm-glass-control',
  surfacePanel: 'gm-glass-surface-panel',
  solidRow: 'gm-glass-solid-row',
  divider: 'gm-glass-divider',
} as const
