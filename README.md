# Pipsta Pushbullet-Printer
This simple Node.js script monitors for any new Pushbullet-pushes and prints them on your Pipsta in a simple way.

## Installation
1. Install and configure your Pipsta according to the official instructions.
2. Clone this repository: `git clone https://github.com/MarvinMenzerath/Pipsta-Pushbullet-Printer.git
3. Copy those files from the official Pipsta-repository into the newly cloned directory:
	- `Examples/1_Basic_Print/BasicPrint.py` --> `printText.py`
	- `Examples/6_Banner_Print/banner.py` --> `printBanner.py`
	- `Examples/7_QR_Print/qr.py` --> `printQr.py`
	- `Examples/7_QR_Print/qr.py` --> `printQrForImage.py`
	- `Examples/8_Image_Print/image_print.py` --> `printImage.py`
4. Open all those Python-scripts and adjust the `FEED_PAST_CUTTER`-constant
5. `npm install`
6. Insert your Pushbullet-API-key into the `listener.js`-file
7. `npm start`

Because of legal reasons my adjusted Pipsta-print-files are not included in this repository.

## License
The MIT License (MIT)

Copyright (c) 2015 Marvin Menzerath

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.