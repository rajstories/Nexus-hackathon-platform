import { useEffect } from "react";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = !shortcut.ctrlKey || event.ctrlKey === shortcut.ctrlKey;
        const shiftMatch = !shortcut.shiftKey || event.shiftKey === shortcut.shiftKey;
        const altMatch = !shortcut.altKey || event.altKey === shortcut.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

// Hook specifically for judge submission navigation
export function useJudgeNavigation(
  currentIndex: number,
  totalSubmissions: number,
  onNavigate: (index: number) => void
) {
  useKeyboardShortcuts([
    {
      key: "j",
      handler: () => {
        if (currentIndex < totalSubmissions - 1) {
          onNavigate(currentIndex + 1);
        }
      },
      description: "Next submission"
    },
    {
      key: "k",
      handler: () => {
        if (currentIndex > 0) {
          onNavigate(currentIndex - 1);
        }
      },
      description: "Previous submission"
    },
    {
      key: "ArrowDown",
      handler: () => {
        if (currentIndex < totalSubmissions - 1) {
          onNavigate(currentIndex + 1);
        }
      },
      description: "Next submission"
    },
    {
      key: "ArrowUp",
      handler: () => {
        if (currentIndex > 0) {
          onNavigate(currentIndex - 1);
        }
      },
      description: "Previous submission"
    }
  ]);
}