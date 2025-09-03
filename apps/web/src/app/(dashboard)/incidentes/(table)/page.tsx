import { columns } from "@/features/dashboard/incidents/table/components/columns";
import { DataTable } from "@/features/dashboard/incidents/table/components/data-table";
import { IncidentSheet } from "@/features/dashboard/incidents/table/components/data-table-incident-sheet";
import { DataTableProvider } from "@/features/dashboard/incidents/table/components/data-table-provider";
import { getIncidentsForTable } from "@bomberoscr/db/queries/incidentsTable";
import { unstable_cacheLife as cacheLife } from "next/cache";
import { headers } from "next/headers";

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
    <div className="flex h-full flex-col p-4">
      <DataTableProvider columns={columns} data={incidents}>
        <DataTable />
        <IncidentSheet />
      </DataTableProvider>
    </div>
  );
}
