import "./App.css";
import { ModeToggle } from "./components/mode-toggle";
import { ThemeProvider } from "./components/theme-provider";

import { lazy, Suspense } from "react";
import LoadingBand from "./components/loading-band";
import LottieContainer from "./components/lottie-container";

import logo from "./assets/lotties/logo.json";

const DataTable = lazy(() => import("./components/ui/data-table/data-table"));

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="w-full container">
          <div className="flex justify-between items-center py-2">
            <LottieContainer animationData={logo} className="size-16" />
            <ModeToggle />
          </div>

          <Suspense fallback={<LoadingBand />}>
            <DataTable />
          </Suspense>
        </div>
      </ThemeProvider>
    </>
  );
}

export default App;
