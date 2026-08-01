import { useEffect, useRef } from "react";

const BANIKOARA_LAT = 11.3;
const BANIKOARA_LNG = 2.44;

const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.async = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else if ((window as any).L) {
      initializeMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !((window as any).L)) return;
    if (mapInstanceRef.current) return; // prevent double-init

    const L = (window as any).L;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
    }).setView([BANIKOARA_LAT, BANIKOARA_LNG], 12);

    mapInstanceRef.current = map;

    // Tile layer — OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Pulsating glow circle (large halo)
    L.circle([BANIKOARA_LAT, BANIKOARA_LNG], {
      radius: 2500,
      color: "#FFD700",
      fillColor: "#FFD700",
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: "6 4",
    }).addTo(map);

    // Inner filled circle
    L.circle([BANIKOARA_LAT, BANIKOARA_LNG], {
      radius: 800,
      color: "#FFD700",
      fillColor: "#FFD700",
      fillOpacity: 0.22,
      weight: 2,
    }).addTo(map);

    // Custom marker icon
    const markerIcon = L.divIcon({
      className: "",
      html: `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          filter: drop-shadow(0 4px 14px rgba(0,0,0,0.35));
        ">
          <div style="
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #0F172A;
            font-weight: 800;
            border-radius: 12px;
            padding: 6px 14px;
            font-size: 13px;
            letter-spacing: 0.03em;
            white-space: nowrap;
            border: 2px solid rgba(255,255,255,0.5);
            box-shadow: 0 6px 20px rgba(0,0,0,0.25);
            line-height: 1.4;
            text-align: center;
          ">
            📍 Banikoara
            <div style="font-size:9px;font-weight:600;color:#1e293b;margin-top:1px;letter-spacing:0.05em;">SION · BÉNIN</div>
          </div>
          <div style="
            width: 3px;
            height: 14px;
            background: #FFD700;
          "></div>
          <div style="
            width: 14px;
            height: 14px;
            background: #FFD700;
            border: 3px solid #0F172A;
            border-radius: 50%;
            box-shadow: 0 0 0 3px rgba(255,215,0,0.4);
          "></div>
        </div>
      `,
      iconSize: [150, 70],
      iconAnchor: [75, 70],
      popupAnchor: [0, -72],
    });

    const marker = L.marker([BANIKOARA_LAT, BANIKOARA_LNG], {
      icon: markerIcon,
    }).addTo(map);

    // Popup with rich content
    const popupHtml = `
      <div style="font-family:'Inter',sans-serif;padding:10px 12px;min-width:180px;text-align:center;border-radius:10px;">
        <div style="font-size:20px;margin-bottom:4px;">👑</div>
        <h3 style="margin:0 0 3px;font-weight:800;font-size:15px;color:#0F172A;">Sion — Banikoara</h3>
        <p style="margin:0 0 5px;font-size:12px;color:#475569;">Bénin · Département de l'Alibori</p>
        <div style="background:#FEF9E7;border:1px solid #FFD700;border-radius:8px;padding:5px 8px;margin-top:6px;">
          <p style="margin:0;font-size:11px;font-weight:700;color:#92400E;">Siège mondial du Règne Millénaire</p>
          <p style="margin:2px 0 0;font-size:10px;color:#78350F;">11.3° N, 2.44° E</p>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml, {
      maxWidth: 220,
      className: "banikoara-popup",
    }).openPopup();
  };

  return (
    <div
      ref={mapRef}
      className="w-full h-full"
      style={{ minHeight: "320px" }}
    />
  );
};

export default MapComponent;
