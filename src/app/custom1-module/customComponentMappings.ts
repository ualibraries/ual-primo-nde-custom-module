import { UaExternalSearchComponent } from '../ua-external-search/ua-external-search.component';

// Left side: the NDE hook (an existing NDE element name + -before / -after / -top / -bottom).
// Right side: your component. Each hook can hold one component.
export const selectorComponentMap = new Map<string, any>([
  // "External search" filter group (Google Scholar, WorldCat) inside the filters panel
  ['nde-search-filters-side-nav-top', UaExternalSearchComponent],
]);
