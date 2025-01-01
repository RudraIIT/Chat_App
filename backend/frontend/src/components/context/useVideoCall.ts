import { useEffect, useRef, useState, useCallback } from "react";
import { usePeerContext } from "./PeerContext";
import { MediaConnection } from "peerjs";

export default function useVideoCall () {
    const { peer } = usePeerContext();
    const localStream = useRef<MediaStream | null>(null);
    const remoteStream = useRef<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const [isInCall, setIsInCall] = useState(false);
    const [currentCall, setCurrentCall] = useState<MediaConnection | null>(null);
    const [incomingCall, setIncomingCall] = useState<MediaConnection | null>(null);

    useEffect(() => {
        if (!peer) return;

        peer.on("call", (call) => {
            console.log("Incoming call...");
            setIncomingCall(call); 
        });

        return () => {
            peer.off("call");
        };
    }, [peer]);

    const answerCall = useCallback(
        (incomingCall: MediaConnection) => {
            console.log("Answering call...");
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    localStream.current = stream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream;
                    }

                    incomingCall.answer(stream); 

                    incomingCall.on("stream", (remoteStreamInstance) => {
                        remoteStream.current = remoteStreamInstance;
                        if (remoteVideoRef.current) {
                            remoteVideoRef.current.srcObject = remoteStreamInstance;
                        }
                    });

                    setCurrentCall(incomingCall);
                    setIsInCall(true);
                })
                .catch((err) => {
                    console.error("Error accessing media devices:", err);
                });
        },
        []
    );

    const startCall = useCallback(
        (receiverPeerId: string) => {
            if (!peer) return;
            console.log("Starting call to:", receiverPeerId);
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    localStream.current = stream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream;
                    }

                    const call = peer.call(receiverPeerId, stream);

                    call.on("stream", (remoteStreamInstance) => {
                        remoteStream.current = remoteStreamInstance;
                        
                        if (remoteVideoRef.current) {
                            remoteVideoRef.current.srcObject = remoteStreamInstance;
                        }
                    });

                    setCurrentCall(call);
                    setIsInCall(true);
                })
                .catch((err) => {
                    console.error("Error starting call:", err);
                });
        },
        [peer]
    );

    const endCall = useCallback(() => {
        if (currentCall) {
            currentCall.close();
            setCurrentCall(null);
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
    }, [currentCall]);

    return {
        localStream,
        remoteStream,
        localVideoRef,
        remoteVideoRef,
        isInCall,
        startCall,
        endCall,
        answerCall, 
        incomingCall, 
    };
};