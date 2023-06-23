## SkinBot

SkinBot is a Selenium bot that can be used to find skins with the cheapest price within a specified range of float values on Steam Market for CS:GO.

**ATTENTION**: This bot is a helpful tool to be used for automating the process of buying skins on Steam Market. I do not take any responsibility for any damage caused by using this bot.

### Installation

1. Clone the repo
   ```sh
   git clone <repo>
   ```
2. Install Python packages (preferably in a virtual environment)
   ```sh
   pip install -r requirements.txt
    ```

### Usage

Run the bot
   ```sh
   python main.py -p <path> -t <time> -l <link> -q <limit> -a <auto> -b <buy>
   ``` 

Here's the bot arguments:
- `-p` or `--path`: path to target.json file (default: `target.json`)
- `-t` or `--time`: wait time to avoid 'Too many requests' error from Steam (default: `20`)
- `-l` or `--link`: the link of the skin on Steam Market (default: `AUG | Snake Pit`)
- `-q` or `--limit`: page limit to check (default: `100`)
- `-a` or `--auto`: auto mode, the bot will automatically buy the skin if conditions are met (default: `False`)
- `-b` or `--buy`: buy mode (it will buy the skins that bot already found). You also have to specify the link! (default: `False`)

**NOTE**: You can also use `--help` to see the list of arguments.
### License
MIT
   