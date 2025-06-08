import { API_CONFIG } from '@/config/api.config';
import { ApiService } from './api.service';
import { Customer } from './customer.service';

export interface DashboardData {
  recentCustomers: Customer[];
  totalCustomers: number;
  totalSurveys: number;
  // Add more dashboard-specific data as needed
}

export class DashboardService {
  static async getDashboardData(token: string): Promise<DashboardData> {
    return ApiService.get(API_CONFIG.ENDPOINTS.DASHBOARD.GET_DATA, token);
  }
} 