import DashboardLayout from "@/features/dashboard/components/DashboardLayout";
import DashboardMain from "@/features/dashboard/components/DashboardMain";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <h2 className="text-2xl text-black font-bold mb-4">Dashboard</h2>
      <DashboardMain />
    </DashboardLayout>
  );
} 