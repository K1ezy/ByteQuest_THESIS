import os
import sys
import time
import webbrowser
import subprocess

def main():
    print("=" * 65)
    print("  🚀 Starting ByteQuest Full-Stack Educational Platform")
    print("=" * 65)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)

    # 1. Seed database if not initialized
    db_file = os.path.join(base_dir, "bytequest.db")
    print("\n[1/3] Checking SQLite database and telemetry baseline...")
    try:
        from backend.seed_data import seed_database
        seed_database()
        print("  ✓ Database verified and seeded successfully.")
    except Exception as e:
        print(f"  ⚠ Warning during database check: {e}")

    # 2. Check frontend build
    dist_dir = os.path.join(base_dir, "frontend", "dist")
    print("\n[2/3] Checking frontend production bundle...")
    if not os.path.exists(dist_dir) or not os.path.exists(os.path.join(dist_dir, "index.html")):
        print("  Building frontend bundle via npm run build...")
        frontend_dir = os.path.join(base_dir, "frontend")
        proc = subprocess.run(["npm.cmd" if os.name == "nt" else "npm", "run", "build"], cwd=frontend_dir)
        if proc.returncode != 0:
            print("  ⚠ Frontend build failed. Will serve API only.")
        else:
            print("  ✓ Frontend bundle generated.")
    else:
        print("  ✓ Production frontend bundle is ready.")

    # 3. Launch application server
    url = "http://localhost:8000"
    print(f"\n[3/3] Launching ByteQuest Server at {url} ...")
    print("  • Web Application: " + url)
    print("  • Interactive API Docs: " + url + "/docs")
    print("  • Press Ctrl+C in this terminal to shut down.\n")

    # Open web browser after a brief delay
    def open_browser():
        time.sleep(1.5)
        webbrowser.open(url)

    import threading
    threading.Thread(target=open_browser, daemon=True).start()

    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)

if __name__ == "__main__":
    main()
