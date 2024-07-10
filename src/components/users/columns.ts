import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { z } from "zod";

// id, name, email, age, registrationDate.
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export const ZodUser = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  age: z.number(),
  registrationDate: z.date(),
});

export const columns: ColumnDef<z.infer<typeof ZodUser>>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "age",
    header: "Age",
  },
  {
    accessorKey: "registrationDate",
    header: "Registration Date",
    cell: ({ row }) => format(row.getValue("registrationDate"), "MM/dd/yyyy"),
  },
];
