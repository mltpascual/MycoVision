# Application Details: MycoVision

## 1. Design Philosophy: The Zen-Psychedelic Fusion
MycoVision was built to fulfill a specific aesthetic request: **Psychedelic but Calming**. 

### Visual Strategy
- **Imagery**: Selected art that combines human silhouettes with liquid fractals to ground the abstract visuals in an organic context.
- **Motion**: The "Neural Tunnel" zoom speed is set to a therapeutic 0.03x rate, preventing motion sickness and promoting a "flow state."
- **Color Palette**: Focus on deep violets, magentas, and cyans—colors typically associated with deep relaxation and night-time aesthetics.

## 2. Technical Architecture

### The Kaleidoscope Engine (`Kaleidoscope.tsx`)
- **Canvas API**: Utilizes the native HTML5 Canvas for high-performance rendering.
- **Layering System**: Renders up to 12 simultaneous layers with varying scales and opacities to create a sense of infinite depth.
- **Mathematics**: 
  - Segments are calculated using `(Math.PI * 2) / segments`.
  - Geometric mirroring is achieved via `ctx.scale(1, -1)` on alternating segments.
  - Smooth looping is managed by a modulo operator on the time-based drift variables.

### Audio Management
- **Stable Playback**: Uses a dedicated `AudioRef` to manage state independently of the React render cycle.
- **Interactivity Requirement**: Implements a "Start Screen" to comply with browser Autoplay Policies, ensuring audio only plays after a user-initiated event.
- **Volume Normalization**: Pre-set to 0.3 (30%) to ensure a non-jarring introduction to the soundscape.

## 3. UI/UX Features
- **Glassmorphism**: UI elements use high-blur, low-opacity backgrounds to remain readable without obscuring the art.
- **Standard Cursor**: Retains the system default pointer to ensure the application feels like a tool the user is controlling, rather than an uncontrollable movie.
- **DPI Scaling**: Automatically detects high-resolution displays (Retina/4K) and adjusts the internal canvas resolution for maximum sharpness.

## 4. Future Roadmap
- **Microphone Reactivity**: Connecting the fractal drift speed to low-frequency audio input.
- **Image Uploads**: Allowing users to drop their own photos into the Kaleidoscope.
- **VR Support**: WebXR implementation for total immersion.
