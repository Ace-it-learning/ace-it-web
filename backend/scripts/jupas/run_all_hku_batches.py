"""Re-seed all HKU programme batches (skips manually verified codes)."""
import subprocess
import sys

BATCHES = [
    "socsci",
    "medicine",
    "law",
    "business",
    "engineering",
    "science",
    "arts_arch",
    "misc",
]

if __name__ == "__main__":
    root = __file__.replace("\\", "/").rsplit("/", 2)[0]
    builder = f"{root}/jupas/hku_seed_builder.py"
    subprocess.run([sys.executable, f"{root}/jupas/extract_hku_pdf_scores.py"], check=True)
    for batch in BATCHES:
        subprocess.run([sys.executable, builder, "--batch", batch], check=True)
    print("[run_all_hku_batches] Complete")
