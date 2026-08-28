import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import customerService from "../../services/customerService";
import { getErrorMessage } from "../../services/api";
import type { CustomerRequest } from "../../types/domain";

const emptyForm: CustomerRequest = {
  name: "",
  email: "",
  phone: "",
  companyName: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  notes: "",
};

function CustomerFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState<CustomerRequest>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !id) return;
    const load = async () => {
      try {
        const customer = await customerService.getCustomer(Number(id));
        setForm({
          name: customer.name,
          email: customer.email,
          phone: customer.phone || "",
          companyName: customer.companyName || "",
          address: customer.address || "",
          city: customer.city || "",
          state: customer.state || "",
          postalCode: customer.postalCode || "",
          notes: customer.notes || "",
        });
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load customer"));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, isEdit]);

  const onChange = (field: keyof CustomerRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit && id) {
        await customerService.updateCustomer(Number(id), form);
        navigate(`/customers/${id}`);
      } else {
        const created = await customerService.createCustomer(form);
        navigate(`/customers/${created.id}`);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save customer"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? "Edit Customer" : "New Customer"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">Customer profile for service operations</p>
      </div>

      <Card>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
            <Input value={form.name} onChange={(e) => onChange("name", e.target.value)} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <Input type="email" value={form.email} onChange={(e) => onChange("email", e.target.value)} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
            <Input value={form.phone || ""} onChange={(e) => onChange("phone", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Company</label>
            <Input value={form.companyName || ""} onChange={(e) => onChange("companyName", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Address</label>
            <Input value={form.address || ""} onChange={(e) => onChange("address", e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">City</label>
            <Input value={form.city || ""} onChange={(e) => onChange("city", e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">State</label>
            <Input value={form.state || ""} onChange={(e) => onChange("state", e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Postal Code</label>
            <Input value={form.postalCode || ""} onChange={(e) => onChange("postalCode", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              rows={4}
              value={form.notes || ""}
              onChange={(e) => onChange("notes", e.target.value)}
            />
          </div>

          {error && (
            <div className="md:col-span-2">
              <ErrorMessage message={error} />
            </div>
          )}

          <div className="md:col-span-2 flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Customer"}
            </Button>
            <Link to={isEdit ? `/customers/${id}` : "/customers"}>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default CustomerFormPage;
