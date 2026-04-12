import { useMemo } from 'react'
import { useI18n } from '../../i18n/I18nProvider'

/** Mühendislik / [Modül adı] / … ortak breadcrumb parçaları */
export function useMptsBreadcrumb() {
  const { t } = useI18n()
  return useMemo(() => {
    const eng = t('mpts.breadcrumb.eng')
    const mod = t('nav.manualPieceStudio')
    const cat = t('mpts.breadcrumb.catalog')
    const tpl = t('mpts.breadcrumb.templates')
    const prod = t('mpts.breadcrumb.production')
    const mi = t('mpts.layout.nav.materialItems')
    const asm = t('mpts.layout.nav.assemblies')
    return {
      catalogList: `${eng} / ${mod} / ${cat}`,
      templatesList: `${eng} / ${mod} / ${tpl}`,
      productionList: `${eng} / ${mod} / ${prod}`,
      materialItemForm: `${eng} / ${mod} / ${cat} / ${mi}`,
      assemblyForm: `${eng} / ${mod} / ${cat} / ${asm}`,
      templateDetail: `${eng} / ${mod} / ${tpl}`,
      productionEdit: `${eng} / ${mod} / ${prod}`,
    }
  }, [t])
}
