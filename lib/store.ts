import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TailoringRun } from './types';

type AppStep = 'input' | 'analyze' | 'review' | 'export';

interface UIState {
  step: AppStep;
  isLoading: boolean;
  error: string | null;
}

interface AppState {
  resumeText: string;
  jdText: string;
  tailoringRun: TailoringRun | null;
  ui: UIState;
  
  // Actions
  setResumeText: (text: string) => void;
  setJdText: (text: string) => void;
  setTailoringRun: (run: TailoringRun | null) => void;
  setStep: (step: AppStep) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: UIState = {
  step: 'input',
  isLoading: false,
  error: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      resumeText: '',
      jdText: '',
      tailoringRun: null,
      ui: initialState,

      setResumeText: (text) => set({ resumeText: text }),
      setJdText: (text) => set({ jdText: text }),
      setTailoringRun: (run) => set({ tailoringRun: run }),
      setStep: (step) => set((state) => ({ ui: { ...state.ui, step } })),
      setIsLoading: (loading) => set((state) => ({ ui: { ...state.ui, isLoading: loading } })),
      setError: (error) => set((state) => ({ ui: { ...state.ui, error } })),
      reset: () => set({
        resumeText: '',
        jdText: '',
        tailoringRun: null,
        ui: initialState,
      }),
    }),
    {
      name: 'resume-shapeshifter-storage',
      partialize: (state) => ({
        resumeText: state.resumeText,
        jdText: state.jdText,
        tailoringRun: state.tailoringRun,
      }),
    }
  )
);
