# Design System Specification: The Sonic Lens

## 1. Overview & Creative North Star
**Creative North Star: "The Ethereal Studio"**
This design system moves beyond the "SaaS Dashboard" trope to create a high-end, editorial environment for audio creators. It rejects the rigidity of the traditional grid in favor of **Atmospheric Depth**. By leveraging deep violet foundations and electric cyan accents, we create a space that feels like a professional recording studio at midnight: focused, premium, and technologically advanced.

To break the "template" look, we utilize **Intentional Asymmetry**. Larger display type should be offset against condensed functional modules. We treat the screen not as a flat canvas, but as a series of layered, translucent planes that suggest a limitless, digital void.

---

## 2. Colors & Tonal Architecture
The palette is rooted in a "Deep Night" spectrum, using purple as the structural soul and electric blue as the functional pulse.

### The "No-Line" Rule
**Borders are a failure of hierarchy.** 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined through:
1.  **Background Shifts:** Placing a `surface_container_low` (#1B1B1E) element against the `background` (#131316).
2.  **Tonal Transitions:** Using the `surface_container` tiers to imply edges.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of "Obsidian Glass."
*   **Base Level:** `background` (#131316)
*   **Tertiary Sections:** `surface_container_low` (#1B1B1E)
*   **Active Modules/Cards:** `surface_container` (#1F1F22)
*   **Floating/Pop-out Elements:** `surface_container_high` (#2A2A2D)

### The "Glass & Gradient" Rule
To inject "soul" into the AI experience, main CTAs and Hero moments must use a **Linear Gradient**: `primary_container` (#5D21DF) to `secondary_container` (#00E3FD) at a 135° angle. Floating panels should use `surface_container_highest` (#353438) at 70% opacity with a `20px` backdrop-blur to create an authentic glassmorphism effect.

---

## 3. Typography: Editorial Authority
We use **Inter** exclusively, but we manipulate its scale to create a "Masthead" feel.

*   **Display (lg/md):** Used for AI-generated titles and podcast names. Tracking should be set to `-0.02em` to feel tighter and more "custom."
*   **Headline (sm/md):** Used for section headers. Always pair a `headline-sm` with a `label-md` in `on_surface_variant` (#CBC3D9) for an editorial meta-data look.
*   **Body (lg/md):** High legibility for transcripts. Use `body-lg` for active transcript segments and `body-md` for secondary notes.
*   **Labels:** Use `label-sm` (#0.6875rem) in All Caps with `+0.05em` letter spacing for technical stats (bitrate, timestamps, AI confidence scores).

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "web 2.0." We use **Ambient Lifts**.

*   **The Layering Principle:** Depth is achieved by "stacking." A `surface_container_lowest` (#0E0E11) input field should sit inside a `surface_container` (#1F1F22) card. This "inward" depth feels more modern than outward shadows.
*   **Ambient Shadows:** If an element must float (e.g., a playback controller), use a shadow with a `48px` blur, `0px` offset, and `on_background` color at 6% opacity.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke (e.g., in high-glare environments), use `outline_variant` (#494456) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons: The "Power Source"
*   **Primary:** Gradient fill (`primary_container` to `secondary_container`). White text (`on_primary_fixed`). Corner radius: `full` (9999px).
*   **Secondary:** `surface_container_highest` (#353438) with no border. Text in `primary` (#CDBDFF).
*   **Tertiary:** Transparent background. Text in `secondary` (#BDF4FF) with an underline that only appears on hover.

### Input Fields: The "Vocal Booth"
*   **Styling:** Background: `surface_container_lowest` (#0E0E11). Radius: `md` (0.75rem). 
*   **State:** On focus, the background remains dark, but the `outline` (#948DA2) glows at 30% opacity with a soft `primary` outer shadow.

### Cards & Lists: The "Stream"
*   **Strict Rule:** No dividers. Use `1.5rem` (6) of vertical whitespace to separate items.
*   **Interaction:** On hover, a card should shift from `surface_container` to `surface_container_high`.

### Audio-Specific Components
*   **Waveform Visualizer:** Use `secondary` (#BDF4FF) for played segments and `outline_variant` (#494456) at 40% for unplayed segments.
*   **AI Insight Chips:** Small, `full` radius chips using `tertiary_container` (#A8004B) background with `on_tertiary_container` (#FFB4C3) text to signify "AI Intelligence."

---

## 6. Do’s and Don’ts

### Do:
*   **DO** use asymmetry. Place a `display-lg` headline on the left and a small `label-md` technical stat on the extreme right to create tension.
*   **DO** use "Deep Purple" (`primary_fixed_dim`) for icons to keep them subtle until hovered.
*   **DO** lean into the `24` (6rem) spacing for major section breaks to allow the AI content to "breathe."

### Don’t:
*   **DON'T** use pure white (#FFFFFF). Always use `on_background` (#E4E1E6) for text to reduce eye strain in dark mode.
*   **DON'T** use 1px dividers to separate the sidebar from the main content. Use a `surface` to `surface_container_low` shift.
*   **DON'T** use standard "Blue" links. Everything functional is `secondary` (Electric Blue) or `primary` (Deep Purple).