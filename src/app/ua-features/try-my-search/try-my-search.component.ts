import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { SHELL_ROUTER } from '../../injection-tokens';
import { AssetBaseService } from '../../services/asset-base.service';
import {
  parsePrimoQuery,
  spaceToPlus,
  PrimoQuery,
  PrimoClause,
} from '../_shared/primo-query';

// =====================================================================
// Configuration
// =====================================================================
// All institutional values and field mappings live in this one object,
// which forms the seam for eventual add-on extraction. When shipping
// as an Alma add-on, CONFIG gets replaced by MODULE_PARAMETERS
// injection — everything below moves to the add-on unchanged.

const CONFIG = {

  // --- Which systems to show -----------------------------------------
  // Flip a key to `false` to hide that link without removing the
  // integration. To add a new system, register an id here and a
  // matching entry in SYSTEMS below.
  enabled: {
    googleScholar: true,
    worldcat: true,
    hathitrust: true,
    jstor: true,
    internetArchive: true,
    pubmed: true,
    wikipedia: true,
  },

  // --- WorldCat ------------------------------------------------------
  // Uses `prefix:value` index tags separated by spaces; multiple
  // clauses are implicitly AND-ed. We encode with `%20` rather than `+`
  // because WorldCat treats `+` as a literal. Explicit AND/OR/NOT are
  // not emitted — WorldCat's tokenizer is case-insensitive about
  // operators, which collides with terms containing "not" or "and".
  // Field prefixes: ti=Title, au=Author, su=Subject, kw=Keyword,
  // bn=ISBN, in=ISSN.
  worldcat: {
    base: 'https://search.worldcat.org/search?q=',
    fieldPrefix: {
      title:    'ti:',
      addtitle: 'ti:',
      alttitle: 'ti:',
      creator:  'au:',
      sub:      'su:',
      isbn:     'bn:',
      issn:     'in:',
    } as Record<string, string>,
  },

  // --- Google Scholar ------------------------------------------------
  // Scholar has no field syntax — every clause becomes a parenthesized
  // keyword group, joined with the user's chosen conjunctions. Add
  // `&inst=<id>` to the base to enable "Find it @ UA" library links.
  googleScholar: {
    base: 'https://scholar.google.com/scholar?hl=en&q=',
  },

  // --- Keyword-only systems ------------------------------------------
  // These accept a bare keyword query (no field syntax); advanced
  // searches collapse to keywords via convertToKeywords.
  hathitrust:      { base: 'https://catalog.hathitrust.org/Search/Home?type=all&lookfor=' },
  jstor:           { base: 'https://www.jstor.org/action/doBasicSearch?Query=' },
  internetArchive: { base: 'https://archive.org/search?query=' },
  pubmed:          { base: 'https://pubmed.ncbi.nlm.nih.gov/?term=' },
  wikipedia:       { base: 'https://en.wikipedia.org/wiki/Special:Search?search=' },

  // --- Primo NDE query parsing ---------------------------------------
  // Facet fields (`facet_*`) are always dropped. `extraFilterFields`
  // covers UI-applied refinements that show up as bare clauses but
  // narrow results rather than express search intent, so third-party
  // systems can't usefully consume them.
  //
  // Reference: https://developers.exlibrisgroup.com/primo/apis/deeplinks/brief/
  primo: {
    extraFilterFields: new Set([
      'lang',       // Language refinement
      'rtype',      // Resource type
      'fmt',        // Format
      'rectype',    // Record type
      'pnxtype',    // PNX type
      'cdate',      // Creation date
      'dr_s',       // NDE: date range start
      'dr_e',       // NDE: date range end
      'user_tags',  // NDE: My Tags
      'ftext',      // Full-text-only toggle
      'fiction',    // Fiction-only toggle
      'sid',        // Primo-internal: source ID
      'rid',        // Primo-internal: record ID
      'addsrcrid',  // Primo-internal: additional source ID
      'dlink',      // Primo-internal: download link
      'swstitle',   // Sort-only field (begins_with)
    ]),
  },

};

// =====================================================================
// External systems
// =====================================================================
// Order in this array = order links appear in the UI. `icon` is an
// optional `assets/...` path (e.g. `assets/images/external/jstor.svg`).

interface ExternalSystem {
  id: keyof typeof CONFIG.enabled;
  label: string;
  icon?: string;
  buildUrl: (query: PrimoQuery) => string;
}

const SYSTEMS: ExternalSystem[] = [
  {
    id: 'googleScholar',
    label: 'Google Scholar',
    buildUrl: q => `${CONFIG.googleScholar.base}${convertToGoogle(q)}`,
  },
  {
    id: 'worldcat',
    label: 'WorldCat',
    buildUrl: q => `${CONFIG.worldcat.base}${convertToWorldCat(q)}`,
  },
  {
    id: 'hathitrust',
    label: 'HathiTrust',
    buildUrl: q => `${CONFIG.hathitrust.base}${convertToKeywords(q)}`,
  },
  {
    id: 'jstor',
    label: 'JSTOR',
    buildUrl: q => `${CONFIG.jstor.base}${convertToKeywords(q)}`,
  },
  {
    id: 'internetArchive',
    label: 'Internet Archive',
    buildUrl: q => `${CONFIG.internetArchive.base}${convertToKeywords(q)}`,
  },
  {
    id: 'pubmed',
    label: 'PubMed',
    buildUrl: q => `${CONFIG.pubmed.base}${convertToKeywords(q)}`,
  },
  {
    id: 'wikipedia',
    label: 'Wikipedia',
    buildUrl: q => `${CONFIG.wikipedia.base}${convertToKeywords(q)}`,
  },
];

// =====================================================================
// Query translation
// =====================================================================
// A simple search becomes the bare terms. An advanced search becomes
// one system-specific segment per clause, joined together, after
// filter clauses have been stripped.

function isFilterField(field: string): boolean {
  return field.startsWith('facet_') || CONFIG.primo.extraFilterFields.has(field);
}

function searchableClauses(clauses: PrimoClause[]): PrimoClause[] {
  return clauses.filter(c => !isFilterField(c.field));
}

// Drops clauses that follow a `NOT` conjunction. Used by targets that
// can't express NOT — including the excluded clause as a positive
// term would over-restrict results.
function dropExcludedClauses(clauses: PrimoClause[]): PrimoClause[] {
  return clauses.filter((_, i, all) => i === 0 || all[i - 1].conjunction !== 'NOT');
}

// False when the user is only browsing facets, which hides the block.
function hasSearchableContent(query: PrimoQuery): boolean {
  return query.kind === 'simple' || searchableClauses(query.clauses).length > 0;
}

// Primo stores the conjunction on the clause *before* the join, so the
// last clause's conjunction is unused.
function joinClauses(clauses: PrimoClause[], toSegment: (c: PrimoClause) => string): string {
  return clauses
    .map((c, i) => i === clauses.length - 1 ? toSegment(c) : `${toSegment(c)}+${c.conjunction}+`)
    .join('');
}

function convertToWorldCat(query: PrimoQuery): string {
  if (query.kind === 'simple') return encodeURIComponent(query.terms);
  return dropExcludedClauses(searchableClauses(query.clauses))
    .map(c => `${CONFIG.worldcat.fieldPrefix[c.field] ?? 'kw:'}${encodeURIComponent(c.terms)}`)
    .join('%20');
}

function convertToGoogle(query: PrimoQuery): string {
  if (query.kind === 'simple') return spaceToPlus(query.terms);
  return joinClauses(searchableClauses(query.clauses), c => `(${spaceToPlus(c.terms)})`);
}

function keywordTerms(query: PrimoQuery): string {
  if (query.kind === 'simple') return query.terms;
  return dropExcludedClauses(searchableClauses(query.clauses))
    .map(c => c.terms)
    .join(' ');
}

function convertToKeywords(query: PrimoQuery): string {
  return encodeURIComponent(keywordTerms(query));
}

// =====================================================================
// Component
// =====================================================================

interface ExternalLink {
  label: string;
  icon: string;
  href: string;
}

@Component({
  selector: 'nde-search-results-after',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './try-my-search.component.html',
  styleUrls: ['./try-my-search.component.scss'],
})
export class TryMySearchComponent implements OnInit, OnDestroy {
  links: ExternalLink[] = [];

  private readonly router = inject(SHELL_ROUTER);
  private readonly assets = inject(AssetBaseService);
  private routerSub?: Subscription;

  // The shell navigates between searches without a full page reload,
  // so we re-derive the links on each route change.
  ngOnInit(): void {
    this.refresh();
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.refresh());
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private refresh(): void {
    const query = parsePrimoQuery(window.location.search);
    if (!query || !hasSearchableContent(query)) {
      this.links = [];
      return;
    }
    this.links = SYSTEMS
      .filter(s => CONFIG.enabled[s.id])
      .map(({ label, icon, buildUrl }) => ({
        label,
        // Resolve `assets/...` paths through the asset service so they
        // survive deployment behind a non-root base URL.
        icon: icon ? this.assets.resolveAssetUrl(icon) : '',
        href: buildUrl(query),
      }));
  }
}
