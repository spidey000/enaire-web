#!/usr/bin/env python3
"""
Servidor HTTP simple para ENAIRE Web
Usa este script si npm no está funcionando correctamente
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

PORT = 3000
DIRECTORY = Path(__file__).parent

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def start_server():
    os.chdir(DIRECTORY)

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"╔════════════════════════════════════════╗")
        print(f"║   ENAIRE Web - Servidor HTTP Python   ║")
        print(f"╠════════════════════════════════════════╣")
        print(f"║  Servidor corriendo en:               ║")
        print(f"║  http://localhost:{PORT}                ║")
        print(f"╠════════════════════════════════════════╣")
        print(f"║  Presiona Ctrl+C para detener         ║")
        print(f"╚════════════════════════════════════════╝")
        print()

        # Abrir navegador automáticamente
        try:
            webbrowser.open(f'http://localhost:{PORT}')
        except:
            pass

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServidor detenido.")

if __name__ == "__main__":
    start_server()
