import { columns } from "@/features/incidents/table/components/columns";
import { DataTable } from "@/features/incidents/table/components/data-table";
import { DataTableProvider } from "@/features/incidents/table/components/data-table-provider";
import { IncidentSheet } from "@/features/incidents/table/components/incident-sheet";
import { getIncidentsForTable } from "@bomberoscr/db/queries/incidentsTable";

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
