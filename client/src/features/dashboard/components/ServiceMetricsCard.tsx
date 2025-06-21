import MetricBar from "./MetricBar";
import { SERVICE_METRICS } from "@/data/staticData";

const metrics = [
  { label: "Overall Service", value: Math.round(SERVICE_METRICS.timeliness * 20) },
  { label: "Timeliness", value: Math.round(SERVICE_METRICS.timeliness * 20) },
  { label: "Cleanliness", value: Math.round(SERVICE_METRICS.cleanliness * 20) },
  { label: "Advisor Helpfulness", value: Math.round(SERVICE_METRICS.advisorHelpfulness * 20) },
  { label: "Work Quality", value: Math.round(SERVICE_METRICS.workQuality * 20) },
  { label: "Recommendation", value: Math.round(SERVICE_METRICS.recommendation * 20) },
];

export default function ServiceMetricsCard() {
  return (
    <div className="bg-white rounded-2xl shadow p-6 w-full flex flex-col gap-8 h-full flex-1">
      <h6 className="text-lg text-black font-bold mb-2">Service Feedback Breakdown</h6>
      <div className="grid grid-cols-2 grid-rows-3 gap-x-4 gap-y-8">
        {metrics.map((m) => (
          <MetricBar key={m.label} label={m.label} value={m.value} />
        ))}
      </div>
    </div>
  );
} 