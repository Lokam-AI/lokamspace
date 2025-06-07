import { API_CONFIG } from '@/config/api.config';
import { ApiService } from './api.service';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface CreateCustomerData {
  name: string;
  email: string;
  phone: string;
}

export class CustomerService {
  static async createCustomer(data: CreateCustomerData, token: string): Promise<Customer> {
    return ApiService.post(API_CONFIG.ENDPOINTS.CUSTOMER.CREATE, data, token);
  }

  static async getCustomers(token: string): Promise<Customer[]> {
    return ApiService.get(API_CONFIG.ENDPOINTS.CUSTOMER.LIST, token);
  }

  static async initiateCustomerSurvey(customerId: string, token: string): Promise<{ success: boolean }> {
    return ApiService.post(`${API_CONFIG.ENDPOINTS.CUSTOMER.SURVEY}/${customerId}`, {}, token);
  }
} 