import { useSearchParams } from 'react-router-dom'
import { ApprovalFlowDesignerLegacy } from './ApprovalFlowDesignerLegacy'
import { ApprovalFlowDesignerModuleView } from './ApprovalFlowDesignerModuleView'
import { useApprovalFlowDesignerState } from './useApprovalFlowDesignerState'

export function ApprovalFlowDesignerView() {
  const [sp] = useSearchParams()
  const state = useApprovalFlowDesignerState()
  if (sp.get('legacy') === '1') {
    return <ApprovalFlowDesignerLegacy {...state} />
  }
  return <ApprovalFlowDesignerModuleView {...state} />
}
