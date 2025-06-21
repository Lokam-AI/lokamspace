import StatCard from "./StatCard";
import ServiceMetricsCard from "./ServiceMetricsCard";
import PostServiceCallsCard from "./PostServiceCallsCard";
import CallListCard from "./CallListCard";
import { FaPhoneAlt, FaCheckCircle, FaStar, FaExclamationTriangle } from "react-icons/fa";
import { DASHBOARD_STATS } from "@/data/staticData";

export default function DashboardMain() {
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Stats and Metrics Row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 w-full">
        {/* Stats Cards */}
        <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <StatCard icon={<FaPhoneAlt />} value={DASHBOARD_STATS.totalCalls.toString()} label="Total Calls" color="orange" change="+55%" />
          <StatCard icon={<FaCheckCircle />} value={DASHBOARD_STATS.completedCalls.toString()} label="Completed Calls" color="black" change="+48%" />
          <StatCard icon={<FaStar />} value={DASHBOARD_STATS.averageRating.toString()} label="Average Rating" color="black" change="+0.2" />
          <StatCard icon={<FaExclamationTriangle />} value={DASHBOARD_STATS.detractors.toString()} label="Detractors" color="black" change="-5%" />
        </div>
        {/* Service Metrics Card */}
        <div className="xl:col-span-2">
          <ServiceMetricsCard />
        </div>
      </div>
      
      {/* Tables Row - Vertical Stack */}
      <div className="flex flex-col gap-8 w-full">
        <PostServiceCallsCard />
        <CallListCard />
      </div>
    </div>
  );
} 