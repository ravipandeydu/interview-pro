'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Video, Video as VideoIcon, Mic, MicOff, Camera, CameraOff, PhoneOff, MonitorUp, MonitorX } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer';

interface VideoChatProps {
  interviewId: string;
  userRole?: string; // Add userRole prop
}

interface PeerConnection {
  peerId: string;
  peer: Peer.Instance;
  stream?: MediaStream;
}

export function VideoChat({ interviewId, userRole = 'CANDIDATE' }: VideoChatProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<PeerConnection[]>([]);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<PeerConnection[]>([]);
  
  // Function to get user media
  const getUserMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: !isVideoOff, 
        audio: !isMicMuted 
      });
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Failed to access camera or microphone');
      return null;
    }
  }, [isVideoOff, isMicMuted]);
  
  // Function to toggle screen sharing
  const toggleScreenSharing = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      
      // Notify peers that screen sharing has stopped
      socketRef.current?.emit('webrtc:screenShare', {
        roomId: interviewId,
        isSharing: false
      });
      
      // Restore video stream if video is enabled
      if (!isVideoOff && localStream) {
        peersRef.current.forEach(({ peer }) => {
          localStream.getTracks().forEach(track => {
            peer.replaceTrack(
              peer.streams[0].getVideoTracks()[0],
              track,
              peer.streams[0]
            );
          });
        });
      }
      
      setIsScreenSharing(false);
      toast.info('Screen sharing stopped');
    } else {
      try {
        // Start screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: true
        });
        
        setScreenStream(stream);
        
        // Replace video track with screen sharing track for all peers
        peersRef.current.forEach(({ peer }) => {
          stream.getVideoTracks()[0].onended = () => {
            toggleScreenSharing();
          };
          
          peer.replaceTrack(
            peer.streams[0].getVideoTracks()[0],
            stream.getVideoTracks()[0],
            peer.streams[0]
          );
        });
        
        // Notify peers that screen sharing has started
        socketRef.current?.emit('webrtc:screenShare', {
          roomId: interviewId,
          isSharing: true
        });
        
        setIsScreenSharing(true);
        toast.success('Screen sharing started');
      } catch (error) {
        console.error('Error starting screen share:', error);
        toast.error('Failed to start screen sharing');
      }
    }
  };
  
  // Function to create a peer connection
  const createPeer = (userToSignal: string, callerId: string, stream: MediaStream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream
    });
    
    peer.on('signal', (signal) => {
      socketRef.current?.emit('webrtc:offer', {
        target: userToSignal,
        offer: signal
      });
    });
    
    return { peerId: userToSignal, peer };
  };
  
  // Function to add a peer connection
  const addPeer = (incomingSignal: Peer.SignalData, callerId: string, stream: MediaStream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream
    });
    
    peer.on('signal', (signal) => {
      socketRef.current?.emit('webrtc:answer', {
        target: callerId,
        answer: signal
      });
    });
    
    peer.signal(incomingSignal);
    
    return { peerId: callerId, peer };
  };
  
  // Initialize WebRTC connection
  useEffect(() => {
    if (!interviewId) return;
    
    setIsConnecting(true);
    
    // Connect to socket server
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });
    
    socketRef.current = socket;
    
    // Get user media and join room
    getUserMedia().then((stream) => {
      if (!stream) {
        setIsConnecting(false);
        return;
      }
      
      socket.emit('webrtc:joinRoom', interviewId);
      
      // Handle existing users in the room
      socket.on('webrtc:usersInRoom', (users: string[]) => {
        const peers: PeerConnection[] = [];
        
        users.forEach((userId) => {
          const peerConnection = createPeer(userId, socket.id, stream);
          peersRef.current.push(peerConnection);
          peers.push(peerConnection);
        });
        
        setPeers(peers);
      });
      
      // Handle new user joining
      socket.on('webrtc:userJoined', (userId: string) => {
        const peerConnection = createPeer(userId, socket.id, stream);
        peersRef.current.push(peerConnection);
        
        setPeers(prevPeers => [...prevPeers, peerConnection]);
      });
      
      // Handle receiving an offer
      socket.on('webrtc:offer', ({ offer, from }) => {
        const peerConnection = addPeer(offer, from, stream);
        peersRef.current.push(peerConnection);
        
        setPeers(prevPeers => [...prevPeers, peerConnection]);
      });
      
      // Handle receiving an answer
      socket.on('webrtc:answer', ({ answer, from }) => {
        const peerItem = peersRef.current.find(p => p.peerId === from);
        if (peerItem) {
          peerItem.peer.signal(answer);
        }
      });
      
      // Handle receiving ICE candidate
      socket.on('webrtc:iceCandidate', ({ candidate, from }) => {
        const peerItem = peersRef.current.find(p => p.peerId === from);
        if (peerItem) {
          peerItem.peer.signal({ candidate });
        }
      });
      
      // Handle user leaving
      socket.on('webrtc:userLeft', (userId) => {
        const peerItem = peersRef.current.find(p => p.peerId === userId);
        if (peerItem) {
          peerItem.peer.destroy();
        }
        
        const peers = peersRef.current.filter(p => p.peerId !== userId);
        peersRef.current = peers;
        setPeers(peers);
      });
      
      // Handle screen sharing updates
      socket.on('webrtc:screenShareUpdate', ({ userId, isSharing }) => {
        toast.info(`${isSharing ? 'Screen sharing started' : 'Screen sharing stopped'} by another user`);
      });
      
      setIsConnecting(false);
      setIsConnected(true);
    });
    
    // Cleanup function
    return () => {
      // Stop all media tracks
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
      
      // Close all peer connections
      peersRef.current.forEach(({ peer }) => peer.destroy());
      
      // Leave room and disconnect socket
      socket.emit('webrtc:leaveRoom', interviewId);
      socket.disconnect();
    };
  }, [interviewId]);
  
  // Toggle microphone
  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMicMuted;
      });
    }
    
    setIsMicMuted(!isMicMuted);
    toast.info(isMicMuted ? 'Microphone unmuted' : 'Microphone muted');
  };
  
  // Toggle video
  const toggleVideo = async () => {
    if (isVideoOff) {
      // Turn camera on
      try {
        // Get new video stream
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = newStream.getVideoTracks()[0];
        
        // Create a new combined stream with existing audio (if any) and new video
        const combinedStream = new MediaStream();
        
        // Add existing audio tracks if available
        if (localStream) {
          const audioTracks = localStream.getAudioTracks();
          audioTracks.forEach(track => combinedStream.addTrack(track));
          
          // Stop old video tracks
          localStream.getVideoTracks().forEach(track => track.stop());
        }
        
        // Add the new video track
        combinedStream.addTrack(videoTrack);
        
        // Update local stream reference
        setLocalStream(combinedStream);
        
        // Update local video display
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = combinedStream;
        }
        
        // Replace track in all peer connections
        peersRef.current.forEach(({ peer }) => {
          try {
            // For simple-peer, we need to use replaceTrack directly
            peer.replaceTrack(
              peer.streams?.[0]?.getVideoTracks()?.[0],
              videoTrack,
              combinedStream
            );
          } catch (err) {
            console.error('Error replacing track:', err);
          }
        });
        
        setIsVideoOff(false);
        toast.success('Camera turned on');
      } catch (error) {
        console.error('Error turning camera on:', error);
        toast.error('Failed to turn on camera');
      }
    } else {
      // Turn camera off
      if (localStream) {
        localStream.getVideoTracks().forEach(track => {
          track.enabled = false;
        });
      }
      
      setIsVideoOff(true);
      toast.info('Camera turned off');
    }
  };

  
  // Disconnect from call
  const disconnect = () => {
    // Stop all media tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    
    // Close all peer connections
    peersRef.current.forEach(({ peer }) => peer.destroy());
    peersRef.current = [];
    setPeers([]);
    
    // Leave room
    socketRef.current?.emit('webrtc:leaveRoom', interviewId);
    
    setIsConnected(false);
    setIsScreenSharing(false);
    toast.info('Disconnected from video chat');
  };
  
  // Reconnect to call
  const reconnect = () => {
    setIsConnecting(true);
    
    getUserMedia().then((stream) => {
      if (!stream) {
        setIsConnecting(false);
        return;
      }
      
      socketRef.current?.emit('webrtc:joinRoom', interviewId);
      setIsConnected(true);
      setIsConnecting(false);
      toast.success('Reconnected to video chat');
    });
  };

  return (
    <div className="space-y-4">
      {/* Video container */}
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        {/* Remote video (interviewer) */}
        {isConnected ? (
          <div className="absolute inset-0 flex items-center justify-center">
            {peers.length > 0 ? (
              peers.map((peer, index) => (
                <div key={peer.peerId} className="absolute inset-0">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    onLoadedMetadata={() => {
                      if (remoteVideoRef.current) {
                        peer.peer.on('stream', stream => {
                          if (remoteVideoRef.current) {
                            remoteVideoRef.current.srcObject = stream;
                          }
                        });
                      }
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="text-center">
                <VideoIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {userRole === 'RECRUITER' || userRole === 'ADMIN' 
                    ? 'Waiting for candidate to join...' 
                    : 'Waiting for interviewer to join...'}
                </p>
              </div>
            )}
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
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
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
        <Button
          variant="outline"
          size="icon"
          onClick={toggleScreenSharing}
          disabled={!isConnected}
          className={isScreenSharing ? 'bg-blue-100 text-blue-500 hover:bg-blue-200 hover:text-blue-600' : ''}
        >
          {isScreenSharing ? <MonitorX className="h-4 w-4" /> : <MonitorUp className="h-4 w-4" />}
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