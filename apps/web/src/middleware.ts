import { getDetailedIncidentById } from "@bomberoscr/db/queries/incidents";
import { type NextRequest, NextResponse } from "next/server";
import { buildIncidentUrl, extractIncidentId } from "./features/shared/lib/utils";

const staticFileRegex = /\.(jpg|png|svg|ico|webp)$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/incidentes/")) {
    return NextResponse.next();
  }

  if (pathname.includes("/og") || pathname.match(staticFileRegex)) {
    return NextResponse.next();
  }

  const id = extractIncidentId(pathname);

  if (!id) {
    return NextResponse.next();
  }

  const incident = await getDetailedIncidentById(id);

  if (!incident) {
    return NextResponse.next();
  }

  const incidentType =
    incident.importantDetails ||
    incident.specificDispatchIncidentType?.name ||
    incident.dispatchIncidentType?.name ||
    "Incidente";

  const correctUrl = buildIncidentUrl(id, incidentType, incident.incidentTimestamp);

  if (pathname !== correctUrl) {
    const basePath = "/bomberos";
    const redirectUrl = new URL(`${basePath}${correctUrl}`, request.url);

    return NextResponse.redirect(redirectUrl, {
      status: 308
    });
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/incidentes/:path*"]
};
