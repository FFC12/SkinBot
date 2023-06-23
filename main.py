"""
This is very simple bot that will auto-buy (optional) a skin from the Steam Community Market.
It will buy the cheapest skin that is above the float value you set. Check the `README.md` for more info.

Author:
    - FFC12

Version:
    - 0.1

TODO:
    - Add support for multiple skins
    - Add support for multiple proxies
    - Add support for multiple float values
    - Add support for multiple prices
    - Add support for multiple currencies
    - Optimize code and make it more readable
"""

import argparse
import json
import os
import re
import sys
import time
from traceback import print_exc

from loguru import logger
from selenium.common import NoSuchElementException

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.common.keys import Keys

from bs4 import BeautifulSoup

import undetected_chromedriver as uc
from undetected_chromedriver import ChromeOptions

FOUND_SKINS = []

options = None

chrome_data_found = False


def check_rows(driver, auto, item_float_above, item_float_below, item_price):
    # xpath for `market_listing_item_name_block sih`
    # check if the element is present
    try:
        rows = driver.find_element(By.XPATH, ".//div[@id='searchResultsRows']")

        # get html of element
        rows = rows.get_attribute("innerHTML")

        # split by each div
        soup = BeautifulSoup(rows, "html.parser")

        # get divs
        rows = soup.find_all("div", recursive=False)

        # remove first div
        rows.pop(0)

        for row in rows:
            # find `itemfloat` class
            float_data = row.find("div", {"class": "itemfloat"})

            # get span
            float_data = float_data.find("span").text.strip()

            logger.warning(f"Checking float: {float_data}")

            float_data = float(float_data)

            if item_float_above <= float_data <= item_float_below:
                logger.success(f"Found float {float_data} between {item_float_above} and {item_float_below}")

                logger.warning("Checking price...")

                # find 'price_with` class
                price = row.find("div", {"class": "price_with"})
                # get price
                price = price.text.strip()
                logger.success(f"Found price: {price}")

                # split by ' '
                price = price.strip()

                # remove any character that is not a number, a comma or a dot
                price = re.sub(r"[^\d\,\.]", "", price)

                price = price.replace(",", "")

                price = float(price)

                if price <= item_price:
                    logger.success("Found the skin! 🎉 🎉 🎉 BINGO!")

                    logger.info("Buying the skin...")

                    # find `item_market_action_button btn_green_white_innerfade btn_small` class
                    button_div = row.find("div", {"class": "market_listing_buy_button sih"})

                    # child a
                    href = button_div.find("a").get("href")

                    # this is a JavaScript function
                    # remove `javascript:`
                    href = href.replace("javascript:", "")
                    logger.info(f"Found href: {href}")

                    if auto:
                        # buy the skin
                        buy(driver, href, price, float_data)
                    else:
                        data = {
                            "href": href,
                            "price": price,
                            "float": float_data,
                            "bought": False
                        }

                        FOUND_SKINS.append(data)

            logger.info("--end of page--\n")
    except Exception as e:
        # try again
        logger.info("We could not retrieve the data since the page is loading."
                    "Trying again after 2 seconds. This causes by the Inventory Helper "
                    "(not because of me as a bot lol).")
        time.sleep(2)
        return check_rows(driver, auto, item_float_above, item_float_below, item_price)


def bot_loop(path=None, wait_time=20, auto=False, page_limit=100,
             target_link="https://steamcommunity.com/market/listings/730/AUG%20%7C%20Snake"
                         "%20Pit%20%28Minimal%20Wear%29"):
    if path is None:
        path = "target/target.json"
    if not os.path.exists(path):
        raise FileNotFoundError("target.json not found")

    # load json
    data = json.load(open(path, "r"))

    # get data
    item_name = data["item_name"]
    item_float: list = data["float"]
    item_price = data["price"]

    # create driver
    driver = uc.Chrome(headless=False, use_subprocess=False, options=options)

    # go to link
    driver.get(target_link)

    # scroll to bottom
    html = driver.find_element(By.TAG_NAME, "html")
    html.send_keys(Keys.END)

    logger.info("Checking for `{}` with float `{}` and price `{}`\n".format(item_name, item_float, item_price))
    logger.warning("Please make sure you're logged in to Steam Community Market. Otherwise, this script won't work "
                   "properly with mixed currencies.")
    o = input("Are you okay with this (y/n)? ")

    if o.lower() == "y":
        logger.info("Okay, let's go!")
    else:
        logger.info("Okay, bye!")
        sys.exit()

    print('\n')

    if not chrome_data_found:
        # find input by id
        auto_get_float_and_sticker_wear = driver.find_element(By.ID, 'auto_get_float_and_sticker_wear')

        # click the checkbox
        driver.execute_script("arguments[0].click();", auto_get_float_and_sticker_wear)

        logger.info("No data found. Checking the 'Get skin data, by default' checkbox...")

        get_skin_data = driver.find_element(By.XPATH, "//a[@class='sih_button sih_pre_shadow_button']")

        # check the text of the button
        if get_skin_data.text == "Get Skin Data":
            logger.info("Found the 'Get Skin Data' button. Clicking it...")
            # click the button
            driver.execute_script("arguments[0].click();", get_skin_data)
            time.sleep(2)

    counter = 0
    while True:
        # wait until 'float_data' class name appears
        u = WebDriverWait(driver, 1000).until(
            EC.presence_of_element_located((By.CLASS_NAME, "float_data"))
        )

        logger.info("Found the 'float_data' class name. Ascending the float value...")

        # find the by_float
        by_float = driver.find_element(By.XPATH, "//span[contains(@class, 'sih_label sort float_value')]")

        # click the by_float
        driver.execute_script("arguments[0].click();", by_float)

        logger.info("Ascending the float value. Waiting 2 seconds to " +
                    "make sure the float value is ascending...")

        time.sleep(2)

        # get rows
        rows = check_rows(driver, auto, item_float[0], item_float[1], item_price)

        try:
            is_disabled = driver.find_element(By.XPATH, "//a[@class='sih_button next_page disabled']")
            logger.info("Reached the last page. Exiting...")
            break
        except NoSuchElementException:
            next_button = driver.find_element(By.XPATH, '//a[@class="sih_button next_page"]')

            # click the next button
            driver.execute_script("arguments[0].click();", next_button)

            time.sleep(3)

            # be sure that we reached the last page
        counter += 1

        if page_limit <= counter:
            logger.info("Reached the page limit. Exiting...")
            break

        if counter % 7 == 0:
            logger.info("Waiting 20 seconds to avoid 'Too many requests' error from Steam...")
            time.sleep(wait_time)

    with open("skins.json", "w") as f:
        json.dump(FOUND_SKINS, f, indent=4)

    driver.close()


def buy_mode(target_link):
    # create driver
    driver = uc.Chrome(headless=False, use_subprocess=False, options=options)

    # go to link
    driver.get(target_link)

    # check if json exists
    if os.path.exists("skins.json"):
        # load json
        with open("skins.json", "r") as f:
            data = json.load(f)
    else:
        raise FileNotFoundError("`skins.json` not found - please run the bot first and be sure that you have found "
                                "skins.")

    for skin in data:
        logger.warning("Buying the skin with float {} and price {}".format(skin["float"], skin["price"]))

        # get javascript code
        href = skin["href"]

        # buy
        buy(driver, href, skin["float"], skin["price"])


def buy(driver, href, skin, price):
    # inject javascript
    driver.execute_script(href)

    # click the checkbox 'market_buynow_dialog_accept_ssa'
    checkbox = driver.find_element(By.ID, "market_buynow_dialog_accept_ssa")

    # click the checkbox
    driver.execute_script("arguments[0].click();", checkbox)

    # `market_listing_buy_button sih` find the div by xpath
    buy_button = driver.find_element(By.XPATH, "//div[@class='market_listing_buy_button sih']")

    # it has `a `child element, so we need to click the child element
    driver.execute_script("arguments[0].click();", buy_button.find_element(By.TAG_NAME, "a"))

    # bought
    logger.success("Bought the skin with float {} and price {}".format(skin, price))

    logger.info("----- DONE ----\n")



if __name__ == "__main__":
    # arguments
    parser = argparse.ArgumentParser(description="Steam Community Market Bot - Developed by @ffc12")

    # add arguments
    parser.add_argument("-c", "--chrome", help="path to chrome.exe", required=False, default="driver/chromedriver.exe")
    parser.add_argument("-p", "--path", help="path to target.json file", required=False, default="target/target.json")
    parser.add_argument("-t", "--time", help="wait time to avoid 'Too many requests' error from Steam", required=False,
                        default=20)
    parser.add_argument("-l", "--link", help="link to the item", required=False,
                        default="https://steamcommunity.com/market/listings/730/AUG%20%7C%20Snake%20Pit%20%28Minimal"
                                "%20Wear%29")
    parser.add_argument('-q', '--limit', help='page limit to check', required=False, default=5)
    parser.add_argument('-a', '--auto', help='auto mode', required=False, default=False)
    parser.add_argument('-b', '--buy', help='buy mode (it will buy the skins that bot already found). You also have '
                                            'to specify the link!', required=False, default=False)

    # parse arguments
    args = parser.parse_args()

    # check if chrome_data exists
    if os.path.exists("chrome_data"):
        chrome_data_found = True

    # create options
    options = ChromeOptions()

    # detect if system is Windows
    if sys.platform == 'win32':
        # set executable path to chromedriver.exe
        options.add_argument(f"--binary_location={args.chrome}")
    else:
        if os.path.exists("/usr/bin/chromium"):
            options.add_argument("--binary_location=/usr/bin/chromedriver")
        else:
            raise Exception("Install Chromium or Chrome and set the path to the executable file for Linux (It may be "
                        "set by default)")

    # FIXME: headless (no GUI) but not working for some reason
    # options.add_argument('--headless')

    # find the absolute path of the extension
    extension_path = os.path.abspath('extension/sth/')

    # load extension
    options.add_argument(f'--load-extension={extension_path}')

    # save Chrome data
    options.add_argument(f"--user-data-dir={os.getcwd()}/chrome_data")

    # buy mode
    if args.buy:
        buy_mode(args.link)
    else:
        # run the bot
        bot_loop(path=args.path, wait_time=args.time, auto=args.auto, page_limit=args.limit, target_link=args.link)
