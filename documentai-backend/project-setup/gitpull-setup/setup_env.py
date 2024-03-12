import os
import random
import string
import subprocess
import inquirer
from colorama import Fore, Style

# Get the directory of the currently running script
script_dir = os.path.dirname(os.path.realpath(__file__))

# Change the current working directory to the script directory
os.chdir(script_dir)

PLACEHOLDER = "REPLACE_ME"
ENV_PATH = "../.env"
ENV_EXAMPLE_PATH = "./.env.example"
VENV_PATH = "../venv"
LOCAL_SETTINGS_EXAMPLE_PATH = "./local_settings.example.py"
LOCAL_SETTINGS_PATH = "../../SSDjango/SSDjango/local_settings.py"

# Database options
DATABASE_OPTIONS = {
    "SQLite (Default)": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": "db.sqlite3",
    },
    "PostgreSQL": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "mydatabase",
        "USER": "mydatabaseuser",
        "PASSWORD": "mypassword",
        "HOST": "localhost",
        "PORT": "5432",
    },
    "MySQL": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "mydatabase",
        "USER": "mydatabaseuser",
        "PASSWORD": "mypassword",
        "HOST": "localhost",
        "PORT": "3306",
    },
    "MariaDB": {
        "ENGINE": "django.db.backends.mariadb",
        "NAME": "mydatabase",
        "USER": "mydatabaseuser",
        "PASSWORD": "mypassword",
        "HOST": "localhost",
        "PORT": "3306",
    },
    "Custom": "custom",
}

# Create virtual environment if it doesn't exist
if not os.path.isdir(VENV_PATH):
    subprocess.run(["python", "-m", "venv", VENV_PATH])
    print(Fore.GREEN + "Created virtual environment." + Style.RESET_ALL)

# Create .env file if it doesn't exist
if not os.path.isfile(ENV_PATH):
    if os.path.isfile(ENV_EXAMPLE_PATH):
        with open(ENV_EXAMPLE_PATH, "r") as f:
            lines = f.readlines()

        with open(ENV_PATH, "w") as f:
            f.writelines(lines)
        print(Fore.GREEN + "Created .env file." + Style.RESET_ALL)
    else:
        print(Fore.RED + ".env.example file not found." + Style.RESET_ALL)
        exit(1)

# Create local_settings.py file if it doesn't exist
if not os.path.isfile(LOCAL_SETTINGS_PATH):
    if os.path.isfile(LOCAL_SETTINGS_EXAMPLE_PATH):
        with open(LOCAL_SETTINGS_EXAMPLE_PATH, "r") as f:
            lines = f.readlines()

        # Ask the user to select a database option
        questions = [
            inquirer.List(
                "db_option",
                message="Select a database option",
                choices=[option for option in DATABASE_OPTIONS.keys()],
            ),
        ]
        answers = inquirer.prompt(questions)
        selected_option = answers["db_option"]  # get the selected option

        # If the user selected the custom option, prompt them to enter the database settings manually
        if (
            DATABASE_OPTIONS[selected_option] == "custom"
            or DATABASE_OPTIONS[selected_option]["ENGINE"]
            != "django.db.backends.sqlite3"
        ):
            DATABASE_OPTIONS[selected_option] = {
                "ENGINE": DATABASE_OPTIONS[selected_option][
                    "ENGINE"
                ],  # keep the selected engine
                "NAME": input("Enter the database name: "),
                "USER": input("Enter the database user: "),
                "PASSWORD": input("Enter the database password: "),
                "HOST": input("Enter the database host: "),
                "PORT": input("Enter the database port: "),
            }

        # Replace the database settings in the local_settings.py file
        for i, line in enumerate(lines):
            if "DATABASES = {" in line:
                # If the database is SQLite, we don't need the user, password, host, and port
                if (
                    DATABASE_OPTIONS[selected_option]["ENGINE"]
                    == "django.db.backends.sqlite3"
                ):
                    lines[i] = (
                        f'DATABASES = {{\n    "default": {{\n        "ENGINE": "{DATABASE_OPTIONS[selected_option]["ENGINE"]}",\n        "NAME": BASE_DIR / "{DATABASE_OPTIONS[selected_option]["NAME"]}",\n    }}\n}}\n'
                    )
                else:
                    lines[i] = (
                        f'DATABASES = {{\n    "default": {{\n        "ENGINE": "{DATABASE_OPTIONS[selected_option]["ENGINE"]}",\n        "NAME": "{DATABASE_OPTIONS[selected_option]["NAME"]}",\n        "USER": "{DATABASE_OPTIONS[selected_option]["USER"]}",\n        "PASSWORD": "{DATABASE_OPTIONS[selected_option]["PASSWORD"]}",\n        "HOST": "{DATABASE_OPTIONS[selected_option]["HOST"]}",\n        "PORT": "{DATABASE_OPTIONS[selected_option]["PORT"]}",\n    }}\n}}\n'
                    )
                break

        with open(LOCAL_SETTINGS_PATH, "w") as f:
            f.writelines(lines)
        print(Fore.GREEN + "Created local_settings.py file." + Style.RESET_ALL)
    else:
        print(Fore.RED + "local_settings.example.py file not found." + Style.RESET_ALL)
        exit(1)

# Check each environment variable in the .env file and prompt the user to enter a value if it's set to REPLACE_ME
with open(ENV_PATH, "r") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    key, value = line.strip().split("=")
    if value == PLACEHOLDER:
        if key == "DJANGO_SECRET_KEY":
            # Generate a random secret key
            new_value = "".join(
                random.choice(string.ascii_letters + string.digits) for _ in range(24)
            )
        else:
            print(
                Fore.GREEN + f"Enter value for {key}: " + Style.RESET_ALL
            )  # print in green color
            new_value = input()
        new_lines.append(f"{key}={new_value}\n")
    else:
        new_lines.append(line)

with open(ENV_PATH, "w") as f:
    f.writelines(new_lines)

if PLACEHOLDER in open(ENV_PATH).read():
    print(
        Fore.RED
        + "The .env file is not fully set up. Please run the script again."
        + Style.RESET_ALL
    )
else:
    print(Fore.GREEN + ".env file is fully set up." + Style.RESET_ALL)
