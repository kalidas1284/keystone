import fs from "node:fs";
import path from "node:path";

const read = (p) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

function mustInclude(haystack, needle, label) {
  if (!haystack.includes(needle)) {
    throw new Error(`UI smoke failed: missing "${needle}" in ${label}`);
  }
}

try {
  const appRouter = read("src/routes/AppRouter.tsx");

  // Route wiring checks
  mustInclude(appRouter, 'path="/portal/invoices"', "AppRouter.tsx");
  mustInclude(appRouter, 'path="/portal/invoices/:id"', "AppRouter.tsx");
  mustInclude(appRouter, 'path="/invoices"', "AppRouter.tsx");
  mustInclude(appRouter, 'path="/invoices/:id"', "AppRouter.tsx");

  const invoicesPage = read("src/pages/invoices/InvoicesPage.tsx");
  mustInclude(invoicesPage, "Out of scope for KEYSTONE spec.", "InvoicesPage.tsx");
  mustInclude(invoicesPage, "Invoices are disabled", "InvoicesPage.tsx");

  const portalInvoicesPage = read("src/pages/portal/PortalInvoicesPage.tsx");
  mustInclude(portalInvoicesPage, "Invoices are disabled", "PortalInvoicesPage.tsx");

  const portalInvoiceDetailsPage = read(
    "src/pages/portal/PortalInvoiceDetailsPage.tsx"
  );
  mustInclude(portalInvoiceDetailsPage, "Invoices are disabled", "PortalInvoiceDetailsPage.tsx");

  console.log("UI smoke: PASSED (invoice routes + out-of-scope UI text verified)");
} catch (err) {
  console.error(err?.message ?? String(err));
  process.exit(1);
}

