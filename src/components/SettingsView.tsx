import { useState, useEffect } from 'react';
import { Settings, Download, Upload, Trash2, Smartphone, Lock } from 'lucide-react';
import { exportCornerstoneData, importCornerstoneData, clearCornerstoneData, hasCornerstoneData } from '@/lib/storage';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface SettingsViewProps {
  onLock: () => void;
}

export function SettingsView({ onLock }: SettingsViewProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if has cornerstone data
    setHasData(hasCornerstoneData());

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success('CORNER installed successfully!');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast.info('Use your browser menu to install: ⋮ → Install app');
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleExport = () => {
    exportCornerstoneData();
    toast.success('Cornerstone data exported!');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await importCornerstoneData(file);
          toast.success('Cornerstone data imported! Refresh to see changes.');
          setHasData(true);
        } catch {
          toast.error('Failed to import data. Invalid file format.');
        }
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
      clearCornerstoneData();
      toast.success('Local data cleared. Refresh to reload from source.');
      setHasData(false);
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('corner-unlocked');
    onLock();
    toast.success('Corner locked. Goodbye!');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg burgundy-gradient flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-serif text-2xl text-foreground">Settings</h2>
          <p className="text-sm text-muted-foreground">App configuration and data management</p>
        </div>
      </div>

      {/* Install App Section */}
      <div className="stat-card">
        <h3 className="font-serif text-lg text-foreground mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-primary" />
          Install Desktop App
        </h3>
        
        {isInstalled ? (
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-foreground font-medium">✓ CORNER is installed</p>
            <p className="text-sm text-muted-foreground mt-1">
              You're running the desktop app. Works offline!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Install CORNER as a desktop app for quick access and offline use. 
              Your data is stored locally on your device.
            </p>
            <button
              onClick={handleInstall}
              className="px-6 py-3 burgundy-gradient text-primary-foreground rounded-lg font-medium
                hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Install CORNER
            </button>
            <p className="text-xs text-muted-foreground">
              Or use browser menu: ⋮ → "Install app" or "Add to Home Screen"
            </p>
          </div>
        )}
      </div>

      {/* Security Section */}
      <div className="stat-card">
        <h3 className="font-serif text-lg text-foreground mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          Security
        </h3>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Lock your corner to require password on next access. 
            You can also type <code className="px-2 py-0.5 bg-secondary rounded text-foreground">lockit</code> anywhere to lock instantly.
          </p>
          <button
            onClick={handleLock}
            className="px-6 py-3 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg font-medium
              transition-colors flex items-center gap-2 border border-destructive/30"
          >
            <Lock className="w-4 h-4" />
            Lock CORNER
          </button>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="stat-card">
        <h3 className="font-serif text-lg text-foreground mb-4">Data Management</h3>
        <p className="text-muted-foreground mb-4">
          Your game data is stored locally in a file called "cornerstone". 
          {hasData ? ' Local data found.' : ' No local data yet.'}
        </p>
        
        <div className="grid sm:grid-cols-3 gap-4">
          <button
            onClick={handleExport}
            className="p-4 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-left"
          >
            <Download className="w-5 h-5 text-primary mb-2" />
            <p className="font-medium text-foreground">Export Data</p>
            <p className="text-xs text-muted-foreground mt-1">Download cornerstone.json</p>
          </button>
          
          <button
            onClick={handleImport}
            className="p-4 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-left"
          >
            <Upload className="w-5 h-5 text-primary mb-2" />
            <p className="font-medium text-foreground">Import Data</p>
            <p className="text-xs text-muted-foreground mt-1">Restore from backup</p>
          </button>
          
          <button
            onClick={handleClearData}
            className="p-4 bg-secondary hover:bg-destructive/10 rounded-lg transition-colors text-left group"
          >
            <Trash2 className="w-5 h-5 text-muted-foreground group-hover:text-destructive mb-2" />
            <p className="font-medium text-foreground group-hover:text-destructive">Clear Data</p>
            <p className="text-xs text-muted-foreground mt-1">Reset local storage</p>
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="stat-card">
        <h3 className="font-serif text-lg text-foreground mb-3">About CORNER</h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>CORNER is a single-player life game designed for intentional living.</p>
          <p>Version 1.0 • Built with ♡ for Laasya</p>
        </div>
      </div>
    </div>
  );
}
