import eel
import csv
import os

# Set web folder
eel.init("web")
with open("web/pos.html", "r") as f:
    content = f.read()
    print(content)


@eel.expose
def serve_pos():
    with open("web/pos.html", "r") as f:
        content = f.read()
        return content


@eel.expose
def serve_dashboard():
    with open("web/dashboard.html", "r") as f:
        content = f.read()
        return content


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
def getSales():
    file_path = "data/sales.csv"
    data = []
    with open(file_path, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            data.append(row)
    return data


@eel.expose
def addSales(data):
    file_path = "data/sales.csv"
    try:
        write_header = not os.path.exists(file_path) or os.path.getsize(file_path) == 0
        with open(file_path, mode="a", encoding="utf-8", newline="") as file:
            fieldnames = data[0].keys()
            fieldnames = [
                "id",
                "date",
                "time",
                "item",
                "quantity",
                "price",
                "total",
                "subtotal",
                "tax",
                "grandtotal",
            ]
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            if write_header:
                writer.writeheader()
            writer.writerows(data)
        return True
    except Exception as e:
        print(f"Error writing to file: {e}")
        return f"Error writing to file: {e}"


@eel.expose
def setInventory(data):
    file_path = "data/inventory.csv"
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
    port=1234,
)
