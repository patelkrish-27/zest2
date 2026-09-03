import * as React from "react"
import type { AppState, AppConfig } from "@/types/blueprint"

type Action =
  | { type: "SET_STATE"; payload: Partial<AppState> }
  | { type: "SET_CONFIG"; payload: Partial<AppConfig> }
  | { type: "RESET" }

interface BlueprintContextValue {
  state: AppState
  config: AppConfig
  dispatch: React.Dispatch<Action>
}

const BlueprintContext = React.createContext<BlueprintContextValue | undefined>(undefined)

export function blueprintReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_STATE":
      return { ...state, ...action.payload }
    default:
      return state
  }
}

export function useBlueprintContext() {
  const ctx = React.useContext(BlueprintContext)
  if (!ctx) throw new Error("useBlueprintContext must be used within BlueprintProvider")
  return ctx
}

export const BlueprintProvider: React.FC<{
  state: AppState
  config: AppConfig
  dispatch: React.Dispatch<Action>
  children: React.ReactNode
}> = ({ state, config, dispatch, children }) => {
  return <BlueprintContext.Provider value={{ state, config, dispatch }}>{children}</BlueprintContext.Provider>
}

export default BlueprintContext
