import { Component, type ReactNode } from 'react';

// Catches an error thrown while rendering the Markdown view and shows `fallback`
// (the plain view) instead, so one odd file can't blank the whole detail pane.
// A class because React has no hook for error boundaries. The parent's
// per-file key remounts it, so a new file starts without the error.
export class MarkdownBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
