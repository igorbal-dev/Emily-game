#!/usr/bin/env python3
"""Downloads only some files from a big remote zip (HTTP Range). Used by setup_godot.sh."""
import io, sys, zipfile, urllib.request
class HttpFile(io.RawIOBase):
    def __init__(s, url):
        s.url = urllib.request.urlopen(urllib.request.Request(url, method="HEAD")).geturl()
        s.size = int(urllib.request.urlopen(urllib.request.Request(s.url, method="HEAD")).headers["Content-Length"]); s.pos = 0
    def seekable(s): return True
    def readable(s): return True
    def tell(s): return s.pos
    def seek(s, o, w=0):
        s.pos = o if w == 0 else (s.pos + o if w == 1 else s.size + o); return s.pos
    def read(s, n=-1):
        if n < 0: n = s.size - s.pos
        if n == 0 or s.pos >= s.size: return b""
        end = min(s.size, s.pos + n) - 1
        r = urllib.request.urlopen(urllib.request.Request(s.url, headers={"Range": f"bytes={s.pos}-{end}"})).read()
        s.pos += len(r); return r
    def readinto(s, b):
        d = s.read(len(b)); b[:len(d)] = d; return len(d)
url, out = sys.argv[1], sys.argv[2]
z = zipfile.ZipFile(io.BufferedReader(HttpFile(url), buffer_size=1 << 20))
names = [n for n in z.namelist() if "web" in n or n.endswith("version.txt")]
print(names)
for n in names:
    if n.endswith("web_nothreads_release.zip") or n.endswith("web_nothreads_debug.zip") or n.endswith("version.txt"):
        z.extract(n, out); print("got", n)
