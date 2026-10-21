import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { SHELL_ROUTER } from '../injection-tokens';
import { UaExternalSearchComponent } from './ua-external-search.component';

describe('UaExternalSearchComponent', () => {
  beforeEach(() => {
    history.replaceState(null, '', '/nde/search?query=any,contains,climate%20change&vid=01UA_INST:DaricusNDE');
    TestBed.configureTestingModule({
      imports: [UaExternalSearchComponent],
      providers: [{ provide: SHELL_ROUTER, useValue: { events: new Subject() } }],
    });
  });

  it('renders clickable links with real hrefs', () => {
    const fixture = TestBed.createComponent(UaExternalSearchComponent);
    fixture.detectChanges();
    const anchors: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('a'));
    const hrefs = anchors.map(a => a.getAttribute('href'));
    console.log('HREFS=' + JSON.stringify(hrefs));
    expect(anchors.length).toBe(2);
    expect(hrefs[0]).toContain('scholar.google.com/scholar?inst=420512584797975801&q=climate%20change');
    expect(hrefs[1]).toContain('universityofarizona.on.worldcat.org/search?queryString=climate%20change');
  });

  it('toggle collapses the list', () => {
    const fixture = TestBed.createComponent(UaExternalSearchComponent);
    fixture.detectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    btn.click(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ul').hidden).toBeTrue();
  });
});
