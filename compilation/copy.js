//eggs
//"3.ly/_"
//update blueprint from console:
//cellGrid = cellGrid.map((e) => {return e.map((f) => {return {type: 0, bit: f}})});cullingMap();

//cellConnections.horizontal = cellConnections.horizontal.map((item) => {return item.map((item2) => {stringified = JSON.stringify(item2);return JSON.parse(stringified.substring(0, stringified.length-1)+',"static":true, "mixed":false}')})});cellConnections.vertical = cellConnections.vertical.map((item) => {return item.map((item2) => {stringified = JSON.stringify(item2);return JSON.parse(stringified.substring(0, stringified.length-1)+',"static":true,"mixed":false}')})})
//<parameters>
var gridWidth = 9;
//width of the cell grid
var gridHeight = 9; //height of the cell grid
var quality = 2; //image quality from 0-2 (0 being don't draw at all and 2 being vector quality)
var drift = 50; //how far to drift when letting go after moving and when returning home
//DO NOT CHANGE WHILE RUNNING, instead use: gridResize(width, height)
var realtime = false; //if ticks should be run in realtime as fast as possible or on a clock
var default2Cell = false; // if to make the default cell type a 2-cell
var tickRate = 100; //time to wait between each tick in miliseconds if realtime is off
//better off changing with setTick(realtime, tickRate)
var recovery = false; //if the program should try to recover if it can't keep up
var record = true; //enable recording from the console with mediaRecorder.start();/mediaRecorder.stop();
var muted = true; //if soundtrakcs should be muted by default
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
var connection = false;
var driftCharge = 0;
var driftx = 0;
var drifty = 0;
var tickDrift = 0
var extra = 1;
var homeCharge = 0;
//<mobile>
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  // true for mobile device
  var mobile = true;
  quality = 1
  //document.getElementById("modeRadio").style.visibility = "visible";
  document.getElementById("mobileControls").style.visibility = "visible";
} else {
  // false for not mobile device
  var mobile = false
}
//</mobile>
var magicNumber = 1;
var driftAscention = Array(20).fill(0);
var lastDrift = 0;
var lastCell;
var cursorStatic = false;
var newGrid;
//var soundtracks = ["LabyrinthOfMirrors", "WidePlain", "PaperPete", "Select", "TheTideIsRising", "Compass", "Hydra", "TheReversal", "Genome", "CorporateJapan"]
var soundtracks = ["https://drive.google.com/uc?export=download&id=1SEhtmPk-VuIYk9EzTfnretk62DzIWK3k",
  "https://drive.google.com/uc?export=download&id=1In6dTH9f4jT5QjMzqmMreAm5oZ6pLdbf",
  "https://drive.google.com/uc?export=download&id=1_UASirXo1GB1BUV24Jk4MYz71fQW0kXQ",
  "https://drive.google.com/uc?export=download&id=1HTc1Znubb_v1pFTyvsaVC1rdfHSBr2rn",
  "https://drive.google.com/uc?export=download&id=1_lrAyHc9RkPCoZ03rPdLpX8PLJTMdf1c",
  "https://drive.google.com/uc?export=download&id=1cq0KR7B_3Dbku3668iSCtE5Q-Fbdnsmd",
  "https://drive.google.com/uc?export=download&id=1NACj9P4KPASmT9mDBvuuJ4UcnH7IYizr",
  "https://drive.google.com/uc?export=download&id=1FIWCweWhOkJgBjq8xhbs9RERo9fby_YK",
  "https://drive.google.com/uc?export=download&id=1n3AwpuPk72-bxCENutLuGhjc5tyg2ukF",
  "https://drive.google.com/uc?export=download&id=16zToeg8eqVK9nciCMdR0rzDzX5pP6hEw"]
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
var lastTouches = [{ pageX: 0, pageY: 0 }];
var w = canvas.width;
var h = canvas.height;
var start;
var nextAt;
var ticks = 0;
var quantities = document.getElementById("tickRateControl")
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
    if ((((Math.min(canvas.width, canvas.height) < (gridSize * size))) && (sc > 1)) || ((Math.max(canvas.width, canvas.height) / 400 > (gridSize * size)) && (sc < 1))) {
      this.scale = lastScale
    }
    else {
      if ((Math.floor(Math.log2(lastScale)) != Math.floor(Math.log2(this.scale))) && (!mobile)) {
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
var mouse = {
  x: 0,
  y: 0,
  controlX: 0,
  controlY: 0,
  button: false,
  wheel: 0,
  lastX: 0,
  lastY: 0,
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
  };
  mediaRecorder.onstop = function(e) {
    var blob = new Blob(chunks, { 'type': 'video/mp4' });
    chunks = [];
    var videoURL = URL.createObjectURL(blob);
    window.open(videoURL)
  };
  mediaRecorder.ondataavailable = function(e) {
    chunks.push(e.data);
  };
}
quantities.children[2].value = 10;
quantities.children[2].onchange = (() => realtimeCheck());
quantities.children[1].addEventListener('click', () => change_quantity(-1));
quantities.children[3].addEventListener('click', () => change_quantity(1));
/*
if (localStorage.getItem("orcells") === null) {
  localStorage.setItem("orcells", emptyGrid);
} else {
  let localGrid = localStorage.getItem('orcells');
  cellGrid = JSON.parse(localGrid).cells;
  cellConnections = JSON.parse(localGrid).connections;
}
*/
let localMute = localStorage.getItem("mute") === "true"
let localTrack = localStorage.getItem("track")
let localCurrentTime = localStorage.getItem("currentTime")
if (localMute === null) {
  localStorage.setItem("mute", true)
}
else {
  muted = localMute
  document.getElementById("muteCross").style.visibility = localMute ? "visible" : "hidden"
}
if (localTrack === null) {
  var soundtrackIndex = Math.floor(Math.random() * soundtracks.length);
  localStorage.setItem("track", soundtrackIndex)
}
else {
  var soundtrackIndex = Number(localTrack)
}
//var soundtrackAudio = new Audio("./soundtracks/" + soundtracks[soundtrackIndex] + ".mp3");
var soundtrackAudio = new Audio(soundtracks[soundtrackIndex]);
soundtrackAudio.volume = 0.5
if (localCurrentTime === null) {
  localStorage.setItem("currentTime", 0)
}
else {
  soundtrackAudio.currentTime = Number(localCurrentTime)
}
window.onunload = (() => {
  localStorage.setItem("currentTime", soundtrackAudio.currentTime)
})
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
      break;
    case ".":
      tick(false)
      break;
    case "/":
      toggleRealtime();
      break;
    case "m":
    case "M":
    case "µ":
    case "Â":
      mute();
      break;
    case "ArrowUp":
      e.preventDefault();
      change_quantity(1)
      break;
    case "ArrowDown":
      e.preventDefault();
      change_quantity(-1)
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
imgT1B1.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='144pt' height='144pt' version='1.0'%3E%3Cpath fill='%23eee' fill-rule='evenodd' stroke='%23333' stroke-linejoin='round' stroke-width='6.72663' d='m118 63 49 33-49 33Z' transform='matrix(1.4644 0 0 1.50838 -113 -49)'/%3E%3C/svg%3E";
imgT2B2.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='144pt' height='144pt' version='1.0'%3E%3Cg fill='%23eee' fill-rule='evenodd' stroke='%23333' stroke-linejoin='round' stroke-width='10.29989936' transform='matrix(1.4644 0 0 1.50838 -113 -49)'%3E%3Cpath stroke-width='6.72663' d='m118 63 49 33-49 33Z'/%3E%3Cellipse cx='171.64027' cy='96' stroke-linecap='round' stroke-width='6.70434' rx='8.7565432' ry='8.4034777'/%3E%3C/g%3E%3C/svg%3E";
imgCross.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xml:space='preserve' viewBox='0 0 144 144'%3E%3Cpath fill='%23333' d='M106 96 82 72l24-24a7 7 0 1 0-10-10L72 62 48 38a7 7 0 1 0-10 10l24 24-24 24a7 7 0 1 0 10 10l24-24 24 24a7 7 0 1 0 10-10z'/%3E%3C/svg%3E";
imgBT1.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='144pt' height='144pt' version='1.0'%3E%3Cdefs%3E%3ClinearGradient id='a'%3E%3Cstop offset='0' stop-color='%2300f'/%3E%3Cstop offset='1' stop-color='red'/%3E%3C/linearGradient%3E%3ClinearGradient xlink:href='%23a' id='b' x1='114.72217' x2='154.50781' y1='96' y2='96' gradientTransform='matrix(0 -.59997 .90948 0 55 184)' gradientUnits='userSpaceOnUse'/%3E%3C/defs%3E%3Cpath fill='url(%23b)' fill-rule='evenodd' stroke='%23333' stroke-linejoin='round' stroke-width='4.9689' d='m112 118 31-30 30 30z' transform='matrix(1.4644 0 0 1.50838 -113 -49)'/%3E%3C/svg%3E";
imgBT2.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='144pt' height='144pt' version='1.0'%3E%3Cdefs%3E%3ClinearGradient id='a'%3E%3Cstop offset='0' stop-color='%2300f'/%3E%3Cstop offset='1' stop-color='red'/%3E%3C/linearGradient%3E%3ClinearGradient xlink:href='%23a' id='b' x1='114.72217' x2='154.50781' y1='96' y2='96' gradientTransform='matrix(0 -.59997 .90948 0 55 184)' gradientUnits='userSpaceOnUse'/%3E%3C/defs%3E%3Cg fill-rule='evenodd' stroke='%23333' stroke-linejoin='round' stroke-width='10.29989936' transform='matrix(1.4644 0 0 1.50838 -113 -49)'%3E%3Cpath fill='url(%23b)' stroke-width='4.9689' d='m112 118 31-30 30 30z'/%3E%3Cellipse cx='-82.535233' cy='142.55943' fill='red' stroke-linecap='round' stroke-width='6.02604' rx='7.5532703' ry='7.870615' transform='rotate(-90)'/%3E%3C/g%3E%3C/svg%3E";
imgTB1.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='144pt' height='144pt' version='1.0'%3E%3Cdefs%3E%3ClinearGradient id='a'%3E%3Cstop offset='0' stop-color='red'/%3E%3Cstop offset='1' stop-color='%2300f'/%3E%3C/linearGradient%3E%3ClinearGradient xlink:href='%23a' id='b' x1='114.72217' x2='154.50781' y1='96' y2='96' gradientTransform='matrix(0 .59997 -.90948 0 230 8)' gradientUnits='userSpaceOnUse'/%3E%3C/defs%3E%3Cpath fill='url(%23b)' fill-rule='evenodd' stroke='%23333' stroke-linejoin='round' stroke-width='4.9689' d='m173 74-30 30-31-30Z' transform='matrix(1.4644 0 0 1.50838 -113 -49)'/%3E%3C/svg%3E";
imgTB2.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='144pt' height='144pt' version='1.0'%3E%3Cdefs%3E%3ClinearGradient id='a'%3E%3Cstop offset='0' stop-color='red'/%3E%3Cstop offset='1' stop-color='%2300f'/%3E%3C/linearGradient%3E%3ClinearGradient xlink:href='%23a' id='b' x1='114.72217' x2='154.50781' y1='96' y2='96' gradientTransform='matrix(0 .59997 -.90948 0 230 8)' gradientUnits='userSpaceOnUse'/%3E%3C/defs%3E%3Cg fill-rule='evenodd' stroke='%23333' stroke-linejoin='round' stroke-width='10.29989936' transform='matrix(1.4644 0 0 1.50838 -113 -49)'%3E%3Cpath fill='url(%23b)' stroke-width='4.9689' d='m173 74-30 30-31-30Z'/%3E%3Cellipse cx='109.46476' cy='-142.55853' fill='%2300f' stroke-linecap='round' stroke-width='6.02604' rx='7.5532703' ry='7.870615' transform='rotate(90)'/%3E%3C/g%3E%3C/svg%3E";
imgT0B1.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='144pt' height='144pt' version='1.0'%3E%3Cpath fill='%2300f' fill-rule='evenodd' stroke='%23333' stroke-linejoin='round' stroke-width='6.72663' d='m118 63 49 33-49 33Z' transform='matrix(1.4644 0 0 1.50838 -113 -49)'/%3E%3C/svg%3E";
imgT0B2.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='144pt' height='144pt' version='1.0'%3E%3Cg fill='%2300f' fill-rule='evenodd' stroke='%23333' stroke-linejoin='round' stroke-width='10.29989936' transform='matrix(1.4644 0 0 1.50838 -113 -49)'%3E%3Cpath stroke-width='6.72663' d='m118 63 49 33-49 33Z'/%3E%3Cellipse cx='171.64041' cy='96' stroke-linecap='round' stroke-width='6.70437' rx='8.7566566' ry='8.4034605'/%3E%3C/g%3E%3C/svg%3E";
imgT1B0.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='144pt' height='144pt' version='1.0'%3E%3Cpath fill='red' fill-rule='evenodd' stroke='%23333' stroke-linejoin='round' stroke-width='6.72663' d='m118 63 49 33-49 33Z' transform='matrix(1.4644 0 0 1.50838 -113 -49)'/%3E%3C/svg%3E";
imgT1B1F.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='144pt' height='144pt' version='1.0'%3E%3Cdefs%3E%3ClinearGradient id='a'%3E%3Cstop offset='0' stop-color='red'/%3E%3Cstop offset='1' stop-color='%2300f'/%3E%3C/linearGradient%3E%3ClinearGradient xlink:href='%23a' id='d' x1='138.83206' x2='159.51738' y1='96.00013' y2='96.00013' gradientUnits='userSpaceOnUse'/%3E%3CclipPath id='c' clipPathUnits='userSpaceOnUse'%3E%3Cpath fill='%230f0' fill-opacity='.449324' stroke-width='3.77957' d='M77 32h66v128H77z'/%3E%3C/clipPath%3E%3CclipPath id='b' clipPathUnits='userSpaceOnUse'%3E%3Cpath fill='%230f0' fill-opacity='.466216' stroke-width='8.42636' d='M-143-160h66v128h-66z' transform='scale(-1)'/%3E%3C/clipPath%3E%3C/defs%3E%3Cg stroke-width='10.29989936'%3E%3Cg fill='%2300f' stroke='%23333' stroke-width='6.72664772' clip-path='url(%23b)' style='mix-blend-mode:normal' transform='matrix(-1.4644 0 0 -1.50838 305 241)'%3E%3Cpath fill-rule='evenodd' stroke-linejoin='round' d='m118 63 49 33-49 33Z'/%3E%3C/g%3E%3Cg fill='red' stroke-width='6.72665' clip-path='url(%23c)' style='mix-blend-mode:normal' transform='matrix(1.4644 0 0 1.50838 -113 -49)'%3E%3Cpath fill-rule='evenodd' stroke='%23333' stroke-linejoin='round' d='m118 63 49 33-49 33Z'/%3E%3C/g%3E%3Cpath fill='url(%23d)' fill-rule='evenodd' stroke='%23333' stroke-linejoin='round' stroke-width='6.72664772' d='m149 108 18-12-18-12-18 12Z' style='mix-blend-mode:normal' transform='matrix(-1.4644 0 0 -1.50838 314 241)'/%3E%3Cpath fill='%23333' d='M94 110h6v18h-6zM94 64h6v18h-6z'/%3E%3C/g%3E%3C/svg%3E";
imgT1B2.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='144pt' height='144pt' version='1.0'%3E%3Cg fill-rule='evenodd' stroke='%23333' stroke-linejoin='round' stroke-width='10.29989936' transform='matrix(1.4644 0 0 1.50838 -113 -49)'%3E%3Cpath fill='%23eee' stroke-width='6.72663' d='m118 63 49 33-49 33Z'/%3E%3Cellipse cx='171.64041' cy='96' fill='%2300f' stroke-linecap='round' stroke-width='6.70437' rx='8.7566566' ry='8.4034605'/%3E%3C/g%3E%3C/svg%3E";
imgT1B2F.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='144pt' height='144pt' version='1.0'%3E%3Cdefs%3E%3ClinearGradient id='a'%3E%3Cstop offset='0' stop-color='red'/%3E%3Cstop offset='1' stop-color='%2300f'/%3E%3C/linearGradient%3E%3ClinearGradient xlink:href='%23a' id='d' x1='138.83206' x2='159.51738' y1='96.00013' y2='96.00013' gradientUnits='userSpaceOnUse'/%3E%3CclipPath id='c' clipPathUnits='userSpaceOnUse'%3E%3Cpath fill='%230f0' fill-opacity='.449324' stroke-width='3.77957' d='M77 32h66v128H77z'/%3E%3C/clipPath%3E%3CclipPath id='b' clipPathUnits='userSpaceOnUse'%3E%3Cpath fill='%230f0' fill-opacity='.466216' stroke-width='8.42636' d='M-143-160h66v128h-66z' transform='scale(-1)'/%3E%3C/clipPath%3E%3C/defs%3E%3Cg stroke-width='10.29989936' transform='matrix(1.4644 0 0 1.50838 -113 -49)'%3E%3Cg fill='%2300f' stroke='%23333' stroke-width='6.72664772' clip-path='url(%23b)' style='mix-blend-mode:normal' transform='rotate(180 143 96)'%3E%3Cpath fill-rule='evenodd' stroke-linejoin='round' d='m118 63 49 33-49 33Z'/%3E%3C/g%3E%3Cg fill='red' stroke-width='6.72665' clip-path='url(%23c)' style='mix-blend-mode:normal'%3E%3Cpath fill-rule='evenodd' stroke='%23333' stroke-linejoin='round' d='m118 63 49 33-49 33Z'/%3E%3C/g%3E%3Cpath fill='url(%23d)' fill-rule='evenodd' stroke='%23333' stroke-linejoin='round' stroke-width='6.72664772' d='m149 108 18-12-18-12-18 12Z' style='mix-blend-mode:normal' transform='rotate(180 146 96)'/%3E%3Cpath fill='%23333' d='M141 105h4v12h-4zM141 75h4v12h-4z'/%3E%3Cellipse cx='-113.4769' cy='-96' fill='%2300f' fill-rule='evenodd' stroke='%23333' stroke-linecap='round' stroke-linejoin='round' stroke-width='6.70437' rx='8.7566566' ry='8.4034605' transform='scale(-1)'/%3E%3C/g%3E%3C/svg%3E";
imgT2B0.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='144pt' height='144pt' version='1.0'%3E%3Cg fill='red' fill-rule='evenodd' stroke='%23333' stroke-linejoin='round' stroke-width='10.29989936' transform='matrix(1.4644 0 0 1.50838 -113 -49)'%3E%3Cpath stroke-width='6.72663' d='m118 63 49 33-49 33Z'/%3E%3Cellipse cx='171.64041' cy='96' stroke-linecap='round' stroke-width='6.70437' rx='8.7566566' ry='8.4034605'/%3E%3C/g%3E%3C/svg%3E";
imgT2B1.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='144pt' height='144pt' version='1.0'%3E%3Cg fill-rule='evenodd' stroke='%23333' stroke-linejoin='round' stroke-width='10.29989936' transform='matrix(1.4644 0 0 1.50838 -113 -49)'%3E%3Cpath fill='%23eee' stroke-width='6.72663' d='m118 63 49 33-49 33Z'/%3E%3Cellipse cx='171.64041' cy='96' fill='red' stroke-linecap='round' stroke-width='6.70437' rx='8.7566566' ry='8.4034605'/%3E%3C/g%3E%3C/svg%3E";
imgT2B1F.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='144pt' height='144pt' version='1.0'%3E%3Cdefs%3E%3ClinearGradient id='a'%3E%3Cstop offset='0' stop-color='red'/%3E%3Cstop offset='1' stop-color='%2300f'/%3E%3C/linearGradient%3E%3ClinearGradient xlink:href='%23a' id='d' x1='138.83206' x2='159.51738' y1='96.00013' y2='96.00013' gradientUnits='userSpaceOnUse'/%3E%3CclipPath id='c' clipPathUnits='userSpaceOnUse'%3E%3Cpath fill='%230f0' fill-opacity='.449324' stroke-width='3.77957' d='M77 32h66v128H77z'/%3E%3C/clipPath%3E%3CclipPath id='b' clipPathUnits='userSpaceOnUse'%3E%3Cpath fill='%230f0' fill-opacity='.466216' stroke-width='8.42636' d='M-143-160h66v128h-66z' transform='scale(-1)'/%3E%3C/clipPath%3E%3C/defs%3E%3Cg stroke-width='10.29989936' transform='matrix(1.4644 0 0 1.50838 -113 -49)'%3E%3Cg fill='%2300f' stroke='%23333' stroke-width='6.72664772' clip-path='url(%23b)' style='mix-blend-mode:normal' transform='rotate(180 143 96)'%3E%3Cpath fill-rule='evenodd' stroke-linejoin='round' d='m118 63 49 33-49 33Z'/%3E%3C/g%3E%3Cg fill='red' stroke-width='6.72665' clip-path='url(%23c)' style='mix-blend-mode:normal'%3E%3Cpath fill-rule='evenodd' stroke='%23333' stroke-linejoin='round' d='m118 63 49 33-49 33Z'/%3E%3C/g%3E%3Cpath fill='url(%23d)' fill-rule='evenodd' stroke='%23333' stroke-linejoin='round' stroke-width='6.72664772' d='m149 108 18-12-18-12-18 12Z' style='mix-blend-mode:normal' transform='rotate(180 146 96)'/%3E%3Cpath fill='%23333' d='M141 105h4v12h-4zM141 75h4v12h-4z'/%3E%3Cellipse cx='171.64041' cy='96' fill='red' fill-rule='evenodd' stroke='%23333' stroke-linecap='round' stroke-linejoin='round' stroke-width='6.70437' rx='8.7566566' ry='8.4034605'/%3E%3C/g%3E%3C/svg%3E";
imgT2B2F.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='144pt' height='144pt' version='1.0'%3E%3Cdefs%3E%3ClinearGradient id='a'%3E%3Cstop offset='0' stop-color='red'/%3E%3Cstop offset='1' stop-color='%2300f'/%3E%3C/linearGradient%3E%3ClinearGradient xlink:href='%23a' id='d' x1='138.83206' x2='159.51738' y1='96.00013' y2='96.00013' gradientUnits='userSpaceOnUse'/%3E%3CclipPath id='c' clipPathUnits='userSpaceOnUse'%3E%3Cpath fill='%230f0' fill-opacity='.449324' stroke-width='3.77957' d='M77 32h66v128H77z'/%3E%3C/clipPath%3E%3CclipPath id='b' clipPathUnits='userSpaceOnUse'%3E%3Cpath fill='%230f0' fill-opacity='.466216' stroke-width='8.42636' d='M-143-160h66v128h-66z' transform='scale(-1)'/%3E%3C/clipPath%3E%3C/defs%3E%3Cg stroke-width='10.29989936' transform='matrix(1.4644 0 0 1.50838 -113 -49)'%3E%3Cg fill='%2300f' stroke='%23333' stroke-width='6.72664772' clip-path='url(%23b)' style='mix-blend-mode:normal' transform='rotate(180 143 96)'%3E%3Cpath fill-rule='evenodd' stroke-linejoin='round' d='m118 63 49 33-49 33Z'/%3E%3C/g%3E%3Cg fill='red' stroke-width='6.72665' clip-path='url(%23c)' style='mix-blend-mode:normal'%3E%3Cpath fill-rule='evenodd' stroke='%23333' stroke-linejoin='round' d='m118 63 49 33-49 33Z'/%3E%3C/g%3E%3Cpath fill='url(%23d)' fill-rule='evenodd' stroke='%23333' stroke-linejoin='round' stroke-width='6.72664772' d='m149 108 18-12-18-12-18 12Z' style='mix-blend-mode:normal' transform='rotate(180 146 96)'/%3E%3Cpath fill='%23333' d='M141 105h4v12h-4zM141 75h4v12h-4z'/%3E%3Cellipse cx='171.64041' cy='96' fill='red' fill-rule='evenodd' stroke='%23333' stroke-linecap='round' stroke-linejoin='round' stroke-width='6.70437' rx='8.7566566' ry='8.4034605'/%3E%3Cellipse cx='-113.4769' cy='-96' fill='%2300f' fill-rule='evenodd' stroke='%23333' stroke-linecap='round' stroke-linejoin='round' stroke-width='6.70437' rx='8.7566566' ry='8.4034605' transform='scale(-1)'/%3E%3C/g%3E%3C/svg%3E";
//</tiles>
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
  } else {
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
    uploadedFileData.text().then((f) => {
      loadData(f);
    })
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

function cancelSubmit() {
  return false
}

function flyIn() {
  let right = Number(quantities.style.right.split("px")[0])
  if (right < 72) {
    if (!document.getElementById("realtimeCheckBox").checked) {
      quantities.style.visibility = "visible"
      quantities.style.right = (right + (((1 - ((right + 180) / 252)) * 25) + 2)) + "px"
      setTimeout(flyIn, 10);
    }
    else {
      flyOut()
    }
  }
  else {
    if (!document.getElementById("realtimeCheckBox").checked) {
      quantities.style.right = "72px"
    }
    else {
      flyOut()
    }
  }
}

function flyOut() {
  let right = Number(quantities.style.right.split("px")[0])
  if (right > -180) {
    if (document.getElementById("realtimeCheckBox").checked) {
      quantities.style.right = (right - (((1 - ((right + 180) / 252)) * 25) + 2)) + "px"
      setTimeout(flyOut, 10);
    }
    else {
      flyIn()
    }
  }
  else {
    if (document.getElementById("realtimeCheckBox").checked) {
      quantities.style.visibility = "hidden"
    }
    else {
      flyIn()
    }
  }
}

function realtimeCheck() {
  if (quantities.children[2].value <= 0) {
    quantities.children[2].value = 1
  }
  if (document.getElementById("realtimeCheckBox").checked) {
    flyOut()
    setTick(true)
  }
  else {
    flyIn()
    setTick(false, (1 / (quantities.children[2].value)) * 1000)
  }
}

function rasterize() {
  imgScale = Math.ceil(gridSize * size) * quality
  for (var i = 0; i < tiles.length; i++) {
    eval("svgToPng(svg" + tiles[i] + ".src, imgScale, imgScale).then((e) => { img" + tiles[i] + ".src = e })")
  }
}

function gridResize(width, height) {
  if (height > gridHeight) {
    cellGrid = cellGrid.map((e) => {
      return e.concat(Array(height - gridHeight).fill(null).map(() => { return { type: 1, bit: 0, static: true } }))
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
    cellGrid = cellGrid.concat(Array(width - gridWidth).fill(null).map(() => { return Array(height).fill(null).map(() => { return { type: 1, bit: 0, static: true }; }) }))
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
    document.getElementById("gameDiv").style.pointerEvents = "all";
    document.getElementById("help").style.visibility = "hidden";
  } else {
    helpMenu = true;
    document.getElementById("gameDiv").style.filter = "blur(8px)";
    document.getElementById("gameDiv").style.pointerEvents = "none";
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
  skipCatchup()
  tick();
}
function mute(setMute = null) {
  if ((!muted && setMute == null) || (setMute && !setMute != null)) {
    soundtrackAudio.pause()
    document.getElementById("muteCross").style.visibility = "visible"
    localStorage.setItem("mute", true)
  }
  if ((muted && setMute == null) || (!setMute && setMute != null)) {
    soundtrackAudio.play()
    document.getElementById("muteCross").style.visibility = "hidden"
    localStorage.setItem("mute", false)
  }
  muted = !muted
}
function change_quantity(change) {
  if (!realtime) {
    // Get current value
    let quantity = Number(quantities.children[2].value);

    // Ensure quantity is a valid number
    if (isNaN(quantity)) quantity = 1;

    // Change quantity
    quantity += change;

    // Ensure quantity is always a number
    quantity = Math.max(quantity, 1);

    // Output number
    quantities.children[2].value = quantity;

    realtimeCheck()
  }
}

function setTick(setRealTime, setTickRate) {
  skipCatchup()
  tickRate = setTickRate
  if (realtime && !setRealTime) {
    realtime = false
    tick()
  }
  else {
    realtime = setRealTime;
  }
}

function skipCatchup() {
  ticks = 0
  start = new Date().getTime()
  document.getElementById("behindDiv").style.visibility = "hidden";
  document.getElementById("aheadDiv").style.visibility = "hidden";
}
function mouseEvents(e) {
  const bounds = canvas.getBoundingClientRect();
  connection = false
  if (e.type == "touchmove" || e.type == "touchstart") {
    let touches = Array(e.touches.length).fill(null).map((item, i) => { return { pageX: e.touches[i].pageX, pageY: e.touches[i].pageY, target: e.touches[i].target } })
    let pageX =
      Array.from(touches, (x) => x.pageX).reduce((a, b) => a + b, 0) /
      touches.length;
    let pageY =
      Array.from(touches, (x) => x.pageY).reduce((a, b) => a + b, 0) /
      touches.length;
    mouse.x = pageX - bounds.left - scrollX;
    mouse.y = pageY - bounds.top - scrollY;
    if (touches.length != lastTouches.length) {
      mouse.drag = false;
    }
    for (let i = 0; i < e.touches.length; i++) {
      connection ||= touches[i].target.id == "connectionRect"
    }
    if (touches.length == 2 && lastTouches.length == 2) {
      if (connection) {
        if (touches[0].target.id == "connectionRect") {
          mouse.controlX = touches[1].pageX
          mouse.controlY = touches[1].pageY
        }
        else {
          mouse.controlX = touches[0].pageX
          mouse.controlY = touches[0].pageY
        }
        if (e.type == "touchstart") {
          lastCell = WorldToGrid(panZoom.toWorld(mouse.controlX, mouse.controlY));
        }
      }
      else {
        let scrolling = distance(lastTouches[0].pageX, lastTouches[0].pageY, lastTouches[1].pageX, lastTouches[1].pageY) - distance(touches[0].pageX, touches[0].pageY, touches[1].pageX, touches[1].pageY);
        mouse.wheel -= scrolling
      }
    }
    lastTouches = touches
  } else {
    if (e.type == "touchend") {
      let pageX =
        Array.from(e.changedTouches, (x) => x.pageX).reduce(
          (a, b) => a + b,
          0
        ) / e.changedTouches.length;
      let pageY =
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
  mouse.button =
    e.type === "mousedown" || (e.type === "touchstart")
      ? true
      : e.type === "mouseup" || (e.type === "touchend")
        ? false
        : mouse.button;
  if (e.type === "wheel") {
    mouse.wheel -= e.deltaY;
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
          mix &&= !(e.buttons === 4 || del)
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
          mix &&= !(e.buttons === 4 || del)
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
canvas.ontouchmove = (e) => {
  if (mobile && connection) {
    let currentCell = WorldToGrid(panZoom.toWorld(mouse.controlX, mouse.controlY));
    if (currentCell[0] != lastCell[0] || currentCell[1] != lastCell[1]) {
      let direction = [
        currentCell[0] - lastCell[0],
        currentCell[1] - lastCell[1],
      ];
      let type = 1;
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
}
//</connect>
//<mouse>
canvas.onmousedown = ((e) => {
  if (!lastCell && !muted) {
    soundtrackAudio.play()
  }
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
soundtrackAudio.onended = (() => {
  soundtrackIndex++
  soundtrackIndex %= soundtracks.length
  //soundtrackAudio.src = "./soundtracks/" + soundtracks[soundtrackIndex] + ".mp3"
  soundtrackAudio.src = soundtracks[soundtrackIndex]
  localStorage.setItem("track", soundtrackIndex)
  soundtrackAudio.load()
  soundtrackAudio.play()
})
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
      (!connection &&
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
     requestAnimationFrame(update);
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
    //<timing>  
    if (!realtime && !paused && auto) {
      let epoch = new Date().getTime()
      if (!start) {
        nextAt = start = epoch;
      }
      tickDrift = (epoch - start) - (ticks * tickRate)
      nextAt = start + (tickRate * (ticks + 1))
      if (tickDrift > tickRate) {
        let ticksBehind = Math.floor(tickDrift / tickRate)
        document.getElementById("behindDiv").style.visibility = "visible";
        if (!helpMenu)
        {
        document.getElementById("behindSkip").style.pointerEvents = "all";
        }
        document.getElementById("behind").textContent = "Running Behind " + ticksBehind + (ticksBehind == 1 ? "  tick" : " ticks") + "!"
      }
      else {
        document.getElementById("behindDiv").style.visibility = "hidden";
        document.getElementById("behindSkip").style.pointerEvents = "none";
      }
      if (tickDrift < -tickRate) {
        console.log(tickDrift)
        let ticksAhead = Math.floor(tickDrift / tickRate) * -1
        document.getElementById("aheadDiv").style.visibility = "visible";
        if (!helpMenu)
        {
        document.getElementById("aheadSkip").style.pointerEvents = "all";
        }
        document.getElementById("ahead").textContent = "Running Ahead " + ticksAhead + (ticksAhead == 1 ? " tick" : " ticks") + "?!"
      }
      else {
        document.getElementById("aheadDiv").style.visibility = "hidden";
        document.getElementById("aheadSkip").style.pointerEvents = "none";
      }
      ticks++
      if (recovery) {
        let count = driftAscention.filter(value => value === true).length;
        console.log("count: " + count, "drift: " + tickDrift)
        if ((count >= 8) && (tickDrift > (10 * tickRate))) {
          document.getElementById("unstable").style.visibility = "visible";
          console.warn("unstable, rasing tickrate to: " + tickRate)
          setTick(false, tickRate * 2)
        }
        else {
          document.getElementById("unstable").style.visibility = "hidden";
        }
        driftAscention.unshift(Math.floor(tickDrift / tickRate) > Math.floor(lastDrift / tickRate));
        driftAscention.pop();
        lastDrift = tickDrift
      }
      setTimeout(tick, nextAt - epoch);
      //</timing>
    }
  }
}

requestAnimationFrame(update);