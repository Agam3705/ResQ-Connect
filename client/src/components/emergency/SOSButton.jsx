import { useState } from 'react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast'; // <--- IMPORT THIS

export function SOSButton() {
  const { user } = useStore();
  const [isPressing, setIsPressing] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [loading, setLoading] = useState(false);

  const handleSOS = async () => {
    if (!navigator.geolocation) {
      toast.error("GPS not supported on this device"); // <--- Replace alert
      return;
    }

    setLoading(true);
    
    // Show a "Sending..." toast that we can update later
    const toastId = toast.loading("Acquiring GPS Signal...");

    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const payload = {
          userId: user?._id || 'guest-id',
          userName: user?.name || 'Guest User',
          type: 'medical',
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          description: "Immediate Assistance Required"
        };

        await axios.post('http://localhost:5000/api/sos/create', payload);
        
        // Success! Update the loading toast to a Success Message
        toast.success("SOS SIGNAL SENT! RESCUE NOTIFIED.", {
          id: toastId,
          duration: 5000,
          style: {
            background: '#ef4444', // Red background for emergency
            color: 'white',
            fontWeight: 'bold'
          }
        });

        setLoading(false);
        setIsPressing(false);

      } catch (error) {
        console.error(error);
        toast.error("FAILED TO SEND SOS! CHECK INTERNET.", { id: toastId });
        setLoading(false);
      }
    }, (error) => {
      toast.error("GPS ACCESS DENIED. ENABLE LOCATION SERVICES.", { id: toastId });
      setLoading(false);
    });
  };

  const startPress = () => {
    setIsPressing(true);
    let count = 3;
    setCountdown(count);
    
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(interval);
        handleSOS();
      }
    }, 1000);

    window.currentInterval = interval;
  };

  const cancelPress = () => {
    if (isPressing && countdown > 0) {
      toast("SOS Cancelled", { icon: '🛑' }); // Optional feedback
    }
    setIsPressing(false);
    setCountdown(3);
    clearInterval(window.currentInterval);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onMouseDown={startPress}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 select-none
          ${isPressing ? 'scale-110 bg-red-700' : 'bg-red-600 hover:bg-red-500 animate-pulse'}
        `}
      >
        {loading ? (
          <Loader2 className="animate-spin text-white w-8 h-8" />
        ) : isPressing ? (
          <span className="text-3xl font-bold text-white font-mono">{countdown}</span>
        ) : (
          <div className="text-white text-xs font-bold flex flex-col items-center pointer-events-none">
            <span className="text-xl">SOS</span>
          </div>
        )}
        
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping -z-10"></span>
      </button>
    </div>
  );
}