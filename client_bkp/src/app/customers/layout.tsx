import DashboardLayout from '@/features/dashboard/components/DashboardLayout';

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
} 