import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import MindBridgeShell from "./components/MindBridgeShell";
import { ThemeProvider } from "./contexts/ThemeContext";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Onboarding from "./pages/Onboarding";
import ProfessionalConnect from "./pages/ProfessionalConnect";
import Support from "./pages/Support";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"}><MindBridgeShell><Dashboard /></MindBridgeShell></Route>
      <Route path={"/onboarding"}><MindBridgeShell><Onboarding /></MindBridgeShell></Route>
      <Route path={"/chat"}><MindBridgeShell><Chat /></MindBridgeShell></Route>
      <Route path={"/library"}><MindBridgeShell><Library /></MindBridgeShell></Route>
      <Route path={"/connect"}><MindBridgeShell><ProfessionalConnect /></MindBridgeShell></Route>
      <Route path={"/support"}><MindBridgeShell><Support /></MindBridgeShell></Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
