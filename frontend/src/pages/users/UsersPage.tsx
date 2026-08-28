import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import ErrorMessage from "../../components/ui/ErrorMessage";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import { ROLE_LABELS, type Role } from "../../constants/roles";
import { getErrorMessage } from "../../services/api";
import userService from "../../services/userService";
import type { User } from "../../types/user";

const STAFF_ROLES: Role[] = ["ADMIN", "MANAGER", "DISPATCHER", "TECHNICIAN"];

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "password123",
    phoneNumber: "",
    role: "DISPATCHER" as Role,
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.listUsers();
      setUsers(data.filter((u) => u.role !== "CUSTOMER"));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await userService.createUser({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber || undefined,
        role: form.role,
      });
      toast.success("Staff user created");
      setOpen(false);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create user"));
    }
  };

  const deactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await userService.deactivateUser(deactivateTarget.id);
      toast.success("User deactivated");
      setDeactivateTarget(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to deactivate user"));
      setDeactivateTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="mt-1 text-sm text-slate-500">Provision staff accounts (admin only)</p>
        </div>
        <Button onClick={() => setOpen(true)}>Add Staff User</Button>
      </div>

      {error && <ErrorMessage message={error} />}
      {loading ? (
        <Loader />
      ) : users.length === 0 ? (
        <EmptyState title="No staff users" />
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{u.fullName}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">{ROLE_LABELS[u.role]}</td>
                  <td className="px-4 py-3">
                    <Badge tone={u.active ? "success" : "danger"}>{u.active ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {u.active && (
                      <Button
                        variant="danger"
                        className="!px-2 !py-1 text-xs"
                        onClick={() => setDeactivateTarget(u)}
                      >
                        Deactivate
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        open={open}
        title="Add Staff User"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="user-form">
              Create
            </Button>
          </>
        }
      >
        <form id="user-form" className="space-y-3" onSubmit={create}>
          <Input
            required
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <Input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            type="password"
            required
            minLength={8}
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Input
            placeholder="Phone"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          />
          <Select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
          >
            {STAFF_ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </Select>
          <p className="text-xs text-slate-500">
            TECHNICIAN users still need a technician profile (Add Technician) to appear in the field roster.
          </p>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deactivateTarget}
        title="Deactivate user?"
        message={`Deactivate ${deactivateTarget?.fullName}? They will no longer be able to sign in.`}
        confirmLabel="Deactivate"
        onCancel={() => setDeactivateTarget(null)}
        onConfirm={() => void deactivate()}
      />
    </div>
  );
}

export default UsersPage;
