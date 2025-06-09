interface Call {
  id: number;
  customer: string;
  email: string;
  phone: string;
  vehicleNumber: string;
  serviceDate: string;
  serviceDetails: string;
  status: string;
}

interface CallListProps {
  calls: Call[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}

export default function CallList({ calls, selectedIds, onToggle }: CallListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-[#9D9DA3] font-semibold border-b border-[#E3E3E7]">
            <th className="py-2 pr-4">Select</th>
            <th className="py-2 pr-4">Customer Name</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Phone Number</th>
            <th className="py-2 pr-4">Vehicle Number</th>
            <th className="py-2 pr-4">Service Date</th>
            <th className="py-2 pr-4">Service Details</th>
            <th className="py-2 pr-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call) => (
            <tr key={call.id} className="border-b border-[#F4F4F5] last:border-0">
              <td className="py-2 pr-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(call.id)}
                  onChange={() => onToggle(call.id)}
                  className="accent-[#F97316] w-4 h-4"
                />
              </td>
              <td className="py-2 pr-4 font-medium text-black">{call.customer}</td>
              <td className="py-2 pr-4 text-[#71717A]">{call.email}</td>
              <td className="py-2 pr-4 text-[#71717A]">{call.phone}</td>
              <td className="py-2 pr-4 text-[#71717A]">{call.vehicleNumber}</td>
              <td className="py-2 pr-4 text-[#71717A]">{call.serviceDate}</td>
              <td className="py-2 pr-4 text-[#71717A]">{call.serviceDetails}</td>
              <td className="py-2 pr-4 text-[#71717A]">{call.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 