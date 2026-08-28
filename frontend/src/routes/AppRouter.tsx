import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import MainLayout from "../layouts/MainLayout";
import PortalLayout from "../layouts/PortalLayout";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import CustomerDetailsPage from "../pages/customers/CustomerDetailsPage";
import CustomerFormPage from "../pages/customers/CustomerFormPage";
import CustomerListPage from "../pages/customers/CustomerListPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import FieldJobsPage from "../pages/field/FieldJobsPage";
import InventoryPage from "../pages/inventory/InventoryPage";
import InvoiceDetailsPage from "../pages/invoices/InvoiceDetailsPage";
import InvoicesPage from "../pages/invoices/InvoicesPage";
import PortalHomePage from "../pages/portal/PortalHomePage";
import PortalInvoiceDetailsPage from "../pages/portal/PortalInvoiceDetailsPage";
import PortalInvoicesPage from "../pages/portal/PortalInvoicesPage";
import PortalRequestDetailsPage from "../pages/portal/PortalRequestDetailsPage";
import PortalRequestFormPage from "../pages/portal/PortalRequestFormPage";
import PortalRequestsPage from "../pages/portal/PortalRequestsPage";
import ProfilePage from "../pages/profile/ProfilePage";
import ReportsPage from "../pages/reports/ReportsPage";
import SchedulePage from "../pages/schedule/SchedulePage";
import TechnicianDetailsPage from "../pages/technicians/TechnicianDetailsPage";
import TechnicianListPage from "../pages/technicians/TechnicianListPage";
import UsersPage from "../pages/users/UsersPage";
import WorkOrderDetailsPage from "../pages/workorders/WorkOrderDetailsPage";
import WorkOrderFormPage from "../pages/workorders/WorkOrderFormPage";
import WorkOrderListPage from "../pages/workorders/WorkOrderListPage";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

function HomeRedirect() {
  const { user } = useAuth();
  if (user?.role === "CUSTOMER") {
    return <Navigate to="/portal" replace />;
  }
  if (user?.role === "TECHNICIAN") {
    return <Navigate to="/field" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["CUSTOMER"]} />}>
          <Route element={<PortalLayout />}>
            <Route path="/portal" element={<PortalHomePage />} />
            <Route path="/portal/requests" element={<PortalRequestsPage />} />
            <Route path="/portal/requests/new" element={<PortalRequestFormPage />} />
            <Route path="/portal/requests/:id" element={<PortalRequestDetailsPage />} />
            <Route path="/portal/invoices" element={<PortalInvoicesPage />} />
            <Route path="/portal/invoices/:id" element={<PortalInvoiceDetailsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "DISPATCHER", "TECHNICIAN"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomeRedirect />} />
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "DISPATCHER"]} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["TECHNICIAN"]} />}>
              <Route path="/field" element={<FieldJobsPage />} />
            </Route>
            <Route path="/profile" element={<ProfilePage />} />

            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "DISPATCHER"]} />}>
              <Route path="/customers" element={<CustomerListPage />} />
              <Route path="/customers/new" element={<CustomerFormPage />} />
              <Route path="/customers/:id" element={<CustomerDetailsPage />} />
              <Route path="/customers/:id/edit" element={<CustomerFormPage />} />
              <Route path="/technicians" element={<TechnicianListPage />} />
              <Route path="/technicians/:id" element={<TechnicianDetailsPage />} />
            </Route>

            <Route path="/work-orders" element={<WorkOrderListPage />} />
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "DISPATCHER"]} />}>
              <Route path="/work-orders/new" element={<WorkOrderFormPage />} />
              <Route path="/work-orders/:id/edit" element={<WorkOrderFormPage />} />
            </Route>
            <Route path="/work-orders/:id" element={<WorkOrderDetailsPage />} />

            <Route path="/schedule" element={<SchedulePage />} />

            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "DISPATCHER"]} />}>
              <Route path="/inventory" element={<InventoryPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]} />}>
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/invoices/:id" element={<InvoiceDetailsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/users" element={<UsersPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
