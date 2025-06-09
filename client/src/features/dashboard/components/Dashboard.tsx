import Sidebar from "./Sidebar";
import DashboardMain from "./DashboardMain";

export default function GarageBotDashboard() {
  return (
    <div className="flex min-h-screen bg-[#F4F4F5]">
      <Sidebar />
      <main className="flex-1 p-10">
        <h2 className="text-2xl text-black font-bold mb-4">Dashboard</h2>
        <DashboardMain />
      </main>
    </div>
  );
} 