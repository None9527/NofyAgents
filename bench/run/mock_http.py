#!/usr/bin/env python3
"""Mock OpenAI-compatible endpoint for U10 error-path tests.
Usage: mock_http.py <garbage|rate429> <port>
  garbage  — 200 + non-JSON body (model returns garbage)
  rate429  — 429 + rate-limit JSON (quota exhausted)
"""
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

mode = sys.argv[1]
port = int(sys.argv[2])


class H(BaseHTTPRequestHandler):
    def do_POST(self):
        ln = int(self.headers.get("content-length", 0))
        self.rfile.read(ln)
        if mode == "garbage":
            body = b"THIS_IS_NOT_JSON{{{"
            code = 200
        else:
            body = b'{"error":{"message":"rate limit exceeded","code":"rate_limit_exceeded"}}'
            code = 429
        self.send_response(code)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *a):
        pass


HTTPServer(("127.0.0.1", port), H).serve_forever()
