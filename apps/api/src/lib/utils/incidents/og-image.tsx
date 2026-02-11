import { ImageResponse } from "hono-og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { IncidentStatistics } from "@/lib/utils/incidents/statistics";
import type { DetailedIncident } from "@bomberoscr/db/queries/incidents";

const size = { width: 1200, height: 630 } as const;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export async function generateOgImage(
  incident: NonNullable<DetailedIncident>,
  _statistics: IncidentStatistics
): Promise<Response> {
  const fontDataRegular = await readFile(
    join(process.cwd(), "public", "assets", "JetBrainsMono-Regular.ttf")
  );
  const fontDataBold = await readFile(
    join(process.cwd(), "public", "assets", "JetBrainsMono-Bold.ttf")
  );
  const fontDataRegularBuffer = fontDataRegular.buffer as ArrayBuffer;
  const fontDataBoldBuffer = fontDataBold.buffer as ArrayBuffer;

  const stationsCount = incident.dispatchedStations?.length || 0;
  const vehiclesCount = incident.dispatchedVehicles?.length || 0;

  const hasGeoData = incident.province && incident.canton && incident.district;
  const locationDisplay = hasGeoData
    ? `${incident.district?.name || ""}, ${incident.canton?.name || ""}, ${incident.province?.name || ""}`
    : truncateText(incident.address, 65);

  const incidentTitle =
    incident.importantDetails && incident.importantDetails.length > 0
      ? incident.importantDetails
      : incident.specificIncidentType?.name || incident.incidentType?.name || "Incidente";

  const responsibleStation = incident.dispatchedStations?.[0]?.station?.name;

  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #e53e3e, #9b2c2c)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "40px",
        color: "white",
        fontFamily: "JetBrains Mono"
      }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid rgba(255, 255, 255, 0.3)",
          paddingBottom: "20px"
        }}>
        <div
          style={{
            fontSize: "36px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center"
          }}>
          <div
            style={{
              background: "white",
              color: "#c53030",
              padding: "4px 12px",
              borderRadius: "6px",
              marginRight: "12px",
              display: "flex"
            }}>
            EE-{incident.EEConsecutive}
          </div>
        </div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: 400,
            opacity: 0.9,
            display: "flex"
          }}>
          #{incident.id}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}>
        <div
          style={{
            fontSize: "28px",
            marginBottom: "10px",
            opacity: 0.9,
            display: "flex"
          }}>
          {formatDate(incident.incidentTimestamp)}
        </div>

        <h2
          style={{
            fontSize: "56px",
            fontWeight: 700,
            display: "flex",
            textShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}>
          {truncateText(incidentTitle, 50)}
        </h2>

        <div
          style={{
            fontSize: "36px",
            opacity: 0.9,
            display: "flex",
            marginTop: "10px",
            maxWidth: "90%"
          }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: "8px"
            }}>
            <span style={{ display: "flex" }}>{locationDisplay || "Sin ubicación"}</span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "2px solid rgba(255, 255, 255, 0.3)",
          paddingTop: "20px",
          marginTop: "20px"
        }}>
        <div style={{ display: "flex", gap: "30px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: "8px"
            }}>
            <div style={{ fontSize: "36px", fontWeight: 700, display: "flex" }}>
              {stationsCount}
            </div>
            <div style={{ fontSize: "18px", opacity: 0.9, display: "flex" }}>
              {stationsCount === 1 ? "Estación" : "Estaciones"}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: "8px"
            }}>
            <div style={{ fontSize: "36px", fontWeight: 700, display: "flex" }}>
              {vehiclesCount}
            </div>
            <div style={{ fontSize: "18px", opacity: 0.9, display: "flex" }}>
              {vehiclesCount === 1 ? "Vehículo" : "Vehículos"}
            </div>
          </div>
        </div>

        {responsibleStation && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: "8px",
              fontSize: "20px"
            }}>
            <span style={{ display: "flex" }}>Estación responsable: {responsibleStation}</span>
          </div>
        )}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "JetBrains Mono", data: fontDataRegularBuffer, style: "normal", weight: 400 },
        { name: "JetBrains Mono", data: fontDataBoldBuffer, style: "normal", weight: 700 }
      ]
    }
  );
}
