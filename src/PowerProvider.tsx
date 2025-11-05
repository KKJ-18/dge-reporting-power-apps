import { initialize } from "@pa-client/power-code-sdk/lib/Lifecycle";
import { useEffect, useState, type ReactNode } from "react";

interface PowerProviderProps {
    children: ReactNode;
}

export default function PowerProvider({ children }: PowerProviderProps) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const initApp = async () => {
            try {
                console.log('Initializing Power Platform SDK...');
                await initialize();
                console.log('Power Platform SDK initialized successfully');
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
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div>Initialisation de l'application...</div>
                {error && <div style={{ color: 'orange', fontSize: '0.9rem' }}>Mode développement</div>}
            </div>
        );
    }

    return <>{children}</>;
}