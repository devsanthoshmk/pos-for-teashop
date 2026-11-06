# Tea shop POS and cafe billing software for small business point of sale

A local desktop application to process counter orders, track stock counts, print receipts, and analyze sales revenue.

This tea shop POS is a desktop cafe billing software and small business point of sale system for daily counter operations. The software runs locally on the checkout computer and stores data in standard CSV and JSON files, so it functions without an internet connection or external database server.

Cashiers can search product names, add line items to an active bill, adjust item quantities, and print thermal receipts. The application updates inventory counts on checkout, calculates optional itemized or flat tax rates, and displays sales statistics across daily, weekly, and monthly periods.

## Architecture

The system combines a Python backend with a local web interface using Eel.

- **Backend runtime**: Python 3 with Bottle and Gevent WebSocket servers via Eel 0.18.1.
- **Frontend interface**: Single-page application using HTML5, CSS3, modern JavaScript DOM APIs, and Chart.js 3.9.1.
- **Communication bridge**: Eel WebSocket RPC exposing Python functions to JavaScript and browser functions to Python.
- **Data storage**: Flat files in the `data/` directory.
  - `data/inventory.csv`: Product records with columns `name`, `availability` (`yes`, `no`, or an integer stock count), `price`, and `tax`.
  - `data/sales.csv`: Historical transaction rows with 10 columns: `id`, `date`, `time`, `item`, `quantity`, `price`, `total`, `subtotal`, `tax`, and `grandtotal`.
  - `data/settings.json`: Configuration object storing base tax rate, per-item tax toggle, and file paths.
- **Packaging**: PyInstaller bundles the Python runtime and web assets into a single binary, and Inno Setup creates the Windows installer.

## Setup

### Prerequisites

- Python 3.10 or higher
- pip package installer
- Chromium, Google Chrome, or a modern system browser

### Installation

Clone the repository:

```bash
git clone git@github.com:devsanthoshmk/pos-for-teashop.git
cd pos-for-teashop
```

Create and activate a virtual environment:

On Linux or macOS:

```bash
python3 -m venv venv
source venv/bin/activate
```

On Windows Command Prompt:

```cmd
python -m venv venv
venv\Scripts\activate.bat
```

On Windows PowerShell:

```powershell
python -m venv venv
venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

## Usage

### Run development mode

Start the application:

```bash
python main.py
```

The script initializes Eel, exposes backend methods, and opens a maximized browser window pointing to `web/index.html`.

### Interface sections

1. **Point of sale**: Select items from the product grid or type to filter items instantly in the search bar. Adjust quantities in the active bill table. Print receipts by selecting the print button, which triggers the system print dialog and deducts stock counts in `data/inventory.csv`.
2. **Inventory manager**: Edit item names, availability, prices, and tax rates directly in table cells. Enter an exact stock count or use `yes` and `no`. Add rows with the Add New Item button or delete unwanted items. Press `Ctrl+S` or click Save to write changes to `data/inventory.csv`.
3. **Analytics dashboard**: Review daily, weekly, and monthly average sales metrics. Filter the sales trend line chart by day, week, or month. Inspect the doughnut chart for best-selling items, review individual product revenue percentages, and export sales records to CSV.
4. **Settings**: Adjust the base tax rate, toggle per-item tax calculations, view file paths, download current CSV files, or upload replacement or supplemental CSV datasets.

### Build a Windows installer

Install packaging dependencies:

```bash
pip install pyinstaller pillow
```

Build the single-file executable:

```bash
python -m eel main.py web --add-data "data:data" --onefile --noconsole --icon=bill.png
```

Compile the Windows installer:

1. Open `setup.iss` in the Inno Setup compiler.
2. Press `F9` to compile the setup package.
3. Find the compiled installer inside the `Output` directory.

## Configuration

All application settings persist in `data/settings.json`. The file contains four keys:

- `base_tax`: Numeric tax rate applied to the bill subtotal when per-item tax is disabled. Default is `0`.
- `tax_on_every`: Boolean flag. When `true`, the system applies the tax rate defined per item in `data/inventory.csv` and displays the tax column in the inventory interface. When `false`, the system uses `base_tax`.
- `inventory_direct`: Path to the inventory CSV file (`/data/inventory.csv`).
- `sales_direct`: Path to the sales CSV file (`/data/sales.csv`).

Users can edit these parameters in `data/settings.json` directly or update them through the Settings view in the application.
