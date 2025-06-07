import { useState, useCallback } from 'react';
import { CustomerService, Customer, CreateCustomerData } from '@/services/customer.service';
import { useAuth } from './useAuth';

interface CustomerState {
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
}

export const useCustomers = () => {
  const { token } = useAuth();
  const [state, setState] = useState<CustomerState>({
    customers: [],
    isLoading: false,
    error: null,
  });

  const fetchCustomers = useCallback(async () => {
    if (!token) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const customers = await CustomerService.getCustomers(token);
      setState({
        customers,
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

  const createCustomer = useCallback(async (data: CreateCustomerData) => {
    if (!token) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const newCustomer = await CustomerService.createCustomer(data, token);
      setState(prev => ({
        customers: [...prev.customers, newCustomer],
        isLoading: false,
        error: null,
      }));
      return newCustomer;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [token]);

  const initiateCustomerSurvey = useCallback(async (customerId: string) => {
    if (!token) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const result = await CustomerService.initiateCustomerSurvey(customerId, token);
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
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
    fetchCustomers,
    createCustomer,
    initiateCustomerSurvey,
  };
}; 