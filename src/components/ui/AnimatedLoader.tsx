/**
 * AnimatedLoader - Splash screen animé inspiré de ReportingCommercialeV2
 * Affiche un progress bar séquentiel avec textes dynamiques
 */
import { useState, useEffect } from 'react';

interface AnimatedLoaderProps {
  onLoadComplete?: () => void;
  minDuration?: number;
}

const loadingSteps = [
  { progress: 20, text: 'Initialisation...' },
  { progress: 40, text: 'Connexion aux services...' },
  { progress: 60, text: 'Récupération des données...' },
  { progress: 80, text: 'Préparation de l\'interface...' },
  { progress: 100, text: 'Bienvenue !' },
];

export default function AnimatedLoader({ onLoadComplete, minDuration = 2500 }: AnimatedLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initialisation...');
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const stepDuration = minDuration / loadingSteps.length;
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        setProgress(loadingSteps[currentStep].progress);
        setLoadingText(loadingSteps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => onLoadComplete?.(), 500);
        }, 300);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [minDuration, onLoadComplete]);

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div
          className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-primary-600 rounded-2xl flex items-center justify-center shadow-strong animate-scale-in">
            <span className="text-white text-4xl font-bold">DGE</span>
          </div>
          <div className="absolute -inset-2 border-2 border-primary-500/30 rounded-2xl animate-pulse" />
        </div>

        {/* Text */}
        <h1 className="text-white text-2xl font-bold mb-2 animate-fade-in">DGE Reporting</h1>
        <p className="text-neutral-400 text-sm mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>{loadingText}</p>

        {/* Progress bar */}
        <div className="w-64 sm:w-80">
          <div className="h-1.5 bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-neutral-500 text-xs mt-2 text-center">{progress}%</p>
        </div>
      </div>
    </div>
  );
}
