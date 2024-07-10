import "./App.css";
import { ModeToggle } from "./components/mode-toggle";
import { ThemeProvider } from "./components/theme-provider";
import { DataTable } from "./components/ui/data-table/data-table";
import { columns, Payment } from "./components/users/columns";

function getData(): Payment[] {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // ...
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
