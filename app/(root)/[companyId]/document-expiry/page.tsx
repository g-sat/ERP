import DocumentForm from "./components/document-form"
import DocumentList from "./components/document-list"
import ExpiryReminder from "./components/expiry-reminder"

export default function Page() {
  return (
    <div className="container mx-auto space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Document Expiry Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage and track document expiry dates
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-1">
          <DocumentForm />
        </div>

        {/* Right Column - Lists */}
        <div className="space-y-4 lg:col-span-2 lg:space-y-6">
          <ExpiryReminder />
          <DocumentList />
        </div>
      </div>
    </div>
  )
}
