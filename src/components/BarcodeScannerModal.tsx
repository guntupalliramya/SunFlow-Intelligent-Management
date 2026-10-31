import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, Barcode, AlertCircle, RefreshCw } from 'lucide-react';
import { ProductSerialNumber } from '../types/solar';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (scannedSerial: string) => void;
  availableSerials?: ProductSerialNumber[];
  title?: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  availableSerials = [],
  title = 'Scan Equipment Barcode / Serial Number',
}) => {
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      setManualCode('');
      setCameraError(null);
      // Attempt camera access
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraError('Camera API not accessible on this device. Use manual entry or quick pick below.');
      }
    } catch {
      setCameraError('Camera permission denied or camera not found. Use manual barcode input or quick select below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScan(manualCode.trim().toUpperCase());
    onClose();
  };

  const handleQuickPick = (serial: string) => {
    onScan(serial);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">{title}</h3>
              <p className="text-xs text-slate-500">Scan 1D/2D barcode or enter serial manually</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Camera Viewfinder Box */}
          <div className="relative rounded-lg overflow-hidden bg-slate-950 aspect-16/9 flex items-center justify-center border border-slate-700">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {/* Visual Scanner HUD Reticle */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-3/4 h-28 border-2 border-emerald-400 rounded-lg relative animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_8px_red]"></div>
                  </div>
                </div>
                <div className="absolute bottom-2 inset-x-0 text-center">
                  <span className="bg-black/70 text-emerald-400 text-xs px-3 py-1 rounded-full font-mono">
                    Aim laser line at barcode
                  </span>
                </div>
              </>
            ) : (
              <div className="p-4 text-center text-slate-400">
                <Camera className="w-10 h-10 mx-auto mb-2 text-slate-500 opacity-60" />
                <p className="text-xs max-w-xs">{cameraError || 'Camera preview stopped.'}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium px-2 py-1 bg-slate-800 rounded border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Camera
                </button>
              </div>
            )}
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Manual Serial Number Entry
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. GRW-5KW-2026-9043"
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
                autoFocus
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Check className="w-4 h-4" />
                Select
              </button>
            </div>
          </form>

          {/* Quick Select from Available Stock */}
          {availableSerials.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Quick Pick Available In Stock ({availableSerials.length})
                </span>
                <span className="text-xs text-slate-400">Click to instantly scan</span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {availableSerials.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleQuickPick(item.serialNumber)}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                        {item.serialNumber}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{item.productName}</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800">
                      {item.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            Duplicate serials are blocked automatically
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
