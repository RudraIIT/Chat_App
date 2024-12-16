import { useRef, useEffect, useState, useCallback } from "react";
import { useSocketContext } from "./SocketContext.tsx";


export default function useVideoCall() {
    const { socket } = useSocketContext();
    const localStream = useRef<MediaStream | null>(null);
    const remoteStream = useRef<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const [isInCall, setIsInCall] = useState(false);
    const peerConnection = useRef<RTCPeerConnection | null>(null);

    const startCall = useCallback(
        async (receiverId: string) => {
            if (!socket) return;
    
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localStream.current = stream;
    
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
    
                peerConnection.current = new RTCPeerConnection();
    
                stream.getTracks().forEach((track) => {
                    peerConnection.current?.addTrack(track, stream);
                });
    
                peerConnection.current.onicecandidate = (e) => {
                    if (e.candidate) {
                        socket.emit("ice-candidate", { to: receiverId, candidate: e.candidate });
                    }
                };
    
                peerConnection.current.ontrack = (e) => {
                    if (!remoteStream.current) {
                        remoteStream.current = new MediaStream();
                    }
                    e.streams[0].getTracks().forEach((track) => {
                        remoteStream.current?.addTrack(track);
                    });
    
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream.current;
                    }
                };
    
                const offer = await peerConnection.current.createOffer();
                await peerConnection.current.setLocalDescription(offer);
    
                socket.emit("start-call", { to: receiverId, offer });
    
                setIsInCall(true);
            } catch (error) {
                console.error("Error starting call:", error);
            }
        },
        [socket]
    );
    
    const answerCall = useCallback(
        async (callerId: string, offer: RTCSessionDescriptionInit) => {
            if (!socket) return;

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localStream.current = stream;

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                peerConnection.current = new RTCPeerConnection();

                stream.getTracks().forEach((track) => {
                    peerConnection.current?.addTrack(track, stream);
                });

                peerConnection.current.onicecandidate = (e) => {
                    if (e.candidate) {
                        socket.emit("ice-candidate", {
                            to: callerId,
                            candidate: e.candidate,
                        });
                    }
                };

                peerConnection.current.ontrack = (e) => {
                    if (!remoteStream.current) {
                        remoteStream.current = new MediaStream();
                    }
                    e.streams[0].getTracks().forEach((track) => {
                        remoteStream.current?.addTrack(track);
                    });

                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = remoteStream.current;
                    }
                };

                await peerConnection.current.setRemoteDescription(offer);
                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);

                socket.emit("answer-call", {
                    to: callerId,
                    answer,
                });

                setIsInCall(true);
            } catch (error) {
                console.error("Error answering call:", error);
            }
        },
        [socket]
    );

    const endCall = useCallback(() => {
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        localStream.current?.getTracks().forEach((track) => track.stop());
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }

        if (remoteStream.current) {
            remoteStream.current.getTracks().forEach((track) => track.stop());
        }

        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        localStream.current = null;
        remoteStream.current = null;
        setIsInCall(false);
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleStartCall = async ({ callerId, offer }: { callerId: string; offer: RTCSessionDescriptionInit }) => {
            if (confirm(`Do you want to accept the call from ${callerId}?`)) {
                await answerCall(callerId, offer);
            }
        };

        const handleAnswerCall = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
            await peerConnection.current?.setRemoteDescription(answer);
        };

        const handleIceCandidate = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
            try {
                await peerConnection.current?.addIceCandidate(candidate);
            } catch (error) {
                console.error("Error adding ICE candidate:", error);
            }
        };

        socket.on("start-call", handleStartCall);
        socket.on("answer-call", handleAnswerCall);
        socket.on("ice-candidate", handleIceCandidate);

        return () => {
            socket.off("start-call", handleStartCall);
            socket.off("answer-call", handleAnswerCall);
            socket.off("ice-candidate", handleIceCandidate);
        };
    }, [socket, answerCall]);

    return {
        localStream,
        remoteStream,
        localVideoRef,
        remoteVideoRef,
        isInCall,
        startCall,
        endCall,
        answerCall
    };
}
