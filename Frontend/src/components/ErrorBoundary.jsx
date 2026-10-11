import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("HIACDI UI error:", error?.message || error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section className="px-5 py-20 text-center">
        <h1 className="font-heading text-3xl font-bold text-navy">Something went wrong</h1>
        <p className="mt-3 text-muted">That page hit an unexpected error. You can go home or try again.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href="/" className="inline-flex min-h-11 items-center rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white">
            Home
          </a>
          <button
            type="button"
            className="inline-flex min-h-11 items-center rounded-full border border-navy/20 px-5 py-2 text-sm font-semibold text-navy"
            onClick={() => this.setState({ failed: false })}
          >
            Try again
          </button>
        </div>
      </section>
    );
  }
}
