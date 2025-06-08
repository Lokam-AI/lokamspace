import StatCard from "./StatCard";
import ServiceMetricsCard from "./ServiceMetricsCard";
import PostServiceCallsCard from "./PostServiceCallsCard";
import CallListCard from "./CallListCard";
import AddCustomerButton from "./AddCustomerButton";
import { FaPhoneAlt, FaCheckCircle, FaStar, FaExclamationTriangle } from "react-icons/fa";

export default function DashboardMain() {
  return (
    <div className="flex flex-col gap-8 w-full items-center">
      <div className="w-full flex justify-end px-4">
        <AddCustomerButton />
      </div>
      <div className="flex flex-col lg:flex-row gap-8 w-full">
        <div className="flex-1 basis-1/2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard icon={<FaPhoneAlt />} value="1600" label="Total Calls" color="orange" change="+55%" />
          <StatCard icon={<FaCheckCircle />} value="1450" label="Completed Calls" color="black" change="+48%" />
          <StatCard icon={<FaStar />} value="4.7" label="Average Rating" color="black" change="+0.2" />
          <StatCard icon={<FaExclamationTriangle />} value="50" label="Detractors" color="black" change="-5%" />
        </div>
        <div className="flex-1 basis-1/2 flex-shrink-0 flex items-start">
          <ServiceMetricsCard />
        </div>
      </div>
      <div className="flex w-full gap-8 flex-col lg:flex-row">
        <div className="flex-[7] min-w-0">
          <PostServiceCallsCard />
        </div>
        <div className="flex-[3] min-w-[320px] max-w-sm">
          <CallListCard />
        </div>
      </div>
    </div>
  );
} 