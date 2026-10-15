import sys
import psycopg2

sys.stdout.reconfigure(encoding="utf-8")
conn = psycopg2.connect('postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital')
cur = conn.cursor()
cur.execute('SELECT id, name, "shareCapital", "totalDeposit", "totalLoanOutstanding", "liquidityRatio", "nplRatio" FROM cooperatives')
for r in cur.fetchall():
    print(r)
cur.close()
conn.close()
