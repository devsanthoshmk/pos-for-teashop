import eel
import csv
import json
import os
import platform
import subprocess
import io

inventory_path = "data/inventory.csv"
settings_path = "data/settings.json"


# Set web folder
eel.init("web")


@eel.expose
def serve(html, web="True"):
    web = "data/" if web == "False" else "web/"
    with open(
        f"{web}{html}" + (".html" if web == "web/" else ""), "r", encoding="utf-8"
    ) as f:
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
                "CostomerName",
                "CostomerPhone",
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


@eel.expose
def getSettings():
    with open(settings_path, mode="r", encoding="utf-8") as file:
        settings = json.load(file)
    return settings


@eel.expose
def openData(file):
    file_path = "data/inventory.csv" if file == "inventory" else "data/sales.csv"
    if platform.system() == "Windows":
        os.startfile(file_path)
    elif platform.system() == "Darwin":  # macOS
        subprocess.Popen(["open", file_path])
    else:  # Linux and others
        subprocess.Popen(["xdg-open", file_path])


@eel.expose
def process_csv(which, file_contents, isnew):
    # only allow inventory or sales
    if which not in ("inventory", "sales"):
        return {"status": "error", "message": f"Unknown type {which}"}

    os.makedirs("data", exist_ok=True)
    target = f"data/{which}.csv"

    # brand-new file: overwrite
    if isnew == "True":
        with open(target, "w", encoding="utf-8", newline="") as f:
            f.write(file_contents)
        return {"status": "created"}

    # otherwise we append
    # 1. parse incoming
    buffer = io.StringIO(file_contents)
    incoming = csv.reader(buffer)
    try:
        header_in = next(incoming)
    except StopIteration:
        return {"status": "error", "message": "Empty CSV upload"}

    # 2. read existing header
    if not os.path.exists(target):
        return {"status": "error", "message": f"{which}.csv does not exist"}
    with open(target, "r", encoding="utf-8", newline="") as f_read:
        existing = csv.reader(f_read)
        try:
            header_ex = next(existing)
        except StopIteration:
            return {"status": "error", "message": f"{which}.csv is empty"}

    # 3. compare
    if header_in != header_ex:
        return {"status": "error", "message": "Header mismatch"}

    # 4. append only data rows
    with open(target, "a", encoding="utf-8", newline="") as f_append:
        writer = csv.writer(f_append)
        rows_appended = 0
        for row in incoming:
            writer.writerow(row)
            rows_appended += 1

    return {"status": "appended", "rows": rows_appended}


@eel.expose
def setSettings(settings):
    with open(settings_path, mode="w", encoding="utf-8") as file:
        json.dump(settings, file)


# Start the app with an HTML file
eel.start(
    "index.html",
    mode="default",
    cmdline_args=["--app", "--start-fullscreen", "--browser-startup-dialog"],
    port=1234,
)
