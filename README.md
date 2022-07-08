# hub-young-downloader
A tool website that allows you to create an ofline backup of your books on HUB Young

## Requirements

- [Node](https://nodejs.org/) >= 14.0
- Windows 10 or higher (The script hasn't been tested on other platforms, but it may work.)
- A modern browser (Chrome, Edge, Firefox ...)

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

1. Open an login in your HUB Young account on your web browser.
2. Open the book you'd like to download in the HUB Young web reader.
3. Copy the number from the url https://young.hubscuola.it/viewer/########?page=1 in the command line where it asks for the `Volume ID`.
4. Now open the developer tools with CTRL + SHIFT + I and go under the application tab, on the list of the left select local storage then where it says https://young.hubscuola.it/ and on the table that will appear look for the `tokenSession`, click on that. It will appear on the bottom, copy it without the quotation marks and paste it in the command line where it asks for the `token`.
5. You are now ready to download! Just press enter and it will do it all.

## Disclaimer

Remember that you are responsible for what you are doing on the internet and even tho this script exists it might not be legal in your country to create personal backups of books.

I may or may not update it depending on my needs tho I'm open to pullup requests ecc.

## Licence

This software uses the MIT License

