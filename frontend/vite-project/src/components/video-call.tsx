import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare } from "lucide-react";

interface VideoCallProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onEndCall: () => void;
}

export default function VideoCall({ localStream, remoteStream, onEndCall }: VideoCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
      setIsVideoOn(!isVideoOn);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-900">
      <div className="flex-1 relative">
        {/* Remote user video taking full space */}
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Local user video (small overlay) */}
        <div className="absolute bottom-4 right-4 w-1/4 aspect-video bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Call controls */}
      <div className="bg-gray-800 p-4 flex justify-center space-x-4">
        <Button variant="outline" size="icon" onClick={toggleMute}>
          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>
        <Button variant="outline" size="icon" onClick={toggleVideo}>
          {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </Button>
        <Button variant="destructive" size="icon" onClick={onEndCall}>
          <PhoneOff className="h-6 w-6" />
        </Button>
        <Button variant="outline" size="icon">
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
