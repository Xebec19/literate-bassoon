import "./App.css";
import { ModeToggle } from "./components/mode-toggle";
import { ThemeProvider } from "./components/theme-provider";
import DataTable from "./components/ui/data-table/data-table";

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="flex justify-center items-center flex-col space-y-4 my-4 container">
          <div>
            <ModeToggle />
          </div>
          {/* <DataTable columns={columns} data={data} /> */}
          <DataTable />
        </div>
      </ThemeProvider>
    </>
  );
}

export default App;
