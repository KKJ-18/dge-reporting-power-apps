import { initialize } from "@pa-client/power-code-sdk/lib/Lifecycle";
import { useEffect, useState, type ReactNode } from "react";
import { debugLog } from './utils/logger';

interface PowerProviderProps {
    children: ReactNode;
}

export default function PowerProvider({ children }: PowerProviderProps) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const initApp = async () => {
            try {
                debugLog('Initializing Power Platform SDK...');
                await initialize();
                debugLog('Power Platform SDK initialized successfully');
                setIsInitialized(true);
            } catch (error) {
                console.error('Failed to initialize Power Platform SDK:', error);
                setError(error as Error);
                // Even if initialization fails, we'll show the app
                // This allows development without Power Platform
                setIsInitialized(true);
            }
        };
        
        initApp();
    }, []);

    if (!isInitialized) {
        return (
            <div className="flex justify-center items-center min-h-screen flex-col gap-4">
                <div>Initialisation de l'application...</div>
                {error && <div className="text-orange-500 text-sm">Mode développement</div>}
            </div>
        );
    }

    return <>{children}</>;
}