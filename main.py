import eel
import csv

# Set web folder
eel.init("web")


@eel.expose
def getInventory():
    file_path = "data/inventory.csv"
    data = []
    with open(file_path, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            data.append(row)
    return data

@eel.expose
def setInventory(data):
    file_path = "data/sales.csv"
    try:
        with open(file_path, mode="w", encoding="utf-8", newline="") as file:
            fieldnames = data[0].keys()
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
        return True
    except Exception as e:
        print(f"Error writing to file: {e}")
        return f"Error writing to file: {e}"

# Start the app with an HTML file
eel.start(
    "index.html",
    mode="default",
    cmdline_args=["--app", "--start-fullscreen", "--browser-startup-dialog"],
)
