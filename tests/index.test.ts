import { describe, expect, test } from "@jest/globals";
import { useIdleTimer } from "../src/useIdleTimer";
import { IdleTimerProvider } from "../src/IdleTimerContext";

describe("useIdleTimer", () => {
    test("exports useIdleTimer", () => {
        expect(typeof useIdleTimer).toBe("function");
    });

    test("exports IdleTimerProvider", () => {
        expect(IdleTimerProvider).toBeDefined();
    });
});
