import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/features/shared/components/ui/tabs";

export default function Component() {
  return (
    <Tabs defaultValue="tab-1" className="items-center">
      <TabsList className="h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1 text-foreground">
        <TabsTrigger
          value="tab-1"
          className="after:-mb-1 relative after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:hover:bg-accent data-[state=active]:after:bg-primary"
        >
          Tab 1
        </TabsTrigger>
        <TabsTrigger
          value="tab-2"
          className="after:-mb-1 relative after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:hover:bg-accent data-[state=active]:after:bg-primary"
        >
          Tab 2
        </TabsTrigger>
        <TabsTrigger
          value="tab-3"
          className="after:-mb-1 relative after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:hover:bg-accent data-[state=active]:after:bg-primary"
        >
          Tab 3
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab-1">
        <p className="p-4 text-center text-muted-foreground text-xs">Content for Tab 1</p>
      </TabsContent>
      <TabsContent value="tab-2">
        <p className="p-4 text-center text-muted-foreground text-xs">Content for Tab 2</p>
      </TabsContent>
      <TabsContent value="tab-3">
        <p className="p-4 text-center text-muted-foreground text-xs">Content for Tab 3</p>
      </TabsContent>
    </Tabs>
  );
}
