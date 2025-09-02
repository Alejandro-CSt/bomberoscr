import { columns } from "@/features/dashboard/incidents/table/components/columns";
import { DataTable } from "@/features/dashboard/incidents/table/components/data-table";
import { IncidentSheet } from "@/features/dashboard/incidents/table/components/data-table-incident-sheet";
import { DataTableProvider } from "@/features/dashboard/incidents/table/components/data-table-provider";
import { getIncidentsForTable } from "@bomberoscr/db/queries/incidentsTable";

export const dynamic = "force-dynamic";

export default async function Page() {
  // const { pageIndex, pageSize, query, sortBy, sortDirection } =
  //   await tableSearchParamsCache.parse(searchParams);

  // const { incidents, totalCount } = await getIncidentsForTable({
  //   pageIndex,
  //   pageSize,
  //   query,
  //   sortBy,
  //   sortDirection
  // });

  const incidents = await getIncidentsForTable({ limit: 50 });

  return (
    <div className="flex h-full flex-col p-4">
      <DataTableProvider columns={columns} data={incidents}>
        <DataTable />
        <IncidentSheet />
      </DataTableProvider>
    </div>
  );
}
