export interface UseIdleTimerProps {
    timeout?: number;
    onIdle?: () => void;
    onActive?: () => void;
    onAction?: () => void;
}
