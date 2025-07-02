import { FeaturedIncidents } from "@/features/homepage/components/featured-incidents";

export default async function Page() {
  return (
    <div className="flex flex-col p-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FeaturedIncidents />
        <FeaturedIncidents />
        <FeaturedIncidents />
        <FeaturedIncidents />
      </div>
    </div>
  );
}
