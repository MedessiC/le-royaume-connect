import { useEffect, useRef } from "react";

const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Load Leaflet CSS and JS dynamically
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

    // Banikoara coordinates (Benin)
    const banikoareLat = 10.27;
    const banikoareLng = 1.88;

    // Create map
    const map = (window as any).L.map(mapRef.current).setView(
      [banikoareLat, banikoareLng],
      12
    );

    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    (window as any).L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }
    ).addTo(map);

    // Custom icon for marker
    const goldIcon = (window as any).L.icon({
      iconUrl:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICAKICAGPHBHDGGGZMLSBD0iIzE5MTk3MCIgZD0iTTMyIDE2YzAgOC44MjctNy4xNzMgMTYtMTYgMTZTMCAyNC44MjcgMCAxNiA3LjE3MyAwIDE2IDAgMzIgNy4xNzMgMzIgMTZ6Ii8+CiAgCiAgPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTAiIGZpbGw9IiNmZmQ3MDAiLz4KICAKPC9zdmc+",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    // Add marker
    const marker = (window as any).L.marker(
      [banikoareLat, banikoareLng],
      { icon: goldIcon }
    ).addTo(map);

    // Popup content
    const popupHtml = `
      <div style="font-family: 'Inter', sans-serif; padding: 8px; text-align: center;">
        <h3 style="margin: 0 0 6px 0; font-weight: 600; font-size: 16px; color: #191970;">Sion</h3>
        <p style="margin: 0 0 3px 0; font-size: 13px; color: #191970;">Banikoara, Bénin</p>
        <p style="margin: 0; font-size: 11px; color: #666;">Cœur de MILLENIUM</p>
      </div>
    `;

    marker.bindPopup(popupHtml);
    marker.openPopup();

    // Add animated arrow from top-left to marker
    const arrowStart = (window as any).L.latLng(
      banikoareLat + 0.4,
      banikoareLng - 0.3
    );
    const arrowEnd = (window as any).L.latLng(banikoareLat, banikoareLng);

    const arrow = (window as any).L.polyline([arrowStart, arrowEnd], {
      color: "#191970",
      weight: 2,
      opacity: 0.7,
      dashArray: "5, 5",
    }).addTo(map);

    // Add arrowhead
    const arrowHeadIcon = (window as any).L.icon({
      iconUrl:
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij4KICAKICAGPHBVBHLNB24gZmlsbD0iIzE5MTk3MCIgcG9pbnRzPSIxMiwyIDE4LDIyIDEyLDE2IDYsMjIiIHN0cm9rZT0iIzE5MTk3MCIgc3Ryb2tlLXdpZHRoPSIxIi8+CiAgCjwvc3ZnPg==",
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });

    (window as any).L.marker(arrowStart, { icon: arrowHeadIcon }).addTo(map);
  };

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-lg"
      style={{ minHeight: "400px" }}
    />
  );
};

export default MapComponent;

