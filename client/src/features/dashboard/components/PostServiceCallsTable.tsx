interface Call {
  customer: string;
  callDate: string;
  vehicleNumber: string;
  serviceDate: string;
  transcription: string;
  score: number;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? "bg-green-400" : "bg-sky-400";
  return (
    <div className="flex flex-col items-start min-w-[80px]">
      <span className="text-xs font-bold mb-1">{score}%</span>
      <div className="w-full h-2 bg-[#E3E3E7] rounded-full">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function PostServiceCallsTable({ calls }: { calls: Call[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-[#9D9DA3] font-semibold border-b border-[#E3E3E7]">
            <th className="py-2 pr-4">Customer</th>
            <th className="py-2 pr-4">Call Date</th>
            <th className="py-2 pr-4">Vehicle No</th>
            <th className="py-2 pr-4">Service Date</th>
            <th className="py-2 pr-4">Transcription</th>
            <th className="py-2 pr-4">Score</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call, idx) => (
            <tr key={idx} className="border-b border-[#F4F4F5] last:border-0">
              <td className="py-2 pr-4 font-medium text-black">{call.customer}</td>
              <td className="py-2 pr-4 text-[#71717A]">{call.callDate}</td>
              <td className="py-2 pr-4 text-[#71717A]">{call.vehicleNumber}</td>
              <td className="py-2 pr-4 text-[#71717A]">{call.serviceDate}</td>
              <td className="py-2 pr-4 text-[#71717A] max-w-xs truncate" title={call.transcription}>{call.transcription}</td>
              <td className="py-2 pr-4 text-center text-[#71717A] align-middle"><ScoreBar score={call.score} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 