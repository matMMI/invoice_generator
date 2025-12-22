import psycopg2
import os

def get_db_url():
    try:
        with open("api/.env") as f:
            for line in f:
                if line.startswith("DATABASE_URL="):
                    return line.strip().split("=", 1)[1]
    except Exception:
        pass
    return os.environ.get("DATABASE_URL")

url = get_db_url()
if not url:
    print("DATABASE_URL not found")
    exit(1)

print(f"Connecting to {url}")
conn = psycopg2.connect(url)
cur = conn.cursor()
types = ["currency", "quotestatus", "discounttype"]
for t in types:
    print(f"Dropping type {t}...")
    cur.execute(f"DROP TYPE IF EXISTS {t} CASCADE;")
conn.commit()
conn.close()
print("Done.")
