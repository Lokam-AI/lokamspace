import { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";

interface CallInteraction {
  id: number;
  call_date: string;
  status: string;
  duration_seconds: number;
  transcription: string;
  overall_feedback: string;
  overall_score: number;
  timeliness_score: number | null;
  cleanliness_score: number | null;
  advisor_helpfulness_score: number | null;
  work_quality_score: number | null;
  recommendation_score: number | null;
  action_items: string;
  completed_at: string;
}

interface Call {
  vehicle_number: string;
  service_details: string;
  service_date: string;
  id: number;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  assigned_user_id: number;
  created_at: string;
  status: string;
  call_interactions: CallInteraction[];
}

function ScoreModal({ open, onClose, interaction }: { open: boolean; onClose: () => void; interaction: CallInteraction | null }) {
  if (!open || !interaction) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-xs">
        <h3 className="font-bold text-lg mb-2">Score Breakdown</h3>
        <ul className="text-sm text-[#27272A] space-y-1">
          <li>Timeliness: {interaction.timeliness_score ?? 'N/A'}</li>
          <li>Cleanliness: {interaction.cleanliness_score ?? 'N/A'}</li>
          <li>Advisor Helpfulness: {interaction.advisor_helpfulness_score ?? 'N/A'}</li>
          <li>Work Quality: {interaction.work_quality_score ?? 'N/A'}</li>
          <li>Recommendation: {interaction.recommendation_score ?? 'N/A'}</li>
        </ul>
        <button className="mt-4 px-4 py-2 bg-[#F97316] text-white rounded" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default function PostServiceCallsTable({ calls }: { calls: Call[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState<CallInteraction | null>(null);

  const handleScoreClick = (interaction: CallInteraction) => {
    setSelectedInteraction(interaction);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedInteraction(null);
  };

  return (
    <div className="overflow-x-auto">
      <ScoreModal open={modalOpen} onClose={closeModal} interaction={selectedInteraction} />
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-[#9D9DA3] font-semibold border-b border-[#E3E3E7]">
            <th className="py-2 pr-4">Customer Name</th>
            <th className="py-2 pr-4">Customer Email</th>
            <th className="py-2 pr-4">Customer Phone Number</th>
            <th className="py-2 pr-4">Vehicle Number</th>
            <th className="py-2 pr-4">Service Detail</th>
            <th className="py-2 pr-4">Service Date</th>
            <th className="py-2 pr-4">Call Date</th>
            <th className="py-2 pr-4">Call Duration</th>
            <th className="py-2 pr-4">Overall Feedback</th>
            <th className="py-2 pr-4">Overall Score</th>
            <th className="py-2 pr-4">Action Items</th>
            <th className="py-2 pr-4">Completed At</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call) =>
            call.call_interactions.map((interaction) => (
              <tr key={interaction.id} className="border-b border-[#F4F4F5] last:border-0">
                <td className="py-2 pr-4 font-medium text-black">{call.customer_name}</td>
                <td className="py-2 pr-4 text-[#71717A]">{call.customer_email}</td>
                <td className="py-2 pr-4 text-[#71717A]">{call.customer_phone}</td>
                <td className="py-2 pr-4 text-[#71717A]">{call.vehicle_number}</td>
                <td className="py-2 pr-4 text-[#71717A]">{call.service_details}</td>
                <td className="py-2 pr-4 text-[#71717A]">{call.service_date.split('T')[0]}</td>
                <td className="py-2 pr-4 text-[#71717A]">{interaction.call_date.split('T')[0]}</td>
                <td className="py-2 pr-4 text-[#71717A]">{Math.floor(interaction.duration_seconds / 60)}m {interaction.duration_seconds % 60}s</td>
                <td className="py-2 pr-4 text-[#71717A] max-w-xs truncate" title={interaction.overall_feedback}>{interaction.overall_feedback}</td>
                <td className="py-2 pr-4 text-center text-[#F97316] align-middle cursor-pointer" onClick={() => handleScoreClick(interaction)}>
                  <span className="underline flex items-center gap-1">{interaction.overall_score} <FaInfoCircle size={14} /></span>
                </td>
                <td className="py-2 pr-4 text-[#71717A]">{interaction.action_items}</td>
                <td className="py-2 pr-4 text-[#71717A]">{interaction.completed_at ? interaction.completed_at.split('T')[0] : ''}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 