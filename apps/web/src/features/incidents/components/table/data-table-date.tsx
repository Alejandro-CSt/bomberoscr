"use client";

import type React from "react";

interface DataTableDateProps {
  date: string | number | Date;
}

const DataTableDate: React.FC<DataTableDateProps> = ({ date }) => {
  const d = new Date(date);
  const day = d.toLocaleDateString("es-CR", { day: "2-digit" });
  const month = d.toLocaleDateString("es-CR", { month: "short" });
  const year = d.getFullYear();
  const time = d.toLocaleTimeString("es-CR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const currentYear = new Date().getFullYear();
  const showYear = year !== currentYear;

  return (
    <div className="text-muted-foreground text-sm" suppressHydrationWarning>
      {`${day} ${month}${showYear ? ", " : ""}${showYear ? year : ""} ${time}`}
    </div>
  );
};

export default DataTableDate;
