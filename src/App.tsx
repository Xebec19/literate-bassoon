import { z } from "zod";
import "./App.css";
import { ModeToggle } from "./components/mode-toggle";
import { ThemeProvider } from "./components/theme-provider";
import { DataTable } from "./components/ui/data-table/data-table";
import { columns, ZodUser } from "./components/users/columns";

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
          <DataTable columns={columns} data={data} />
        </div>
      </ThemeProvider>
    </>
  );
}

export default App;
