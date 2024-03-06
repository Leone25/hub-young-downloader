# hub-young-downloader
A tool that allows you to create an ofline backup of your books on HUB Young and HUB Kids

## Requirements

- [Node](https://nodejs.org/) >= 14.0
- Windows 10 or higher (The script hasn't been tested on other platforms, but it may work.)
- Chromium browser (Chrome, edge, ecc), firefox is fine, only if you know what you are doing

## Installation

1. Download the source code from [here](https://github.com/Leone25/hub-young-downloader/archive/refs/heads/main.zip) or click the above green button `Code` and click `Download Zip`
2. Extract the zip file in a new folder and open it
3. Open the folder in a terminal
   1. If you are on Windows 11, just right click and press `Open with Windows Terminal`
   2. If you are on Windows 10, hold `shift` on your keyboard and right click on a white space, then press `Open command window here`
4. Type in the terminal:
   ```shell
   npm i
   ```


## How to Use

1. Run the script using this script.
   ```shell
   node index.js
   ```
2. Open an login in your HUB Scuola account on your web browser.
3. Open the book you'd like to download in the web reader.
4. Select which platform you'd like to download from by typing its name as prompted.
5. Copy the number from the url https://young.hubscuola.it/viewer/########?page=1 (url starts with kids for HUB Kids but it's the same thing) in the command line where it asks for the `Volume ID`.
6. Now open the developer tools with F12 and refresh the page, now go under the network tab, on the list select the request that only has the volume ID (the blue one in the example below), then scroll down to the bottom in the new menu that opened, and copy the value where it says `token-session` (the red thing in the example, copy only the stuff that is where the red box is), and paste it when the program asks for a token.
![network tab](/network%20tab.png)
7. You are now ready to download! Just press enter and it will do it all.

## Disclaimer

Remember that you are responsible for what you are doing on the internet and even tho this script exists it might not be legal in your country to create personal backups of books.

I may or may not update it depending on my needs tho I'm open to pullup requests ecc.

## Licence

This software uses the MIT License

