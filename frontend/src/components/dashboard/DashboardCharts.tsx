import { useMemo } from "react";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import type { DashboardStatistics } from "../../types/domain";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type Props = {
  data: DashboardStatistics;
};

function DashboardCharts({ data }: Props) {
  const statusChart = useMemo(() => {
    const labels = Object.keys(data.workOrdersByStatus);
    const values = Object.values(data.workOrdersByStatus);
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: ["#94a3b8", "#0f766e", "#14b8a6", "#0284c7", "#d97706", "#059669", "#dc2626"],
          borderWidth: 0,
        },
      ],
    };
  }, [data.workOrdersByStatus]);

  const workloadChart = useMemo(() => {
    const items = data.technicianWorkload.slice(0, 6);
    return {
      labels: items.map((i) => i.technicianName),
      datasets: [
        {
          label: "Active jobs",
          data: items.map((i) => i.activeJobs),
          backgroundColor: "#0f766e",
          borderRadius: 6,
        },
        {
          label: "Completed",
          data: items.map((i) => i.completedJobs),
          backgroundColor: "#5eead4",
          borderRadius: 6,
        },
      ],
    };
  }, [data.technicianWorkload]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
        <h2 className="font-display mb-4 text-lg font-semibold text-[var(--ink)]">Work orders by status</h2>
        <div className="mx-auto h-64 max-w-xs">
          <Doughnut
            data={statusChart}
            options={{
              plugins: { legend: { position: "bottom" } },
              maintainAspectRatio: false,
            }}
          />
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
        <h2 className="font-display mb-4 text-lg font-semibold text-[var(--ink)]">Technician workload</h2>
        <div className="h-64">
          {data.technicianWorkload.length === 0 ? (
            <p className="text-sm text-slate-500">No technician workload data yet.</p>
          ) : (
            <Bar
              data={workloadChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardCharts;
