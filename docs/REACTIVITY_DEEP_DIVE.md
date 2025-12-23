# Deep Dive: Reactivity (Polling vs. Event-Driven)

This document explains why we are moving from the current "Polling" approach to an "Event-Driven" architecture (Section B of the Plan).

## 1. The Current Approach: Polling (The "Are we there yet?" Method)

Currently, your `DemoScreen` (the UI) asks the `useIdleTimer` (the Logic) for updates constantly, regardless of whether anything has changed.

**Current Code (`DemoScreen.tsx`):**
```typescript
useEffect(() => {
    // This runs every 500ms (2 times per second) forever!
    const intervalId = setInterval(() => {
        // Asking: "Is it idle now?"
        setCountdownTime(idleTimer.getRemainingTime() ?? 0);
        setIsIdle(idleTimer.getIsIdle());
    }, 500);

    return () => clearInterval(intervalId);
}, [idleTimer]);
```

### Why this is bad:
1.  **Performance Waste**: The app runs code every 500ms even if the user is happily tapping away and nowhere near being idle.
2.  **Lag**: If the timer hits 0 at `10.0s`, but your interval runs at `10.4s`, there is a 400ms delay before the UI reacts.
3.  **Boilerplate**: Every component that wants to know if the user is idle has to set up its own interval.

---

## 2. The Proposed Approach: Event-Driven (The "Don't call us, we'll call you" Method)

Instead of the UI asking repeatedly, the `useIdleTimer` hook should notify the UI **only when the state actually changes**.

**How it works:**
1.  The `useIdleTimer` knows exactly when the timeout happens (because it holds the `setTimeout`).
2.  We pass a function (callback) to `useIdleTimer`.
3.  When the time is up, `useIdleTimer` executes that function.

**Proposed Code (`DemoScreen.tsx`):**

```typescript
// 1. We pass the instructions to the hook
useIdleTimer({
    timeout: 10_000, // 10 seconds
    onIdle: () => {
        // 2. The hook calls this ONLY when time runs out
        setIsIdle(true);
        console.log("User has gone idle!");
    },
    onActive: () => {
        // 3. The hook calls this ONLY when user returns
        setIsIdle(false);
        console.log("User is back!");
    }
});

// No useEffect with setInterval needed for the status!
```

### Benefits:
1.  **Zero Waste**: Code only runs exactly when the state changes (Active -> Idle, or Idle -> Active).
2.  **Instant Reaction**: The UI updates the exact millisecond the timer expires.
3.  **Cleaner UI Code**: The `DemoScreen` doesn't need to manage intervals or `clearInterval`.

---

## 3. What about the Countdown Timer?

You might ask: *"But I still need to show the remaining seconds (5...4...3...)!"*

**You are correct.** If you need to display a ticking clock on the screen, you **do** need an interval/polling mechanism. However:

1.  **Separation of Concerns**: The "Is Idle" status (Boolean) and the "Time Remaining" (Number) are different needs.
    *   Most apps just want to know: "Log me out when idle." -> **No interval needed.**
    *   Some apps want: "Show a countdown." -> **Interval needed.**
2.  **Optimization**: With the new approach, we can choose to *only* run the interval when we are in a "Prompt" state (e.g., only count down the last 60 seconds), rather than running it all the time.

## Summary

We are moving the responsibility of "checking the time" from the **Consumer** (DemoScreen) to the **Provider** (useIdleTimer). The Provider will simply notify the Consumer when important events happen.
