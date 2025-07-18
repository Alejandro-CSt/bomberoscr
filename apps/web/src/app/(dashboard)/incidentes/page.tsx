import { columns } from "@/features/incidents/components/table/columns";
import { DataTable } from "@/features/incidents/components/table/data-table";
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
    <div className="px-4 py-2">
      <DataTable columns={columns} data={incidents} />
    </div>
  );
}
