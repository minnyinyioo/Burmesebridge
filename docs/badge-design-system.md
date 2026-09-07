# BurmeseBridge identity marks

Version 2: silhouette-led, two-tone SVG artwork designed for 25px display.

- One recognisable symbol per identity; no nested outline frames.
- Admin: rose crown; moderator: blue shield; verification: jade seal and white tick.
- Teacher: violet graduation cap; student: teal open book; author: bronze nib; company: blue building.
- Member: slate B monogram; VIP: gold faceted jewel; Premium: purple and gold star.
- Activity level: numbered amber hexagon, independent of paid membership.
- All surfaces use ProfileBadges, with deterministic role order and deduplication.
- 34px interaction target, 25px artwork, 3px between targets. Wrapping allowed at small widths.
- Native buttons support keyboard interaction; Escape dismisses the label. Labels also appear on hover/focus/tap.
- Only VIP/Premium and level 10+ have a small 12-second sparkle; reduced-motion disables it.
- Scoped CSS prevents the historical global badge styles from changing the artwork.
- Badge display never grants permissions. Unknown roles use the B mark and their supplied label.

When adding an identity, add its original silhouette and localized label here in the shared components.
Check at actual size on light/dark backgrounds and with multiple roles before publishing.
