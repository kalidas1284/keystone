import EmptyState from "../../components/ui/EmptyState";

function InvoiceDetailsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
      <EmptyState
        title="Invoices are disabled"
        description="The spec explicitly excludes payment processing, invoicing engines, and accounting integrations. Keystone tracks work-order lifecycle, parts, and time only."
      />
    </div>
  );
}

export default InvoiceDetailsPage;
