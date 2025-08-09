import { FileText } from "lucide-react";
import { ApiKey } from "@/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/utils/apiUtils";

interface APIKeysTableProps {
  apiKeys: ApiKey[];
  loading: boolean;
  onViewDetails: (apiKey: ApiKey) => void;
}

export const APIKeysTable = ({ apiKeys, loading, onViewDetails }: APIKeysTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Secret Key</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Created by</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {apiKeys.map((key) => (
          <TableRow key={key.id}>
            <TableCell>{key.name}</TableCell>
            <TableCell className="font-mono">{key.secret_key_preview}</TableCell>
            <TableCell>{formatDate(key.created_at)}</TableCell>
            <TableCell>{key.created_by_name}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onViewDetails(key)}
              >
                <FileText className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {loading && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-6">
              Loading API keys...
            </TableCell>
          </TableRow>
        )}
        {!loading && apiKeys.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-6">
              No API configurations found. Create your first configuration to get started.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};