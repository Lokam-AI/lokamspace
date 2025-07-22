import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface TranscriptSegment {
  role: string;
  content: string;
  timestamp: number | null;
}

interface CallTranscriptChatProps {
  transcript: TranscriptSegment[] | string;
  audioUrl?: string;
}

export const CallTranscriptChat = ({
  transcript,
  audioUrl,
}: CallTranscriptChatProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check if we have a valid audio URL
    setHasAudio(!!audioUrl && audioUrl !== "");
  }, [audioUrl]);

  // Parse the transcript into messages
  const parseTranscript = (
    transcript: TranscriptSegment[] | string
  ): TranscriptSegment[] => {
    // If transcript is already an array of objects, return it
    if (Array.isArray(transcript)) {
      return transcript;
    }

    // For backward compatibility - handle string transcript
    if (typeof transcript === "string") {
      const sentences = transcript.split(". ").filter((s) => s.length > 0);
      return sentences.map((sentence, index) => ({
        role: index % 2 === 0 ? "assistant" : "user",
        content: sentence + (index < sentences.length - 1 ? "." : ""),
        timestamp: index * 15,
      }));
    }

    // Default empty array if transcript is neither array nor string
    return [];
  };

  const messages = parseTranscript(transcript);

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }

    setIsPlaying(!isPlaying);
  };

  // Handle audio events
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = (error: any) => {
    console.error("Audio playback error:", error);
    setIsPlaying(false);
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: number | null): string => {
    if (timestamp === null) return "00:00";
    const minutes = Math.floor(timestamp / 60);
    const seconds = Math.floor(timestamp % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Call Transcript</CardTitle>
          {hasAudio ? (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAudio}
              className="flex items-center space-x-2"
              disabled={!hasAudio}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span>{isPlaying ? "Pause" : "Play"} Recording</span>
            </Button>
          ) : (
            <div className="text-sm text-muted-foreground flex items-center">
              <Volume2 className="h-4 w-4 mr-2" />
              No recording available
            </div>
          )}

          {/* Hidden audio element for playback */}
          {hasAudio && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={handleAudioEnded}
              onError={handleAudioError}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "assistant" || message.role === "Agent"
                    ? "justify-start"
                    : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "assistant" || message.role === "Agent"
                      ? "bg-gray-100 text-gray-900"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium">
                      {message.role === "assistant" || message.role === "Agent"
                        ? "Agent"
                        : "Customer"}
                    </span>
                    <span className="text-xs opacity-70">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              No transcript available for this call.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
