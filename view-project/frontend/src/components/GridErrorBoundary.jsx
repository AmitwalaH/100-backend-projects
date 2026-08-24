import { Component } from "react";

export class GridErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Render failed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", textAlign: "center", color: "#888" }}>
          <p style={{ marginBottom: "12px" }}>
            Something went wrong loading this project.
          </p>
          <button
            className="sidebar-filter-btn"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
