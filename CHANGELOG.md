# Changelog

All notable changes to TREMOR are documented in this file.

---

## [0.1.0] - 2026-09-02

### Architecture & WebMCP
- Initialized official `@mcp-b/global@5.1.0` polyfill implementing W3C `document.modelContext` / `navigator.modelContext`.
- Registered full 6-tool WebMCP suite: `get_system_snapshot`, `get_blast_radius`, `check_regression_history`, `get_change_provenance`, `simulate_change_impact`, and `flag_for_review`.
- Implemented multi-root breadth-first search (BFS) graph traversal engine for transitive downstream blast radius calculation.
- Implemented historical regression pattern matcher correlating past P0/P1 outage root-causes with proposed changes.
- Added strict non-self-approving human review gate (`flag_for_review`), enforcing physical DOM `onClick` confirmation.
- Fixed strict read-only property handling on `document.modelContext` for native ChatGPT in-app browser compatibility.

### Visualization & User Experience
- Built 2D force-directed physics graph using `react-force-graph-2d` with dynamic risk coloring (Green < 0.40, Amber 0.40–0.74, Red $\ge$ 0.75).
- Added real-time particle acceleration along impacted dependency streams during active simulations.
- Implemented floating glassmorphism simulation banner and slide-over module inspector sidebar.
- Added in-canvas floating zoom/fit toolbar and mouseover module preview cards.
- Integrated power-user keyboard shortcuts (<kbd>H</kbd> for Hero, <kbd>S</kbd> for Simulation, <kbd>R</kbd> for Reset, <kbd>?</kbd> for Help).
- Completed WCAG 2.1 AA accessibility pass with high-contrast `:focus-visible` rings and semantic ARIA descriptors.

### Verification & Testing
- Automated regression suite in Google Chrome with `--enable-webmcp-testing` verifying all 6 tools.
- Tested responsive viewports across Desktop (1440x900), Mobile (390x844), and Tablet split-view (1024x768).
- Verified live tool discovery and simulation in the official native ChatGPT in-app browser.
