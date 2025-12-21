import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useStore } from '../../store/useStore';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AlertTriangle, Navigation, Phone, Filter, X } from 'lucide-react';

// Custom Marker Icons
const createCustomIcon = (color, pulse = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative; width: 30px; height: 30px;">
        ${pulse ? `<div style="position: absolute; inset: 0; background-color: ${color}; border-radius: 9999px; opacity: 0.75; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
        <div style="position: relative; width: 30px; height: 30px; background-color: ${color}; border: 2px solid white; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="width: 8px; height: 8px; background-color: white; border-radius: 9999px;"></div>
        </div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const Icons = {
  sos: createCustomIcon('#ef4444', true),
  hazard: createCustomIcon('#f59e0b'),
  police: createCustomIcon('#3b82f6'),
  medical: createCustomIcon('#10b981'),
  default: createCustomIcon('#6b7280')
};

// Helper to control map zoom/center
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13);
  }, [center, map]);
  return null;
}

export function TacticalMapPage() {
  const { sosRequests, hazards, rescueUnits, fetchSOS } = useStore();
  
  const [center, setCenter] = useState([28.6139, 77.2090]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({ showSOS: true, showHazards: true, showUnits: true });
  const [showFilterPanel, setShowFilterPanel] = useState(true);

  // Poll for updates
  useEffect(() => {
    fetchSOS();
    const interval = setInterval(fetchSOS, 5000);
    return () => clearInterval(interval);
  }, [fetchSOS]);

  return (
    <DashboardLayout>
      <div className="relative h-[calc(100vh-4rem)] rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
        
        <MapContainer 
          center={center} 
          zoom={13} 
          style={{ height: '100%', width: '100%', background: '#0f172a' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          <MapController center={center} />

          {/* 1. SOS MARKERS (Safe Map) */}
          {filters.showSOS && (sosRequests || []).map(sos => (
            <Marker 
              key={`sos-${sos._id || sos.id}`} 
              position={[sos.location.lat, sos.location.lng]} 
              icon={Icons.sos}
              eventHandlers={{ click: () => setSelectedItem({ type: 'sos', data: sos }) }}
            />
          ))}

          {/* 2. HAZARD MARKERS (Safe Map) */}
          {filters.showHazards && (hazards || []).map(hz => (
            <Marker 
              key={`haz-${hz.id}`} 
              position={[28.62, 77.21]} 
              icon={Icons.hazard}
              eventHandlers={{ click: () => setSelectedItem({ type: 'hazard', data: hz }) }}
            />
          ))}

          {/* 3. UNIT MARKERS (Safe Map) */}
          {filters.showUnits && (rescueUnits || []).map(unit => (
            <Marker 
              key={`unit-${unit.id}`} 
              position={[28.61, 77.22]} 
              icon={unit.type === 'medical' ? Icons.medical : Icons.police}
              eventHandlers={{ click: () => setSelectedItem({ type: 'unit', data: unit }) }}
            />
          ))}
        </MapContainer>

        {/* Filter Controls */}
        <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-lg shadow-xl w-64">
           <div className="flex justify-between items-center mb-3">
             <h3 className="text-white font-bold flex items-center gap-2">
               <Filter size={16} /> Layers
             </h3>
             <button onClick={() => setShowFilterPanel(!showFilterPanel)} className="text-slate-400 hover:text-white">
               {showFilterPanel ? <X size={16} /> : <Filter size={16} />}
             </button>
           </div>
           
           {showFilterPanel && (
             <div className="space-y-3">
               <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                 <input 
                   type="checkbox" 
                   checked={filters.showSOS} 
                   onChange={e => setFilters({...filters, showSOS: e.target.checked})}
                   className="accent-red-500 w-4 h-4" 
                 />
                 <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> SOS Alerts</span>
               </label>
             </div>
           )}
        </div>

        {/* Selected Item Details */}
        {selectedItem && (
          <div className="absolute bottom-6 left-6 z-[1000] bg-slate-900/95 backdrop-blur border-l-4 border-red-500 p-6 rounded-r-lg shadow-2xl w-80 animate-in slide-in-from-bottom-10 fade-in">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                {selectedItem.type === 'sos' ? 'SOS ALERT' : selectedItem.type.toUpperCase()}
              </h2>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
               {selectedItem.type === 'sos' && (
                 <>
                   <div className="flex items-center gap-2 text-red-400 font-medium">
                     <AlertTriangle size={18} />
                     <span>{selectedItem.data.type?.toUpperCase()} - {selectedItem.data.priority} Priority</span>
                   </div>
                   <p className="text-slate-300 text-sm">Reported by: <span className="text-white">{selectedItem.data.userName}</span></p>
                   <div className="flex gap-2 mt-4">
                     <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center gap-2 text-sm font-medium">
                       <Navigation size={16} /> Navigate
                     </button>
                     <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded flex items-center justify-center gap-2 text-sm font-medium">
                       <Phone size={16} /> Contact
                     </button>
                   </div>
                 </>
               )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}