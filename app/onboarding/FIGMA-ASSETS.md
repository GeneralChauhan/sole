# Onboarding assets from Figma

Design file: [Celeris](https://www.figma.com/design/ZuFszRdaenFfiCoTKa3TkB/celeris?node-id=0-1)

## Exporting assets

1. Open the Figma file and select the frame(s) you need.
2. In the right panel, open the **Export** section.
3. Choose format (PNG @2x for images, SVG for icons) and click **Export**.
4. Save exported files into `public/` so they are served at the root (e.g. `/sol-light@2x.png`, `/Pattern.png`).

## Assets used by onboarding

| Asset        | Path in app   | Notes                          |
|-------------|---------------|---------------------------------|
| Sol logo    | `/sol-light@2x.png` | Logo in card header            |
| Card pattern| `/Pattern.png`      | Diagonal pattern (top-right; top-left on overview step) |
| CTA arrow   | `/CTA_Icon.svg`     | Right arrow on CTA button (rendered white) |
| Star        | `/star.svg`         | “Analyzed so far” (stats) + section headers (Slack summary) |
| Messages    | `/msg.svg`          | Stats: “600 messages”         |
| Threads     | `/conversation.svg` | Stats: “88 threads”            |
| Channels    | `/hash.svg`         | Stats: “25 channels”          |
| People      | `/people.svg`       | Slack: “14 people”            |
| Document    | `/file.svg`         | Slack: “8 topics”             |
| Open        | `/open.svg`         | Slack: “17 open on you”       |
| Awaited     | `/awaited.svg`      | Slack: “37 awaited on others” |

After exporting new assets from Figma, replace the files in `public/` and refresh; design tokens live in `design-tokens.css` if you need to adjust colors or spacing to match the design.
