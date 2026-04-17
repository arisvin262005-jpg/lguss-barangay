import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Navigation, ShieldAlert, Users, Radio, LocateFixed } from 'lucide-react';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Custom user tracking icon
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Incident icon
const incidentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultCenter = [13.2236, 120.5989]; // Mamburao

// Component to dynamically pan the map
function MapUpdater({ userLoc, shouldCenter }) {
  const map = useMap();
  useEffect(() => {
    if (shouldCenter && userLoc) {
      map.flyTo(userLoc, 18);
    }
  }, [userLoc, shouldCenter, map]);
  return null;
}

export default function Tracking() {
  const { hasRole } = useAuth();
  const [locations, setLocations] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // User realtime Tracking
  const [userLocation, setUserLocation] = useState(null);
  const [centerOnUser, setCenterOnUser] = useState(false);

  useEffect(() => {
    if (!hasRole('Admin', 'Secretary')) { setLoading(false); return; }
    
    // Fetch initial data
    const fetchData = async () => {
      try {
        const [locRes, incRes] = await Promise.all([
          api.get('/tracking/locations'),
          api.get('/tracking/incidents')
        ]);
        setLocations(locRes.data.data || []);
        setIncidents(incRes.data.data || []);
      } catch (err) { } finally { setLoading(false); }
    };
    
    fetchData();

    // Mock real-time updates for tanods
    const interval = setInterval(() => {
      setLocations(prev => prev.map(t => {
        if (!t.onDuty) return t;
        const latDelta = (Math.random() - 0.5) * 0.0005;
        const lngDelta = (Math.random() - 0.5) * 0.0005;
        return { ...t, lat: t.lat + latDelta, lng: t.lng + lngDelta, lastSeen: new Date().toISOString() };
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, [hasRole]);

  // Geolocation Realtime Watcher
  useEffect(() => {
    if (!hasRole('Admin', 'Secretary')) return;
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
      },
      (error) => console.log('Geolocation tracking error:', error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [hasRole]);

  const handleCenterClick = () => {
    if (userLocation) {
      setCenterOnUser(true);
      setTimeout(() => setCenterOnUser(false), 1000); // Reset flags
    } else {
      alert("Please allow location access in your browser to center the map on you.");
    }
  };

  if (!hasRole('Admin', 'Secretary')) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#64748b' }}>
        <div style={{ textAlign: 'center' }}>
          <ShieldAlert size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <div>Access to real-time maps is restricted.</div>
        </div>
      </div>
    );
  }

  const activeTanods = locations.filter(l => l.onDuty).length;

  return (
    <div className="animate-in" style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">GPS Dispatch & Tracking</h1>
          <p className="page-subtitle">Real-time Satellite map with live user & tanod tracking.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={handleCenterClick} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <LocateFixed size={18} /> Locate Me
          </button>
          <div className="gov-card" style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 0 }}>
            <Radio size={20} color="#10b981" />
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>ON DUTY NOW</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)', lineHeight: 1.1 }}>{activeTanods} Tanod</div>
            </div>
          </div>
          <div className="gov-card" style={{ padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 0 }}>
            <ShieldAlert size={20} color="#ef4444" />
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800 }}>ACTIVE INCIDENTS</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)', lineHeight: 1.1 }}>{incidents.filter(i => i.status === 'Open').length} Cases</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', alignItems: 'start' }}>
        {/* Map */}
        <div className="gov-card" style={{ height: 'calc(100vh - 170px)', padding: 0, overflow: 'hidden', borderRadius: 12 }}>
            {loading ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontWeight: 600 }}>Loading satellite data...</div> : (
              <MapContainer center={defaultCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
                
                {/* 100% FREE SATELLITE TILE LAYER (ESRI WORLD IMAGERY) */}
                <TileLayer
                  attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                
                <MapUpdater userLoc={userLocation} shouldCenter={centerOnUser} />

                {/* Real-time User Location Marker */}
                {userLocation && (
                  <>
                    <Circle center={userLocation} pathOptions={{ fillColor: '#10b981', color: '#10b981', weight: 1, fillOpacity: 0.2 }} radius={20} />
                    <Marker position={userLocation} icon={userIcon} zIndexOffset={1000}>
                      <Popup>
                        <strong style={{ color: '#16a34a' }}>Your Location</strong><br />
                        Updating dynamically as you move.
                      </Popup>
                    </Marker>
                  </>
                )}

                {/* Tanod Coverage & Markers */}
                {locations.filter(t => t.onDuty).map(t => (
                  <div key={`wrap-${t.userId}`}>
                    <Circle center={[t.lat, t.lng]} pathOptions={{ fillColor: '#38bdf8', fillOpacity: 0.1, color: '#38bdf8', weight: 1.5, dashArray: '4' }} radius={100} />
                    <Marker position={[t.lat, t.lng]}>
                      <Popup>
                        <div style={{ textAlign: 'center', color: '#1e293b' }}>
                          <div style={{ fontWeight: 800, color: '#1a4f8a' }}>{t.name}</div>
                          <div style={{ fontSize: '0.8em', color: '#64748b', fontWeight: 600 }}>{t.barangay}</div>
                          <div style={{ fontSize: '0.75em', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 100, fontWeight: 700 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} /> Active Patrol
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </div>
                ))}

                {/* Incident Markers */}
                {incidents.filter(i => i.status === 'Open').map(inc => (
                  <Marker key={`inc-${inc.id}`} position={[inc.lat, inc.lng]} icon={incidentIcon}>
                    <Popup>
                      <div style={{ fontWeight: 800, color: '#ef4444' }}>⚠️ Incident Report</div>
                      <div style={{ fontSize: '0.85em', fontWeight: 600, marginTop: 2 }}>Severity: <span style={{ color: '#b91c1c' }}>{inc.severity}</span></div>
                      <div style={{ fontSize: '0.85em', marginTop: 4, color: '#334155' }}>{inc.description}</div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
        </div>

        {/* Sidebar info */}
        <div className="gov-card" style={{ height: 'calc(100vh - 170px)', display: 'flex', flexDirection: 'column' }}>
          <div className="gov-card-header" style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
            <div className="gov-card-title"><Users size={16} color="#1a4f8a" /> <span>Tanod Dispatch Roster</span></div>
          </div>
            
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {locations.length === 0 && !loading && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2rem' }}>No tanods registered.</div>
              )}
              {locations.map(t => (
                <div key={t.userId} style={{ padding: '1rem', borderRadius: 10, background: t.onDuty ? 'var(--surface)' : 'var(--bg)', border: `1px solid ${t.onDuty ? 'var(--border)' : 'transparent'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: t.onDuty ? '#1a4f8a' : 'var(--text-muted)' }}>{t.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.barangay}</div>
                    </div>
                    {t.onDuty ? 
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px #dcfce7' }} title="On Duty" /> 
                      : <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1' }} title="Off Duty" />
                    }
                  </div>
                  {t.onDuty && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface-2)', padding: '4px 8px', borderRadius: 6, width: 'fit-content', fontWeight: 600 }}>
                      <Navigation size={12} color="#1a4f8a" /> Last seen: {new Date(t.lastSeen).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
