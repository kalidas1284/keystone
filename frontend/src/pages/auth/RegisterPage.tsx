import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Logo from "../../components/common/Logo";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../services/api";

function RegisterPage() {
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({
        fullName,
        email,
        password,
        phoneNumber: phoneNumber || undefined,
        role: "CUSTOMER",
      });
      toast.success("Customer account created. Please sign in.");
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(getErrorMessage(err, "Unable to register"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[var(--ink)] text-white lg:flex lg:flex-col lg:justify-between">
        <div className="ks-grid-bg absolute inset-0 opacity-60" />
        <div className="absolute -left-16 top-20 h-64 w-64 rounded-full bg-teal-500/25 blur-3xl" />
        <div className="relative z-10 p-10">
          <Logo variant="light" />
        </div>
        <div className="relative z-10 space-y-4 px-10 pb-16 ks-slide-up">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300/90">
            Customer Portal
          </p>
          <h2 className="font-display max-w-md text-4xl font-semibold leading-tight text-white">
            Keystone
          </h2>
          <p className="max-w-sm text-base text-slate-300">
            Submit service requests, track progress, and view invoices — without calling the desk.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="ks-fade-in w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Get started</p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
            Create portal account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            For facility contacts. Staff accounts are provisioned by an administrator.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
              <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            {error && (
              <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default RegisterPage;
