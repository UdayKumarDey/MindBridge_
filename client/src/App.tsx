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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
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
