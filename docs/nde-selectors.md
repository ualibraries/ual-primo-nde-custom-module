# NDE component selectors

A reference to the `nde-*` component selectors in Primo NDE that our custom module can hook into, and how to find them.

Ex Libris doesn't publish a complete list of selectors, as far as we know. The repo [README](../README.md#add-custom-components) explains the pattern and says every NDE component is meant to be customizable. If you find one that isn't, open a support case with Ex Libris. The list below was extracted from the UA sandbox's code (see [Regenerating the list](#regenerating-the-list)).

## How hooks work

Every hookable NDE component, `nde-xyz`, gives you five slots. Primo builds them from the component's tag name:

| Selector to map | Where your component goes |
|---|---|
| `nde-xyz` | Replaces the component |
| `nde-xyz-before` | Outside the component, before it |
| `nde-xyz-after` | Outside the component, after it |
| `nde-xyz-top` | Inside the component, at the start |
| `nde-xyz-bottom` | Inside the component, at the end |

You connect a component to a slot in [src/app/custom1-module/customComponentMappings.ts](../src/app/custom1-module/customComponentMappings.ts). For example:

```ts
['nde-search-filters-side-nav-top', UaExternalSearchComponent],
```

## Finding the selectors on the page you're viewing

Open the page in Chrome, open DevTools (Cmd+Option+I), and paste this into the **Console**. It outlines every NDE component on the page, shows its selector when you hover over it, and prints a table of the selectors it found:

```js
(() => {
  const els = [...document.querySelectorAll('*')].filter(e => e.tagName.toLowerCase().startsWith('nde-'));
  els.forEach(e => {
    const t = e.tagName.toLowerCase();
    e.style.outline = '1px dashed rgba(255,0,128,.6)';
    e.title = `${t}  (also: ${t}-before / -after / -top / -bottom)`;
  });
  console.table([...new Set(els.map(e => e.tagName.toLowerCase()))].sort());
})();
```

Primo swaps components when you move between pages, so run the snippet again on each page. Reloading the page removes the outlines.

You can also select an element in the DevTools **Elements** tab: its tag name is the selector.

## All hookable selectors

Extracted on 2026-11-20 from the UA sandbox (`arizona-ua-psb`, view `01UA_INST:ndeDev`): **366 selectors**. These cover the main bundle and every lazily loaded chunk.

Not included:

- `nde-app-root` and `nde-base-action`, which exist but don't have the hook.
- Ex Libris's internal test components (the `test-tools` chunk).

This is a snapshot. Ex Libris can add, rename or remove components in any release. If a selector here doesn't work, check the page with the snippet above or regenerate the list.

Groups are by the selector's first word. Groups with fewer than 3 selectors are under **Other**.

### `nde-account-*` (8)

- `nde-account`
- `nde-account-block-skeleton`
- `nde-account-item-skeleton`
- `nde-account-overview`
- `nde-account-results-range`
- `nde-account-section-item-container`
- `nde-account-section-results`
- `nde-account-section-skeleton-container`

### `nde-authority-*` (4)

- `nde-authority-home-page`
- `nde-authority-search-container`
- `nde-authority-search-result`
- `nde-authority-search-skeleton`

### `nde-browse-*` (5)

- `nde-browse-general-search-nav`
- `nde-browse-home-page`
- `nde-browse-search-container`
- `nde-browse-search-result`
- `nde-browse-search-skeleton`

### `nde-citation-*` (4)

- `nde-citation-action`
- `nde-citation-trails`
- `nde-citation-trails-card`
- `nde-citation-trails-header`

### `nde-collection-*` (18)

- `nde-collection-discovery-container`
- `nde-collection-discovery-gallery`
- `nde-collection-discovery-gallery-collection`
- `nde-collection-discovery-gallery-item`
- `nde-collection-discovery-grid`
- `nde-collection-discovery-header`
- `nde-collection-discovery-item-thumbnail`
- `nde-collection-discovery-items-skeleton`
- `nde-collection-discovery-list`
- `nde-collection-discovery-lobby-header`
- `nde-collection-discovery-no-results`
- `nde-collection-discovery-results-range`
- `nde-collection-discovery-search-bar`
- `nde-collection-discovery-thumbnail`
- `nde-collection-discovery-top-bar`
- `nde-collection-discovery-tree`
- `nde-collection-path-breadcrumbs`
- `nde-collection-path-detail`

### `nde-entity-*` (8)

- `nde-entity-details-skeleton`
- `nde-entity-layout`
- `nde-entity-properties`
- `nde-entity-related-docs-list`
- `nde-entity-related-lists-skeleton`
- `nde-entity-thumbnail`
- `nde-entity-thumbnail-license`
- `nde-entity-wikidata-skeleton`

### `nde-export-*` (5)

- `nde-export-all-dialog`
- `nde-export-bibtex-action`
- `nde-export-excel-action`
- `nde-export-reading`
- `nde-export-ris`

### `nde-favorites-*` (9)

- `nde-favorites-bulk-options-bottom-sheet`
- `nde-favorites-deleted-pnx`
- `nde-favorites-labels-bottom-sheet`
- `nde-favorites-labels-container`
- `nde-favorites-labels-dialog`
- `nde-favorites-operations-labels`
- `nde-favorites-overview`
- `nde-favorites-popup-bulk-options`
- `nde-favorites-popup-message`

### `nde-filters-*` (4)

- `nde-filters-group`
- `nde-filters-range`
- `nde-filters-skeleton`
- `nde-filters-value`

### `nde-formly-*` (21)

- `nde-formly-add-address-line-button`
- `nde-formly-calculate-queue-button`
- `nde-formly-check-availability-button`
- `nde-formly-copyrights-declaration-checkbox`
- `nde-formly-custom-checkbox`
- `nde-formly-custom-date-picker`
- `nde-formly-custom-datepicker`
- `nde-formly-date-time-picker`
- `nde-formly-digital-check-availability-button`
- `nde-formly-divider`
- `nde-formly-field-custom-input-field`
- `nde-formly-field-custom-radio`
- `nde-formly-field-resource-sharing-auto-fill`
- `nde-formly-find-item-level-description`
- `nde-formly-general-use-label`
- `nde-formly-general-wrapper`
- `nde-formly-group-select-with-search`
- `nde-formly-invalid-input-addons`
- `nde-formly-item-description`
- `nde-formly-password-field`
- `nde-formly-refine-offer-button`

### `nde-full-*` (11)

- `nde-full-display-add-tag-bottom-sheet`
- `nde-full-display-add-tag-container`
- `nde-full-display-add-tag-dialog`
- `nde-full-display-container`
- `nde-full-display-details`
- `nde-full-display-error-page`
- `nde-full-display-links`
- `nde-full-display-navigation`
- `nde-full-display-service-container`
- `nde-full-display-side-bar`
- `nde-full-display-tags`

### `nde-get-*` (3)

- `nde-get-it`
- `nde-get-it-from-other`
- `nde-get-it-other-institution`

### `nde-journal-*` (3)

- `nde-journal-database-layout-component`
- `nde-journal-home-page`
- `nde-journal-search-container`

### `nde-landing-*` (10)

- `nde-landing-about`
- `nde-landing-announcements`
- `nde-landing-page`
- `nde-landing-page-config`
- `nde-landing-page-renderer`
- `nde-landing-quick-links`
- `nde-landing-search-section`
- `nde-landing-section-host`
- `nde-landing-welcome`
- `nde-landing-welcome-announcements`

### `nde-linked-*` (3)

- `nde-linked-data-expanded-dialog`
- `nde-linked-data-recommendation`
- `nde-linked-data-recommendations`

### `nde-location-*` (7)

- `nde-location`
- `nde-location-item`
- `nde-location-item-service-button`
- `nde-location-items-container`
- `nde-location-items-filter`
- `nde-location-items-properties`
- `nde-location-items-requests`

### `nde-login-*` (5)

- `nde-login`
- `nde-login-dialog`
- `nde-login-form-content`
- `nde-login-page`
- `nde-login-restricted`

### `nde-main-*` (3)

- `nde-main-actions`
- `nde-main-menu`
- `nde-main-menu-dialog`

### `nde-map-*` (3)

- `nde-map`
- `nde-map-container`
- `nde-map-dialog`

### `nde-ngrs-*` (5)

- `nde-ngrs-get-it-other-location`
- `nde-ngrs-no-offer-message`
- `nde-ngrs-no-offer-message-content`
- `nde-ngrs-offer`
- `nde-ngrs-offer-drawer`

### `nde-personal-*` (6)

- `nde-personal-details`
- `nde-personal-details-edit`
- `nde-personal-details-info`
- `nde-personal-details-view`
- `nde-personal-info`
- `nde-personal-settings`

### `nde-record-*` (18)

- `nde-record-actions`
- `nde-record-availability`
- `nde-record-book-chapters-or-reviews`
- `nde-record-checkbox`
- `nde-record-citations-and-times-cited`
- `nde-record-citations-indicators`
- `nde-record-frbr`
- `nde-record-image`
- `nde-record-indications`
- `nde-record-main-details`
- `nde-record-scopus`
- `nde-record-skeleton-container`
- `nde-record-snippet`
- `nde-record-sub-action`
- `nde-record-summary`
- `nde-record-title`
- `nde-record-type`
- `nde-record-web-of-science`

### `nde-request-*` (5)

- `nde-request-card`
- `nde-request-form`
- `nde-request-it-form-content`
- `nde-request-item`
- `nde-request-progress-bar`

### `nde-requests-*` (3)

- `nde-requests`
- `nde-requests-overview`
- `nde-requests-page`

### `nde-research-*` (4)

- `nde-research-assistant`
- `nde-research-assistant-side-bar`
- `nde-research-assistant-suggestion`
- `nde-research-assistant-widget`

### `nde-save-*` (3)

- `nde-save-query-and-export-all-dropdown`
- `nde-save-query-enable-notifications`
- `nde-save-to-favorites`

### `nde-saved-*` (3)

- `nde-saved-searches`
- `nde-saved-searches-actions`
- `nde-saved-searches-overview`

### `nde-search-*` (22)

- `nde-search-bar-container`
- `nde-search-bar-filters`
- `nde-search-bar-presenter`
- `nde-search-box-presenter`
- `nde-search-contain-dropdown`
- `nde-search-filters-side-nav`
- `nde-search-history`
- `nde-search-history-actions`
- `nde-search-history-filters`
- `nde-search-history-item`
- `nde-search-history-overview`
- `nde-search-no-results`
- `nde-search-result-item-container`
- `nde-search-result-journal-indication-line`
- `nde-search-results`
- `nde-search-results-container`
- `nde-search-results-pagination`
- `nde-search-results-recommendations`
- `nde-search-results-resource-type-bar`
- `nde-search-results-top-bar`
- `nde-search-summary`
- `nde-search-within-journal`

### `nde-user-*` (5)

- `nde-user-area`
- `nde-user-identifiers`
- `nde-user-panel`
- `nde-user-roles`
- `nde-user-roles-dialog`

### `nde-view-*` (10)

- `nde-view-config-load-failure-message`
- `nde-view-it`
- `nde-view-it-additional-services`
- `nde-view-it-card`
- `nde-view-it-filter`
- `nde-view-it-from-other`
- `nde-view-it-from-other-card`
- `nde-view-it-from-other-institution`
- `nde-view-it-licence`
- `nde-view-it-section`

### `nde-virtual-*` (3)

- `nde-virtual-browse`
- `nde-virtual-browse-card`
- `nde-virtual-browse-skeleton`

### Other (145)

- `nde-action-container`
- `nde-actions-bottom-sheet`
- `nde-actions-presenter`
- `nde-advanced-search`
- `nde-ai-insights-link`
- `nde-alma-d-viewer`
- `nde-app-layout`
- `nde-atoz`
- `nde-back-to-results`
- `nde-back-to-top`
- `nde-barcode-search-tab`
- `nde-base-request-form`
- `nde-blank-alma-purchase-request`
- `nde-blocks`
- `nde-book-chapters-or-reviews-item`
- `nde-bx-recommendation`
- `nde-bx-recommendations`
- `nde-cancel-request-dialog`
- `nde-captcha`
- `nde-captcha-popup`
- `nde-carousel`
- `nde-categories`
- `nde-cdl-dialog`
- `nde-cdl-timer`
- `nde-collapsible-box`
- `nde-confirm-dialog`
- `nde-controlled-vocabulary`
- `nde-copy-to-clipboard`
- `nde-cto-button`
- `nde-custom-snack-bar`
- `nde-database-home-page`
- `nde-database-search-container`
- `nde-db-journal-mobile-dialog`
- `nde-delete-deposit-dialog`
- `nde-deposit-item`
- `nde-deposits-overview`
- `nde-deposits-page`
- `nde-digital-viewer-service-container`
- `nde-dynamic-autocomplete-options`
- `nde-esploro-online-services`
- `nde-expand-collapse`
- `nde-expand-options`
- `nde-explain-lucene-query`
- `nde-failure-request`
- `nde-favoritesapp`
- `nde-featured-np-scope-bar`
- `nde-featured-results-bar`
- `nde-fetch-item`
- `nde-filter-panel-open-categories-skeleton`
- `nde-filter-panel-open-sidenav-skeleton`
- `nde-fine-item`
- `nde-fines`
- `nde-fines-overview`
- `nde-footer`
- `nde-formatted-detail`
- `nde-frbr-header`
- `nde-general-electronic-service-link`
- `nde-general-search-header`
- `nde-generic-full-display-service-list-container`
- `nde-header`
- `nde-highlight`
- `nde-highlight-the-record-you-came-from`
- `nde-holding-properties`
- `nde-home-page-showcase`
- `nde-ill-request`
- `nde-info-popup`
- `nde-info-popup-host`
- `nde-institutions-dropdown`
- `nde-isbn-match-popup`
- `nde-language-selector-container`
- `nde-language-selector-presenter`
- `nde-leganto-get-it`
- `nde-libraries-container`
- `nde-library`
- `nde-links-to-exhibition`
- `nde-loan-item`
- `nde-loans`
- `nde-loans-overview`
- `nde-locations-container`
- `nde-locations-filter`
- `nde-logo`
- `nde-may-also-be-found-at`
- `nde-mendeley-toast`
- `nde-metrics`
- `nde-mirador-viewer-popup`
- `nde-mobile-filters-toggle`
- `nde-more-from-the-same`
- `nde-natural-language-search-dialog`
- `nde-newspaper-search-container`
- `nde-newspaper-search-main-page`
- `nde-no-results`
- `nde-no-signin-available-popup`
- `nde-notification`
- `nde-offset-limit-notification`
- `nde-online-availability`
- `nde-overview-section`
- `nde-page-not-found`
- `nde-page-out-of-reach`
- `nde-paragraph-with-show-more-less-btn`
- `nde-permalink-dialog`
- `nde-person-entity`
- `nde-physical-availability-line`
- `nde-progress-spinner-dialog`
- `nde-qr-dialog`
- `nde-quick-filters`
- `nde-quick-filters-skeleton`
- `nde-rapido-links`
- `nde-reference-entry-item`
- `nde-register-confirmation-dialog`
- `nde-related-entities-search-header`
- `nde-report-a-problem`
- `nde-report-a-problem-overlay`
- `nde-resource-recommender-banner`
- `nde-resource-recommender-card`
- `nde-restricted-form-page`
- `nde-results-per-page`
- `nde-results-range`
- `nde-selected-filters`
- `nde-selected-filters-container`
- `nde-self-registration-dialog`
- `nde-self-registration-form`
- `nde-service-page`
- `nde-sign-out-button`
- `nde-similar-image-browse`
- `nde-single-link-to-exhibition`
- `nde-skeleton-shimmer`
- `nde-skeleton-skeleton`
- `nde-skip-links`
- `nde-sort-by`
- `nde-source-record`
- `nde-standalone-deposit-layout`
- `nde-status-badge`
- `nde-su-recommendations`
- `nde-success-request`
- `nde-syndetics-unbound`
- `nde-tabs-and-scopes-dropdown`
- `nde-tags-operation-chips`
- `nde-tags-panel`
- `nde-timeout-dialog`
- `nde-top-bar`
- `nde-union-view-login-form`
- `nde-unsaved-changes-dialog`
- `nde-update-login-credentials`
- `nde-voice-search-button`
- `nde-voice-search-dialog`

## Regenerating the list

Run [extract-nde-selectors.py](extract-nde-selectors.py) after a Primo release, or to check another environment. It needs only Python 3, with no extra packages, and it doesn't need the dev server:

```bash
# UA sandbox, view 01UA_INST:ndeDev (default)
python3 docs/extract-nde-selectors.py

# Another server and view
python3 docs/extract-nde-selectors.py https://arizona-ua.primo.exlibrisgroup.com 01UA_INST:ndeDev
```

It downloads the NDE code bundles from the server and prints the grouped list as Markdown. Replace the list in **All hookable selectors** above with the output, and update the date.

How it decides what's hookable: it finds every Angular component whose selector starts with `nde-` and that carries NDE's customization host directive. That directive creates the `-before` / `-after` / `-top` / `-bottom` slots.
