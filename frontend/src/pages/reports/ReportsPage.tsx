import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Loader from "../../components/ui/Loader";
import { getErrorMessage } from "../../services/api";
import reportService from "../../services/reportService";
import type {
  CustomerSummaryItem,
  InventoryReport,
  SiteSummaryItem,
  TechnicianWorkloadItem,
  WorkOrderSummaryReport,
} from "../../types/domain";
import { downloadCsv } from "../../utils/csv";

function ReportsPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrderSummaryReport | null>(null);
  const [technicians, setTechnicians] = useState<TechnicianWorkloadItem[]>([]);
  const [customers, setCustomers] = useState<CustomerSummaryItem[]>([]);
  const [sites, setSites] = useState<SiteSummaryItem[]>([]);
  const [inventory, setInventory] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [wo, tech, cust, site, inv] = await Promise.all([
          reportService.getWorkOrderReport(),
          reportService.getTechnicianReport(),
          reportService.getCustomerReport(),
          reportService.getSiteReport(),
          reportService.getInventoryReport(),
        ]);
        setWorkOrders(wo);
        setTechnicians(tech);
        setCustomers(cust);
        setSites(site);
        setInventory(inv);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load reports"));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const exportAll = () => {
    if (!workOrders || !inventory) return;
    downloadCsv(
      "keystone-work-order-summary.csv",
      ["Metric", "Value"],
      [
        ["Total", workOrders.total],
        ["New", workOrders.newCount],
        ["Assigned", workOrders.assigned],
        ["Scheduled", workOrders.scheduled],
        ["In Progress", workOrders.inProgress],
        ["On Hold", workOrders.onHold],
        ["Completed", workOrders.completed],
        ["Closed", workOrders.closed],
        ["Cancelled", workOrders.cancelled],
      ]
    );
    downloadCsv(
      "keystone-technician-workload.csv",
      ["Technician", "Assigned", "Active", "Completed"],
      technicians.map((t) => [t.technicianName, t.assignedJobs, t.activeJobs, t.completedJobs])
    );
    downloadCsv(
      "keystone-customer-summary.csv",
      ["Customer", "Total", "Open", "Completed"],
      customers.map((c) => [c.customerName, c.totalWorkOrders, c.openWorkOrders, c.completedWorkOrders])
    );
    downloadCsv(
      "keystone-inventory-summary.csv",
      ["Metric", "Value"],
      [
        ["Total Items", inventory.totalItems],
        ["Low Stock", inventory.lowStock],
        ["Out of Stock", inventory.outOfStock],
        ["Stock Value", Number(inventory.stockValue).toFixed(2)],
      ]
    );
    downloadCsv(
      "keystone-site-summary.csv",
      ["Site", "Customer", "Location", "Total", "Open"],
      sites.map((s) => [s.siteName, s.customerName, s.location, s.totalWorkOrders, s.openWorkOrders])
    );
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">Operational summaries from live database data</p>
        </div>
        <Button variant="secondary" onClick={exportAll}>
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {workOrders && (
          <>
            <Card><p className="text-sm text-slate-500">Total Work Orders</p><p className="mt-2 text-3xl font-semibold">{workOrders.total}</p></Card>
            <Card><p className="text-sm text-slate-500">In Progress</p><p className="mt-2 text-3xl font-semibold">{workOrders.inProgress}</p></Card>
            <Card><p className="text-sm text-slate-500">Completed</p><p className="mt-2 text-3xl font-semibold">{workOrders.completed}</p></Card>
            <Card><p className="text-sm text-slate-500">Cancelled</p><p className="mt-2 text-3xl font-semibold">{workOrders.cancelled}</p></Card>
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold text-slate-900">Work Order Summary</h2>
          {workOrders && (
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex justify-between"><span>New</span><span>{workOrders.newCount}</span></li>
              <li className="flex justify-between"><span>Assigned</span><span>{workOrders.assigned}</span></li>
              <li className="flex justify-between"><span>Scheduled</span><span>{workOrders.scheduled}</span></li>
              <li className="flex justify-between"><span>On Hold</span><span>{workOrders.onHold}</span></li>
              <li className="flex justify-between"><span>Closed</span><span>{workOrders.closed}</span></li>
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold text-slate-900">Inventory Report</h2>
          {inventory && (
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex justify-between"><span>Total Items</span><span>{inventory.totalItems}</span></li>
              <li className="flex justify-between"><span>Low Stock</span><span>{inventory.lowStock}</span></li>
              <li className="flex justify-between"><span>Out of Stock</span><span>{inventory.outOfStock}</span></li>
              <li className="flex justify-between"><span>Stock Value</span><span>${Number(inventory.stockValue).toFixed(2)}</span></li>
            </ul>
          )}
        </Card>
      </div>

      <Card className="overflow-x-auto !p-0">
        <div className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900">Technician Workload</div>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Technician</th>
              <th className="px-4 py-3 font-medium">Assigned</th>
              <th className="px-4 py-3 font-medium">Active</th>
              <th className="px-4 py-3 font-medium">Completed</th>
            </tr>
          </thead>
          <tbody>
            {technicians.map((t) => (
              <tr key={t.technicianId} className="border-t border-slate-100">
                <td className="px-4 py-3">{t.technicianName}</td>
                <td className="px-4 py-3">{t.assignedJobs}</td>
                <td className="px-4 py-3">{t.activeJobs}</td>
                <td className="px-4 py-3">{t.completedJobs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="overflow-x-auto !p-0">
        <div className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900">Customer Summary</div>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Open</th>
              <th className="px-4 py-3 font-medium">Completed</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.customerId} className="border-t border-slate-100">
                <td className="px-4 py-3">{c.customerName}</td>
                <td className="px-4 py-3">{c.totalWorkOrders}</td>
                <td className="px-4 py-3">{c.openWorkOrders}</td>
                <td className="px-4 py-3">{c.completedWorkOrders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="overflow-x-auto !p-0">
        <div className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900">Site Summary</div>
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Site</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Open</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((s) => (
              <tr key={s.siteId} className="border-t border-slate-100">
                <td className="px-4 py-3">{s.siteName}</td>
                <td className="px-4 py-3">{s.customerName}</td>
                <td className="px-4 py-3">{s.location}</td>
                <td className="px-4 py-3">{s.totalWorkOrders}</td>
                <td className="px-4 py-3">{s.openWorkOrders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default ReportsPage;
