export const mapFiltersForApi = (filters: any): Record<string, string> => {
  const apiFilters: Record<string, string> = {};
  if (filters.searchTerm) apiFilters.search = filters.searchTerm;
  if (filters.advisor && filters.advisor !== "all") apiFilters.service_advisor_name = filters.advisor;
  if (filters.campaignId && filters.campaignId !== "all") apiFilters.campaign_id = filters.campaignId;
  if (filters.dateRange?.start) apiFilters.appointment_date = filters.dateRange.start;
  return apiFilters;
}; 