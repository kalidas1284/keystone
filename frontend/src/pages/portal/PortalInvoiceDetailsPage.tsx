import EmptyState from "../../components/ui/EmptyState";
function PortalInvoiceDetailsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
      <EmptyState
        title="Invoices are disabled"
        description="Out of scope for Keystone KEYSTONE spec. Please use request tracking and work-order status history instead."
      />
    </div>
  );
}

export default PortalInvoiceDetailsPage;
