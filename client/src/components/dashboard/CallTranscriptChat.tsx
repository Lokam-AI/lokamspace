
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { useState } from "react";

interface TranscriptMessage {
  speaker: 'user' | 'assistant';
  message: string;
  timestamp: string;
}

interface CallTranscriptChatProps {
  transcript: string;
  audioUrl?: string;
}

export const CallTranscriptChat = ({ transcript, audioUrl }: CallTranscriptChatProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Parse the transcript into messages (this would be more sophisticated in a real app)
  const parseTranscript = (transcript: string): TranscriptMessage[] => {
    // For demo purposes, we'll split the transcript and create alternating messages
    const sentences = transcript.split('. ').filter(s => s.length > 0);
    return sentences.map((sentence, index) => ({
      speaker: index % 2 === 0 ? 'assistant' : 'user',
      message: sentence + (index < sentences.length - 1 ? '.' : ''),
      timestamp: `00:${String(index * 15).padStart(2, '0')}`
    }));
  };

  const messages = parseTranscript(transcript);

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
    console.log(isPlaying ? 'Pausing audio' : 'Playing audio');
    // In a real app, this would control actual audio playback
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Call Transcript</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAudio}
            className="flex items-center space-x-2"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{isPlaying ? 'Pause' : 'Play'} Recording</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.speaker === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.speaker === 'assistant'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-blue-600 text-white'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-medium">
                    {message.speaker === 'assistant' ? 'Agent' : 'Customer'}
                  </span>
                  <span className="text-xs opacity-70">{message.timestamp}</span>
                </div>
                <p className="text-sm">{message.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
