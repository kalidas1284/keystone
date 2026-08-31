import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
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
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../services/api";
import attachmentService from "../../services/attachmentService";
import inventoryService from "../../services/inventoryService";
import technicianService from "../../services/technicianService";
import workOrderService from "../../services/workOrderService";
import type {
  Attachment,
  InventoryItem,
  Technician,
  TimeLog,
  WorkOrder,
  WorkOrderPartUsage,
  WorkOrderStatus,
} from "../../types/domain";
import { formatDate, formatDateTime } from "../../utils/helpers";
import { allowedNextStatuses, priorityTone, slaTone, statusTone } from "../../utils/status";
import { toast } from "react-toastify";

function WorkOrderDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isTech = user?.role === "TECHNICIAN";
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "DISPATCHER";
  const canClose = user?.role === "ADMIN" || user?.role === "MANAGER";
  const canUseParts =
    user?.role === "ADMIN" ||
    user?.role === "MANAGER" ||
    user?.role === "DISPATCHER" ||
    user?.role === "TECHNICIAN";

  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [parts, setParts] = useState<WorkOrderPartUsage[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [technicianId, setTechnicianId] = useState("");
  const [scheduleForm, setScheduleForm] = useState({
    scheduledDate: "",
    startTime: "09:00",
    endTime: "10:00",
    notes: "",
  });
  const [statusNotes, setStatusNotes] = useState("");
  const [nextStatus, setNextStatus] = useState<WorkOrderStatus>("ASSIGNED");
  const [minutes, setMinutes] = useState("30");
  const [timeNotes, setTimeNotes] = useState("");
  const [partItemId, setPartItemId] = useState("");
  const [partQty, setPartQty] = useState("1");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({});
  const [previewOpen, setPreviewOpen] = useState<{ id: number; name: string } | null>(null);

  const statusOptions = order
    ? allowedNextStatuses(order.status, { allowCancel: !isTech })
        .filter((s) => {
          // Backend enforces role-gated transitions; hide forbidden options to keep UX consistent.
          if (isTech) return s !== "CLOSED";
          if (s === "CLOSED") return canClose;
          return s !== "IN_PROGRESS" && s !== "ON_HOLD" && s !== "COMPLETED";
        })
    : [];

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [data, logs, usedParts, files] = await Promise.all([
        workOrderService.getWorkOrder(Number(id)),
        workOrderService.listTimeLogs(Number(id)),
        workOrderService.listParts(Number(id)),
        attachmentService.listAttachments(Number(id)),
      ]);
      setOrder(data);
      setTimeLogs(logs);
      setParts(usedParts);
      setAttachments(files);
      const next = allowedNextStatuses(data.status, { allowCancel: !isTech });
      setNextStatus(next[0] ?? data.status);

      setPreviewUrls((prev) => {
        Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
        return {};
      });
      const imageFiles = files.filter((f) => f.contentType?.startsWith("image/"));
      if (imageFiles.length > 0) {
        const entries = await Promise.all(
          imageFiles.map(async (file) => {
            try {
              const blob = await attachmentService.fetchAttachmentBlob(Number(id), file.id);
              return [file.id, URL.createObjectURL(blob)] as const;
            } catch {
              return null;
            }
          })
        );
        const map: Record<number, string> = {};
        entries.forEach((entry) => {
          if (entry) map[entry[0]] = entry[1];
        });
        setPreviewUrls(map);
      }

      // (Invoicing disabled by spec.)

      if (canManage) {
        const techPage = await technicianService.listTechnicians({ active: true, page: 0, size: 100 });
        setTechnicians(techPage.content);
      }
      if (canUseParts) {
        try {
          const inv = await inventoryService.listInventory({ active: true, page: 0, size: 100 });
          setInventory(inv.content);
        } catch (err) {
          setInventory([]);
          setError(getErrorMessage(err, "Failed to load inventory items for parts"));
        }
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load work order"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    return () => {
      setPreviewUrls((prev) => {
        Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
        return {};
      });
    };
  }, [id]);

  const assign = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) return;
    try {
      const updated = await workOrderService.assignTechnician(Number(id), Number(technicianId));
      setOrder(updated);
      setError(null);
      const next = allowedNextStatuses(updated.status, { allowCancel: !isTech });
      setNextStatus(next[0] ?? updated.status);
      setAssignOpen(false);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to assign technician"));
    }
  };

  const schedule = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) return;
    try {
      const updated = await workOrderService.scheduleWorkOrder(Number(id), scheduleForm);
      setOrder(updated);
      setError(null);
      const next = allowedNextStatuses(updated.status, { allowCancel: !isTech });
      setNextStatus(next[0] ?? updated.status);
      setScheduleOpen(false);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to schedule work order"));
    }
  };

  const updateStatus = async () => {
    if (!id) return;
    try {
      const updated = await workOrderService.updateStatus(Number(id), nextStatus, statusNotes || undefined);
      setOrder(updated);
      setStatusNotes("");
      setError(null);
      const next = allowedNextStatuses(updated.status, { allowCancel: !isTech });
      setNextStatus(next[0] ?? updated.status);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update status"));
    }
  };

  const submitTime = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) return;
    try {
      const created = await workOrderService.addTimeLog(Number(id), Number(minutes), timeNotes || undefined);
      setTimeLogs((prev) => [created, ...prev]);
      setMinutes("30");
      setTimeNotes("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to log time"));
    }
  };

  const submitPart = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) return;
    try {
      const created = await workOrderService.addPart(
        Number(id),
        Number(partItemId),
        Number(partQty)
      );
      setParts((prev) => [created, ...prev]);
      setPartItemId("");
      setPartQty("1");
      const inv = await inventoryService.listInventory({ active: true, page: 0, size: 100 });
      setInventory(inv.content);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to add part"));
    }
  };

  const uploadFile = async (file: File | null) => {
    if (!id || !file) return;
    setUploading(true);
    try {
      const created = await attachmentService.uploadAttachment(Number(id), file);
      setAttachments((prev) => [created, ...prev]);
      toast.success("File uploaded");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to upload file"));
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = async (attachmentId: number) => {
    if (!id) return;
    try {
      await attachmentService.deleteAttachment(Number(id), attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete attachment"));
    }
  };

  if (loading) return <Loader />;
  if (error && !order) return <ErrorMessage message={error} />;
  if (!order) return <EmptyState title="Work order not found" />;

  const totalPartsAmount = order.totalPartsAmount != null ? Number(order.totalPartsAmount) : 0;
  const totalMinutes =
    order.totalLaborMinutes != null
      ? Number(order.totalLaborMinutes)
      : timeLogs.reduce((sum, log) => sum + Number(log.minutes), 0);
  const isTerminal = order.status === "CLOSED" || order.status === "CANCELLED";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-blue-600">{order.workOrderNumber}</p>
          <h1 className="text-2xl font-bold text-slate-900">{order.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{order.customerName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManage && !isTerminal && (
            <>
              <Link to={`/work-orders/${order.id}/edit`}>
                <Button variant="secondary">Edit</Button>
              </Link>
              <Button variant="secondary" onClick={() => setAssignOpen(true)}>
                Assign
              </Button>
              <Button variant="secondary" onClick={() => setScheduleOpen(true)}>
                Schedule
              </Button>
              <Button variant="danger" onClick={() => setConfirmCancel(true)}>
                Cancel
              </Button>
            </>
          )}
          {/* (Invoicing disabled by spec.) */}
          <Link to={isTech ? "/field" : "/work-orders"}>
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-4 lg:col-span-2">
          <div className="flex gap-2">
            <Badge tone={priorityTone(order.priority)}>{order.priority}</Badge>
            <Badge tone={statusTone(order.status)}>{order.status}</Badge>
            {order.slaStatus && <Badge tone={slaTone(order.slaStatus)}>{order.slaStatus}</Badge>}
          </div>
          <p className="whitespace-pre-wrap text-sm text-slate-700">
            {order.description || "No description"}
          </p>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <p>
              <span className="text-slate-500">Technician:</span>{" "}
              {order.technicianName || "Unassigned"}
            </p>
            <p>
              <span className="text-slate-500">Location:</span> {order.location || "—"}
            </p>
            <p>
              <span className="text-slate-500">Scheduled:</span> {formatDate(order.scheduledDate)}
            </p>
            <p>
              <span className="text-slate-500">Duration:</span>{" "}
              {order.estimatedDuration ? `${order.estimatedDuration} min` : "—"}
            </p>
            <p>
              <span className="text-slate-500">SLA due:</span> {formatDateTime(order.slaDueAt)}
            </p>
            <p>
              <span className="text-slate-500">Created:</span> {formatDateTime(order.createdAt)}
            </p>
            <p>
              <span className="text-slate-500">Completed:</span> {formatDateTime(order.completedAt)}
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-medium text-slate-900">Notes</h3>
            <p className="whitespace-pre-wrap text-sm text-slate-600">{order.notes || "No notes"}</p>
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="font-semibold text-slate-900">{isTech ? "Update Job" : "Status Update"}</h2>
          {order.status === "NEW" && canManage && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              This job is still <strong>NEW</strong>. Assign a technician first (that moves it to
              ASSIGNED), then progress through IN_PROGRESS before COMPLETED.
            </p>
          )}
          {statusOptions.length === 0 ? (
            <p className="text-sm text-slate-500">No further status changes are available.</p>
          ) : (
            <>
              <Select
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value as WorkOrderStatus)}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={3}
                placeholder="Add work notes"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
              />
              <Button className="w-full" onClick={() => void updateStatus()}>
                Update Status
              </Button>
            </>
          )}
          {isTech && order.status === "IN_PROGRESS" && (
            <Button
              className="w-full"
              variant="secondary"
              onClick={() =>
                void workOrderService.completeWorkOrder(order.id, statusNotes || undefined).then(setOrder)
              }
            >
              Mark Complete
            </Button>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Time Tracking</h2>
            <Badge tone="info">{totalMinutes.toFixed(0)} min</Badge>
          </div>
          {!isTerminal ? (
          <form className="mb-4 grid gap-2 sm:grid-cols-[120px_1fr_auto]" onSubmit={submitTime}>
            <Input
              type="number"
              min={1}
              step={5}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              required
            />
            <Input
              placeholder="Notes"
              value={timeNotes}
              onChange={(e) => setTimeNotes(e.target.value)}
            />
            <Button type="submit">Log Time</Button>
          </form>
          ) : (
            <p className="mb-4 text-sm text-slate-500">Time cannot be logged on closed or cancelled work orders.</p>
          )}
          {timeLogs.length === 0 ? (
            <EmptyState title="No time logged yet" />
          ) : (
            <ul className="space-y-2 text-sm">
              {timeLogs.map((log) => (
                <li
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {log.minutes} min · {log.loggedByName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(log.createdAt)}
                      {log.notes ? ` · ${log.notes}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold text-slate-900">Parts Used</h2>
          <p className="mb-4 text-xs text-slate-500">
            Total parts amount: ${totalPartsAmount.toFixed(2)}
          </p>
          {canUseParts && !isTerminal ? (
            inventory.length === 0 ? (
              <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                No inventory items available. Add stock under Inventory, then refresh this page.
              </p>
            ) : (
              <form className="mb-4 grid gap-2 sm:grid-cols-[1fr_100px_auto]" onSubmit={submitPart}>
                <Select required value={partItemId} onChange={(e) => setPartItemId(e.target.value)}>
                  <option value="">Select inventory item</option>
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.itemCode} — {item.name} ({item.quantity})
                    </option>
                  ))}
                </Select>
                <Input
                  type="number"
                  min={1}
                  value={partQty}
                  onChange={(e) => setPartQty(e.target.value)}
                  required
                />
                <Button type="submit">Add</Button>
              </form>
            )
          ) : (
            <p className="mb-3 text-sm text-slate-500">
              {isTerminal
                ? "Parts cannot be added to closed or cancelled work orders."
                : "Parts can be logged by technicians or managers."}
            </p>
          )}
          {parts.length === 0 ? (
            <EmptyState title="No parts used yet" />
          ) : (
            <ul className="space-y-2 text-sm">
              {parts.map((part) => (
                <li
                  key={part.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {part.itemCode} · {part.itemName}
                    </p>
                    <p className="text-xs text-slate-500">{formatDateTime(part.createdAt)}</p>
                  </div>
                  <Badge>x{part.quantity}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-900">Attachments</h2>
          {!isTerminal && (
          <label className="inline-flex cursor-pointer items-center">
            <span className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
              {uploading ? "Uploading..." : "Upload file"}
            </span>
            <input
              type="file"
              className="hidden"
              disabled={uploading}
              accept="image/*,.pdf,.txt,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                e.target.value = "";
                void uploadFile(file);
              }}
            />
          </label>
          )}
        </div>
        {attachments.length === 0 ? (
          <EmptyState title="No files attached" description="Photos, PDFs, and docs up to 10MB." />
        ) : (
          <ul className="space-y-2 text-sm">
            {attachments.map((file) => (
              <li
                key={file.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {previewUrls[file.id] ? (
                    <button
                      type="button"
                      className="shrink-0 overflow-hidden rounded-md border border-slate-200"
                      onClick={() => setPreviewOpen({ id: file.id, name: file.originalFilename })}
                    >
                      <img
                        src={previewUrls[file.id]}
                        alt={file.originalFilename}
                        className="h-14 w-14 object-cover"
                      />
                    </button>
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-500">
                      FILE
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">{file.originalFilename}</p>
                    <p className="text-xs text-slate-500">
                      {file.uploadedByName} · {(file.sizeBytes / 1024).toFixed(1)} KB ·{" "}
                      {formatDateTime(file.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="!px-2 !py-1 text-xs"
                    onClick={() =>
                      void attachmentService
                        .downloadAttachment(order.id, file.id, file.originalFilename)
                        .catch((err) => setError(getErrorMessage(err, "Download failed")))
                    }
                  >
                    Download
                  </Button>
                  {canManage && !isTerminal && (
                    <Button
                      variant="danger"
                      className="!px-2 !py-1 text-xs"
                      onClick={() => void removeAttachment(file.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {order.statusHistory && order.statusHistory.length > 0 && (
        <Card className="space-y-3">
          <h2 className="font-semibold text-slate-900">Status History</h2>
          <ul className="space-y-2 text-sm">
            {order.statusHistory.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2"
              >
                <div>
                  <span className="font-medium text-slate-800">
                    {entry.fromStatus ?? "—"} → {entry.toStatus ?? "—"}
                  </span>
                  {entry.note && <p className="text-xs text-slate-500">{entry.note}</p>}
                  {entry.changedByName && (
                    <p className="text-xs text-slate-400">by {entry.changedByName}</p>
                  )}
                </div>
                <span className="text-xs text-slate-400">{formatDateTime(entry.changedAt)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal
        open={!!previewOpen}
        title={previewOpen?.name || "Preview"}
        onClose={() => setPreviewOpen(null)}
      >
        {previewOpen && previewUrls[previewOpen.id] && (
          <img
            src={previewUrls[previewOpen.id]}
            alt={previewOpen.name}
            className="max-h-[70vh] w-full rounded-lg object-contain"
          />
        )}
      </Modal>

      <Modal
        open={assignOpen}
        title="Assign Technician"
        onClose={() => setAssignOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button form="assign-form" type="submit">
              Assign
            </Button>
          </>
        }
      >
        <form id="assign-form" onSubmit={assign}>
          <Select required value={technicianId} onChange={(e) => setTechnicianId(e.target.value)}>
            <option value="">Select technician</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName} ({t.availabilityStatus})
              </option>
            ))}
          </Select>
        </form>
      </Modal>

      <Modal
        open={scheduleOpen}
        title="Schedule Work Order"
        onClose={() => setScheduleOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setScheduleOpen(false)}>
              Cancel
            </Button>
            <Button form="schedule-form" type="submit">
              Schedule
            </Button>
          </>
        }
      >
        <form id="schedule-form" className="space-y-3" onSubmit={schedule}>
          <Input
            type="date"
            required
            value={scheduleForm.scheduledDate}
            onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="time"
              required
              value={scheduleForm.startTime}
              onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
            />
            <Input
              type="time"
              required
              value={scheduleForm.endTime}
              onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
            />
          </div>
          <Input
            placeholder="Notes"
            value={scheduleForm.notes}
            onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel work order?"
        message={`Cancel ${order.workOrderNumber}? This cannot be undone easily.`}
        confirmLabel="Cancel work order"
        onCancel={() => setConfirmCancel(false)}
        onConfirm={() => {
          setConfirmCancel(false);
          void workOrderService
            .cancelWorkOrder(order.id)
            .then(setOrder)
            .catch((err) => setError(getErrorMessage(err, "Failed to cancel work order")));
        }}
      />
    </div>
  );
}

export default WorkOrderDetailsPage;
