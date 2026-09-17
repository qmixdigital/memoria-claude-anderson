"use client"
// src/components/empresa/MapaEmpresas.tsx
// Mapa Leaflet com pins clusterizados (ou simples quando poucos).
// Usado em /empresas/cidades/[uf]/[cidade]/ e em /empresas/?vista=mapa
import { useEffect, useRef } from "react"

type Pin = {
  id: string
  slug: string
  nome: string
  lat: number
  lng: number
  verificada?: boolean
}

type Props = {
  pins: Pin[]
  centerLat?: number
  centerLng?: number
  zoom?: number
  height?: string
}

export function MapaEmpresas({ pins, centerLat, centerLng, zoom = 11, height = "500px" }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)

  useEffect(() => {
    let mounted = true
    let started = false
    if (!ref.current) return
    const el = ref.current

    const init = async () => {
      if (started || !mounted || !ref.current) return
      started = true
      const L = (await import("leaflet")).default
      // CSS do Leaflet
      if (!document.querySelector('link[data-leaflet]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        link.crossOrigin = ""
        link.setAttribute("data-leaflet", "1")
        document.head.appendChild(link)
      }

      if (!mounted || !ref.current) return

      // Centro: média dos pins, ou Brasil
      let cLat = centerLat
      let cLng = centerLng
      if (cLat === undefined || cLng === undefined) {
        if (pins.length > 0) {
          cLat = pins.reduce((s, p) => s + p.lat, 0) / pins.length
          cLng = pins.reduce((s, p) => s + p.lng, 0) / pins.length
        } else {
          cLat = -14.235
          cLng = -51.925
        }
      }

      const map = L.map(ref.current, { scrollWheelZoom: false }).setView([cLat, cLng], zoom)
      mapRef.current = map

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      // Ícone customizado verde
      const verdeIcon = L.divIcon({
        className: "leaflet-pin-verde",
        html: '<div style="background:#087540;width:24px;height:24px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -22],
      })
      const azulIcon = L.divIcon({
        className: "leaflet-pin-azul",
        html: '<div style="background:#3B82F6;width:20px;height:20px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 20],
        popupAnchor: [0, -18],
      })

      const layer = L.featureGroup()
      pins.forEach(p => {
        const m = L.marker([p.lat, p.lng], { icon: p.verificada ? verdeIcon : azulIcon })
        m.bindPopup(`
          <div style="font-family: -apple-system, sans-serif; font-size:13px; max-width:240px">
            <strong style="font-size:14px">${escapeHtml(p.nome)}</strong>
            ${p.verificada ? '<div style="color:#0B6FB8;font-size:11px;font-weight:bold;margin-top:2px">✓ Verificada</div>' : ''}
            <div style="margin-top:6px"><a href="/empresas/${p.slug}/" style="color:#0B6FB8;font-weight:bold;text-decoration:none">Ver perfil →</a></div>
          </div>
        `)
        layer.addLayer(m)
      })
      layer.addTo(map)

      // Auto-fit se tem mais de 1 pin
      if (pins.length > 1) {
        try { map.fitBounds(layer.getBounds(), { padding: [40, 40], maxZoom: 14 }) } catch { /* ok */ }
      }
    }

    // Carrega o Leaflet (~140KB) + tiles só quando o mapa entra no viewport (CWV).
    let io: IntersectionObserver | null = null
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) { io?.disconnect(); init() }
      }, { rootMargin: "300px" })
      io.observe(el)
    } else {
      init()
    }

    return () => {
      mounted = false
      io?.disconnect()
      if (mapRef.current) {
        // @ts-expect-error - leaflet remove
        mapRef.current.remove?.()
        mapRef.current = null
      }
    }
  }, [pins, centerLat, centerLng, zoom])

  return (
    <div
      ref={ref}
      role="application"
      aria-label="Mapa de empresas"
      className="w-full border border-border rounded-sm bg-surface"
      style={{ height, zIndex: 0 }}
    />
  )
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}
