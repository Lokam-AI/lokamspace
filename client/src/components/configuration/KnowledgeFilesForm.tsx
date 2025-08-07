import { FileText as FileTextIcon, Upload, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { KnowledgeFile } from "@/types/apiConfig";

interface KnowledgeFilesFormProps {
  knowledgeFiles: KnowledgeFile[];
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  expanded: boolean;
  onToggle: () => void;
}

export const KnowledgeFilesForm = ({ 
  knowledgeFiles, 
  onFileUpload, 
  onRemoveFile, 
  expanded, 
  onToggle 
}: KnowledgeFilesFormProps) => {
  return (
    <Collapsible open={expanded} onOpenChange={onToggle}>
      <div className="space-y-4">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <div className="flex items-center gap-2">
              <FileTextIcon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Knowledge Files</h3>
            </div>
            <div className="flex items-center gap-2">
              {expanded ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Upload files that will act as knowledge sources for the Feedback Agent
            </p>
            <div className="relative">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={onFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </div>
          </div>

          {knowledgeFiles.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center bg-gray-50">
              <FileTextIcon className="mx-auto h-6 w-6 text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">
                No knowledge files uploaded. Click "Upload Files" to add your first file.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {knowledgeFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-2 border rounded-lg bg-gray-50">
                  <FileTextIcon className="h-4 w-4 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.size} • {file.type}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveFile(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};