'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Video, Video as VideoIcon, Mic, MicOff, Camera, CameraOff, PhoneOff, MonitorUp, MonitorX } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer';

// Import socketService
import socketService from '../services/socketService';

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
  // Ensure we're using a consistent room ID format
  const roomId = interviewId?.toString();
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
      console.log(`[WebRTC] Getting user media, video: ${!isVideoOff}, audio: ${!isMicMuted}`);
      
      // Explicitly set video constraints to ensure proper video capture
      const videoConstraints = !isVideoOff ? {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user"
      } : false;
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: videoConstraints,
        audio: !isMicMuted
      });
      
      console.log(`[WebRTC] Got media stream:`, stream.id, 
        `video tracks: ${stream.getVideoTracks().length}`, 
        `audio tracks: ${stream.getAudioTracks().length}`);
      
      // Log detailed information about video tracks
      if (stream.getVideoTracks().length > 0) {
        const videoTrack = stream.getVideoTracks()[0];
        console.log(`[WebRTC] Video track details:`, {
          enabled: videoTrack.enabled,
          readyState: videoTrack.readyState,
          muted: videoTrack.muted,
          id: videoTrack.id,
          label: videoTrack.label,
          settings: videoTrack.getSettings()
        });
      }
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        console.log(`[WebRTC] Setting local video source`);
        localVideoRef.current.srcObject = stream;
        
        // Force play to ensure video starts
        localVideoRef.current.play().catch(err => {
          console.error(`[WebRTC] Error playing local video: ${err.message}`);
        });
      } else {
        console.warn(`[WebRTC] Local video ref is not available`);
      }
      
      return stream;
    } catch (error) {
      console.error('[WebRTC] Error accessing media devices:', error);
      toast.error('Could not access camera or microphone');
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
      socketRef.current?.emit('webrtc:screenShare', { roomId, isSharing: false });
      
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
        roomId,
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
    console.log(`[WebRTC] Creating peer connection as initiator to ${userToSignal}`);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });
    
    peer.on('signal', (signal) => {
      console.log(`[WebRTC] Sending offer signal to ${userToSignal}`);
      socketRef.current?.emit('webrtc:offer', {
        target: userToSignal,
        offer: signal
      });
    });
    
    peer.on('connect', () => {
      console.log(`[WebRTC] Peer connection established with ${userToSignal}`);
    });
    
    peer.on('error', (err) => {
      console.error(`[WebRTC] Peer connection error with ${userToSignal}:`, err);
    });
    
    // Set up stream handler immediately
    peer.on('stream', (remoteStream) => {
      console.log(`[WebRTC] Received stream from ${userToSignal}`, remoteStream.id);
      // Log stream details to help debug
      console.log(`[WebRTC] Stream has ${remoteStream.getVideoTracks().length} video tracks and ${remoteStream.getAudioTracks().length} audio tracks`);
      
      // Ensure video tracks are enabled
      remoteStream.getVideoTracks().forEach(track => {
        console.log(`[WebRTC] Video track: enabled=${track.enabled}, readyState=${track.readyState}`);
        track.enabled = true;
      });
      
      setPeers(prevPeers => {
        const updatedPeers = prevPeers.map(p => {
          if (p.peerId === userToSignal) {
            return { ...p, stream: remoteStream };
          }
          return p;
        });
        console.log(`[WebRTC] Updated peers after receiving stream:`, updatedPeers);
        return updatedPeers;
      });
    });
    
    return { peerId: userToSignal, peer };
  };
  
  // Function to add a peer connection
  const addPeer = (incomingSignal: Peer.SignalData, callerId: string, stream: MediaStream) => {
    console.log(`[WebRTC] Adding peer connection from ${callerId} (not initiator)`);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });
    
    peer.on('signal', (signal) => {
      console.log(`[WebRTC] Sending answer signal to ${callerId}`);
      socketRef.current?.emit('webrtc:answer', {
        target: callerId,
        answer: signal
      });
    });
    
    peer.on('connect', () => {
      console.log(`[WebRTC] Peer connection established with ${callerId}`);
    });
    
    peer.on('error', (err) => {
      console.error(`[WebRTC] Peer connection error with ${callerId}:`, err);
    });
    
    // Set up stream handler immediately
    peer.on('stream', (remoteStream) => {
      console.log(`[WebRTC] Received stream from ${callerId}`, remoteStream.id);
      // Log stream details to help debug
      console.log(`[WebRTC] Stream has ${remoteStream.getVideoTracks().length} video tracks and ${remoteStream.getAudioTracks().length} audio tracks`);
      
      // Ensure video tracks are enabled
      remoteStream.getVideoTracks().forEach(track => {
        console.log(`[WebRTC] Video track: enabled=${track.enabled}, readyState=${track.readyState}`);
        track.enabled = true;
      });
      
      setPeers(prevPeers => {
        const updatedPeers = prevPeers.map(p => {
          if (p.peerId === callerId) {
            return { ...p, stream: remoteStream };
          }
          return p;
        });
        console.log(`[WebRTC] Updated peers after receiving stream:`, updatedPeers);
        return updatedPeers;
      });
    });
    
    console.log(`[WebRTC] Signaling to peer ${callerId} with incoming signal`);
    peer.signal(incomingSignal);
    
    return { peerId: callerId, peer };
  };
  
  // Initialize WebRTC connection
  useEffect(() => {
    if (!roomId) return;
    
    setIsConnecting(true);
    
    // Connect to socket server using socketService
    console.log(`[WebRTC] Connecting to socket server via socketService...`);
    
    // Connect to socket service
    socketService.connect().then(connected => {
      if (!connected) {
        console.error(`[WebRTC] Failed to connect to socket server via socketService`);
        toast.error('Failed to connect to video chat server');
        setIsConnecting(false);
        return;
      }
      
      const socket = socketService.getSocket();
      if (!socket) {
        console.error(`[WebRTC] Socket is null after connection`);
        toast.error('Failed to connect to video chat server');
        setIsConnecting(false);
        return;
      }
      
      console.log(`[WebRTC] Socket connected with ID: ${socket.id}`);
      socketRef.current = socket;
      
      // Get user media and join room
      getUserMedia().then((stream) => {
        if (!stream) {
          setIsConnecting(false);
          return;
        }
        
        // Verify stream has active tracks
        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();
        console.log(`[WebRTC] Stream ready for connection:`, {
          videoTracks: videoTracks.length,
          audioTracks: audioTracks.length,
          videoEnabled: videoTracks.length > 0 ? videoTracks[0].enabled : false,
          audioEnabled: audioTracks.length > 0 ? audioTracks[0].enabled : false
        });
        
        console.log(`[WebRTC] Joining room with ID: ${roomId}, user role: ${userRole}`);
        socket.emit('webrtc:joinRoom', roomId);
        
        // Handle existing users in the room
        socket.on('webrtc:usersInRoom', (users) => {
          console.log(`[WebRTC] Users in room ${roomId}:`, users);
          const peers = [];
          
          users.forEach((userId) => {
            console.log(`[WebRTC] Creating peer connection to ${userId}`);
            const peerConnection = createPeer(userId, socket.id, stream);
            peersRef.current.push(peerConnection);
            peers.push(peerConnection);
          });
          
          setPeers(peers);
        });
        
        // Handle new user joining
        socket.on('webrtc:userJoined', (userId) => {
          console.log(`[WebRTC] New user joined room ${roomId}:`, userId);
          const peerConnection = createPeer(userId, socket.id, stream);
          peersRef.current.push(peerConnection);
          
          setPeers(prevPeers => {
            console.log(`[WebRTC] Updated peers:`, [...prevPeers, peerConnection].length);
            return [...prevPeers, peerConnection];
          });
        });
        
        // Handle receiving an offer
        socket.on('webrtc:offer', ({ offer, from }) => {
          console.log(`[WebRTC] Received offer from ${from}`);
          const peerConnection = addPeer(offer, from, stream);
          peersRef.current.push(peerConnection);
          
          setPeers(prevPeers => {
            console.log(`[WebRTC] Updated peers after offer:`, [...prevPeers, peerConnection].length);
            return [...prevPeers, peerConnection];
          });
        });
        
        // Handle receiving an answer
        socket.on('webrtc:answer', ({ answer, from }) => {
          console.log(`[WebRTC] Received answer from ${from}`);
          const peerItem = peersRef.current.find(p => p.peerId === from);
          if (peerItem) {
            console.log(`[WebRTC] Applying answer signal from ${from}`);
            peerItem.peer.signal(answer);
          } else {
            console.warn(`[WebRTC] No peer found for answer from ${from}`);
          }
        });
        
        // Handle receiving ICE candidate
        socket.on('webrtc:iceCandidate', ({ candidate, from }) => {
          console.log(`[WebRTC] Received ICE candidate from ${from}`);
          const peerItem = peersRef.current.find(p => p.peerId === from);
          if (peerItem) {
            console.log(`[WebRTC] Applying ICE candidate from ${from}`);
            peerItem.peer.signal({ candidate });
          } else {
            console.warn(`[WebRTC] No peer found for ICE candidate from ${from}`);
          }
        });
        
        // Handle user leaving
        socket.on('webrtc:userLeft', (userId) => {
          console.log(`[WebRTC] User left: ${userId}`);
          const peerItem = peersRef.current.find(p => p.peerId === userId);
          if (peerItem) {
            console.log(`[WebRTC] Destroying peer connection with ${userId}`);
            peerItem.peer.destroy();
          } else {
            console.warn(`[WebRTC] No peer found for user who left: ${userId}`);
          }
          
          const peers = peersRef.current.filter(p => p.peerId !== userId);
          peersRef.current = peers;
          setPeers(peers);
          console.log(`[WebRTC] Updated peers after user left:`, peers.length);
        });
        
        // Handle screen sharing updates
        socket.on('webrtc:screenShareUpdate', ({ userId, isSharing }) => {
          toast.info(`${isSharing ? 'Screen sharing started' : 'Screen sharing stopped'} by another user`);
        });
        
        setIsConnecting(false);
        setIsConnected(true);
      });
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
      
      // Leave room but don't disconnect socket since it's managed by socketService
      if (socketRef.current) {
        console.log(`[WebRTC] Leaving room ${roomId}`);
        socketRef.current.emit('webrtc:leaveRoom', roomId);
        // Remove all event listeners
        socketRef.current.off('webrtc:usersInRoom');
        socketRef.current.off('webrtc:userJoined');
        socketRef.current.off('webrtc:offer');
        socketRef.current.off('webrtc:answer');
        socketRef.current.off('webrtc:iceCandidate');
        socketRef.current.off('webrtc:userLeft');
        socketRef.current.off('webrtc:screenShareUpdate');
      }
      
      socketRef.current = null;
    };
  }, [roomId, getUserMedia, isVideoOff, isMicMuted]);
  
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
    socketRef.current?.emit('webrtc:leaveRoom', roomId);
    
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
      
      socketRef.current?.emit('webrtc:joinRoom', roomId);
      setIsConnected(true);
      setIsConnecting(false);
      toast.success('Reconnected to video chat');
    });
  };

  // Add a useEffect to update video elements when peers state changes
  useEffect(() => {
    console.log(`[WebRTC] Peers state updated, peers count: ${peers.length}`);
    peers.forEach(peer => {
      if (peer.stream) {
        console.log(`[WebRTC] Peer ${peer.peerId} has stream ${peer.stream.id}`);
      } else {
        console.log(`[WebRTC] Peer ${peer.peerId} has no stream yet`);
      }
    });
  }, [peers]);

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
                    ref={(element) => {
                      if (element) {
                        // Always set the ref, even if stream is not yet available
                        console.log(`[WebRTC] Setting up video element for peer ${peer.peerId}`);
                        if (peer.stream) {
                          console.log(`[WebRTC] Setting srcObject for peer ${peer.peerId}`);
                          
                          // Only set srcObject if it's different from the current one
                          if (element.srcObject !== peer.stream) {
                            element.srcObject = peer.stream;
                            
                            // Add event listeners for debugging
                            element.onloadedmetadata = () => {
                              console.log(`[WebRTC] Video metadata loaded for peer ${peer.peerId}`);
                            };
                            
                            element.oncanplay = () => {
                              console.log(`[WebRTC] Video can play for peer ${peer.peerId}`);
                            };
                            
                            element.onplay = () => {
                              console.log(`[WebRTC] Video playing for peer ${peer.peerId}`);
                            };
                            
                            element.onerror = (e) => {
                              console.error(`[WebRTC] Video error for peer ${peer.peerId}:`, e);
                            };
                            
                            // Force play to ensure video starts
                            element.play().catch(err => {
                              console.error(`[WebRTC] Error playing video: ${err.message}`);
                            });
                          }
                        } else {
                          console.log(`[WebRTC] No stream available yet for peer ${peer.peerId}`);
                        }
                      }
                    }}
                    autoPlay
                    playsInline
                    muted={false}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    className="w-full h-full object-cover"
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
                <p className="mt-1 text-xs text-muted-foreground">
                  Room ID: {roomId}
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
              ref={(element) => {
                if (element && localStream) {
                  console.log(`[WebRTC] Setting up local video element`);
                  if (element.srcObject !== localStream) {
                    element.srcObject = localStream;
                    
                    // Add event listeners for debugging
                    element.onloadedmetadata = () => {
                      console.log(`[WebRTC] Local video metadata loaded`);
                    };
                    
                    element.oncanplay = () => {
                      console.log(`[WebRTC] Local video can play`);
                    };
                    
                    element.onplay = () => {
                      console.log(`[WebRTC] Local video playing`);
                    };
                    
                    element.onerror = (e) => {
                      console.error(`[WebRTC] Local video error:`, e);
                    };
                    
                    // Force play to ensure video starts
                    element.play().catch(err => {
                      console.error(`[WebRTC] Error playing local video: ${err.message}`);
                    });
                  }
                }
              }}
              autoPlay
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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