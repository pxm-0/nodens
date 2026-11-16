# Product brief

## Thesis

Nodens is the public front of one person's practice: a consulting landing first, and behind it a gallery of one ongoing life.

It is simultaneously:

- a landing page for consulting work
- a public portfolio
- a publishing surface
- a personal social medium
- a record of niche practices
- a direct contact surface
- an absurdly overengineered dating profile

The landing states the offer plainly. The exhibition does not begin by describing the person. It presents evidence from which the person becomes inferable.

## Experience architecture

### Landing layer

The root route is a scrolling page for a visitor who may hire. In order: the offer and the action, three shapes of work (Automate, Build, Embed), the evidence, how an engagement runs, who is behind it, and the action again.

- No public prices. The one action is "Start a conversation".
- The action is the contact email until `PUBLIC_BOOKING_URL` is set at build time.
- The evidence is the ranked project records, a live product first.

### Exhibition layer

`/exhibition/` is a sequence of full-screen frames:

1. Threshold
2. Engineer
3. Writer
4. Coffee
5. Audio
6. Synthesis

Each frame previews a facet and provides a route into its deeper section. Wheel, keyboard, touch, buttons, and an overlay index all navigate the sequence.

### Content layer

Deeper routes behave like proper public sites rather than forcing every visitor through theatrical interaction.

- `/engineering/` contains projects and build notes
- `/writing/` contains essays and fragments
- `/coffee/` contains brew logs and equipment notes
- `/audio/` contains listening notes and equipment records
- `/about/`, `/contact/`, `/now/`, and `/index/` remain directly available

## Core principle

**Concept in the encounter. Clarity in the archive.**

The exhibition may be authored and indirect. The landing and the deeper pages must be readable, indexable, fast, and honest.
