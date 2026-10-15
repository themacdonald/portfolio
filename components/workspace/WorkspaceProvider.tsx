"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  AgenticPortfolioPayload,
  LanguageKey,
  LocalizationNode,
  NotebookCell,
} from "@/types/portfolio-contract";
import { LANGUAGE_HTML_TAGS } from "@/types/portfolio-contract";

export type ThemeArchetype = "dark" | "light";

/** Recruiter mode hides the engineering surfaces; technical mode shows everything. */
export type ViewMode = "recruiter" | "technical";

export interface CellExecutionState {
  status: "idle" | "queued" | "running" | "done";
  startedAt?: number;
  finishedAt?: number;
  elapsedMs?: number;
}

interface WorkspaceContextValue {
  payload: AgenticPortfolioPayload;
  langKey: string;
  setLangKey: (langKey: string) => void;
  node: LocalizationNode;
  theme: ThemeArchetype;
  setTheme: (theme: ThemeArchetype) => void;
  toggleTheme: () => void;
  kernelBusy: boolean;
  executions: Record<number, CellExecutionState>;
  runCell: (cell: NotebookCell) => void;
  runAllCells: () => void;
  resetCells: () => void;
  activeProject: string | null;
  setActiveProject: (slug: string | null) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
  navOpen: boolean;
  setNavOpen: (value: boolean) => void;
  helpOpen: boolean;
  setHelpOpen: (value: boolean) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const LOCALE_STORAGE_KEY = "portfolio.langKey";
const THEME_STORAGE_KEY = "portfolio.theme";
const VIEW_MODE_STORAGE_KEY = "portfolio.viewMode";
const REDUCE_MOTION_STORAGE_KEY = "portfolio.reduceMotion";

/**
 * Read persisted client preferences once. The server render falls back to the
 * compiled defaults so markup is deterministic; the layout bootstrap script
 * paints the stored archetype before hydration to avoid a flash.
 */
function readBootstrapState(availableLanguages: string[], fallbackTheme: ThemeArchetype) {
  const fallback = {
    langKey: availableLanguages[0] ?? "en",
    theme: fallbackTheme,
    viewMode: "technical" as ViewMode,
    reduceMotion: false,
  };
  if (typeof window === "undefined") {
    return fallback;
  }

  const state = { ...fallback };

  try {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (storedLocale && availableLanguages.includes(storedLocale)) {
      state.langKey = storedLocale;
    }
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "dark" || storedTheme === "light") {
      state.theme = storedTheme;
    }
    const storedView = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (storedView === "recruiter" || storedView === "technical") {
      state.viewMode = storedView;
    }
    state.reduceMotion = window.localStorage.getItem(REDUCE_MOTION_STORAGE_KEY) === "true";
  } catch {
    // storage can be unavailable in private or sandboxed contexts
  }

  return state;
}

interface WorkspaceProviderProps {
  payload: AgenticPortfolioPayload;
  initialLangKey: string;
  initialTheme: ThemeArchetype;
  children: ReactNode;
}

export function WorkspaceProvider({
  payload,
  initialLangKey,
  initialTheme,
  children,
}: WorkspaceProviderProps) {
  const available = payload.metadata.availableLanguages;
  const [initialState] = useState(() => readBootstrapState(available, initialTheme));
  const [langKey, setLangKey] = useState(initialState.langKey ?? initialLangKey);
  const [theme, setTheme] = useState<ThemeArchetype>(initialState.theme ?? initialTheme);
  const [viewMode, setViewMode] = useState<ViewMode>(initialState.viewMode);
  const [reduceMotion, setReduceMotion] = useState(initialState.reduceMotion);
  const [navOpen, setNavOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [executions, setExecutions] = useState<Record<number, CellExecutionState>>({});
  const [activeProject, setActiveProject] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = LANGUAGE_HTML_TAGS[langKey as LanguageKey] ?? langKey;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, langKey);
  }, [langKey]);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = reduceMotion ? "true" : "false";
    window.localStorage.setItem(REDUCE_MOTION_STORAGE_KEY, String(reduceMotion));
  }, [reduceMotion]);

  useEffect(() => {
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

  /**
   * Keyboard grammar, following the reference site's lead: `g` then a section
   * key jumps, `?` lists the shortcuts, Escape closes overlays.
   */
  useEffect(() => {
    let pendingGoto = false;
    let resetTimer: number | undefined;

    const goTo = (id: string) => {
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "Escape") {
        setHelpOpen(false);
        setNavOpen(false);
        return;
      }
      if (event.key === "?") {
        event.preventDefault();
        setHelpOpen((current) => !current);
        return;
      }
      if (event.key === "g") {
        pendingGoto = true;
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          pendingGoto = false;
        }, 1200);
        return;
      }
      if (pendingGoto) {
        const map: Record<string, string> = {
          p: "profile",
          d: "dashboard",
          t: "tracks",
          m: "methodology",
          n: "notebook",
          c: "contact",
        };
        const section = map[event.key.toLowerCase()];
        if (section) {
          event.preventDefault();
          goTo(section);
        }
        pendingGoto = false;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(resetTimer);
    };
  }, []);

  const node = useMemo<LocalizationNode>(
    () =>
      payload.localizationRegistry[langKey] ??
      payload.localizationRegistry[payload.metadata.availableLanguages[0]],
    [payload, langKey]
  );

  const codeCells = useMemo(
    () => node.notebookCells.filter((cell) => cell.type === "code"),
    [node]
  );

  const runCell = useCallback((cell: NotebookCell) => {
    if (!cell.executionMetadata) return;
    const startedAt = Date.now();
    setExecutions((current) => ({
      ...current,
      [cell.id]: { status: "running", startedAt },
    }));

    window.setTimeout(() => {
      setExecutions((current) => ({
        ...current,
        [cell.id]: {
          status: "done" as const,
          startedAt,
          finishedAt: Date.now(),
          elapsedMs: Date.now() - startedAt,
        },
      }));
    }, 460 + (cell.id % 3) * 180);
  }, []);

  const runAllCells = useCallback(() => {
    codeCells.forEach((cell, index) => {
      window.setTimeout(() => runCell(cell), index * 140);
    });
  }, [codeCells, runCell]);

  const resetCells = useCallback(() => setExecutions({}), []);

  const kernelBusy = Object.values(executions).some(
    (state) => state.status === "running" || state.status === "queued"
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      payload,
      langKey,
      setLangKey,
      node,
      theme,
      setTheme,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
      kernelBusy,
      executions,
      runCell,
      runAllCells,
      resetCells,
      activeProject,
      setActiveProject,
      viewMode,
      setViewMode,
      reduceMotion,
      setReduceMotion,
      navOpen,
      setNavOpen,
      helpOpen,
      setHelpOpen,
    }),
    [
      payload,
      langKey,
      node,
      theme,
      kernelBusy,
      executions,
      runCell,
      runAllCells,
      resetCells,
      activeProject,
      viewMode,
      reduceMotion,
      navOpen,
      helpOpen,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }
  return context;
}
