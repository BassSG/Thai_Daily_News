# Verification · 2026-10-15

## 2.5.1 · Publisher context and automatic Thai summaries

- Application source: `0e48b44c1cf3887667122baf5d5424ed6ede5110`. [Build, lint, signing and Android 11/15 device checks passed](https://github.com/BassSG/Thai_Daily_News/actions/runs/38763882079). Inspected the native reader screenshot and its headline-only fallback.
- RSS ingestion chooses the longer description or encoded/Atom content, keeps paragraph boundaries and a bounded publisher lead of about 1,200 characters. Public metadata enrichment shares the existing bounded image requests. Google cluster lists remain excluded.
- The reader starts Thai summarization automatically on opening a story with at least 80 characters of source content. AI receives the richer lead, uses the existing global 10-new-requests/day cap, and reuses cached results. Headline-only records make no AI call. No new API provider or credentials were added.
- 30 Node tests passed locally, including source-text cleaning, metadata article identity, retention across refreshes, summary fact inputs, quota/cache behavior and protection against Google records overwriting publisher content. The release CI ran the first 26 tests; the remaining server regressions were verified locally after the APK build.
- GAS deployment 73 includes a reader schema migration that re-reads feeds without conditional HTTP validators, plus protection for direct publisher records on subsequent Google refreshes. The scheduled 5-minute trigger and existing endpoint remain in use. Owner bootstrap remains disabled.
- APK versionCode 20501/versionName 2.5.1 uses the existing signing identity. Downloaded the public stable APK and verified SHA-256 `d815fc51c7d36b1e82851b8e58f06f6cf420ec291e545a2ca72ab5c9ffad6e0a` against the tested artifact. Release: [v2.5.1](https://github.com/BassSG/Thai_Daily_News/releases/tag/v2.5.1).

## 2.5 · Your Daily Perspective

Release source: `4ad5cb60d16d850b97703dd0c878f31415d0e9f1`. [Successful build, signing, release lint and Android 11/15 device checks](https://github.com/BassSG/Thai_Daily_News/actions/runs/38751628467).

- Replaced the large dashboard with an image-led reading layout, compact live signal strip, direct category filters and desktop feature stories. Secondary feature stories remain in the phone feed and are not repeated in the desktop list.
- Verified layouts at 360, 390, 768 and 1440 CSS pixels without horizontal overflow. Checked Daylight/Midnight, search with no results, clearing filters, saving/removing stories, list/card switching and large reader text through the browser UI.
- Android 11/API 30 and Android 15/API 35 passed against live GAS. Checks include news photos, viewport-attached bottom navigation, full-card hero-image bounds, list/card mode, reader text enlargement, settings panels, bookmarks, all three widgets, widget paging/wrapping, collection scrolling, correct article opening, notifications and URL validation.
- Inspected native Android home and settings screenshots. Added physical position and viewport-height fallbacks plus flex-gap detection for older System WebViews after visual QA exposed a misplaced photograph and bottom navigation.
- Widget photograph downloads now use a separate single-thread executor and an image-only JobScheduler job. Pending refresh jobs are coalesced, so image downloads do not occupy the news-request queue. The scrolling test waits for the image queue before injecting gestures.
- Background web refresh stages new snapshots while the user is reading down the page or has the reader/settings open. A visible update button applies the prepared snapshot. Reader focus returns to the originating story when closed.
- 22 Node tests passed. Added regressions for commentary mentioning a coup and Thai-language foreign reporting retaining a legacy domestic scope. Live GAS verified both corrections and all 15 feeds responding.
- Browser CSS/JS/config URLs and offline precache entries carry the release version to avoid mixing a new page with old cached application files. The GAS build embeds script text through replacement callbacks, preserving dollar signs, and compiles every generated inline script to catch packaging syntax errors.
- GAS deployment 69 serves version 2.5.0 at the existing endpoint. No new paid API or credentials were introduced.
- APK versionCode 20500/versionName 2.5.0 uses the existing signing identity. Downloaded the public stable APK and verified SHA-256 `81ffd2bcff4c1c2ec33ed3c01b9ed6df567e828cae0de8f77cfff7c77a107da4` against the tested release artifact.

## 2.4 · Intelligent alerts and Live News Pulse

Release source: `31cbf41ecd53e0c6a8d778ae74a624f6996a1ae8`; TMD feed compatibility follow-up: `d9452ff1b771ba0cecf23d91b5c592bd0e792b8e`. [Successful build, signing, release lint and Android 11/15 device checks](https://github.com/BassSG/Thai_Daily_News/actions/runs/38675114625).

- Rebuilt the web and Android reading experience around Today, Must Know, Trending, Latest and Saved views. Reviewed the live desktop layout plus Android home, settings and all three native widget sizes.
- News is grouped into topic signals: breaking, major, trending, rising and latest. Default alerts accept breaking and major only; international stories require a high-impact major or breaking signal. Quiet hours still allow genuine breaking alerts.
- Verified the live GAS snapshot at version 2.4.0 with unique signal counts and topic de-duplication. Deployment 65 retains the existing endpoint and 5-minute trigger and monitors 15 RSS feeds, including the official TMD warning and earthquake feeds.
- The TMD earthquake adapter consumes only the newest channel-timestamped record. Undated archive records and warnings older than 72 hours are ignored so they cannot produce stale alerts.
- 20 Node tests passed, including corroborated Thai policy news, routine-news suppression, major international emergencies, minor overseas earthquakes, notification category filters, dates, URL safety, duplicate handling and publisher images.
- Android 11/API 30 and Android 15/API 35 device checks passed. Android uses separate channels for breaking and major news, de-duplicates topic notifications, observes quiet hours for non-breaking items and refreshes stale data when the app resumes.
- APK versionCode 20400/versionName 2.4.0 uses the existing signing certificate SHA-256 `b61ab53da8023a7f8b5511dd964ea904934d1b6b4adb528ea5f4090c98b74fb2`. The public stable and versioned APKs both match SHA-256 `aa6d6bd86f4ec6863cd90fa09c80f889d0ce6dfc9d3692c74bc4133b69d45137`.
- No Brave or other paid news/image API was introduced. The existing optional AI-summary configuration and its daily cap remain separate from RSS ingestion and alerts.

## 2.3 · Browse news inside Android widgets

Release source: `11dc7a719563e3f4da70d728854bf938740de893`. [Successful build, signing, release lint and both device checks](https://github.com/BassSG/Thai_Daily_News/actions/runs/38594286781).

- Android 11/API 30 and Android 15/API 35 emulator checks both passed against the live GAS endpoint. The former exercises the RemoteViewsService adapter; the latter exercises RemoteCollectionItems.
- Bound all three widget providers to native AppWidgetHost views. Invoked actual next/previous controls, checked forward and backward wrapping, independent widget cursors and the selected story remaining after a normal refresh.
- Injected touchscreen swipes into the 4×4 ListView and verified that the first visible item advanced. Clicked a story after scrolling and verified the matching headline in the real reader. MainActivity uses singleTop to reuse the reader; widget article events close any previously open settings dialog.
- Reviewed screenshots before navigation, after switching the small widget and after scrolling the large widget. Confirmed pictures, publisher credits, position indicators, themes and the compact headline's visible bounds.
- Photo opt-out, a story without photo metadata, cached thumbnail size, bounded collection parcel, bookmark storage, reader settings, notification category filtering, HTTPS validation and native notification posting passed. Notification checks wait for asynchronous posting.
- Each widget selects at most 20 matching stories. Paging reads the local news cache; a separate image-only JobScheduler job fills missing photos without fetching a new GAS snapshot. Image downloads remain bounded to 20 requests/25 seconds and a 10 MB cache.
- 17 Node tests passed. GAS deployment 63 retains the existing endpoint, credentials and ingestion schedule; owner bootstrap remains disabled.
- Downloaded the public stable APK and matched it to the tested artifact: SHA-256 `fb6fec508726965f86312d65b6e245285cbb26ff3fce42dc61305d04c3e75e92`. VersionCode 20300 uses the existing signing identity.

## 2.2 · Android widget photos

Release source: `cc8ebdcbd6e350506e2ddca5a0ca47bf648d3d16`. [Successful build, signing, lint and Android device check](https://github.com/BassSG/Thai_Daily_News/actions/runs/38578886297).

- 17 Node tests passed. Android 15 emulator downloaded real publisher images from live GAS news and verified 320×200 thumbnails with bounded bitmap memory.
- Bound SmallWidget, MediumWidget and LargeWidget through Android AppWidgetManager and rendered their updates in a native AppWidgetHost. Reviewed actual 2×2, 4×2 and 4×4 screenshots with photos in Midnight and Ivory; the small headline fits its available area.
- Checked cached photos at compact, normal and expanded heights; photo opt-out and a story without image metadata retain readable headlines. The widget render path reads cached thumbnails without network calls.
- Opened the actual native widget configuration screen, switched photos off, saved, and verified that only that widget's preference changed. Existing widget configurations default to showing photos.
- Main news response returns before additional widget photo downloads. Story PendingIntents include a unique data URI so separate widgets cannot overwrite each other's destinations through request-code overlap.
- Article, saved news, application settings, notification filtering, HTTPS validation and actual native notification posting passed. Debug preview and test helpers are excluded from the release APK.
- GAS deployment 61 retains the existing endpoint and 5-minute ingestion trigger, with bootstrap disabled. Live snapshot verified 13 healthy feeds and publisher image URLs; no new paid image API was introduced.
- Downloaded the public stable APK URL and matched it to the tested signed artifact: SHA-256 `27da5598f66c93109493c277153d9d5be99ee03dd9c00b61e587054a206975ac`. Signing certificate matches 2.1; versionCode increased to 20200.

## 2.1 · Publisher photographs

Release source: `507a57fa69242a351b5015b03f188a33d3a96e77`. [Successful build and Android device check](https://github.com/BassSG/Thai_Daily_News/actions/runs/38560568484).

- 17 Node tests passed, including Media RSS, enclosure, HTML and Open Graph image extraction, safe URLs, homepage/tiny-image rejection and preservation across feed refreshes.
- Android 15 emulator waited for the actual hero photograph to finish loading before capturing the home screen; article, bookmarks, settings, widgets and notifications also passed.
- Reviewed the native home screenshot with the real publisher photograph. Public GitHub Pages verified a loaded 1200px hero image, loaded thumbnails and version 2.1 UI.
- GAS deployment 59 serves 13 feeds with bounded publisher metadata requests. Owner bootstrap is disabled in both deployed and current source.
- Both APK download names contain the same signed build; downloaded published APK and verified its SHA-256 against the tested artifact.
- No paid image search or AI image calls. Some stories have no publisher image, and failed image loads fall back to readable text. Original publisher images can be unavailable or slow; they are not replaced by unrelated stock photos.

## 2.0 · Original application release

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
