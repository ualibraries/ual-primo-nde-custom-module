import { TryMySearchComponent } from '../ua-features/try-my-search/try-my-search.component';
import { ChatComponent } from '../ua-features/chat/chat.component';

// Maps NDE extension-point selectors (`nde-{component}-{position}`) to
// the component rendered there. See `src/app/ua-features/README.md`.
export const selectorComponentMap = new Map<string, any>([
  ['nde-search-results-after', TryMySearchComponent],
  ['nde-user-area-after',      ChatComponent],
]);
