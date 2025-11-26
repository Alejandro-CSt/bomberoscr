import { columns } from "@/features/dashboard/incidents/table/components/columns";
import { DataTable } from "@/features/dashboard/incidents/table/components/data-table";
import { IncidentSheet } from "@/features/dashboard/incidents/table/components/data-table-incident-sheet";
import { DataTableProvider } from "@/features/dashboard/incidents/table/components/data-table-provider";
import env from "@/features/lib/env";
import { getIncidentsForTable } from "@bomberoscr/db/queries/incidentsTable";
import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { headers } from "next/headers";

const incidentsTableDescription =
  "Lista filtrable de incidentes despachados con detalles de localización, estaciones y tiempos de respuesta.";

export const metadata: Metadata = {
  title: "Incidentes registrados",
  description: incidentsTableDescription,
  alternates: {
    canonical: env.SITE_URL ? new URL("/incidentes", env.SITE_URL).toString() : undefined
  },
  openGraph: {
    title: "Incidentes registrados",
    description: incidentsTableDescription,
    url: env.SITE_URL ? new URL("/incidentes", env.SITE_URL).toString() : undefined,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Incidentes registrados",
    description: incidentsTableDescription
  }
};

async function getIncidents() {
  "use cache";
  cacheLife({ revalidate: 60 * 10 });
  return await getIncidentsForTable({ limit: 50 });
}

export default async function Page() {
  await headers();
  // const { pageIndex, pageSize, query, sortBy, sortDirection } =
  //   await tableSearchParamsCache.parse(searchParams);

  // const { incidents, totalCount } = await getIncidentsForTable({
  //   pageIndex,
  //   pageSize,
  //   query,
  //   sortBy,
  //   sortDirection
  // });

  const incidents = await getIncidents();

  return (
    <div className="flex h-full flex-col overflow-x-hidden">
      <DataTableProvider columns={columns} data={incidents}>
        <DataTable />
        <IncidentSheet />
      </DataTableProvider>
    </div>
  );
}
