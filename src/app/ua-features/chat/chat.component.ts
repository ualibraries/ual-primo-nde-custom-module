import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// =====================================================================
// Configuration
// =====================================================================
// This block is the seam for eventual add-on extraction: replace with
// MODULE_PARAMETERS injection when shipping as an Alma add-on.
// Everything below moves unchanged.

const CONFIG = {

  // --- Chat service --------------------------------------------------
  // Full URL of the chat page to embed in the drawer (e.g. a LibChat
  // or LibraryH3lp standalone chat URL). We embed it as a direct
  // iframe rather than through the vendor's widget script so the chat
  // can be sized to fill our drawer.
  //
  // Leave empty to hide the widget entirely.
  // TODO: set to the UA Libraries "Ask Us" chat URL.
  chatUrl: '',

  // --- UI ------------------------------------------------------------
  triggerLabel: 'Ask Us',

};

// =====================================================================
// Component
// =====================================================================

@Component({
  selector: 'nde-user-area-after',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly enabled = Boolean(CONFIG.chatUrl);

  // Drawer state.
  isOpen = false;

  // The iframe is created on first open and persists across subsequent
  // closes, so chat history survives close/reopen.
  hasLoaded = false;

  readonly triggerLabel = CONFIG.triggerLabel;

  // Used to portal the custom-element host to <body> after view init
  // (see ngAfterViewInit) so the chat escapes NDE shell stacking
  // contexts.
  private readonly elementRef = inject(ElementRef);

  // Bypass Angular's RESOURCE_URL sanitization for the iframe src: our
  // chat URL is a hardcoded constant from CONFIG, not user input.
  private readonly sanitizer = inject(DomSanitizer);
  readonly chatUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(CONFIG.chatUrl);

  // Arrow form so `this` binds correctly and so add/remove see the
  // same function reference.
  private readonly onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.isOpen) this.close();
  };

  // The iframe isn't mounted yet — that waits for the user's first
  // interaction with the tab, so we don't make a third-party request
  // on every page load.
  ngOnInit(): void {
    if (this.enabled) document.addEventListener('keydown', this.onKeyDown);
  }

  // Moves the custom-element host to <body> so the chat panel escapes
  // any stacking contexts created by NDE shell wrappers (transform,
  // filter, etc.) between our mount point and the document root.
  // Without this, our `z-index` would be trapped inside the nearest
  // stacking-context-creating ancestor. Same trick Angular CDK's
  // Overlay uses.
  ngAfterViewInit(): void {
    if (this.enabled) document.body.appendChild(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  toggle(): void { this.isOpen ? this.close() : this.open(); }
  open(): void   { this.hasLoaded = true; this.isOpen = true; }
  close(): void  { this.isOpen = false; }
}
