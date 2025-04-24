import eel
import csv

# Set web folder
eel.init("web")


@eel.expose
def say_hello_py(name):
    return name * 2

@eel.expose
def inventory():
    file_path = "data/inventory.csv"
    data = []
    with open(file_path, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            data.append(row)
    return data

# Start the app with an HTML file
eel.start(
    "index.html",
    mode="default",
    cmdline_args=["--app", "--start-fullscreen", "--browser-startup-dialog"],
)
