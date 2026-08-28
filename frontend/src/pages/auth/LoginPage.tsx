import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Logo from "../../components/common/Logo";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../services/api";

function LoginPage() {
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    const home =
      user?.role === "CUSTOMER" ? "/portal" : user?.role === "TECHNICIAN" ? "/field" : "/dashboard";
    return <Navigate to={home} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      toast.success("Signed in successfully");
      const stored = localStorage.getItem("keystone_user");
      const role = stored ? (JSON.parse(stored) as { role?: string }).role : undefined;
      navigate(role === "CUSTOMER" ? "/portal" : role === "TECHNICIAN" ? "/field" : "/dashboard");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to sign in"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[var(--ink)] text-white lg:flex lg:flex-col lg:justify-between">
        <div className="ks-grid-bg absolute inset-0 opacity-60" />
        <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10 p-10">
          <Logo variant="light" />
        </div>

        <div className="relative z-10 space-y-5 px-10 pb-16 ks-slide-up">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300/90">
            Field Service Platform
          </p>
          <h2 className="font-display max-w-md text-4xl font-semibold leading-tight tracking-tight text-white">
            Keystone
          </h2>
          <p className="max-w-sm text-base leading-relaxed text-slate-300">
            Dispatch technicians, track SLA, and keep commercial facilities running — from one
            operations console.
          </p>
          <ul className="space-y-2 pt-2 text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" /> Live dispatch & scheduling
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" /> SLA compliance monitoring
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" /> Customer self-service portal
            </li>
          </ul>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="ks-fade-in w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Welcome back</p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-slate-500">Access your Keystone operations workspace.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Customer account?{" "}
            <Link to="/register" className="font-semibold text-teal-700 hover:text-teal-800">
              Register for the portal
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;
