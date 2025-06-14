'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Video, Video as VideoIcon, Mic, MicOff, Camera, CameraOff, PhoneOff } from 'lucide-react';

interface VideoChatProps {
  interviewId: string;
}

export function VideoChat({ interviewId }: VideoChatProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // In a real implementation, we would use Twilio Video SDK here
  // This is a simplified mock implementation
  
  useEffect(() => {
    // Mock function to simulate getting user media
    const setupLocalVideo = async () => {
      try {
        // In a real implementation, we would use navigator.mediaDevices.getUserMedia
        // and connect to Twilio Video Room
        
        // For now, let's simulate the process
        setIsConnecting(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate successful connection
        setIsConnecting(false);
        setIsConnected(true);
        
        toast.success('Connected to video chat');
      } catch (error) {
        console.error('Error accessing media devices:', error);
        setIsConnecting(false);
        toast.error('Failed to connect to video chat');
      }
    };
    
    // Auto-connect when component mounts
    setupLocalVideo();
    
    // Cleanup function
    return () => {
      // In a real implementation, we would disconnect from Twilio Video Room
      if (isConnected) {
        setIsConnected(false);
      }
    };
  }, [interviewId]);
  
  // Toggle microphone
  const toggleMic = () => {
    setIsMicMuted(!isMicMuted);
    // In a real implementation, we would mute/unmute the audio track
    toast.info(isMicMuted ? 'Microphone unmuted' : 'Microphone muted');
  };
  
  // Toggle video
  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // In a real implementation, we would enable/disable the video track
    toast.info(isVideoOff ? 'Camera turned on' : 'Camera turned off');
  };
  
  // Disconnect from call
  const disconnect = () => {
    // In a real implementation, we would disconnect from Twilio Video Room
    setIsConnected(false);
    toast.info('Disconnected from video chat');
  };
  
  // Reconnect to call
  const reconnect = () => {
    setIsConnecting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      toast.success('Reconnected to video chat');
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Video container */}
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        {/* Remote video (interviewer) */}
        {isConnected ? (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* This would be a real video stream in production */}
            <div className="text-center">
              <VideoIcon className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Interviewer connected</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <VideoIcon className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {isConnecting ? 'Connecting...' : 'Not connected'}
              </p>
            </div>
          </div>
        )}
        
        {/* Local video (candidate) - small overlay */}
        <div className="absolute bottom-2 right-2 w-1/4 aspect-video bg-background rounded overflow-hidden border shadow-md">
          {isConnected && !isVideoOff ? (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* This would be a real video stream in production */}
              <p className="text-xs text-center text-muted-foreground">You</p>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <p className="text-xs text-center text-muted-foreground">
                {isVideoOff ? 'Camera off' : 'Connecting...'}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Video controls */}
      <div className="flex justify-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMic}
          disabled={!isConnected}
          className={isMicMuted ? 'bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600' : ''}
        >
          {isMicMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleVideo}
          disabled={!isConnected}
          className={isVideoOff ? 'bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600' : ''}
        >
          {isVideoOff ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
        </Button>
        {isConnected ? (
          <Button
            variant="destructive"
            size="icon"
            onClick={disconnect}
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={reconnect}
            disabled={isConnecting}
            className="px-4"
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Button>
        )}
      </div>
    </div>
  );
}