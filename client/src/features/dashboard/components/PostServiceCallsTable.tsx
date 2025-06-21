import { useState } from "react";
import { FaInfoCircle, FaTimes, FaThumbsUp, FaThumbsDown, FaStar, FaComments } from "react-icons/fa";

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
  nps_score?: number;
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

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  call: Call | null;
  interaction: CallInteraction | null;
}

function DetailModal({ open, onClose, call, interaction }: DetailModalProps) {
  if (!open || !call || !interaction) return null;

  // Get NPS score from interaction
  const npsScore = interaction.nps_score ?? 0;

  // Calculate NPS category based on score out of 10
  const getNPSCategory = (score: number) => {
    if (score >= 9) return { category: "Promoter", color: "text-green-600", bgColor: "bg-green-50" };
    if (score >= 7) return { category: "Passive", color: "text-yellow-600", bgColor: "bg-yellow-50" };
    return { category: "Detractor", color: "text-red-600", bgColor: "bg-red-50" };
  };

  const npsData = getNPSCategory(npsScore);

  // Mock transcript data - in real app this would come from the API
  const transcript = [
    { speaker: "Bot", message: "Hello! This is AutoPulse calling to follow up on your recent service. How are you today?" },
    { speaker: "User", message: "Hi, I'm doing well, thank you for calling." },
    { speaker: "Bot", message: "Great! I'm calling about your recent service on your vehicle. How would you rate your overall experience?" },
    { speaker: "User", message: "It was quite good. The service was completed on time and the staff was helpful." },
    { speaker: "Bot", message: "That's wonderful to hear! What specifically did you like about the service?" },
    { speaker: "User", message: "The technician was very thorough and explained everything clearly. The waiting area was clean and comfortable." },
    { speaker: "Bot", message: "Thank you for that feedback. Is there anything that could have been improved?" },
    { speaker: "User", message: "Maybe the wait time could have been a bit shorter, but overall I'm satisfied." },
    { speaker: "Bot", message: "I appreciate your honest feedback. Would you recommend our service to others?" },
    { speaker: "User", message: "Yes, I would definitely recommend you to friends and family." },
    { speaker: "Bot", message: "Thank you so much for your time and feedback. Have a great day!" },
    { speaker: "User", message: "You too, thank you!" }
  ];

  // Mock positives and detractors based on feedback
  const positives = [
    "Service completed on time",
    "Staff was helpful and professional",
    "Technician was thorough",
    "Clean and comfortable waiting area",
    "Clear explanation of work done"
  ];

  const detractors = [
    "Wait time could be shorter",
    "Limited refreshment options in waiting area"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <FaComments className="text-[#F97316] text-xl" />
            <h2 className="text-xl font-bold text-[#27272A]">Service Call Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#F4F4F5] transition-colors"
          >
            <FaTimes className="text-[#71717A] text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#F9FAFB] rounded-lg p-4">
                <h3 className="font-semibold text-[#27272A] mb-2 flex items-center gap-2">
                  <FaStar className="text-[#F97316]" />
                  Customer Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-[#71717A]">Name:</span>
                    <span className="ml-2 text-[#27272A]">{call.customer_name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-[#71717A]">Service:</span>
                    <span className="ml-2 text-[#27272A]">{call.service_details}</span>
                  </div>
                  <div>
                    <span className="font-medium text-[#71717A]">Vehicle:</span>
                    <span className="ml-2 text-[#27272A]">{call.vehicle_number}</span>
                  </div>
                  <div>
                    <span className="font-medium text-[#71717A]">Date:</span>
                    <span className="ml-2 text-[#27272A]">{call.service_date.split('T')[0]}</span>
                  </div>
                </div>
              </div>

              <div className={`${npsData.bgColor} rounded-lg p-4`}>
                <h3 className="font-semibold text-[#27272A] mb-2 flex items-center gap-2">
                  <FaStar className="text-[#F97316]" />
                  NPS Score
                </h3>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${npsData.color}`}>
                    {npsScore}/10
                  </div>
                  <div className={`text-sm font-medium ${npsData.color}`}>
                    {npsData.category}
                  </div>
                  <div className="text-xs text-[#71717A] mt-1">
                    Overall Score: {interaction.overall_score}/5
                  </div>
                </div>
              </div>
            </div>

            {/* Positives and Detractors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <FaThumbsUp className="text-green-600" />
                  Positives
                </h3>
                <ul className="space-y-2">
                  {positives.map((positive, index) => (
                    <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      {positive}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <FaThumbsDown className="text-red-600" />
                  Detractors
                </h3>
                <ul className="space-y-2">
                  {detractors.map((detractor, index) => (
                    <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      {detractor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Transcript */}
            <div className="bg-[#F9FAFB] rounded-lg p-4">
              <h3 className="font-semibold text-[#27272A] mb-4 flex items-center gap-2">
                <FaComments className="text-[#F97316]" />
                Call Transcript
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {transcript.map((message, index) => (
                  <div key={index} className={`flex gap-3 ${message.speaker === "User" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.speaker === "Bot" 
                        ? "bg-[#F4F4F5] border border-[#E5E7EB] text-[#27272A]" 
                        : "bg-[#F97316] text-white"
                    }`}>
                      <div className="text-xs font-medium mb-1 text-[#71717A]">
                        {message.speaker}
                      </div>
                      <div className="text-sm">
                        {message.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PostServiceCallsTable({ calls }: { calls: Call[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [selectedInteraction, setSelectedInteraction] = useState<CallInteraction | null>(null);

  const handleScoreClick = (call: Call, interaction: CallInteraction) => {
    setSelectedCall(call);
    setSelectedInteraction(interaction);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCall(null);
    setSelectedInteraction(null);
  };

  return (
    <div className="overflow-x-auto">
      <DetailModal 
        open={modalOpen} 
        onClose={closeModal} 
        call={selectedCall} 
        interaction={selectedInteraction} 
      />
      <table className="min-w-full text-xs">
        <thead>
          <tr className="text-left text-[#9D9DA3] font-semibold border-b border-[#E3E3E7]">
            <th className="py-2 pr-4">Customer Name</th>
            <th className="py-2 pr-4">Vehicle Number</th>
            <th className="py-2 pr-4">Service Detail</th>
            <th className="py-2 pr-4">Service Date</th>
            <th className="py-2 pr-4">Overall Feedback</th>
            <th className="py-2 pr-4">Action Items</th>
            <th className="py-2 pr-4">NPS Score</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call) =>
            call.call_interactions.map((interaction) => (
              <tr key={interaction.id} className="border-b border-[#F4F4F5] last:border-0">
                <td className="py-2 pr-4 font-medium text-black">{call.customer_name}</td>
                <td className="py-2 pr-4 text-[#71717A]">{call.vehicle_number}</td>
                <td className="py-2 pr-4 text-[#71717A]">{call.service_details}</td>
                <td className="py-2 pr-4 text-[#71717A] whitespace-nowrap">{call.service_date.split('T')[0]}</td>
                <td className="py-2 pr-4 text-[#71717A]" title={interaction.overall_feedback}>{interaction.overall_feedback}</td>
                <td className="py-2 pr-4 text-[#71717A]">{interaction.action_items}</td>
                <td className="py-2 pr-4 text-center text-[#F97316] align-middle cursor-pointer" onClick={() => handleScoreClick(call, interaction)}>
                  <span className="underline flex items-center gap-1">{interaction.nps_score ?? 0}/10 <FaInfoCircle size={12} /></span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 