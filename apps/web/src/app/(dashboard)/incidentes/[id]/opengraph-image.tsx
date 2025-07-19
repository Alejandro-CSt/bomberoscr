import db, { count, eq } from "@bomberoscr/db/index";
import { dispatchedStations, dispatchedVehicles, incidents } from "@bomberoscr/db/schema";
import { ImageResponse } from "@vercel/og";
import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

// Image metadata
export const alt = "Incidente de Bomberos Costa Rica";
export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

// Helper function to format date
function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "Fecha desconocida";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

// Truncate text with ellipsis if needed
function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

// Image generation
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const idSchema = z.coerce.number().int().positive();
  const idResult = idSchema.safeParse(id);

  if (!idResult.success) return new NextResponse("Invalid ID", { status: 404 });

  const incidentId = idResult.data;

  // Fetch incident data with related information
  const incident = await db.query.incidents.findFirst({
    where: eq(incidents.id, incidentId),
    columns: {
      id: true,
      EEConsecutive: true,
      incidentTimestamp: true,
      address: true,
      importantDetails: true,
      provinceId: true,
      cantonId: true,
      districtId: true
    },
    with: {
      canton: true,
      district: true,
      province: true,
      station: true,
      specificDispatchIncidentType: true
    }
  });

  if (!incident) return new NextResponse("Incident not found", { status: 404 });

  const stationsResult = await db
    .select({ count: count() })
    .from(dispatchedStations)
    .where(eq(dispatchedStations.incidentId, incidentId));

  const stationsCount = stationsResult[0]?.count || 0;

  const vehiclesResult = await db
    .select({ count: count() })
    .from(dispatchedVehicles)
    .where(eq(dispatchedVehicles.incidentId, incidentId));

  const vehiclesCount = vehiclesResult[0]?.count || 0;

  const fontDataRegular = await readFile(
    join(process.cwd(), "public", "assets", "JetBrainsMono-Regular.ttf")
  );

  const fontDataBold = await readFile(
    join(process.cwd(), "public", "assets", "JetBrainsMono-Bold.ttf")
  );

  const hasGeoData = incident.provinceId && incident.cantonId && incident.districtId;
  const locationDisplay = hasGeoData
    ? `${incident.district?.name || ""}, ${incident.canton?.name || ""}, ${incident.province?.name || ""}`
    : truncateText(incident.address, 65);

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
      }}
    >
      {/* Header with logo and ID */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid rgba(255, 255, 255, 0.3)",
          paddingBottom: "20px"
        }}
      >
        <div
          style={{
            fontSize: "36px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center"
          }}
        >
          <div
            style={{
              background: "white",
              color: "#c53030",
              padding: "4px 12px",
              borderRadius: "6px",
              marginRight: "12px",
              display: "flex"
            }}
          >
            EE-{incident.EEConsecutive}
          </div>
        </div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: 400,
            opacity: 0.9,
            display: "flex"
          }}
        >
          #{incident.id}
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center"
        }}
      >
        {/* Incident timestamp */}
        <div
          style={{
            fontSize: "28px",
            marginBottom: "10px",
            opacity: 0.9,
            display: "flex"
          }}
        >
          {formatDate(incident.incidentTimestamp?.toString())}
        </div>

        {/* Incident type */}
        <h2
          style={{
            fontSize: "56px",
            fontWeight: 700,
            display: "flex",
            textShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
        >
          {truncateText(
            incident.importantDetails.length === 0
              ? incident.specificDispatchIncidentType?.name
              : incident.importantDetails,
            50
          )}
        </h2>

        {/* Location - Address or District+Canton+Province */}
        <div
          style={{
            fontSize: "36px",
            opacity: 0.9,
            display: "flex",
            marginTop: "10px",
            maxWidth: "90%"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: "8px"
            }}
          >
            <span style={{ display: "flex" }}>{locationDisplay || "Sin ubicación"}</span>
          </div>
        </div>
      </div>

      {/* Footer with dispatch information */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "2px solid rgba(255, 255, 255, 0.3)",
          paddingTop: "20px",
          marginTop: "20px"
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "30px"
          }}
        >
          {/* Stations count */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: "8px"
            }}
          >
            <div
              style={{
                fontSize: "36px",
                fontWeight: 700,
                display: "flex"
              }}
            >
              {stationsCount}
            </div>
            <div
              style={{
                fontSize: "18px",
                opacity: 0.9,
                display: "flex"
              }}
            >
              {stationsCount === 1 ? "Estación" : "Estaciones"}
            </div>
          </div>

          {/* Vehicles count */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: "8px"
            }}
          >
            <div
              style={{
                fontSize: "36px",
                fontWeight: 700,
                display: "flex"
              }}
            >
              {vehiclesCount}
            </div>
            <div
              style={{
                fontSize: "18px",
                opacity: 0.9,
                display: "flex"
              }}
            >
              {vehiclesCount === 1 ? "Vehículo" : "Vehículos"}
            </div>
          </div>
        </div>

        {/* Responsible station if available */}
        {incident.station && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: "8px",
              fontSize: "20px"
            }}
          >
            <span style={{ display: "flex" }}>Estación responsable: {incident.station.name}</span>
          </div>
        )}
      </div>
    </div>,
    // ImageResponse options
    {
      ...size,
      fonts: [
        {
          name: "JetBrains Mono",
          data: fontDataRegular.buffer,
          style: "normal",
          weight: 400
        },
        {
          name: "JetBrains Mono",
          data: fontDataBold.buffer,
          style: "normal",
          weight: 700
        }
      ]
    }
  );
}
