import subprocess
import time
import schedule

def run_jupyter_notebook():
    subprocess.run(["docker-compose", "run", "--rm", "jupyter"])
    print("Jupyter notebook executed successfully.")

def job():
    run_jupyter_notebook()
    print("Job completed.")

# Run the job immediately when the script starts
job()

# Schedule the job to run every 24 hours
schedule.every(24).hours.do(job)

while True:
    schedule.run_pending()
    time.sleep(1)
