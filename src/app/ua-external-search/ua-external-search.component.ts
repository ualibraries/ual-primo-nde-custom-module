import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { SHELL_ROUTER } from '../injection-tokens';
import { AssetsPublicPathDirective } from '../services/assets-public-path.directive';

/**
 * UA External Search
 * Shows "Search elsewhere" links that re-run the current Primo search in
 * Google Scholar and WorldCat. Rebuild of the classic-UI externalSearch
 * facet (01UA_INST-01UA custom.js).
 *
 * Hook: 'nde-search-filters-side-nav-top' - inside the filters panel, above the
 *   first filter group. Use '-bottom' instead to put it after the last group.
 *   (-before / -after would place it outside the panel.)
 *
 * Where the search comes from: the page URL's `query` parameter.
 *   Basic search:    ?query=climate change
 *                or  ?query=any,contains,climate change
 *   Advanced search: ?mode=advanced&query=title,contains,water,AND;creator,contains,smith,AND
 * The component re-reads it after every in-app navigation, so the links
 * stay current when someone runs a new search.
 */

interface SearchTarget {
  name: string;
  /** Base URL; the encoded search terms are appended to the end. */
  url: string;
  /** Optional logo in assets/images (21x21 is a good size). */
  logo?: string;
}

/** Edit this list to add, remove or reorder targets. */
const TARGETS: SearchTarget[] = [
  {
    name: 'Google Scholar',
    // inst= adds UA "Find It" links to Scholar results
    url: 'https://scholar.google.com/scholar?inst=420512584797975801&q=',
    logo: 'assets/images/logo-googlescholar.png',
  },
  {
    name: 'WorldCat',
    url: 'https://universityofarizona.on.worldcat.org/search?queryString=',
    logo: 'assets/images/logo-worldcat.png',
  },
];

const FIELD_QUERY = /^[a-z_]+,(contains|exact|begins_with),/i;
const TRAILING_OPERATOR = /,(AND|OR|NOT)$/i;

/** Turns Primo's `query` URL parameter into plain search words. Exported for testing. */
export function extractSearchTerms(query: string | null | undefined, mode?: string | null): string {
  if (!query) return '';
  const isStructured = mode === 'advanced' || FIELD_QUERY.test(query);
  if (!isStructured) return query.trim();

  return query
    .split(';')
    .map(segment => {
      const parts = segment.split(',');
      if (parts.length < 3) return '';
      // parts[0] = field, parts[1] = operator, the rest is the term
      // (re-joined because the term itself can contain commas)
      return parts.slice(2).join(',').replace(TRAILING_OPERATOR, '').trim();
    })
    .filter(Boolean)
    .join(' ');
}

@Component({
  selector: 'ua-external-search',
  standalone: true,
  imports: [CommonModule, AssetsPublicPathDirective],
  templateUrl: './ua-external-search.component.html',
  styleUrls: ['./ua-external-search.component.scss'],
})
export class UaExternalSearchComponent implements OnInit, OnDestroy {
  private router = inject(SHELL_ROUTER);
  private sub?: Subscription;

  readonly targets = TARGETS;
  readonly terms = signal('');
  /** Open by default, like the classic facet (facetGroupCollapsed: false). */
  readonly expanded = signal(true);
  readonly links = computed(() => {
    const encoded = encodeURIComponent(this.terms());
    return this.targets.map(t => ({ ...t, href: t.url + encoded }));
  });

  ngOnInit(): void {
    this.readSearch();
    this.sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.readSearch());
  }

  toggle(): void {
    this.expanded.update(v => !v);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private readSearch(): void {
    const params = new URLSearchParams(window.location.search);
    this.terms.set(extractSearchTerms(params.get('query'), params.get('mode')));
  }
}
