import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Select from "../../components/ui/Select";
import customerService from "../../services/customerService";
import { getErrorMessage } from "../../services/api";
import type { Customer } from "../../types/domain";
import { formatDate } from "../../utils/helpers";

function CustomerListPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<string>("true");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.listCustomers({
        search: search || undefined,
        active: active === "" ? undefined : active === "true",
        page,
        size: 10,
      });
      setCustomers(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load customers"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page, active]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(0);
    void load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage commercial facility customers</p>
        </div>
        <Link to="/customers/new">
          <Button>Add Customer</Button>
        </Link>
      </div>

      <Card>
        <form className="grid gap-3 md:grid-cols-[1fr_180px_auto]" onSubmit={handleSearch}>
          <Input
            placeholder="Search name, email, company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={active} onChange={(e) => setActive(e.target.value)}>
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
          <Button type="submit">Search</Button>
        </form>
      </Card>

      {error && <ErrorMessage message={error} />}
      {loading ? (
        <Loader />
      ) : customers.length === 0 ? (
        <EmptyState title="No customers found" description="Create a customer to get started." />
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link className="font-medium text-blue-600 hover:underline" to={`/customers/${customer.id}`}>
                      {customer.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{customer.companyName || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{customer.email}</td>
                  <td className="px-4 py-3 text-slate-600">{customer.city || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={customer.active ? "success" : "neutral"}>
                      {customer.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(customer.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-slate-500">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default CustomerListPage;
