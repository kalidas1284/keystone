import EmptyState from "../../components/ui/EmptyState";

function PortalInvoicesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
      <EmptyState
        title="Invoices are disabled"
        description="The KEYSTONE spec excludes payment processing, invoicing, and accounting integrations. This portal focuses on request tracking."
      />
    </div>
  );
}

export default PortalInvoicesPage;
