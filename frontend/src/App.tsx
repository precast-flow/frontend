import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { FirmAdminShell } from './components/firmAdmin/FirmAdminShell'
import { MainCanvasOutlet } from './components/MainCanvasOutlet'
import { FirmAdminGeneralPage } from './pages/firmAdmin/FirmAdminGeneralPage'
import { FirmOnboardingWizardPage } from './pages/firmAdmin/FirmOnboardingWizardPage'
import { FirmAdminPlaceholderPage } from './pages/firmAdmin/FirmAdminPlaceholderPage'
import { FirmShiftCalendarPage } from './pages/firmAdmin/FirmShiftCalendarPage'
import { FirmFactoriesPage } from './pages/firmAdmin/FirmFactoriesPage'
import { FirmSettingsChangePreviewPage } from './pages/firmAdmin/FirmSettingsChangePreviewPage'
import { ForbiddenPage } from './pages/ForbiddenPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { SettingsPage } from './pages/SettingsPage'
import { ThemeProvider } from './theme/ThemeProvider'
import { FactoryProvider } from './context/FactoryContext'
import { I18nProvider } from './i18n/I18nProvider'
import { GlassShowcasePage } from './pages/GlassShowcasePage'
import { ShellResolver } from './templates/glassmorphism/ShellResolver'
import { ProjectManagementDetailPage } from './components/proje/ProjectManagementDetailPage'
import { CrmCustomerDetailPage } from './components/crm/CrmCustomerDetailPage'
import { QuoteDetailPage } from './components/teklif/QuoteDetailPage'

function App() {
  return (
    <I18nProvider>
    <ThemeProvider>
      <FactoryProvider>
      <BrowserRouter>
        <>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/firma-kurulum" element={<FirmOnboardingWizardPage />} />
          <Route path="/firma-ayarlari" element={<FirmAdminShell />}>
            <Route index element={<FirmAdminGeneralPage />} />
            <Route path="takvim" element={<FirmShiftCalendarPage />} />
            <Route path="fabrikalar" element={<FirmFactoriesPage />} />
            <Route path="kullanicilar" element={<FirmAdminPlaceholderPage />} />
            <Route path="degisiklik" element={<FirmSettingsChangePreviewPage />} />
            <Route path="guvenlik" element={<FirmAdminPlaceholderPage />} />
          </Route>
          <Route path="/" element={<ShellResolver />}>
            <Route index element={<MainCanvasOutlet />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="glass-showcase" element={<GlassShowcasePage />} />
            <Route path="proje-detay/:projectId" element={<ProjectManagementDetailPage />} />
            <Route path="teklif-detay/:quoteId" element={<QuoteDetailPage />} />
            <Route path="musteri-detay/:customerId" element={<CrmCustomerDetailPage />} />
            <Route path="muhendislik-okan" element={<Navigate to="/muhendislik" replace />} />
            <Route path=":moduleSlug/*" element={<MainCanvasOutlet />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </>
      </BrowserRouter>
    </FactoryProvider>
    </ThemeProvider>
    </I18nProvider>
  )
}

export default App
