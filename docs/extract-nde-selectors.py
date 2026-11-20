#!/usr/bin/env python3
"""
List every hookable NDE component selector in a Primo NDE environment.

Downloads the NDE app bundles (main + all lazy-loaded chunks) from a Primo
server and finds Angular components whose selector starts with "nde-" and that
carry NDE's customization host directive (the thing that creates the
-before / -after / -top / -bottom slots).

Prints a Markdown list grouped by the selector's first word, ready to paste
into docs/nde-selectors.md.

Usage:
    python3 docs/extract-nde-selectors.py                 # UA sandbox, ndeDev
    python3 docs/extract-nde-selectors.py https://arizona-ua.primo.exlibrisgroup.com 01UA_INST:ndeDev
"""
import collections
import re
import sys
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "https://arizona-ua-psb.primo.exlibrisgroup.com"
VID = sys.argv[2] if len(sys.argv) > 2 else "01UA_INST:ndeDev"
NDE = BASE.rstrip("/") + "/nde"
SKIP_CHUNKS = ("test-tools",)  # Ex Libris internal QA components, not in the live UI
MIN_GROUP = 3  # groups smaller than this are folded into "Other"


def get(url):
    with urllib.request.urlopen(url) as r:
        return r.read().decode("utf-8", "replace")


def main():
    index = get(f"{NDE}/home?vid={VID}")
    main_js_name = re.search(r"main\.[a-f0-9]+\.js", index).group(0)
    main_js = get(f"{NDE}/{main_js_name}")

    chunk_map = re.search(r'__webpack_require__\.u=\w+=>\w+\+"\."\+\{(.*?)\}\[\w+\]', main_js).group(1)
    chunks = [f"{k}.{v}.js" for k, v in re.findall(r'"?([\w-]+)"?:"([a-f0-9]+)"', chunk_map)]

    hookable = set()
    for chunk in chunks:
        if chunk.startswith(SKIP_CHUNKS):
            continue
        src = get(f"{NDE}/{chunk}")
        for m in re.finditer(r'selectors:\[\["(nde-[a-z0-9-]+)"', src):
            head = src[m.start():m.start() + 1500]
            head = head.split("template:", 1)[0]
            if "HostDirectivesFeature" in head:
                hookable.add(m.group(1))

    groups = collections.defaultdict(list)
    for sel in sorted(hookable):
        groups[sel.split("-")[1]].append(sel)
    other = sorted(s for g in groups.values() if len(g) < MIN_GROUP for s in g)
    big = {k: v for k, v in groups.items() if len(v) >= MIN_GROUP}

    print(f"<!-- {len(hookable)} hookable selectors from {BASE} ({main_js_name}) -->\n")
    for key in sorted(big):
        print(f"### `nde-{key}-*` ({len(big[key])})\n")
        print("\n".join(f"- `{s}`" for s in big[key]) + "\n")
    print(f"### Other ({len(other)})\n")
    print("\n".join(f"- `{s}`" for s in other))


if __name__ == "__main__":
    main()
