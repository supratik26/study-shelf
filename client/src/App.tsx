// Study Shelf interaction guard: keep all interface text unselectable; embedded PDF and file documents stay native to preserve reading tools.
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import GoluuChat from "@/components/GoluuChat";
import ReminderNotifier from "@/components/ReminderNotifier";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import { ThemeProvider } from "./contexts/ThemeContext";
import Library from "./pages/Library";
import MyNotes from "./pages/MyNotes";
import NoteDetail from "./pages/NoteDetail";
import StudySpace from "./pages/StudySpace";
import UploadNote from "./pages/UploadNote";
import { useEffect } from "react";

function allowsNativeTextSelection(target: EventTarget | null) {
  const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
  return Boolean(element?.closest("iframe"));
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Library} />
      <Route path={"/upload"} component={UploadNote} />
      <Route path={"/my-notes"} component={MyNotes} />
      <Route path={"/study-space"} component={StudySpace} />
      <Route path={"/notes/:noteId"}>{params => <NoteDetail noteId={params.noteId} />}</Route>
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
  useEffect(() => {
    const preventInterfaceSelection = (event: Event) => {
      if (!allowsNativeTextSelection(event.target)) event.preventDefault();
    };
    document.addEventListener("selectstart", preventInterfaceSelection);
    document.addEventListener("copy", preventInterfaceSelection);
    document.addEventListener("cut", preventInterfaceSelection);
    return () => {
      document.removeEventListener("selectstart", preventInterfaceSelection);
      document.removeEventListener("copy", preventInterfaceSelection);
      document.removeEventListener("cut", preventInterfaceSelection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="system"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <SiteHeader />
          <Router />
          <SiteFooter />
          <GoluuChat />
          <ReminderNotifier />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
