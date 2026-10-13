#!/usr/bin/env python3
"""Serve the CSE451 study site on this machine.

Usage:  python3 serve.py            (opens http://127.0.0.1:4510 in your browser)
        python3 serve.py --no-open  (just serve)
        python3 serve.py --port 8080

Pages are sent with no-cache headers, so any edit to a file shows on the next reload.
Stop with Ctrl+C.
"""
import argparse
import functools
import http.server
import os
import socket
import threading
import webbrowser

ROOT = os.path.dirname(os.path.abspath(__file__))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):  # keep the terminal quiet
        pass


def free_port(start):
    for port in range(start, start + 20):
        with socket.socket() as s:
            if s.connect_ex(("127.0.0.1", port)) != 0:
                return port
    raise SystemExit("No free port found near %d" % start)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--port", type=int, default=4510)
    ap.add_argument("--no-open", action="store_true")
    args = ap.parse_args()

    # Already running? Then just open it.
    try:
        import urllib.request
        with urllib.request.urlopen("http://127.0.0.1:%d/index.html" % args.port, timeout=1) as r:
            if b"CSE451" in r.read(4000):
                url = "http://127.0.0.1:%d/" % args.port
                print("Already running at %s" % url)
                if not args.no_open:
                    webbrowser.open(url)
                return
    except OSError:
        pass

    port = free_port(args.port)
    handler = functools.partial(NoCacheHandler, directory=ROOT)
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    url = "http://127.0.0.1:%d/" % port
    print("CSE451 study site running at %s  (Ctrl+C to stop)" % url)
    if not args.no_open:
        threading.Timer(0.4, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
