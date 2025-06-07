import { useState, useCallback } from 'react';
import { DashboardService, DashboardData } from '@/services/dashboard.service';
import { useAuth } from './useAuth';

interface DashboardState extends DashboardData {
  isLoading: boolean;
  error: string | null;
}

export const useDashboard = () => {
  const { token } = useAuth();
  const [state, setState] = useState<DashboardState>({
    recentCustomers: [],
    totalCustomers: 0,
    totalSurveys: 0,
    isLoading: false,
    error: null,
  });

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const dashboardData = await DashboardService.getDashboardData(token);
      setState({
        ...dashboardData,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [token]);

  return {
    ...state,
    fetchDashboardData,
  };
}; 