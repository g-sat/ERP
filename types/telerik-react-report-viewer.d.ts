declare module "@progress/telerik-react-report-viewer" {
  import { Component, CSSProperties } from "react"

  export interface ITelerikReportViewerProps {
    id?: string
    serviceUrl?: string
    reportServer?: {
      url?: string
      username?: string
      password?: string
    }
    templateUrl?: string
    reportSource?: {
      report?: string
      parameters?: Record<string, unknown>
    }
    sendEmail?: {
      enabled?: boolean
      from?: string
      to?: string
      cc?: string
      subject?: string
      body?: string
      format?: string
    }
    scale?: number
    scaleMode?: string
    viewMode?: string
    pageMode?: string
    printMode?: string
    parameters?: {
      editors?: {
        singleSelect?: string
        multiSelect?: string
      }
    }
    persistSession?: boolean
    parameterEditors?: Array<{
      match?: () => boolean
      createEditor?: () => HTMLElement
    }>
    authenticationToken?: string
    ready?: () => void
    exportBegin?: () => void
    exportEnd?: () => void
    printBegin?: () => void
    printEnd?: () => void
    renderingBegin?: () => void
    renderingEnd?: () => void
    sendEmailBegin?: () => void
    sendEmailEnd?: () => void
    updateUi?: () => void
    pageReady?: () => void
    error?: (error: Error) => void
    interactiveActionExecuting?: () => void
    interactiveActionEnter?: () => void
    interactiveActionLeave?: () => void
    viewerToolTipOpening?: () => void
    enableAccessibility?: boolean
    searchMetadataOnDemand?: boolean
    initialPageAreaImageUrl?: string
    selector?: string
    disabledButtonClass?: string
    checkedButtonClass?: string
    parametersAreaVisible?: boolean
    documentMapVisible?: boolean
    documentMapAreaPosition?: string
    parametersAreaPosition?: string
    keepClientAlive?: boolean
    viewerContainerStyle?: CSSProperties
  }

  export interface ITelerikReportViewerCommands {
    print: {
      exec: () => void
    }
    [key: string]: {
      exec: () => void
    }
  }

  export class TelerikReportViewer extends Component<ITelerikReportViewerProps> {
    refreshReport(): TelerikReportViewer
    getReportSource(): { report: string; parameters: Record<string, unknown> }
    setReportSource(reportSource: {
      report: string
      parameters?: Record<string, unknown>
    }): TelerikReportViewer
    dispose?(): void
    viewerObject?: {
      dispose?: () => void
    }
    commands: ITelerikReportViewerCommands
  }
}
