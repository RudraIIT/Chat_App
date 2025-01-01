import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import Peer from "peerjs";

interface PeerContextType {
    peer: Peer | null;
}

const peerContext = createContext<PeerContextType | null>(null);

export const usePeerContext = () => {
    const context = useContext(peerContext);
    if (!context) {
        throw new Error("usePeerContext must be used within a PeerProvider");
    }
    return context;
};

export const PeerProvider = ({ children }: { children: React.ReactNode }) => {
    const [peer, setPeer] = useState<Peer | null>(null);
    const { user } = useAuth();
    useEffect(() => {
        if (user) {
            const peerInstance = new Peer(user);
            setPeer(peerInstance);
            return () => {
                peerInstance.destroy();
                setPeer(null);
            };
        } else {
            if (peer) {
                peer.destroy();
                setPeer(null);
            }
        }
    }
        , [user]);

    return (
        <peerContext.Provider value={{ peer }}>
            {children}
        </peerContext.Provider>
    );

};