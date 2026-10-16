import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_ACCESS_TOKEN } from '../../lib/firebase';
import type { Rider, Ride, SOSAlert, AvailabilityZone } from '../../types';
import { getVehicleDetails } from '../../lib/utils';

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const UNIFIED_ZONE_COLOR = '#7F00FD'; // Unified Lady Pilot Purple theme

interface LiveFleetMapProps {
  riders?: Record<string, Rider>;
  rides?: Record<string, Ride>;
  sosAlerts?: Record<string, SOSAlert>;
  zones?: Record<string, AvailabilityZone>;
  selectedRiderId?: string | null;
  onSelectRider?: (rider: Rider) => void;
  markingMode?: 'none' | 'circle' | 'polygon';
  polygonPoints?: Array<{ latitude: number; longitude: number }>;
  onMapClick?: (coords: { latitude: number; longitude: number }) => void;
  height?: string;
  zoom?: number;
  center?: [number, number]; // [lng, lat]
}

// Generate GeoJSON polygon circle coordinates from center point and radius
function getCircleCoords(centerLng: number, centerLat: number, radiusInKm: number, points = 64): [number, number][] {
  const ret: [number, number][] = [];
  const distanceX = radiusInKm / (111.32 * Math.cos((centerLat * Math.PI) / 180));
  const distanceY = radiusInKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    ret.push([centerLng + x, centerLat + y]);
  }
  ret.push(ret[0]); // Close polygon
  return ret;
}

export const LiveFleetMap: React.FC<LiveFleetMapProps> = ({
  riders = {},
  rides = {},
  sosAlerts = {},
  zones = {},
  selectedRiderId,
  onSelectRider,
  markingMode = 'none',
  polygonPoints = [],
  onMapClick,
  height = '500px',
  zoom = 12,
  center = [77.5946, 12.9716], // Default Bengaluru [lng, lat]
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const polygonMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Mutable ref so map click listener ALWAYS calls the latest callback function without stale closure
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  const markingModeRef = useRef(markingMode);
  markingModeRef.current = markingMode;

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: center,
      zoom: zoom,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', () => {
      setMapLoaded(true);
    });

    // Map click handler using mutable ref to avoid stale closures
    map.on('click', (e) => {
      if (onMapClickRef.current) {
        onMapClickRef.current({
          latitude: e.lngLat.lat,
          longitude: e.lngLat.lng,
        });
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Cursor when in zone marking mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (markingMode !== 'none') {
      map.getCanvas().style.cursor = 'crosshair';
    } else {
      map.getCanvas().style.cursor = '';
    }
  }, [markingMode]);

  // Handle Container Resize Observer
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Render Multi-Dot Polygon in-progress markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clear previous vertex markers
    polygonMarkersRef.current.forEach((m) => m.remove());
    polygonMarkersRef.current = [];

    if (markingMode === 'polygon' && polygonPoints.length > 0) {
      polygonPoints.forEach((pt, index) => {
        const el = document.createElement('div');
        el.className = 'w-7 h-7 rounded-full bg-purple-600 border-2 border-white text-white font-black text-xs flex items-center justify-center shadow-2xl transform -translate-x-1/2 -translate-y-1/2 pointer-events-none ring-2 ring-purple-500/40 animate-pulse select-none';
        el.innerText = `${index + 1}`;

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([pt.longitude, pt.latitude])
          .addTo(map);

        polygonMarkersRef.current.push(marker);
      });
    }
  }, [polygonPoints, markingMode, mapLoaded]);

  // Unified Blended Availability Zones Layer Rendering
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const activeZoneFeatures: any[] = [];
    const zoneList = Object.values(zones).filter((z) => z.isActive);

    zoneList.forEach((zone) => {
      if (zone.type === 'circle' && zone.center) {
        const circleCoords = getCircleCoords(
          zone.center.longitude,
          zone.center.latitude,
          zone.radiusKm || 2.5
        );
        activeZoneFeatures.push({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [circleCoords],
          },
          properties: {
            id: zone.id,
            name: zone.name,
            surge: zone.surgeMultiplier,
          },
        });
      } else if (zone.type === 'polygon' && zone.points && zone.points.length >= 3) {
        const coords = zone.points.map((p) => [p.longitude, p.latitude] as [number, number]);
        coords.push(coords[0]); // Close polygon
        activeZoneFeatures.push({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [coords],
          },
          properties: {
            id: zone.id,
            name: zone.name,
            surge: zone.surgeMultiplier,
          },
        });
      }
    });

    // In-progress polygon preview if >= 3 points
    if (markingMode === 'polygon' && polygonPoints.length >= 3) {
      const previewCoords = polygonPoints.map((p) => [p.longitude, p.latitude] as [number, number]);
      previewCoords.push(previewCoords[0]);
      activeZoneFeatures.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [previewCoords],
        },
        properties: {
          id: 'preview_polygon',
          name: 'Drawing Zone Preview',
          surge: 1.0,
        },
      });
    }

    const unifiedGeoJSON = {
      type: 'FeatureCollection',
      features: activeZoneFeatures,
    };

    const sourceId = 'unified_zones_source';
    const fillLayerId = 'unified_zones_fill';
    const lineLayerId = 'unified_zones_outline';

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(unifiedGeoJSON as any);
    } else {
      map.addSource(sourceId, {
        type: 'geojson',
        data: unifiedGeoJSON as any,
      });

      map.addLayer({
        id: fillLayerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': UNIFIED_ZONE_COLOR,
          'fill-opacity': 0.18,
          'fill-antialias': true,
        },
      });

      map.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#C2185B',
          'line-width': 2,
          'line-opacity': 0.85,
        },
      });
    }

    // In-progress polygon connecting line layer (for 2+ points)
    const drawLineSourceId = 'draw_line_source';
    const drawLineLayerId = 'draw_line_layer';

    if (markingMode === 'polygon' && polygonPoints.length >= 2) {
      const lineGeoJSON = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: polygonPoints.map((p) => [p.longitude, p.latitude]),
        },
      };

      if (map.getSource(drawLineSourceId)) {
        (map.getSource(drawLineSourceId) as mapboxgl.GeoJSONSource).setData(lineGeoJSON as any);
      } else {
        map.addSource(drawLineSourceId, {
          type: 'geojson',
          data: lineGeoJSON as any,
        });
        map.addLayer({
          id: drawLineLayerId,
          type: 'line',
          source: drawLineSourceId,
          paint: {
            'line-color': '#E91E63',
            'line-width': 3,
            'line-dasharray': [2, 2],
          },
        });
      }
    } else {
      if (map.getLayer(drawLineLayerId)) map.removeLayer(drawLineLayerId);
      if (map.getSource(drawLineSourceId)) map.removeSource(drawLineSourceId);
    }
  }, [zones, polygonPoints, markingMode, mapLoaded]);

  // Update Riders Markers & SOS Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const currentMarkers = markersRef.current;
    const activeMarkerKeys = new Set<string>();

    // 1. Render Online Riders
    Object.values(riders).forEach((rider) => {
      const loc = rider.currentLocation;
      if (!loc || !loc.latitude || !loc.longitude) return;

      const markerKey = `rider_${rider.id || rider.uid}`;
      activeMarkerKeys.add(markerKey);

      const vehicleInfo = getVehicleDetails(rider.vehicleType);

      if (currentMarkers[markerKey]) {
        currentMarkers[markerKey].setLngLat([loc.longitude, loc.latitude]);
      } else {
        const el = document.createElement('div');
        el.className = 'group cursor-pointer transform -translate-x-1/2 -translate-y-1/2';
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            ${
              rider.isOnline
                ? `<div class="absolute w-8 h-8 rounded-full opacity-30 animate-ping" style="background-color: ${vehicleInfo.color}"></div>`
                : ''
            }
            <div class="w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold transition-transform group-hover:scale-125" style="background-color: ${vehicleInfo.color}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="12 8 8 16 16 16"></polygon>
              </svg>
            </div>
            <div class="absolute -bottom-5 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-semibold px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              ${rider.name}
            </div>
          </div>
        `;

        el.addEventListener('click', (evt) => {
          evt.stopPropagation();
          if (onSelectRider) onSelectRider(rider);
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([loc.longitude, loc.latitude])
          .addTo(map);

        currentMarkers[markerKey] = marker;
      }
    });

    // 2. Render Active SOS Alerts (Pulsing Red)
    Object.values(sosAlerts).forEach((alert) => {
      if (alert.status !== 'active' || !alert.location?.latitude || !alert.location?.longitude) return;

      const markerKey = `sos_${alert.id}`;
      activeMarkerKeys.add(markerKey);

      if (currentMarkers[markerKey]) {
        currentMarkers[markerKey].setLngLat([alert.location.longitude, alert.location.latitude]);
      } else {
        const el = document.createElement('div');
        el.className = 'cursor-pointer transform -translate-x-1/2 -translate-y-1/2';
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="w-10 h-10 rounded-full bg-rose-600 opacity-40 animate-ping absolute"></div>
            <div class="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
          </div>
        `;

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2 text-slate-800">
            <div class="font-bold text-rose-600 flex items-center gap-1">
              🚨 ACTIVE SOS ALERT
            </div>
            <div class="text-xs mt-1 font-semibold">${alert.userName || 'Passenger'}</div>
            <div class="text-[11px] text-slate-500">${alert.userPhone || ''}</div>
          </div>
        `);

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([alert.location.longitude, alert.location.latitude])
          .setPopup(popup)
          .addTo(map);

        currentMarkers[markerKey] = marker;
      }
    });

    // Cleanup markers that are no longer active
    Object.keys(currentMarkers).forEach((key) => {
      if (!activeMarkerKeys.has(key)) {
        currentMarkers[key].remove();
        delete currentMarkers[key];
      }
    });
  }, [riders, sosAlerts, mapLoaded, selectedRiderId]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Dynamic Marking Mode Guidance Banner */}
      {markingMode === 'circle' && (
        <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 z-20 animate-bounce">
          <span>📍 Click anywhere on the map to place the Circular Zone center pin</span>
        </div>
      )}

      {markingMode === 'polygon' && (
        <div className="absolute top-4 left-4 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-3 z-20">
          <span className="flex items-center gap-1.5 text-purple-300">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
            Multi-Dot Polygon Mode:
          </span>
          <span>Click on the map to place boundary vertices ({polygonPoints.length} points placed)</span>
        </div>
      )}

      {/* Live Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-md border border-purple-100/80 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-700 pointer-events-none z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span>Bike</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
          <span>Scooter</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-golden" />
          <span>Auto</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Cab</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2.5">
          <span className="w-3 h-3 rounded-full bg-purple-500/20 border border-primary" />
          <span>Unified Service Area (Blended)</span>
        </div>
      </div>
    </div>
  );
};
