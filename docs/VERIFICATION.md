# Verification · 2026-10-14

Release source: `b449c6449d2320f8acd8cdf97c25642e698c9b55`

- Android build, release lint, APK signing verification and Android 15 device smoke test: [successful workflow](https://github.com/BassSG/Thai_Daily_News/actions/runs/38555206286).
- Node tests: 12 passed. Covers dates, stale/future stories, unsafe links, deduplication, Thai category boundaries, legacy Google cluster cleanup, quiet hours, notification categories and GAS-compatible ES256 signatures.
- Android emulator used the live GAS endpoint and verified real news, article drawer, bookmark storage shared with widgets, settings, three native RemoteViews sizes and active native notification posting.
- Additional debug-only receiver posted a notification outside instrumentation; its actual Android notification shade was captured. Debug helpers are excluded from the release APK.
- Reviewed Android home, story, settings, widget and notification screenshots. Fixed system bar overlap found in the initial visual check.
- Public GitHub Pages verified: current logo, live news, search, saving a story, Thai AI summary through the production-origin bridge, and no horizontal overflow in the checked viewport.
- GAS deployment 55: existing project and endpoint retained; bootstrap disabled, 5-minute ingestion trigger active; 10 feeds healthy in the final checks; Google cluster descriptions excluded; securities headlines classified as economy.
- No Brave calls in the ingestion or reader path. Existing OpenRouter configuration retained with 10 new summaries/day global cap.

## Scope limits

Android 15 emulator was tested; the owner's physical phone and manufacturer battery policies have not been tested. Background checks start from approximately 15-minute intervals and can be delayed by Android. Force-stop pauses them until the next launch. Widgets depend on that cache and also provide manual refresh.

Desktop Web Push code and signing are present, but actual push reception on a normal Chrome/Edge installation has not been verified in this environment. Installation and permissions must be enabled by the person using the app.

RSS availability and publisher headlines/excerpts are controlled by each source. Google News RSS has no app-specific SLA. Full articles open at the original publisher; the app does not promise exhaustive coverage or instantaneous delivery.
