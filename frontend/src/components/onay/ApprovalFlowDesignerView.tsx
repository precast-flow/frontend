import { ApprovalFlowDesignerModuleView } from './ApprovalFlowDesignerModuleView'
import { useApprovalFlowDesignerState } from './useApprovalFlowDesignerState'

export function ApprovalFlowDesignerView() {
  const state = useApprovalFlowDesignerState()
  return <ApprovalFlowDesignerModuleView {...state} />
}
