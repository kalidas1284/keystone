import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../constants/roles";

type ProtectedRouteProps = {
  allowedRoles?: Role[];
};

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const fallback =
      user.role === "CUSTOMER" ? "/portal" : user.role === "TECHNICIAN" ? "/field" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
