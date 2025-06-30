
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MetricsSection } from "@/components/metrics/MetricsSection";

const Metrics = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-screen bg-gray-50 -m-4 p-4">
              <div className="pt-4">
                <MetricsSection />
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Metrics;
