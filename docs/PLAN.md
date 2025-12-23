# React Native Idle Timer - Improvement Plan

## 1. Current Status Analysis

*   **Core Logic**: Uses `useRef` and `setTimeout` (Good for performance, avoids re-renders).
*   **Input**: `PanResponder` intercepts touches.
*   **State Management**: Imperative.
*   **Weaknesses**:
    *   Hardcoded `10s` timeout.
    *   Hardcoded `onIdle` console log.
    *   Typo: `remaningTime`.
    *   UI relies on inefficient polling (`setInterval` in `DemoScreen`).
    *   Confusing Naming: `IdleTimerProps` describes the *return value*, not input props.
    *   Missing `AppState` handling (Background/Foreground).

---

## 2. Refactoring Goals

### A. Configuration (The "Props")
Refactor `useIdleTimer` to accept a configuration object:

```typescript
interface UseIdleTimerOptions {
  timeout: number;          // Time in ms before going idle
  onIdle?: () => void;      // Callback when timeout is reached
  onActive?: () => void;    // Callback when user interacts after being idle
  onAction?: () => void;    // Callback on every interaction (optional)
  respectKeyboard?: boolean;// Whether to pause when keyboard is open
}
```

### B. Reactivity (Event-Driven)
*   **Remove Polling**: The UI (`DemoScreen`) should not use `setInterval`.
*   **Use Callbacks**: The consuming component should update its local state (e.g., `setIsIdle`) inside the `onIdle` and `onActive` callbacks provided by the hook.

### C. Type Definitions
*   **Rename**: `IdleTimerProps` (current) -> `IdleTimerHandle` or `IdleTimerResult`.
*   **Create**: `UseIdleTimerOptions` (as defined above).

### D. App State Handling
*   Integrate `AppState` from `react-native`.
*   **Logic**:
    *   When App goes **Background**: Store current timestamp.
    *   When App comes **Foreground**: Calculate `elapsed = now - storedTimestamp`. Subtract `elapsed` from remaining time (or immediately trigger idle if `elapsed > remaining`).

### E. Code Quality
*   Fix typo: `remaningTime` -> `remainingTime`.
*   Remove debug `console.log`s.

---

## 3. Proposed Architecture

### `useIdleTimer` Hook
```typescript
// Pseudo-code signature
export function useIdleTimer({
  timeout,
  onIdle,
  onActive
}: UseIdleTimerOptions): IdleTimerHandle {
  // ... implementation
}
```

### `IdleTimerProvider`
Should accept the options and pass them to the hook.

```tsx
export function IdleTimerProvider({
  children,
  timeout,
  onIdle,
  onActive
}: PropsWithChildren & UseIdleTimerOptions) {
  const idleTimer = useIdleTimer({ timeout, onIdle, onActive });
  // ...
}
```

---

## 4. Implementation Steps (Checklist)

- [ ] **Step 1: Types**: Rename existing types and create new Options interface.
- [ ] **Step 2: Config**: Update `useIdleTimer` to accept arguments (`timeout`, etc.) instead of hardcoded values.
- [ ] **Step 3: Callbacks**: Implement `onIdle` and `onActive` logic within the timer.
- [ ] **Step 4: Cleanup**: Fix typos and remove polling from `DemoScreen`.
- [ ] **Step 5: AppState**: Add listener for App background/foreground changes to ensure timer accuracy.
