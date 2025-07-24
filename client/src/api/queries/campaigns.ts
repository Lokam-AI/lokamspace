import { useQuery } from "@tanstack/react-query";
import api from "../axios";

export const useCampaigns = () =>
  useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data } = await api.get("/campaigns/");
      return data;
    },
  }); 