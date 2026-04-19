#!/usr/bin/env python3
"""
Development server startup script
"""
import sys
import os

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import uvicorn

if __name__ == "__main__":
    print("Starting Jalyuzi API...")
    print("URL: http://localhost:8000")
    print("Docs: http://localhost:8000/docs")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
