import http.server
import socketserver

PORT = 8000
HANDLER = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), HANDLER) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    httpd.serve_forever()