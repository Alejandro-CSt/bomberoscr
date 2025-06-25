import { FeaturedIncidents } from "@/features/homepage/components/featured-incidents";

export default async function Page() {
  return (
    <div className="flex flex-col p-4">
      <FeaturedIncidents />
    </div>
  );
}
