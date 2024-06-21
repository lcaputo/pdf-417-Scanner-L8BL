// express server

var express = require("express");
var app = express();
const { SerialPort } = require("serialport");

let output = "";

app.get("/", function (req, res) {
  const port = new SerialPort(
    { path: "/dev/cu.usbmodemC2021011", baudRate: 9600 },
    function (err) {
      if (err) {
        return console.log("Error: ", err.message);
      }
    }
  );

  port.write("main screen turn on", function (err) {
    if (err) {
      return console.log("Error on write: ", err.message);
    }
    console.log("message written");
  });

  port.on("data", function (data) {
    const buffer = new Uint8Array(data);
    const text = buffer.reduce(
      (acc, byte) => acc + "\\0x" + byte.toString(16).padStart(2, "0"),
      ""
    );
    output += text;
    if (text.includes("x0d")) {
      console.log("data received: ", output);
      let asciiString = "";
      for (const byte of output.split("\\")) {
        asciiString += String.fromCharCode(byte);
      }
      asciiString = asciiString.split("main screen turn on")[1];
      asciiString = asciiString.split("x0d")[0];
      const nullCharRegex = /\x00/g;
      asciiString = asciiString.slice(127,150);

        asciiString = asciiString.replace(nullCharRegex, "");

      console.log({ asciiString });
    }
  });

  res.send({
    res: output,
  });
});

app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});
