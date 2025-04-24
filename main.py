import eel

# Set web folder
eel.init("web")


@eel.expose
def say_hello_py(name):
    return name * 2


# Start the app with an HTML file
eel.start(
    "index.html",
    mode="default",
    cmdline_args=["--app", "--start-fullscreen", "--browser-startup-dialog"],
)
