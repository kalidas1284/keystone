import EmptyState from "../../components/ui/EmptyState";

function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
        <p className="mt-1 text-sm text-slate-500">Out of scope for KEYSTONE spec.</p>
      </div>
      <EmptyState
        title="Invoices are disabled"
        description="The spec explicitly excludes payment processing, invoicing engines, and accounting integrations. Keystone tracks parts/time and work-order lifecycle only."
      />
    </div>
  );
}

export default InvoicesPage;
