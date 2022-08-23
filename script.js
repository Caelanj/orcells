//eggs
//"3.ly/_"
//update blueprint from console:
//cellGrid = cellGrid.map((e) => {return e.map((f) => {return {type: 0, bit: f}})});cullingMap();

//cellConnections.horizontal = cellConnections.horizontal.map((item) => {return item.map((item2) => {stringified = JSON.stringify(item2);return JSON.parse(stringified.substring(0, stringified.length-1)+',"mixed":false}')})});cellConnections.vertical = cellConnections.vertical.map((item) => {return item.map((item2) => {stringified = JSON.stringify(item2);return JSON.parse(stringified.substring(0, stringified.length-1)+',"mixed":false}')})})
//<parameters>
var gridWidth = 9; //width of the cell grid
var gridHeight = 9; //height of the cell grid
var quality = 2; //image quality from 0-2 (0 being don't draw at all and 2 being vector quality)
var drift = 50; //how far to drift when letting go after moving and when returning home
//DO NOT CHANGE WHILE RUNNING, instead use: gridResize(width, height)
var realtime = false; //if ticks should be run in realtime as fast as possible or on a clock
var default2Cell = false; // if to make the default cell type a 2-cell
var tickRate = 100; //time to wait between each tick in miliseconds if realtime is off
//better off changing with setTick(realtime, tickRate)
var recovery = false; //if the program should try to recover if it can't keep up
var record = false; //enable recording from the console with mediaRecorder.start();/mediaRecorder.stop();
//</parameters>
//var emptyGrid = JSON.stringify({ "cells": Array(gridWidth).fill(null).map(() => Array(gridHeight).fill({ type: (default2Cell ? 2 : 1), bit: (default2Cell ? { upperBit: 0, lowerBit: 0 } : 0), static: (default2Cell ? { upperStatic: true, lowerStatic: true } : true) })), "connections": { horizontal: Array(gridWidth).fill(null).map(() => Array(gridHeight).fill(null).map(() => { return { type: { upperType: 0, lowerType: 0 }, flipped: false }; })), vertical: Array(gridWidth).fill(null).map(() => Array(gridHeight).fill(null).map(() => { return { type: { upperType: 0, lowerType: 0 }, flipped: false }; })), applicital: Array(gridWidth).fill(null).map(() => Array(gridHeight).fill(null).map(() => { return { type: (default2Cell ? 3 : 0), flipped: false }; })), } });
//19-25 kills the preview window in replit so it doesn't waste pc resources, swap commenting for better compatibility:
//var canvas = document.querySelector("canvas");
if (canvas.getContext == null) {
  window.location.replace("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
  throw ("Killed Because Canvas Was Not Defined By Default ");
  var paused = true;
}
var control = false;
var alt = false;
var shift = false;
var driftCharge = 0;
var driftx = 0;
var drifty = 0;
var extra = 1;
var homeCharge = 0;
var mobile = false;
var magicNumber = 1;
var driftAscention = Array(20).fill(0);
var lastDrift = 0;
var lastCell = [0, 0];
var cursorStatic = false;
var newGrid;
var tiles = ["T1B1", "T2B2", "Cross", "BT2", "BT1", "TB2", "TB1", "T0B1", "T0B2", "T1B0", "T1B1F", "T1B2", "T1B2F", "T2B0", "T2B1", "T2B1F", "T2B2F"]
for (var i = 0; i < tiles.length; i++) {
  eval("var svg" + tiles[i] + " = new Image();")
  eval("var img" + tiles[i] + " = new Image();")
}
var helpMenu = false;
var render = true;
var del = false;
var forceOn = false;
var forceOff = false;
var first = true;
var lastTarget = null;
var w = canvas.width;
var h = canvas.height;
var start;
var nextAt;
var ticks = 0;
var culling = { tick: [], tick2: [], connection: { horizontal: [], vertical: [], applicital: (default2Cell ? Array(gridWidth * gridHeight).fill(0).map((e, i) => { return [Math.floor(i / gridWidth), i % gridWidth] }) : []) }, grid: { occlusion: { topLeft: [], bottomRight: [] } } }
var cellGrid = Array(gridWidth)
  .fill(null)
  .map(() =>
    Array(gridHeight)
      .fill(null)
      .map(() => {
        return { type: (default2Cell ? 2 : 1), bit: (default2Cell ? { upperBit: 0, lowerBit: 0 } : 0), static: (default2Cell ? { upperStatic: true, lowerStatic: true } : true) };
      })
  )
var cellConnections = {
  horizontal: Array(gridWidth)
    .fill(null)
    .map(() =>
      Array(gridHeight)
        .fill(null)
        .map(() => {
          return { type: { upperType: 0, lowerType: 0 }, flipped: false, mixed: false };
        })
    ),
  vertical: Array(gridWidth)
    .fill(null)
    .map(() =>
      Array(gridHeight)
        .fill(null)
        .map(() => {
          return { type: { upperType: 0, lowerType: 0 }, flipped: false, mixed: false };
        })
    ),
  applicital: Array(gridWidth)
    .fill(null)
    .map(() =>
      Array(gridHeight)
        .fill(null)
        .map(() => {
          return { type: (default2Cell ? 3 : 0), flipped: false };
        })
    ),
}
const panZoom = {
  x: mobile ? 0 : 464,
  y: mobile ? 0 : 140,
  scale: mobile ? 1 : 0.5,
  apply() {
    ctx.setTransform(this.scale, 0, 0, this.scale, this.x, this.y);
  },
  scaleAt(x, y, sc) {
    // x & y are screen coords, not world
    let lastScale = this.scale
    this.scale *= sc;
    if ((((Math.min(canvas.width, canvas.height) < (gridSize * size))) && (sc > 1)) || ((Math.min(canvas.width, canvas.height) / 200 > (gridSize * size)) && (sc < 1))) {
      this.scale = lastScale
    }
    else {
      if (Math.floor(Math.log2(lastScale)) != Math.floor(Math.log2(this.scale))) {
        rasterize()
      }
      this.x = x - (x - this.x) * sc;
      this.y = y - (y - this.y) * sc;
    }
  },
  toWorld(x, y, point = {}) {
    // converts from screen coords to world coords
    const inv = 1 / this.scale;
    point.x = (x - this.x) * inv;
    point.y = (y - this.y) * inv;
    return point;
  },
};
const ctx = canvas.getContext("2d");
const mouse = {
  x: 0,
  y: 0,
  button: false,
  wheel: 0,
  lastX: 0,
  lastY: 0,
  lastTouches: [{ pageX: 0, pageY: 0 }],
  drag: false,
};
const gridLimit = 512; // max grid lines for static grid
const gridSize = 128; // grid size in screen pixels for adaptive and world pixels for static
const scaleRate = 1.02; // Closer to 1 slower rate of change
const topLeft = { x: 0, y: 0 }; // holds top left of canvas in world coords.
const svgToPng = (svgDataurl, width, height) => new Promise((resolve, reject) => {
  let svgCanvas;
  let ctx;
  let img;

  img = new Image();
  img.src = svgDataurl;
  img.onload = () => {
    svgCanvas = document.createElement('canvas');
    svgCanvas.width = width;
    svgCanvas.height = height;
    ctx = svgCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    resolve(svgCanvas.toDataURL('image/png'));
  };
});
//<initialization>
if (!realtime) {
  tick()
}
if (record) {
  var videoStream = canvas.captureStream(0);
  var mediaRecorder = new MediaRecorder(videoStream);
  var chunks = [];
  mediaRecorder.ondataavailable = function(e) {
    chunks.push(e.data);
    console.log(e.data)
  };
  mediaRecorder.onstop = function(e) {
    console.log(chunks)
    var blob = new Blob(chunks, { 'type': 'video/mp4' });
    chunks = [];
    var videoURL = URL.createObjectURL(blob);
    console.log(videoURL)
    window.open(videoURL)
  };
  mediaRecorder.ondataavailable = function(e) {
    chunks.push(e.data);
  };
}
/*
if (localStorage.getItem("orcells") === null) {
  localStorage.setItem("orcells", emptyGrid);
} else {
  let localGrid = localStorage.getItem('orcells');
  cellGrid = JSON.parse(localGrid).cells;
  cellConnections = JSON.parse(localGrid).connections;
}
*/
//</initialization>
window.addEventListener("dragenter", function(e) {
  showWrapper();
  lastTarget = e.target;
});

window.addEventListener("dragleave", function(e) {
  if (e.target === lastTarget || e.target === document) {
    hideWrapper();
  }
});

window.addEventListener("dragover", function(e) { e.preventDefault(); });

window.addEventListener("drop", function(e) {
  e.preventDefault();
  hideWrapper();
  let dropText = e.dataTransfer.getData("text")
  if (dropText == "") {
    var reader = new FileReader();
    reader.readAsText(e.dataTransfer.files[0], "UTF-8");

    reader.onload = (readerEvent) => {
      loadData(readerEvent.target.result);
    };
  }
  else {
    if (isValidUrl(dropText)) {
      fetch(dropText)
        .then((response) => response.text())
        .then((text) => {
          extra = String(text)
          loadData(String(text))
        });
    }
  }
});
//<keyboard>
document.addEventListener("keydown", (e) => {
  switch (String(e.key)) {
    case "Control":
    case "Meta":
      movingEnabled(true);
      break;
    case "Delete":
    case "Backspace":
      lastCell = WorldToGrid(panZoom.toWorld(mouse.x, mouse.y));
      startCell = lastCell
      del = true;
      break;
    case " ":
      e.preventDefault();
      if (paused) { play() } else { pause() }
      break
    case ".":
      tick(false)
      break;
    case "/":
      toggleRealtime();
      break;
    case "Shift":
      shift = true;
      break;
    case "Alt":
      e.preventDefault();
      alt = true;
      break;
    case "+":
      if (record) {
        mediaRecorder.start()
      }
      break;
    case "-":
      if (record) {
        mediaRecorder.stop()
      }
      break;
    case "e":
    case "E":
    case "Dead": //wth, why is option+e on mac called "Dead"
    case "´":
      forceOn = true;
      forceOff = false;
      shift = e.shiftKey;
      alt = e.altKey;
      break;
    case "q":
    case "Q":
    case "œ":
    case "Œ":
      forceOff = true;
      forceOn = false
      shift = e.shiftKey;
      alt = e.altKey;
      break;
    case "w":
    case "W":
    case "∑":
    case "„":
      var cellpoint = WorldToGrid(panZoom.toWorld(mouse.x, mouse.y));
      if ((cellpoint[0] >= 0) && (cellpoint[0] < gridWidth) && (cellpoint[1] >= 0) && (cellpoint[1] < gridHeight) && (cellGrid[cellpoint[0]][cellpoint[1]].type == 1)) {
        cellGrid[cellpoint[0]][cellpoint[1]].type = 2;
        cellGrid[cellpoint[0]][cellpoint[1]].bit = { upperBit: cellGrid[cellpoint[0]][cellpoint[1]].bit, lowerBit: cellGrid[cellpoint[0]][cellpoint[1]].bit };
        cellGrid[cellpoint[0]][cellpoint[1]].static = { upperStatic: true, lowerStatic: true }
        cellConnections.applicital[cellpoint[0]][cellpoint[1]].type = (cellConnections.applicital[cellpoint[0]][cellpoint[1]].type == 0 ? 3 : cellConnections.applicital[cellpoint[0]][cellpoint[1]].type);
        culling.connection.applicital.push(cellpoint)
        isConnected(cellpoint)
      }
      break;
    case "s":
    case "S":
    case "ß":
    case "Í":
      var cellpoint = WorldToGrid(panZoom.toWorld(mouse.x, mouse.y));
      if ((cellpoint[0] >= 0) && (cellpoint[0] < gridWidth) && (cellpoint[1] >= 0) && (cellpoint[1] < gridHeight) && (cellGrid[cellpoint[0]][cellpoint[1]].type == 2)) {
        cellGrid[cellpoint[0]][cellpoint[1]].type = 1;
        culling.connection.applicital = culling.connection.applicital.filter((i) => { return JSON.stringify(i) !== JSON.stringify(cellpoint) })
        cellGrid[cellpoint[0]][cellpoint[1]].bit = (((cellGrid[cellpoint[0]][cellpoint[1]].bit.upperBit == 1) && (cellGrid[cellpoint[0]][cellpoint[1]].bit.lowerBit == 1)) ? 1 : 0)
        cellConnections.applicital[cellpoint[0]][cellpoint[1]].type = 0
        isConnected(cellpoint)
      }
      break;
  }
});

document.addEventListener("keyup", (e) => {
  switch (String(e.key)) {
    case "Control":
    case "Meta":
      movingEnabled(false);
      break;
    case "Delete":
    case "Backspace":
      del = false;
      let currentCell = WorldToGrid(panZoom.toWorld(mouse.x, mouse.y));
      if (((currentCell[0] >= 0) && (currentCell[0] < gridWidth) && (currentCell[1] >= 0) && (currentCell[1] < gridHeight)) && ((currentCell[0] == startCell[0]) && (currentCell[1] == startCell[1]))) {
        cellConnections.applicital[currentCell[0]][currentCell[1]].type = 3
        isConnected(currentCell)
      }
      break;
    case "Shift":
      shift = false;
      break;
    case "Alt":
      alt = false
      break;
    case "e":
    case "E":
    case "Dead":
      forceOn = false;
      shift = false;
      alt = false
      break;
    case "q":
    case "Q":
    case "œ":
      forceOff = false;
      shift = false;
      alt = false
      break;
  }
});
//</keyboard>
document.addEventListener("contextmenu", (event) => event.preventDefault());

[
  "mousedown",
  "mouseup",
  "mousemove",
  "touchstart",
  "touchmove",
  "touchend",
].forEach((name) => document.addEventListener(name, mouseEvents));
document.addEventListener("wheel", mouseEvents, { passive: false });
//<tiles>
svgT1B1.src = "./tiles/t1/b1.svg";
svgT2B2.src = "./tiles/t2/b2.svg";
svgCross.src = "./tiles/applicital/3.svg";
svgBT1.src = "./tiles/applicital/bt/1.svg";
svgBT2.src = "./tiles/applicital/bt/2.svg";
svgTB1.src = "./tiles/applicital/tb/1.svg";
svgTB2.src = "./tiles/applicital/tb/2.svg";
svgT0B1.src = "./tiles/t0/b1.svg";
svgT0B2.src = "./tiles/t0/b2.svg";
svgT1B0.src = "./tiles/t1/b0.svg";
svgT1B1F.src = "./tiles/t1/b1f.svg";
svgT1B2.src = "./tiles/t1/b2.svg";
svgT1B2F.src = "./tiles/t1/b2f.svg";
svgT2B0.src = "./tiles/t2/b0.svg";
svgT2B1.src = "./tiles/t2/b1.svg";
svgT2B1F.src = "./tiles/t2/b1f.svg";
svgT2B2F.src = "./tiles/t2/b2f.svg";
//</tiles>
//<mobile>
function setDeviceReqs() {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // true for mobile device
    mobile = true;
    document.getElementById("modeRadio").style.visibility = "visible";
  } else {
    // false for not mobile device
    document.getElementById("modeRadio").style.visibility = "hidden";
  }
}
setDeviceReqs();
//</mobile>
function home() { homeCharge = drift }

function rad(angle) { return angle * (Math.PI / 180) }

function distance(x1, y1, x2, y2) { return Math.sqrt(((x2 - x1) ** 2) + ((y2 - y1) ** 2)) }
function isValidUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}
function decimalToBinary(num) {

  let result = '';

  while (num > 0) {
    result += num % 2;
    num = Math.floor(num / 2);
  }

  return result.split('').reverse().join('');
}
Base64 = { encode: ((input) => { let string = ""; input.match(/.{1,6}/g).forEach((item) => { string += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._-".charAt(parseInt(item, 2)) }); return string }), decode: ((input) => { let string = ""; input.split("").forEach((item) => { let value = String(decimalToBinary("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._-".indexOf(item))); string += ("0".repeat(6 - value.length)) + value }); return string }) }
function movingEnabled(status) {
  if (status) {
    control = true;
    canvas.style.cursor = "move";
  } else if (status == false) {
    control = false;
    canvas.style.cursor = "default";
  }
}

function toggleRealtime() {
  document.getElementById("realtimeCheckBox").checked = !document.getElementById("realtimeCheckBox").checked;
  realtimeCheck();
}

function download(filename) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," +
    encodeURIComponent(JSON.stringify({ cells: cellGrid, connections: cellConnections }))
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function hideWrapper() {
  document.querySelector(".wrapper").style.visibility = "hidden";
  document.querySelector(".wrapper").style.opacity = 0;
}

function showWrapper() {
  document.querySelector(".wrapper").style.visibility = "";
  document.querySelector(".wrapper").style.opacity = 0.5;
}

function upload() {
  var input = document.createElement("input");
  input.type = "file";
  input.onchange = (e) => {
    var uploadedFileData = e.target.files[0];
    loadData(uploadedFileData);

  };

  input.click();
}

function loadData(content) {
  cellGrid = JSON.parse(content).cells;
  cellConnections = JSON.parse(content).connections;
  gridWidth = cellGrid.length
  gridHeight = cellGrid[0].length
  cullingMap()
}

function realtimeCheck() {
  if (document.getElementById("realtimeCheckBox").checked) {
    setTick(true)
  }
  else {
    setTick(false, 100)
  }
}

function rasterize() {
  imgScale = Math.ceil(gridSize * size) * quality
  for (var i = 0; i < tiles.length; i++) {
    eval("svgToPng(svg" + tiles[i] + ".src, imgScale, imgScale).then((e) => { img" + tiles[i] + ".src = e })")
  }
  //svgToPng(svgCross.src, imgScale, imgScale).then((e) => { imgCross.src = e })
}

function gridResize(width, height) {
  if (height > gridHeight) {
    cellGrid = cellGrid.map((e) => {
      return e.concat(Array(height - gridHeight).fill(null).map(() => { return { type: 0, bit: 0 } }))
    })
    cellConnections.applicital = cellConnections.applicital.map((e) => {
      return e.concat(Array(height - gridHeight).fill(null).map(() => { return { type: (default2Cell ? 3 : 0), flipped: false } }))
    })
    cellConnections.horizontal = cellConnections.horizontal.map((e) => {
      return e.concat(Array(height - gridHeight).fill(null).map(() => { return { type: { upperType: 0, lowerType: 0 }, flipped: false, mixed: false } }))
    })
    cellConnections.vertical = cellConnections.vertical.map((e) => {
      return e.concat(Array(height - gridHeight).fill(null).map(() => { return { type: { upperType: 0, lowerType: 0 }, flipped: false, mixed: false } }))
    })
    gridHeight = height
  }
  if (height < gridHeight) {
    cellGrid = cellGrid.map((e) => {
      return e.splice(0, height)
    })
    cellConnections.applicital = cellConnections.applicital.map((e) => {
      return e.splice(0, height)
    })
    cellConnections.horizontal = cellConnections.horizontal.map((e) => {
      return e.splice(0, height)
    })
    cellConnections.vertical = cellConnections.vertical.map((e) => {
      return e.splice(0, height)
    })
    gridHeight = height
  }
  if (width > gridWidth) {
    cellGrid = cellGrid.concat(Array(width - gridWidth).fill(null).map(() => { return Array(height).fill(null).map(() => { return { type: 1, bit: 0 }; }) }))
    cellConnections.applicital = cellConnections.applicital.concat(Array(width - gridWidth).fill(null).map(() => { return Array(height).fill(null).map(() => { return { type: (default2Cell ? 3 : 0), flipped: false }; }) }))
    cellConnections.horizontal = cellConnections.horizontal.concat(Array(width - gridWidth).fill(null).map(() => { return Array(height).fill(null).map(() => { return { type: { upperType: 0, lowerType: 0 }, flipped: false, mixed: false }; }) }))
    cellConnections.vertical = cellConnections.vertical.concat(Array(width - gridWidth).fill(null).map(() => { return Array(height).fill(null).map(() => { return { type: { upperType: 0, lowerType: 0 }, flipped: false, mixed: false }; }) }))
    gridWidth = width
  }
  if (width < gridWidth) {
    cellGrid = cellGrid.splice(0, width)
    cellConnections.applicital = cellConnections.applicital.splice(0, width)
    cellConnections.horizontal = cellConnections.horizontal.splice(0, width)
    cellConnections.vertical = cellConnections.vertical.splice(0, width)
    gridWidth = width
  }
  cullingMap()
}
function cullingMap() {
  let tickCulling = [];
  let tickCulling2 = [];
  let horizontalConnectionCulling = [];
  let verticalConnectionCulling = [];
  let applicitalConnectionCulling = [];
  let indeX = 0;
  cellGrid.forEach((a, i) => {
    indeX = i;
    a.forEach((b, j) => {
      switch (b.type) {
        case 1:
          if (!b.static) {
            tickCulling.push([indeX, j])
          }
          break;
        case 2:
          if (!b.static.upperStatic) {
            tickCulling2.push([indeX, j, 1])
          }
          if (!b.static.lowerStatic) {
            tickCulling2.push([indeX, j, 0])
          }
          break;
      }
    })
  })
  culling.tick = tickCulling
  culling.tick2 = tickCulling2
  indeX = 0;
  cellConnections.horizontal.forEach((a, i) => { indeX = i; a.forEach((b, j) => { if ((b.type.upperType !== 0) || (b.type.lowerType !== 0)) { horizontalConnectionCulling.push([indeX, j]) } }) })
  culling.connection.horizontal = horizontalConnectionCulling
  indeX = 0;
  cellConnections.vertical.forEach((a, i) => { indeX = i; a.forEach((b, j) => { if ((b.type.upperType !== 0) || (b.type.lowerType !== 0)) { verticalConnectionCulling.push([indeX, j]) } }) })
  culling.connection.vertical = verticalConnectionCulling
  indexX = 0;
  cellConnections.applicital.forEach((a, i) => { indeX = i; a.forEach((b, j) => { if (b.type !== 0) { applicitalConnectionCulling.push([indeX, j]) } }) })
  culling.connection.applicital = applicitalConnectionCulling
}
function isConnected(target, shift = [0, 0]) {
  let tx = target[0] - shift[0]
  let ty = target[1] - shift[1]
  let upperConnected = false
  let lowerConnected = false
  //from right
  upperConnected ||= (cellConnections.horizontal[tx][ty].type.upperType != 0) && (cellConnections.horizontal[tx][ty].flipped)
  lowerConnected ||= (cellConnections.horizontal[tx][ty].type.lowerType != 0) && (cellConnections.horizontal[tx][ty].flipped != (cellConnections.horizontal[tx][ty].mixed))
  //from bottom
  upperConnected ||= (cellConnections.vertical[tx][ty].type.upperType != 0) && (cellConnections.vertical[tx][ty].flipped)
  lowerConnected ||= (cellConnections.vertical[tx][ty].type.lowerType != 0) && (cellConnections.vertical[tx][ty].flipped != (cellConnections.vertical[tx][ty].mixed))
  //from left
  if (tx > 0) {
    upperConnected ||= ((cellConnections.horizontal[tx - 1][ty].type.upperType != 0) && !(cellConnections.horizontal[tx - 1][ty].flipped))
    lowerConnected ||= ((cellConnections.horizontal[tx - 1][ty].type.lowerType != 0) && !(cellConnections.horizontal[tx - 1][ty].flipped != (cellConnections.horizontal[tx - 1][ty].mixed)))
  }
  //from top
  if (ty > 0) {
    upperConnected ||= ((cellConnections.vertical[tx][ty - 1].type.upperType != 0) && !(cellConnections.vertical[tx][ty - 1].flipped))
    lowerConnected ||= ((cellConnections.vertical[tx][ty - 1].type.lowerType != 0) && !(cellConnections.vertical[tx][ty - 1].flipped != (cellConnections.vertical[tx][ty - 1].mixed)))
  }
  switch (cellGrid[tx][ty].type) {
    case 1:
      let connected = upperConnected || lowerConnected
      culling.tick2 = culling.tick2.filter((i) => { return (JSON.stringify(i) !== JSON.stringify([tx, ty, 0])) && (JSON.stringify(i) !== JSON.stringify([tx, ty, 1])) })
      culling.tick = culling.tick.filter((i) => { return JSON.stringify(i) !== JSON.stringify([tx, ty]) })
      if (connected) {
        cellGrid[tx][ty].static = false
        culling.tick.push([tx, ty])
      }
      else {
        cellGrid[tx][ty].static = true
      }
      break;
    case 2:
      //from below
      upperConnected ||= ((cellConnections.applicital[tx][ty].type != 3) && (cellConnections.applicital[tx][ty].flipped))
      //from above
      lowerConnected ||= ((cellConnections.applicital[tx][ty].type != 3) && (!cellConnections.applicital[tx][ty].flipped))
      culling.tick2 = culling.tick2.filter((i) => { return (JSON.stringify(i) !== JSON.stringify([tx, ty, 0])) && (JSON.stringify(i) !== JSON.stringify([tx, ty, 1])) })
      culling.tick = culling.tick.filter((i) => { return JSON.stringify(i) !== JSON.stringify([tx, ty]) })
      if (upperConnected) {
        cellGrid[tx][ty].static.upperStatic = false
        culling.tick2.push([tx, ty, 1])
      }
      else {
        cellGrid[tx][ty].static.upperStatic = true
      }
      if (lowerConnected) {
        cellGrid[tx][ty].static.lowerStatic = false
        culling.tick2.push([tx, ty, 0])
      }
      else {
        cellGrid[tx][ty].static.lowerStatic = true
      }
      break
  }
}
function help() {
  if (helpMenu) {
    helpMenu = false;
    document.getElementById("gameDiv").style.filter = "blur(0px)";
    document.getElementById("help").style.visibility = "hidden";
  } else {
    helpMenu = true;
    document.getElementById("gameDiv").style.filter = "blur(8px)";
    document.getElementById("help").style.visibility = "visible";
  }
}

function pause() {
  paused = true
  document.getElementById("pause").style.visibility = "hidden";
  document.getElementById("play").style.visibility = "inherit";
  skipCatchup()
}

function play() {
  paused = false
  document.getElementById("pause").style.visibility = "inherit";
  document.getElementById("play").style.visibility = "hidden";
  start = new Date().getTime();
  nextAt = start;
  ticks = 0;
  tick();
}

function setTick(setRealTime, setTickRate) {
  tickRate = setTickRate
  if (setRealTime) {
    realtime = true;
  }
  else {
    realtime = false
    start = new Date().getTime();
    nextAt = start;
    ticks = 0;
    tick();
  }
}

function skipCatchup() {
  start = new Date().getTime();
  nextAt = start;
  ticks = 0;
  document.getElementById("behindDiv").style.visibility = "hidden";
}
function mouseEvents(e) {
  const bounds = canvas.getBoundingClientRect();
  if (e.type == "touchstart") {
    pageX =
      Array.from(e.touches, (x) => x.pageX).reduce((a, b) => a + b, 0) /
      e.touches.length;
    pageY =
      Array.from(e.touches, (x) => x.pageY).reduce((a, b) => a + b, 0) /
      e.touches.length;
    mouse.lastX = pageX - bounds.left - scrollX;
    mouse.lastY = pageY - bounds.top - scrollY;
    mouse.x = pageX - bounds.left - scrollX;
    mouse.y = pageY - bounds.top - scrollY;
  } else {
    if (e.type == "touchmove") {
      pageX =
        Array.from(e.touches, (x) => x.pageX).reduce((a, b) => a + b, 0) /
        e.touches.length;
      pageY =
        Array.from(e.touches, (x) => x.pageY).reduce((a, b) => a + b, 0) /
        e.touches.length;
      mouse.x = pageX - bounds.left - scrollX;
      mouse.y = pageY - bounds.top - scrollY;
      if (e.touches.length = 2) {
        mouse.wheel += distance(mouse.x, mouse.y) - distance(mouse.lastX, mouse.lastY);
        e.preventDefault();
      }
      mouse.lastTouches = e.touches;
    } else {
      if (e.type == "touchend") {
        pageX =
          Array.from(e.changedTouches, (x) => x.pageX).reduce(
            (a, b) => a + b,
            0
          ) / e.changedTouches.length;
        pageY =
          Array.from(e.changedTouches, (x) => x.pageY).reduce(
            (a, b) => a + b,
            0
          ) / e.changedTouches.length;
        mouse.x = pageX - bounds.left - scrollX;
        mouse.y = pageY - bounds.top - scrollY;
        mouse.x += driftx;
        mouse.y += drifty;
      } else {
        mouse.x = e.pageX - bounds.left - scrollX;
        mouse.y = e.pageY - bounds.top - scrollY;
      }
    }
  }
  mouse.button =
    e.type === "mousedown" || e.type === "touchstart"
      ? true
      : e.type === "mouseup" || e.type === "touchend"
        ? false
        : mouse.button;
  if (e.type === "wheel") {
    mouse.wheel += -e.deltaY;
    e.preventDefault();
  }
}
//<connect>
canvas.onmousemove = (e) => {
  cursorStatic = false;
  if (
    (e.buttons === 1 || e.buttons === 2 || e.buttons === 4 || del) &&
    !control
  ) {
    let currentCell = WorldToGrid(panZoom.toWorld(mouse.x, mouse.y));
    if (currentCell[0] != lastCell[0] || currentCell[1] != lastCell[1]) {
      let direction = [
        currentCell[0] - lastCell[0],
        currentCell[1] - lastCell[1],
      ];
      let type = e.buttons === 4 || del ? 0 : e.buttons;
      //horizontal
      if ((Math.abs(direction[0]) === 1 && direction[1] === 0) && ((currentCell[0] - (direction[0] === 1 ? 1 : 0) >= 0) && (currentCell[0] - (direction[0] === 1 ? 1 : 0) < gridWidth - 1) && (currentCell[1] >= 0) && (currentCell[1] < gridHeight))) {
        let mix = ((((direction[0] == -1) && (!cellConnections.horizontal[
          currentCell[0] - (direction[0] === 1 ? 1 : 0)
        ][currentCell[1]].flipped)) || ((direction[0] == 1) && (cellConnections.horizontal[
          currentCell[0] - (direction[0] === 1 ? 1 : 0)
        ][currentCell[1]].flipped))));
        if (shift) {
          if (alt) {
            cellConnections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].type.lowerType = type;
          }
          mix &&= (cellConnections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].type.lowerType != 0)
          mix &&= !alt
          mix = mix != cellConnections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].mixed
          flip = false
          cellConnections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].type.upperType = type
          cellConnections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].mixed = mix
        }
        else {
          if (!alt) {
            cellConnections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].type.upperType = type;
          }
          mix &&= (cellConnections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].type.upperType != 0)
          flip = (mix &&= alt)
          cellConnections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].type.lowerType = type
          cellConnections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].mixed = mix
        }
        if (type != 0) {
          cellConnections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].flipped = (direction[0] === -1) == (!flip);
        }
        culling.connection.horizontal = culling.connection.horizontal.filter((i) => { return JSON.stringify(i) !== JSON.stringify([currentCell[0] - (direction[0] === 1 ? 1 : 0), currentCell[1]]) })
        if ((cellConnections.horizontal[
          currentCell[0] - (direction[0] === 1 ? 1 : 0)
        ][currentCell[1]].type.lowerType != 0) || (cellConnections.horizontal[
          currentCell[0] - (direction[0] === 1 ? 1 : 0)
        ][currentCell[1]].type.upperType != 0)) {
          culling.connection.horizontal.push([currentCell[0] - (direction[0] === 1 ? 1 : 0), currentCell[1]])
        }
        isConnected(currentCell)
        isConnected(currentCell, direction)
      }
      //vertical

      if ((direction[0] === 0 && Math.abs(direction[1]) === 1) && ((currentCell[0] >= 0) && (currentCell[0] < gridWidth) && (currentCell[1] - (direction[1] === 1 ? 1 : 0) >= 0) && (currentCell[1] - (direction[1] === 1 ? 1 : 0) < gridHeight - 1))) {
        let mix = ((((direction[1] == -1) && (!cellConnections.vertical[currentCell[0]][
          currentCell[1] - (direction[1] === 1 ? 1 : 0)
        ].flipped)) || ((direction[1] == 1) && (cellConnections.vertical[currentCell[0]][
          currentCell[1] - (direction[1] === 1 ? 1 : 0)
        ].flipped))));
        if (shift) {
          if (alt) {
            cellConnections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].type.lowerType = type;
          }
          mix &&= (cellConnections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].type.lowerType != 0)
          mix &&= !alt
          mix = mix != cellConnections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].mixed
          flip = false
          cellConnections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].type.upperType = type
          cellConnections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].mixed = mix
        }
        else {
          if (!alt) {
            cellConnections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].type.upperType = type;
          }
          mix &&= (cellConnections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].type.upperType != 0)
          flip = (mix &&= alt)
          cellConnections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].type.lowerType = type
          cellConnections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].mixed = mix
        }
        if (type != 0) {
          cellConnections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].flipped = (direction[1] === -1) == (!flip);
        }
        culling.connection.vertical = culling.connection.vertical.filter((i) => { return JSON.stringify(i) !== JSON.stringify([currentCell[0], currentCell[1] - (direction[1] === 1 ? 1 : 0)]) })
        if ((cellConnections.vertical[currentCell[0]][
          currentCell[1] - (direction[1] === 1 ? 1 : 0)
        ].type.lowerType != 0) || (cellConnections.vertical[currentCell[0]][
          currentCell[1] - (direction[1] === 1 ? 1 : 0)
        ].type.upperType != 0)) {
          culling.connection.vertical.push([currentCell[0], currentCell[1] - (direction[1] === 1 ? 1 : 0)])
        }
        isConnected(currentCell)
        isConnected(currentCell, direction)
      }
      lastCell = currentCell;
    }
  }
};
//</connect>
//<mouse>
canvas.onmousedown = ((e) => {
  lastCell = WorldToGrid(panZoom.toWorld(mouse.x, mouse.y));
  cursorStatic = true
  if (e.button == 1) {
    e.preventDefault();
  }
});
canvas.onmouseup = ((e) => {
  let currentCell = WorldToGrid(panZoom.toWorld(mouse.x, mouse.y));
  if ((((currentCell[0] >= 0) && (currentCell[0] < gridWidth) && (currentCell[1] >= 0) && (currentCell[1] < gridHeight)) && cursorStatic) && (!control)) {
    if (e.button == 1) {
      cellConnections.applicital[currentCell[0]][currentCell[1]].type = 3;
    }
    else {
      if (shift && !alt) {
        cellConnections.applicital[currentCell[0]][currentCell[1]].type = ([1, null, 2][e.button]);
        if (cellGrid[currentCell[0]][currentCell[1]].type == 1) {
          cellGrid[currentCell[0]][currentCell[1]].type = 2;
          cellGrid[currentCell[0]][currentCell[1]].bit = { upperBit: cellGrid[currentCell[0]][currentCell[1]].bit, lowerBit: cellGrid[currentCell[0]][currentCell[1]].bit }
          cellGrid[currentCell[0]][currentCell[1]].static = { upperStatic: true, lowerStatic: true }
        }
        cellConnections.applicital[currentCell[0]][currentCell[1]].flipped = true;
        culling.connection.applicital = culling.connection.applicital.filter((i) => { return JSON.stringify(i) !== JSON.stringify(currentCell) })
        culling.connection.applicital.push(currentCell)
        isConnected(currentCell)
      } else {
        if (alt && !shift) {
          if (cellGrid[currentCell[0]][currentCell[1]].type == 1) {
            cellGrid[currentCell[0]][currentCell[1]].type = 2;
            cellGrid[currentCell[0]][currentCell[1]].bit = { upperBit: cellGrid[currentCell[0]][currentCell[1]].bit, lowerBit: cellGrid[currentCell[0]][currentCell[1]].bit }
            cellGrid[currentCell[0]][currentCell[1]].static = { upperStatic: true, lowerStatic: true }
          }
          cellConnections.applicital[currentCell[0]][currentCell[1]].type = ([1, null, 2][e.button]);
          cellConnections.applicital[currentCell[0]][currentCell[1]].flipped = false;
          culling.connection.applicital = culling.connection.applicital.filter((i) => { return JSON.stringify(i) !== JSON.stringify(currentCell) })
          culling.connection.applicital.push(currentCell)
          isConnected(currentCell)
        }
      }
    }
  }
})
//</mouse>
function drawGrid(gridScreenSize = 128) {
  var size,
    x,
    y,
    gridScale = gridScreenSize;
  size = Math.max(w, h) / panZoom.scale + gridScale * 2;
  panZoom.toWorld(0, 0, topLeft);
  x = Math.floor(topLeft.x / gridScale) * gridScale;
  y = Math.floor(topLeft.y / gridScale) * gridScale;
  if (size / gridScale > gridLimit) {
    size = gridScale * gridLimit;
    limitedGrid = true;
  }
  panZoom.apply();
  ctx.lineWidth = panZoom.scale * 10;
  ctx.strokeStyle = "#333333";
  ctx.beginPath();
  for (i = 0; i < size; i += gridScale) {
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i, y + size);
    ctx.moveTo(x, y + i);
    ctx.lineTo(x + size, y + i);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset the transform so the lineWidth is 1
  ctx.stroke();
  if (first) {
    first = false
    rasterize()
  }
}

function update() {
  //localStorage.setItem('orcells', JSON.stringify({ cells: cellGrid, connections: cellConnections }));
  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
  ctx.globalAlpha = 1; // reset alpha
  if (w !== innerWidth || h !== innerHeight) {
    w = canvas.width = innerWidth + 8;
    h = canvas.height = innerHeight + 8;
  } else {
    ctx.clearRect(0, 0, w, h);
  }
  if (mouse.wheel !== 0) {
    let scale = 1;
    scale = mouse.wheel < 0 ? 1 / scaleRate : scaleRate;
    mouse.wheel *= 0.8;
    if (Math.abs(mouse.wheel) < 1) {
      mouse.wheel = 0;
    }
    panZoom.scaleAt(mouse.x, mouse.y, scale); //scale is the change in scale
  }
  if (
    mouse.button &&
    ((control && !mobile) ||
      (document.querySelector('input[name="move"]:checked').value == 0 &&
        mobile))
  ) {
    if (!mouse.drag) {
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
      mouse.drag = true;
    } else {
      panZoom.x += mouse.x - mouse.lastX;
      panZoom.y += mouse.y - mouse.lastY;
      driftx = mouse.x - mouse.lastX;
      drifty = mouse.y - mouse.lastY;
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
      driftCharge = drift;
    }
  } else {
    mouse.drag = false;
    if (driftCharge > 0) {
      let driftspeed = 1 - Math.sin(rad((1 - driftCharge / drift) * 90));
      panZoom.x += driftx * driftspeed;
      panZoom.y += drifty * driftspeed;
      driftCharge--;
    }
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;
  }
  requestAnimationFrame(update);
  //<tick>
  if (realtime) {
    tick(true);
  }
  //</tick>
  //<force>
  if (forceOn) {
    var cellpoint = WorldToGrid(panZoom.toWorld(mouse.x, mouse.y));
    if ((cellpoint[0] >= 0) && (cellpoint[0] < gridWidth) && (cellpoint[1] >= 0) && (cellpoint[1] < gridHeight)) {
      if (cellGrid[cellpoint[0]][cellpoint[1]].type == 2) {
        if (shift) {
          cellGrid[cellpoint[0]][cellpoint[1]].bit.upperBit = 1
        }
        if (alt) {
          cellGrid[cellpoint[0]][cellpoint[1]].bit.lowerBit = 1
        }
        if (alt == shift) {
          cellGrid[cellpoint[0]][cellpoint[1]].bit = { upperBit: 1, lowerBit: 1 }
        }
      }
      if (cellGrid[cellpoint[0]][cellpoint[1]].type == 1) {
        cellGrid[cellpoint[0]][cellpoint[1]].bit = 1
      }
    }
  }
  else {
    if (forceOff) {
      var cellpoint = WorldToGrid(panZoom.toWorld(mouse.x, mouse.y));
      if ((cellpoint[0] >= 0) && (cellpoint[0] < gridWidth) && (cellpoint[1] >= 0) && (cellpoint[1] < gridHeight)) {
        if (cellGrid[cellpoint[0]][cellpoint[1]].type == 2) {
          if (shift) {
            cellGrid[cellpoint[0]][cellpoint[1]].bit.upperBit = 0
          }
          if (alt) {
            cellGrid[cellpoint[0]][cellpoint[1]].bit.lowerBit = 0
          }
          if (alt == shift) {
            cellGrid[cellpoint[0]][cellpoint[1]].bit = { upperBit: 0, lowerBit: 0 }
          }
        }
        if (cellGrid[cellpoint[0]][cellpoint[1]].type == 1) {
          cellGrid[cellpoint[0]][cellpoint[1]].bit = 0
        }
      }
    }
  }
  //</force>
  if (record) {
    videoStream.getVideoTracks()[0].requestFrame();
  }
  //<render>
  //Grid Render:
  culling.grid.occlusion.topLeft = WorldToGrid(panZoom.toWorld(0, 0));
  culling.grid.occlusion.bottomRight = WorldToGrid(panZoom.toWorld(canvas.width, canvas.height));
  for (let x2 = Math.max(0, culling.grid.occlusion.topLeft[0]); x2 < Math.min(gridWidth, culling.grid.occlusion.bottomRight[0] + 1); x2++) {
    for (let y2 = Math.max(0, culling.grid.occlusion.topLeft[1]); y2 < Math.min(gridHeight, culling.grid.occlusion.bottomRight[1] + 1); y2++) {
      render = true;
      color = getColour(cellGrid[x2][y2].bit, cellGrid[x2][y2].type);
      if (render) {
        DrawCell([x2, y2], color, false);
      }
    }
  }
  drawGrid(gridSize);
  //Horizontal Connection Render:
  culling.connection.horizontal.forEach((item) => {
    let x2 = item[0];
    let y2 = item[1];
    if ((x2 > culling.grid.occlusion.topLeft[0] - 2 && y2 > culling.grid.occlusion.topLeft[1] - 1) && (x2 < culling.grid.occlusion.bottomRight[0] + 1 && y2 < culling.grid.occlusion.bottomRight[1] + 1)) {
      drawConnection(
        [x2, y2],
        cellConnections.horizontal[x2][y2].type,
        cellConnections.horizontal[x2][y2].flipped ? 2 : 0,
        1,
        cellConnections.horizontal[x2][y2].mixed
      );
    }
  })
  //Vertical Connection Render:
  culling.connection.vertical.forEach((item) => {
    let x2 = item[0];
    let y2 = item[1];
    if ((x2 > culling.grid.occlusion.topLeft[0] - 1 && y2 > culling.grid.occlusion.topLeft[1] - 2) && (x2 < culling.grid.occlusion.bottomRight[0] + 1 && y2 < culling.grid.occlusion.bottomRight[1] + 1)) {
      drawConnection(
        [x2, y2],
        cellConnections.vertical[x2][y2].type,
        cellConnections.vertical[x2][y2].flipped ? 3 : 1,
        2,
        cellConnections.vertical[x2][y2].mixed
      );
    }
  })
  //Applicital Connection Render:
  culling.connection.applicital.forEach((item) => {
    let x2 = item[0];
    let y2 = item[1];
    if ((x2 > culling.grid.occlusion.topLeft[0] - 1 && y2 > culling.grid.occlusion.topLeft[1] - 1) && (x2 < culling.grid.occlusion.bottomRight[0] + 1 && y2 < culling.grid.occlusion.bottomRight[1] + 1)) {
      drawConnection(
        [x2, y2],
        { upperType: cellConnections.applicital[x2][y2].type, lowerType: cellConnections.applicital[x2][y2].type },
        0,
        3,
        cellConnections.applicital[x2][y2].flipped
      );
    }
  })
  //</render>
  homeDrift();
}

function homeDrift() {
  if (homeCharge === 1) {
    panZoom.x = mobile ? 0 : 464;
    panZoom.y = mobile ? 0 : 140;
    panZoom.scale = mobile ? 1 : 0.5;
    homeCharge = 0;
  }
  if (homeCharge > 2) {
    let homeSpeed = drift - Math.sin(rad((drift - homeCharge) * (90 / drift))) * drift;
    panZoom.x -= (panZoom.x - (mobile ? 0 : 464)) / homeSpeed;
    panZoom.y -= (panZoom.y - (mobile ? 0 : 140)) / homeSpeed;
    panZoom.scale -= (panZoom.scale - (mobile ? 1 : 0.5)) / homeSpeed;
    homeCharge--;
  }
}

function WorldToGrid(point) {
  return [
    Math.round((point.x + gridSize / 2) / gridSize),
    Math.round((point.y + gridSize / 2) / gridSize),
  ]; // Converts world cords to grid cords
}

function GridToWorld(point) {
  size = 1 / panZoom.scale;
  return [
    (point[0] * gridSize - gridSize / 2) * size + panZoom.x * magicNumber,
    (point[1] * gridSize - gridSize / 2) * size + panZoom.y * magicNumber,
  ];
}

function getColour(state, type) {
  switch (type) {
    case 1:
      switch (state) {
        case 0:
          return "#000000";
          //return "#1c4d66"
          break;
        case 1:
          return "#eeeeee";
          //return "#3eaee6"
          break;
        default:
          render = false;
          return
      }
    case 2:
      switch (state.upperBit) {
        case 0:
          switch (state.lowerBit) {
            case 0:
              return "#000000";
              break;
            case 1:
              return "#0000ff";
              break;
            default:
              render = false
              return
          }
        case 1:
          switch (state.lowerBit) {
            case 0:
              return "#ff0000";
              break;
            case 1:
              return "#eeeeee";
              break;
            default:
              render = false
              return
          }
        default:
          render = false
          return
      }
  }
}
function getImage(t, b, f, a) {
  if (a) {
    switch (t) {
      case 1:
        if (f) {
          return imgBT1
        }
        else {
          return imgTB1
        }
      case 2:
        if (f) {
          return imgBT2
        }
        else {
          return imgTB2
        }
      case 3:
        return imgCross
      default:
        return
    }
  }
  else {
    switch (t) {
      case 0:
        switch (b) {
          case 1:
            return imgT0B1
          case 2:
            return imgT0B2
          default:
            return
        }
      case 1:
        switch (b) {
          case 0:
            return imgT1B0
          case 1:
            if (f) {
              return imgT1B1F
            }
            else {
              return imgT1B1
            }
          case 2:
            if (f) {
              return imgT1B2F
            }
            else {
              return imgT1B2
            }
          default:
            return
        }
      case 2:
        switch (b) {
          case 0:
            return imgT2B0
          case 1:
            if (f) {
              return imgT2B1F
            }
            else {
              return imgT2B1
            }
          case 2:
            if (f) {
              return imgT2B2F
            }
            else {
              return imgT2B2
            }
          default:
            return
        }
      default:
        return
    }
  }
}

function DrawCell(point, color) {
  magicNumber = (1 / panZoom.scale) ** 2;
  point = GridToWorld(point);
  //ctx.save()
  ctx.fillStyle = color;
  ctx.beginPath();
  size = panZoom.scale;
  //ctx.globalAlpha = 0.75
  ctx.rect(
    point[0] / magicNumber - (gridSize / 2) * panZoom.scale,
    point[1] / magicNumber - (gridSize / 2) * panZoom.scale + size,
    gridSize * size,
    gridSize * size
  );
  ctx.fill();
  //ctx.restore()
}

function drawConnection(point, type, rotate, axis, flipped = false) {
  magicNumber = (1 / panZoom.scale) ** 2;
  point = GridToWorld(point);
  size = panZoom.scale;
  ctx.save();
  let image = new Image();
  switch (axis) {
    case 1: //Vertical
      ctx.translate(
        point[0] / magicNumber + (gridSize / 2) * panZoom.scale + size,
        point[1] / magicNumber + size
      );
      break;
    case 2: //Horizontal
      ctx.translate(
        point[0] / magicNumber + size,
        point[1] / magicNumber + (gridSize / 2) * panZoom.scale + size
      );
      break;
    case 3: //Applicital
      ctx.translate(
        point[0] / magicNumber + size,
        point[1] / magicNumber + size
      );
      break;
  }
  image = getImage(type.upperType, type.lowerType, flipped, (axis == 3))
  ctx.rotate(rad(rotate * 90));
  ctx.translate(
    -((panZoom.scale * gridSize) / 2),
    -(panZoom.scale * gridSize) / 2
  );
  ctx.drawImage(
    image,
    0,
    0,
    panZoom.scale * gridSize,
    panZoom.scale * gridSize
  );
  ctx.restore();
}

function tick(auto = true) {
  if (!auto || !paused) {
    lastTick = Date.now();
    newGrid = JSON.parse(JSON.stringify(cellGrid));
    culling.tick.forEach((item) => {
      let x2 = item[0];
      let y2 = item[1];
      let bit = 0;
      if (x2 > 0) {
        switch (cellGrid[x2 - 1][y2].type) {
          case 1:
            bit |=
              ((cellConnections.horizontal[x2 - 1][y2].type.upperType == 1) &&
                (!cellConnections.horizontal[x2 - 1][y2].flipped) &&
                cellGrid[x2 - 1][y2].bit == 1) ||
              ((cellConnections.horizontal[x2 - 1][y2].type.upperType == 2) &&
                (!cellConnections.horizontal[x2 - 1][y2].flipped) &&
                cellGrid[x2 - 1][y2].bit == 0);
            bit |=
              ((cellConnections.horizontal[x2 - 1][y2].type.lowerType == 1) &&
                (cellConnections.horizontal[x2 - 1][y2].flipped == cellConnections.horizontal[x2 - 1][y2].mixed) &&
                cellGrid[x2 - 1][y2].bit == 1) ||
              ((cellConnections.horizontal[x2 - 1][y2].type.lowerType == 2) &&
                (cellConnections.horizontal[x2 - 1][y2].flipped == cellConnections.horizontal[x2 - 1][y2].mixed) &&
                cellGrid[x2 - 1][y2].bit == 0);
            break;
          case 2:
            bit |=
              ((cellConnections.horizontal[x2 - 1][y2].type.upperType == 1) &&
                (!cellConnections.horizontal[x2 - 1][y2].flipped) &&
                cellGrid[x2 - 1][y2].bit.upperBit == 1) ||
              ((cellConnections.horizontal[x2 - 1][y2].type.upperType == 2) &&
                (!cellConnections.horizontal[x2 - 1][y2].flipped) &&
                cellGrid[x2 - 1][y2].bit.upperBit == 0);
            bit |=
              ((cellConnections.horizontal[x2 - 1][y2].type.lowerType == 1) &&
                (cellConnections.horizontal[x2 - 1][y2].flipped == cellConnections.horizontal[x2 - 1][y2].mixed) &&
                cellGrid[x2 - 1][y2].bit.lowerBit == 1) ||
              ((cellConnections.horizontal[x2 - 1][y2].type.lowerType == 2) &&
                (cellConnections.horizontal[x2 - 1][y2].flipped == cellConnections.horizontal[x2 - 1][y2].mixed) &&
                cellGrid[x2 - 1][y2].bit.lowerBit == 0);
            break;
        }
      }
      if (x2 < gridWidth - 1) {
        switch (cellGrid[x2 + 1][y2].type) {
          case 1:
            bit |=
              ((cellConnections.horizontal[x2][y2].type.upperType == 1) &&
                cellConnections.horizontal[x2][y2].flipped &&
                cellGrid[x2 + 1][y2].bit == 1) ||
              ((cellConnections.horizontal[x2][y2].type.upperType == 2) &&
                cellConnections.horizontal[x2][y2].flipped &&
                cellGrid[x2 + 1][y2].bit == 0);
            bit |=
              ((cellConnections.horizontal[x2][y2].type.lowerType == 1) &&
                (cellConnections.horizontal[x2][y2].flipped != cellConnections.horizontal[x2][y2].mixed) &&
                cellGrid[x2 + 1][y2].bit == 1) ||
              ((cellConnections.horizontal[x2][y2].type.lowerType == 2) &&
                (cellConnections.horizontal[x2][y2].flipped != cellConnections.horizontal[x2][y2].mixed) &&
                cellGrid[x2 + 1][y2].bit == 0);
            break;
          case 2:
            bit |=
              ((cellConnections.horizontal[x2][y2].type.upperType == 1) &&
                cellConnections.horizontal[x2][y2].flipped &&
                cellGrid[x2 + 1][y2].bit.upperBit == 1) ||
              ((cellConnections.horizontal[x2][y2].type.upperType == 2) &&
                cellConnections.horizontal[x2][y2].flipped &&
                cellGrid[x2 + 1][y2].bit.upperBit == 0);
            bit |=
              ((cellConnections.horizontal[x2][y2].type.lowerType == 1) &&
                (cellConnections.horizontal[x2][y2].flipped != cellConnections.horizontal[x2][y2].mixed) &&
                cellGrid[x2 + 1][y2].bit.lowerBit == 1) ||
              ((cellConnections.horizontal[x2][y2].type.lowerType == 2) &&
                (cellConnections.horizontal[x2][y2].flipped != cellConnections.horizontal[x2][y2].mixed) &&
                cellGrid[x2 + 1][y2].bit.lowerBit == 0);
            break;
        }
      }
      if (y2 > 0) {
        switch (cellGrid[x2][y2 - 1].type) {
          case 1:
            bit |=
              ((cellConnections.vertical[x2][y2 - 1].type.upperType == 1) &&
                !cellConnections.vertical[x2][y2 - 1].flipped &&
                cellGrid[x2][y2 - 1].bit == 1) ||
              ((cellConnections.vertical[x2][y2 - 1].type.upperType == 2) &&
                !cellConnections.vertical[x2][y2 - 1].flipped &&
                cellGrid[x2][y2 - 1].bit == 0);
            bit |=
              ((cellConnections.vertical[x2][y2 - 1].type.lowerType == 1) &&
                (cellConnections.vertical[x2][y2 - 1].flipped == cellConnections.vertical[x2][y2 - 1].mixed) &&
                cellGrid[x2][y2 - 1].bit == 1) ||
              ((cellConnections.vertical[x2][y2 - 1].type.lowerType == 2) &&
                (cellConnections.vertical[x2][y2 - 1].flipped == cellConnections.vertical[x2][y2 - 1].mixed) &&
                cellGrid[x2][y2 - 1].bit == 0);
            break;
          case 2:
            bit |=
              ((cellConnections.vertical[x2][y2 - 1].type.upperType == 1) &&
                !cellConnections.vertical[x2][y2 - 1].flipped &&
                cellGrid[x2][y2 - 1].bit.upperBit == 1) ||
              ((cellConnections.vertical[x2][y2 - 1].type.upperType == 2) &&
                !cellConnections.vertical[x2][y2 - 1].flipped &&
                cellGrid[x2][y2 - 1].bit.upperBit == 0);
            bit |=
              ((cellConnections.vertical[x2][y2 - 1].type.lowerType == 1) &&
                (cellConnections.vertical[x2][y2 - 1].flipped == cellConnections.vertical[x2][y2 - 1].mixed) &&
                cellGrid[x2][y2 - 1].bit.lowerBit == 1) ||
              ((cellConnections.vertical[x2][y2 - 1].type.lowerType == 2) &&
                (cellConnections.vertical[x2][y2 - 1].flipped == cellConnections.vertical[x2][y2 - 1].mixed) &&
                cellGrid[x2][y2 - 1].bit.lowerBit == 0);
            break;
        }
      }
      if (y2 < gridHeight - 1) {
        switch (cellGrid[x2][y2 + 1].type) {
          case 1:
            bit |=
              ((cellConnections.vertical[x2][y2].type.upperType == 1) &&
                cellConnections.vertical[x2][y2].flipped &&
                cellGrid[x2][y2 + 1].bit == 1) ||
              ((cellConnections.vertical[x2][y2].type.upperType == 2) &&
                cellConnections.vertical[x2][y2].flipped &&
                cellGrid[x2][y2 + 1].bit == 0);
            bit |=
              ((cellConnections.vertical[x2][y2].type.lowerType == 1) &&
                (cellConnections.vertical[x2][y2].flipped != cellConnections.vertical[x2][y2].mixed) &&
                cellGrid[x2][y2 + 1].bit == 1) ||
              ((cellConnections.vertical[x2][y2].type.lowerType == 2) &&
                (cellConnections.vertical[x2][y2].flipped != cellConnections.vertical[x2][y2].mixed) &&
                cellGrid[x2][y2 + 1].bit == 0);
            break;
          case 2:
            bit |=
              ((cellConnections.vertical[x2][y2].type.upperType == 1) &&
                cellConnections.vertical[x2][y2].flipped &&
                cellGrid[x2][y2 + 1].bit.upperBit == 1) ||
              ((cellConnections.vertical[x2][y2].type.upperType == 2) &&
                cellConnections.vertical[x2][y2].flipped &&
                cellGrid[x2][y2 + 1].bit.upperBit == 0);
            bit |=
              ((cellConnections.vertical[x2][y2].type.lowerType == 1) &&
                (cellConnections.vertical[x2][y2].flipped != cellConnections.vertical[x2][y2].mixed) &&
                cellGrid[x2][y2 + 1].bit.lowerBit == 1) ||
              ((cellConnections.vertical[x2][y2].type.lowerType == 2) &&
                (cellConnections.vertical[x2][y2].flipped != cellConnections.vertical[x2][y2].mixed) &&
                cellGrid[x2][y2 + 1].bit.lowerBit == 0);
            break;
        }
      }
      newGrid[x2][y2].bit = bit;
    })
    culling.tick2.forEach((item) => {
      if (!auto || !paused) {
        let x2 = item[0];
        let y2 = item[1];
        let bit = 0;
        switch (item[2]) {
          case 0:
            if (x2 > 0) {
              switch (cellGrid[x2 - 1][y2].type) {
                case 1:
                  bit |=
                    (((cellConnections.horizontal[x2 - 1][y2].type.lowerType) == 1) &&
                      (cellConnections.horizontal[x2 - 1][y2].flipped) == cellConnections.horizontal[x2 - 1][y2].mixed &&
                      cellGrid[x2 - 1][y2].bit == 1) ||
                    (((cellConnections.horizontal[x2 - 1][y2].type.lowerType) == 2) &&
                      (cellConnections.horizontal[x2 - 1][y2].flipped) == cellConnections.horizontal[x2 - 1][y2].mixed &&
                      cellGrid[x2 - 1][y2].bit == 0);
                  break;
                case 2:
                  bit |=
                    (((cellConnections.horizontal[x2 - 1][y2].type.lowerType) == 1) &&
                      (cellConnections.horizontal[x2 - 1][y2].flipped) == cellConnections.horizontal[x2 - 1][y2].mixed &&
                      cellGrid[x2 - 1][y2].bit.lowerBit == 1) ||
                    (((cellConnections.horizontal[x2 - 1][y2].type.lowerType) == 2) &&
                      (cellConnections.horizontal[x2 - 1][y2].flipped) == cellConnections.horizontal[x2 - 1][y2].mixed &&
                      cellGrid[x2 - 1][y2].bit.lowerBit == 0);
                  break;
              }
            }
            if (x2 < gridWidth - 1) {
              switch (cellGrid[x2 + 1][y2].type) {
                case 1:
                  bit |=
                    (((cellConnections.horizontal[x2][y2].type.lowerType) == 1) &&
                      (cellConnections.horizontal[x2][y2].flipped) != cellConnections.horizontal[x2][y2].mixed &&
                      cellGrid[x2 + 1][y2].bit == 1) ||
                    (((cellConnections.horizontal[x2][y2].type.lowerType) == 2) &&
                      (cellConnections.horizontal[x2][y2].flipped) != cellConnections.horizontal[x2][y2].mixed &&
                      cellGrid[x2 + 1][y2].bit == 0);
                  break;
                case 2:
                  bit |=
                    (((cellConnections.horizontal[x2][y2].type.lowerType) == 1) &&
                      (cellConnections.horizontal[x2][y2].flipped) != cellConnections.horizontal[x2][y2].mixed &&
                      cellGrid[x2 + 1][y2].bit.lowerBit == 1) ||
                    (((cellConnections.horizontal[x2][y2].type.lowerType) == 2) &&
                      (cellConnections.horizontal[x2][y2].flipped) != cellConnections.horizontal[x2][y2].mixed &&
                      cellGrid[x2 + 1][y2].bit.lowerBit == 0);
                  break;
              }
            }
            if (y2 > 0) {
              switch (cellGrid[x2][y2 - 1].type) {
                case 1:
                  bit |=
                    (((cellConnections.vertical[x2][y2 - 1].type.lowerType) == 1) &&
                      (cellConnections.vertical[x2][y2 - 1].flipped) == cellConnections.vertical[x2][y2 - 1].mixed &&
                      cellGrid[x2][y2 - 1].bit == 1) ||
                    (((cellConnections.vertical[x2][y2 - 1].type.lowerType) == 2) &&
                      (cellConnections.vertical[x2][y2 - 1].flipped) == cellConnections.vertical[x2][y2 - 1].mixed &&
                      cellGrid[x2][y2 - 1].bit == 0);
                  break;
                case 2:
                  bit |=
                    (((cellConnections.vertical[x2][y2 - 1].type.lowerType) == 1) &&
                      (cellConnections.vertical[x2][y2 - 1].flipped) == cellConnections.vertical[x2][y2 - 1].mixed &&
                      cellGrid[x2][y2 - 1].bit.lowerBit == 1) ||
                    (((cellConnections.vertical[x2][y2 - 1].type.lowerType) == 2) &&
                      (cellConnections.vertical[x2][y2 - 1].flipped) == cellConnections.vertical[x2][y2 - 1].mixed &&
                      cellGrid[x2][y2 - 1].bit.lowerBit == 0);
                  break;
              }
            }
            if (y2 < gridHeight - 1) {
              switch (cellGrid[x2][y2 + 1].type) {
                case 1:
                  bit |=
                    (((cellConnections.vertical[x2][y2].type.lowerType) == 1) &&
                      (cellConnections.vertical[x2][y2].flipped) != cellConnections.vertical[x2][y2].mixed &&
                      cellGrid[x2][y2 + 1].bit == 1) ||
                    (((cellConnections.vertical[x2][y2].type.lowerType) == 2) &&
                      (cellConnections.vertical[x2][y2].flipped) != cellConnections.vertical[x2][y2].mixed &&
                      cellGrid[x2][y2 + 1].bit == 0);
                  break;
                case 2:
                  bit |=
                    (((cellConnections.vertical[x2][y2].type.lowerType) == 1) &&
                      (cellConnections.vertical[x2][y2].flipped) != cellConnections.vertical[x2][y2].mixed &&
                      cellGrid[x2][y2 + 1].bit.lowerBit == 1) ||
                    (((cellConnections.vertical[x2][y2].type.lowerType) == 2) &&
                      (cellConnections.vertical[x2][y2].flipped) != cellConnections.vertical[x2][y2].mixed &&
                      cellGrid[x2][y2 + 1].bit.lowerBit == 0);
                  break;
              }
            }
            bit |=
              ((cellConnections.applicital[x2][y2].type == 1) &&
                (!cellConnections.applicital[x2][y2].flipped) &&
                cellGrid[x2][y2].bit.upperBit == 1) ||
              ((cellConnections.applicital[x2][y2].type == 2) &&
                (!cellConnections.applicital[x2][y2].flipped) &&
                cellGrid[x2][y2].bit.upperBit == 0);
            newGrid[x2][y2].bit.lowerBit = bit;
            break;
          case 1:
            if (x2 > 0) {
              switch (cellGrid[x2 - 1][y2].type) {
                case 1:
                  bit |=
                    (((cellConnections.horizontal[x2 - 1][y2].type.upperType) == 1) &&
                      !cellConnections.horizontal[x2 - 1][y2].flipped &&
                      cellGrid[x2 - 1][y2].bit == 1) ||
                    (((cellConnections.horizontal[x2 - 1][y2].type.upperType) == 2) &&
                      !cellConnections.horizontal[x2 - 1][y2].flipped &&
                      cellGrid[x2 - 1][y2].bit == 0);
                  break;
                case 2:
                  bit |=
                    (((cellConnections.horizontal[x2 - 1][y2].type.upperType) == 1) &&
                      !cellConnections.horizontal[x2 - 1][y2].flipped &&
                      cellGrid[x2 - 1][y2].bit.upperBit == 1) ||
                    (((cellConnections.horizontal[x2 - 1][y2].type.upperType) == 2) &&
                      !cellConnections.horizontal[x2 - 1][y2].flipped &&
                      cellGrid[x2 - 1][y2].bit.upperBit == 0);
                  break;
              }
            }
            if (x2 < gridWidth - 1) {
              switch (cellGrid[x2 + 1][y2].type) {
                case 1:
                  bit |=
                    (((cellConnections.horizontal[x2][y2].type.upperType) == 1) &&
                      cellConnections.horizontal[x2][y2].flipped &&
                      cellGrid[x2 + 1][y2].bit == 1) ||
                    (((cellConnections.horizontal[x2][y2].type.upperType) == 2) &&
                      cellConnections.horizontal[x2][y2].flipped &&
                      cellGrid[x2 + 1][y2].bit == 0);
                  break;
                case 2:
                  bit |=
                    (((cellConnections.horizontal[x2][y2].type.upperType) == 1) &&
                      cellConnections.horizontal[x2][y2].flipped &&
                      cellGrid[x2 + 1][y2].bit.upperBit == 1) ||
                    (((cellConnections.horizontal[x2][y2].type.upperType) == 2) &&
                      cellConnections.horizontal[x2][y2].flipped &&
                      cellGrid[x2 + 1][y2].bit.upperBit == 0);
                  break;
              }
            }
            if (y2 > 0) {
              switch (cellGrid[x2][y2 - 1].type) {
                case 1:
                  bit |=
                    (((cellConnections.vertical[x2][y2 - 1].type.upperType) == 1) &&
                      !cellConnections.vertical[x2][y2 - 1].flipped &&
                      cellGrid[x2][y2 - 1].bit == 1) ||
                    (((cellConnections.vertical[x2][y2 - 1].type.upperType) == 2) &&
                      !cellConnections.vertical[x2][y2 - 1].flipped &&
                      cellGrid[x2][y2 - 1].bit == 0);
                  break;
                case 2:
                  bit |=
                    (((cellConnections.vertical[x2][y2 - 1].type.upperType) == 1) &&
                      !cellConnections.vertical[x2][y2 - 1].flipped &&
                      cellGrid[x2][y2 - 1].bit.upperBit == 1) ||
                    (((cellConnections.vertical[x2][y2 - 1].type.upperType) == 2) &&
                      !cellConnections.vertical[x2][y2 - 1].flipped &&
                      cellGrid[x2][y2 - 1].bit.upperBit == 0);
                  break;
              }
            }
            if (y2 < gridHeight - 1) {
              switch (cellGrid[x2][y2 + 1].type) {
                case 1:
                  bit |=
                    (((cellConnections.vertical[x2][y2].type.upperType) == 1) &&
                      (cellConnections.vertical[x2][y2].flipped &&
                        cellGrid[x2][y2 + 1].bit == 1)) ||
                    (((cellConnections.vertical[x2][y2].type.upperType) == 2) &&
                      cellConnections.vertical[x2][y2].flipped &&
                      cellGrid[x2][y2 + 1].bit == 0);
                  break;
                case 2:
                  bit |=
                    (((cellConnections.vertical[x2][y2].type.upperType) == 1) &&
                      cellConnections.vertical[x2][y2].flipped &&
                      cellGrid[x2][y2 + 1].bit.upperBit == 1) ||
                    (((cellConnections.vertical[x2][y2].type.upperType) == 2) &&
                      cellConnections.vertical[x2][y2].flipped &&
                      cellGrid[x2][y2 + 1].bit.upperBit == 0);
                  break;
              }
            }
            bit |=
              ((cellConnections.applicital[x2][y2].type == 1) &&
                (cellConnections.applicital[x2][y2].flipped) &&
                cellGrid[x2][y2].bit.lowerBit == 1) ||
              ((cellConnections.applicital[x2][y2].type == 2) &&
                (cellConnections.applicital[x2][y2].flipped) &&
                cellGrid[x2][y2].bit.lowerBit == 0);
            newGrid[x2][y2].bit.upperBit = bit;
            break;
        }
      }
    })
    if (!auto || !paused) {
      cellGrid = newGrid;
    }
    //timing  
    if (!realtime && !paused && auto) {
      if (!start) {
        start = new Date().getTime();
        nextAt = start;
      }
      nextAt += tickRate;

      var drift = (new Date().getTime() - start) - (ticks * tickRate)
      if (drift > tickRate) {
        let ticksBehind = Math.floor(drift / tickRate)
        document.getElementById("behindDiv").style.visibility = "visible";
        document.getElementById("behind").textContent = "Running Behind " + ticksBehind + (ticksBehind == 1 ? " tick!" : " ticks!")
      }
      else {
        document.getElementById("behindDiv").style.visibility = "hidden";
      }
      ticks++
      if (recovery) {
        let count = driftAscention.filter(value => value === true).length;
        console.log("count: " + count, "drift: " + drift)
        if ((count >= 8) && (drift > (10 * tickRate))) {
          document.getElementById("unstable").style.visibility = "visible";
          console.warn("unstable, rasing tickrate to: " + tickRate)
          setTick(false, tickRate * 2)
        }
        else {
          document.getElementById("unstable").style.visibility = "hidden";
        }
        driftAscention.unshift(Math.floor(drift / tickRate) > Math.floor(lastDrift / tickRate));
        driftAscention.pop();
        lastDrift = drift
      }
      setTimeout(tick, nextAt - new Date().getTime());
    }
  }
}

requestAnimationFrame(update);