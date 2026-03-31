type Props = {
  children: React.ReactNode
}

/**
 * Glass shell için kök sarmalayıcı — asıl cam yüzey ve nav stilleri `glassmorphism.css`
 * içinde `.gm-glass-sidebar-root` altında tanımlı (klasik Sidebar.tsx’e dokunulmaz).
 */
export function GlassSidebar({ children }: Props) {
  return <div className="gm-glass-sidebar-root w-full md:overflow-visible">{children}</div>
}
