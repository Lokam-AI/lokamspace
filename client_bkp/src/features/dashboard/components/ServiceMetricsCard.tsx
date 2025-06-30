import MetricBar from "./MetricBar";

const metrics = [
  { label: "Overall Service", value: 80 },
  { label: "Timeliness", value: 17 },
  { label: "Cleanliness", value: 3 },
  { label: "Advisor Helpfulness", value: 25 },
  { label: "Work Quality", value: 24 },
  { label: "Recommendation", value: 59 },
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