import { z } from "zod";
import "./App.css";
import { ModeToggle } from "./components/mode-toggle";
import { ThemeProvider } from "./components/theme-provider";
import { ZodUser } from "./components/users/columns";
import DndTable from "./components/ui/data-table/dnd-table";

function getData(): z.infer<typeof ZodUser>[] {
  // Fetch data from your API here.
  return [
    {
      id: 1 + "",
      name: "Rohan",
      email: "rohan@gmail.com",
      age: 13,
      registrationDate: new Date(),
    },
  ];
}

function App() {
  const data = getData();

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="flex justify-center items-center flex-col space-y-4 my-4">
          <div>
            <ModeToggle />
          </div>
          {/* <DataTable columns={columns} data={data} /> */}
          <DndTable />
        </div>
      </ThemeProvider>
    </>
  );
}

export default App;
