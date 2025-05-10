# Setting Up

## Clone this repo

``` bash
git clone git@github.com:devsanthoshmk/pos-for-teashop.git
cd pos-for-teashop

```

## Create virtual Envronment

``` bash
python -m venv venv
```

## Activate venv

#### Command Prompt
``` cmd
\\venv\\Scripts\\activate.bat
```
#### PowerShell
``` PowerShell
\\venv\\Scripts\\Activate.ps1
```
#### Bash
``` bash
source venv/bin/activate
```

## Installing Libraries

``` bash
pip install -r requirements.txt
```

# Usage Guide
``` bash
python main.py
```


# To Re-bundle Again(mostly for other os than windows)

## Activate venv [refer](#activate-venv)

## Install pyinstaller

``` bash
pip install pyinstaller
pip install pillow #for using .png as icon
```

## Bundle eel with pyinstaller

``` bash
python -m eel main.py web --add-data "data:data" --onefile --noconsole --icon=bill.png
```

  That will works as is i modified built-in open function to make it work in python binary

## Inno Setup

  Install Inno setup from [here](https://jrsoftware.org/isinfo.php) and open setup.iss in that

  Run it by hitting F9 the setup will be available in output folder