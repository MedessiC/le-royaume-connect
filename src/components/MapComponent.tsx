import { useEffect, useRef } from "react";

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
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !((window as any).L)) return;

    const banikoaraLat = 10.27;
    const banikoaraLng = 1.88;
    const map = (window as any).L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView([banikoaraLat, banikoaraLng], 11);

    mapInstanceRef.current = map;

    (window as any).L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const markerIcon = (window as any).L.divIcon({
      className: "banikoara-marker",
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="background:#FFD700;color:#0F172A;font-weight:700;border-radius:999px;padding:8px 14px;box-shadow:0 14px 30px rgba(0,0,0,0.18);font-size:14px;letter-spacing:0.02em;white-space:nowrap;">
            Banikoara
          </div>
          <div style="width:18px;height:18px;background:#FFD700;border:4px solid #0F172A;border-radius:999px;margin-top:-6px;box-shadow:0 8px 18px rgba(0,0,0,0.2);"></div>
        </div>
      `,
      iconSize: [140, 50],
      iconAnchor: [70, 36],
    });

    const marker = (window as any).L.marker([banikoaraLat, banikoaraLng], {
      icon: markerIcon,
      interactive: false,
    }).addTo(map);

    (window as any).L.circle([banikoaraLat, banikoaraLng], {
      radius: 1200,
      color: "#FFD700",
      fillColor: "#FFD700",
      fillOpacity: 0.12,
      weight: 2,
    }).addTo(map);

    const popupHtml = `
      <div style="font-family: 'Inter', sans-serif; padding: 10px; text-align: center;">
        <h3 style="margin: 0 0 6px 0; font-weight: 700; font-size: 16px; color: #0F172A;">Sion</h3>
        <p style="margin: 0 0 3px 0; font-size: 13px; color: #0F172A;">Banikoara, Bénin</p>
        <p style="margin: 0; font-size: 11px; color: #334155;">Cœur spirituel du Règne Millénaire</p>
      </div>
    `;

    marker.bindPopup(popupHtml).openPopup();
  };

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-lg"
      style={{ minHeight: "420px" }}
    />
  );
};

export default MapComponent;

