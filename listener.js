var PushBullet = require("pushbullet");
var exec = require("child_process").exec;

var pb = new PushBullet("ENTER-YOUR-API-KEY-HERE");
var deviceToUse = null;

console.log("Welcome to Pipsta-Pushbullet-Printer!");
printText("Welcome to Pipsta-Pushbullet-Printer!\n\n\n\n");

// look for devices
pb.devices(function(error, response) {
	if (error) {
		console.log("Unable to get all devices: " + error);
		printText("Unable to get all devices: " + error);
		process.exit();
	}

	// check for existing device
	var devices = response.devices;

	for (var i = 0; i < devices.length; i++){
		var device = devices[i];
		if (device.active && device.nickname === "Pipsta") {
			deviceToUse = device.iden;
		}
	}

	// create new device
	if (deviceToUse === null) {
		pb.createDevice("Pipsta", function(error, response) {
			if (error) {
				console.log("Unable to create a new device: " + error);
				printText("Unable to create a new device: " + error);
				process.exit();
			}
			deviceToUse = response.iden;
		});
	}
});

// register PB-stream
var stream = pb.stream();
var gotNopped = false;
stream.connect();

stream.on("connect", function() {
	console.log("Stream connected.");
});

stream.on("close", function() {
	console.log("Stream closed. Trying to reconnect...");
	stream.connect();
});

stream.on("error", function(error) {
	console.log("Stream error (" + error + "). Trying to reconnect...");
	stream.connect();
});

stream.on("nop", function() {
	gotNopped = true;
});

stream.on("tickle", function(type) {
	pb.history({ limit: 1, modified_after: 0 }, function(error, response) {
		if (error) {
			console.log("Unable to get latest Push: " + error);
		} else {
			var push = response.pushes[0];

			if (push.target_device_iden === deviceToUse && !push.dismissed) {
				// build dateTime
				var date = new Date(push.created * 1000);
				var dateTime = ("0" + date.getDate()).slice(-2) + "." + ("0" + (date.getMonth() + 1)).slice(-2) + "." + date.getFullYear() + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);

				// build Push-data
				var pushData = push.sender_name + "\n";
				if (push.sender_email !== undefined) {
					pushData += push.sender_email + "\n";
				}
				pushData += dateTime + "\n--------------------------------";

				var qrCodeData = null;
				var imageData = null;
				var bannerData = null;
				if (push.type === "note") {
					if (push.title !== undefined) {
						pushData += "\n> " + push.title.replace(/'/g, "\"");
					}
					if (push.body !== undefined) {
						pushData += "\n> " + push.body.replace(/'/g, "\"");
						if (push.body.startsWith("T_BANNER ")) {
							bannerData = push.body.slice(9, push.body.length);
						}
					}
				} else if (push.type === "link") {
					if (push.title !== undefined) {
						pushData += "\n> " + push.title.replace(/'/g, "\"");
					}
					if (push.body !== undefined) {
						pushData += "\n> " + push.body.replace(/'/g, "\"");
					}
					if (push.url !== undefined) {
						pushData += "\n> " + push.url;
						qrCodeData = push.url;
					}
				} else if (push.type === "file") {
					if (push.file_name !== undefined) {
						pushData += "\n> " + push.file_name.replace(/'/g, "\"");
					}
					if (push.file_type !== undefined) {
						pushData += "\n> " + push.file_type;
						if (push.file_type === "image/jpeg" || push.file_type === "image/png") {
							imageData = push.file_url;
						}
					}
					if (push.file_url !== undefined) {
						pushData += "\n> " + push.file_url;
						qrCodeData = push.file_url;
					}
					if (push.body !== undefined) {
						pushData += "\n> " + push.body.replace(/'/g, "\"");
					}
				}

				// replace Ä, Ö, Ü, ß
				pushData = pushData.replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/Ä/g, "Ae").replace(/Ö/g, "Oe").replace(/Ü/g, "Ue").replace(/ß/g, "ss");

				// print data
				console.log(pushData);

				if (bannerData !== null) {
					printBanner(bannerData);
				} else if (push.type === "note") {
					printText(pushData + "\n\n\n\n");
				} else if (push.type === "link" || (push.type === "file" && imageData === null)) {
					printTextQr(pushData, qrCodeData);
				} else if (push.type === "file" && imageData !== null) {
					printTextQrImage(pushData, qrCodeData, imageData);
				}

				// dismiss push
				pb.updatePush(push.iden, { dismissed: true }, function(error, response) {
					if (error) {
						console.log("Unable to dismiss Push: " + error);
					}
				});

				console.log("##############################");
			}
		}
	});
});

function printBanner(text) {
	exec("python printBanner.py '" + text + "'", function(error, stdout, stderr) {
		if (error !== null) {
			console.log("Python-Printer-Error: " + error);
		}
	});
}

function printText(text) {
	exec("python printText.py '" + text + "'", function(error, stdout, stderr) {
		if (error !== null) {
			console.log("Python-Printer-Error: " + error);
		}
	});
}

function printTextQr(text, link) {
	var print = exec("python printText.py '" + text + "'", function(error, stdout, stderr) {
		if (error !== null) {
			console.log("Python-Printer-Error: " + error);
		}
	});

	print.on("exit", function() {
		exec("python printQr.py '" + link + "'", function(error, stdout, stderr) {
			if (error !== null) {
				console.log("Python-Printer-Error: " + error);
			}
		});
	});
}

function printTextQrImage(text, link) {
	var print = exec("python printText.py '" + text + "'", function(error, stdout, stderr) {
		if (error !== null) {
			console.log("Python-Printer-Error: " + error);
		}
	});

	print.on("exit", function() {
		var print2 = exec("python printQrForImage.py '" + link + "'", function(error, stdout, stderr) {
			if (error !== null) {
				console.log("Python-Printer-Error: " + error);
			}
		});

		print2.on("exit", function() {
			exec("wget -O imageFile.img " + link + " && python printImage.py imageFile.img && rm imageFile.img && rm temp.png", function(error, stdout, stderr) {
				if (error !== null) {
					console.log("Python-Printer-Error: " + error);
				}
			});
		});
	});
}

setInterval(function() {
	if (!gotNopped) {
		console.log("Did not get a nop. Reconnecting...");

		setTimeout(function() {
			stream.connect();
		}, 3 * 1000);
	} else {
		gotNopped = false;
	}
}, 60 * 1000);

if (typeof String.prototype.startsWith !== "function") {
	String.prototype.startsWith = function(str) {
		return this.slice(0, str.length) === str;
	};
}
