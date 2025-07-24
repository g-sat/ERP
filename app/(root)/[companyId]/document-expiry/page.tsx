import DocumentForm from "./components/document-form"
import DocumentList from "./components/document-list"
import ExpiryReminder from "./components/expiry-reminder"

export default function Page() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Document Expiry Management</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Form */}
        <div className="lg:col-span-1">
          <DocumentForm />
        </div>

        {/* Right Column - Lists */}
        <div className="space-y-6 lg:col-span-2">
          <ExpiryReminder />
          <DocumentList />
        </div>
      </div>
    </div>
  )
}
