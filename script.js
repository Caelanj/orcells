console.log(
  "if you know what your doing and want to help then join the discord:"
);
console.log("https://discord.gg/Je3HeYsHF2");
console.log("%cAttempting To Get Free Premium Will Result In A Permenant Ban", "background: repeating-linear-gradient(45deg, #8f0000, #8f0000 10px, #ff0000 10px, #ff0000 15px); color: yellow; font-size: x-large;font-family: junegull;text-align: center;");
//<parameters>
var
  board = { //The state of the board and it's functions
    //DO NOT CHANGE WHILE RUNNING, instead use: board.resize(width, height)
    width: 9, //starting width of the cell grid
    height: 9, //starting height of the cell grid
    default2Cell: false //if the default cell type is 1 or 2
  },
  render = { //The state of rendering and it's functions
    quality: { false: 2, true: 1 }, //false is desktop device render quality, true is mobile device render quality, render quality is from 0-2 (0 being don't draw at all and 2 being full quality)
    drift: 50 //how far to drift when letting go after moving and when returning home
  },
  tick = { //The state of the tickrate of the simulation and it's functions
    realtime: false, //if ticks should be run in realtime as fast as possible or on a clock
    rate: 100, //time to wait between each tick in miliseconds in consistent mode
    //better off changing above with tick.set(realtime, tickRate)
    recovery: false, //if the program should try to recover if it can't keep up
    paused: false, //if the simulation should be paused by default
    sync: false //if to run ticks in sync with frames in realtime mode (way faster if false)
  },
  record = { //The state of recording and it's functions
    enabled: true //if recording is enabled, start with: + stop with: -
  },
  music = { //The state of the music and it's functions
    muted: true //if soundtracks should be muted by default
  },
  debug = { //Whether or not debug mode is enabled and the function to change that
    enabled: false //logs FPS and TPS to console
  },
//</parameters>
//Main Objects
file = {}, //The file handling functions that save and load boards to and from files
utility = {}, //useful functions like distance between 2 points and degrees to radians
ui = {}, //The functions relating to changing the user interface
culling = {}, //Extra data that helps increase the performance of things like rendering and performing ticks
core = {} //The core functionality of Orcells
//<mobile>
core.mobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0 //Detect if device is touch screen
if (core.mobile) {
  document.getElementById("mobileControls").style.visibility = "inherit";
} else {
  document.getElementById("forceRect").style.pointerEvents = "none";
  document.getElementById("connectRect").style.pointerEvents = "none";
}
//</mobile>
//<initialization>
//Board Object Initialization
board.defaults = { //Defaults for various things
  cell: _ => { //Default state of a cell
    return {
      type: board.default2Cell ? 2 : 1,
      bit: board.default2Cell ? { upperBit: false, lowerBit: false } : false,
    };
  },
  connection: _ => { //Default state of a connection
    return {
      type: { upperType: 0, lowerType: 0 },
      flipped: false,
      mixed: false,
    };
  },
  applicitalConnection: _ => { //Default state of an applicital connection
    return { type: board.default2Cell ? 3 : 0, flipped: false };
  },
};
board.cells = Array(board.width) //Init the board with a grid of cells
  .fill(null)
  .map(_ =>
    Array(board.height)
      .fill(null)
      .map(_ => {
        return board.defaults.cell()
      })
  );
board.connections = { //Init the board with empty connections
  horizontal: Array(board.width) //Init horizontal connections
    .fill(null)
    .map(_ =>
      Array(board.height)
        .fill(null)
        .map(_ => {
          return board.defaults.connection()
        })
    ),
  vertical: Array(board.width) //Init vertical connections
    .fill(null)
    .map(_ =>
      Array(board.height)
        .fill(null)
        .map(_ => {
          return board.defaults.connection()
        })
    ),
  applicital: Array(board.width) //Init applicital connections
    .fill(null)
    .map(_ =>
      Array(board.height)
        .fill(null)
        .map(_ => {
          return board.defaults.applicitalConnection()
        })
    ),
};
board.inBounds = ((point) => { //Check if a cell is within the board
  return (point[0] < board.width && point[0] >= 0 && point[1] < board.height && point[1] >= 0)
})
board.resize = ((width, height) => { //Resize the board
  if (height > board.height) {
    board.cells = board.cells.map((e) => {
      return e.concat(
        Array(height - board.height)
          .fill(null)
          .map(_ => {
            return board.defaults.cell();
          })
      );
    });
    board.connections.applicital = board.connections.applicital.map((e) => {
      return e.concat(
        Array(height - board.height)
          .fill(null)
          .map(_ => {
            return board.defaults.applicitalConnection();
          })
      );
    });
    board.connections.horizontal = board.connections.horizontal.map((e) => {
      return e.concat(
        Array(height - board.height)
          .fill(null)
          .map(_ => {
            return board.defaults.connection();
          })
      );
    });
    board.connections.vertical = board.connections.vertical.map((e) => {
      return e.concat(
        Array(height - board.height)
          .fill(null)
          .map(_ => {
            return board.defaults.connection();
          })
      );
    });
    board.height = height;
  }
  if (height < board.height) {
    board.cells = board.cells.map((e) => {
      return e.splice(0, height);
    });
    board.connections.applicital = board.connections.applicital.map((e) => {
      return e.splice(0, height);
    });
    board.connections.horizontal = board.connections.horizontal.map((e) => {
      return e.splice(0, height);
    });
    board.connections.vertical = board.connections.vertical.map((e) => {
      return e.splice(0, height);
    });
    board.height = height;
  }
  if (width > board.width) {
    board.cells = board.cells.concat(
      Array(width - board.width)
        .fill(null)
        .map(_ => {
          return Array(height)
            .fill(null)
            .map(_ => {
              return board.defaults.cell();
            });
        })
    );
    board.connections.applicital = board.connections.applicital.concat(
      Array(width - board.width)
        .fill(null)
        .map(_ => {
          return Array(height)
            .fill(null)
            .map(_ => {
              return board.defaults.applicitalConnection();
            });
        })
    );
    board.connections.horizontal = board.connections.horizontal.concat(
      Array(width - board.width)
        .fill(null)
        .map(_ => {
          return Array(height)
            .fill(null)
            .map(_ => {
              return board.defaults.connection();
            });
        })
    );
    board.connections.vertical = board.connections.vertical.concat(
      Array(width - board.width)
        .fill(null)
        .map(_ => {
          return Array(height)
            .fill(null)
            .map(_ => {
              return board.defaults.connection();
            });
        })
    );
    board.width = width;
  }
  if (width < board.width) {
    board.cells = board.cells.splice(0, width);
    board.connections.applicital = board.connections.applicital.splice(
      0,
      width
    );
    board.connections.horizontal = board.connections.horizontal.splice(
      0,
      width
    );
    board.connections.vertical = board.connections.vertical.splice(0, width);
    board.width = width;
  }
  culling.map();
});
board.isConnected = ((target, shift = [0, 0]) => { //Check if a cell is connected to any other cells
  let tx = target[0] - shift[0];
  let ty = target[1] - shift[1];
  let upperConnected = false;
  let lowerConnected = false;
  //from right
  if (board.connections.horizontal[tx][ty].type.upperType != 0 &&
    board.connections.horizontal[tx][ty].flipped) {
    upperConnected = true
  }
  if (board.connections.horizontal[tx][ty].type.lowerType != 0 &&
    board.connections.horizontal[tx][ty].flipped !=
    board.connections.horizontal[tx][ty].mixed) {
    lowerConnected = true
  }
  //from bottom
  upperConnected ||=
    board.connections.vertical[tx][ty].type.upperType != 0 &&
    board.connections.vertical[tx][ty].flipped;
  lowerConnected ||=
    board.connections.vertical[tx][ty].type.lowerType != 0 &&
    board.connections.vertical[tx][ty].flipped !=
    board.connections.vertical[tx][ty].mixed;
  //from left
  if (tx > 0) {
    upperConnected ||=
      board.connections.horizontal[tx - 1][ty].type.upperType != 0 &&
      !board.connections.horizontal[tx - 1][ty].flipped;
    lowerConnected ||=
      board.connections.horizontal[tx - 1][ty].type.lowerType != 0 &&
      !(
        board.connections.horizontal[tx - 1][ty].flipped !=
        board.connections.horizontal[tx - 1][ty].mixed
      );
  }
  //from top
  if (ty > 0) {
    upperConnected ||=
      board.connections.vertical[tx][ty - 1].type.upperType != 0 &&
      !board.connections.vertical[tx][ty - 1].flipped;
    lowerConnected ||=
      board.connections.vertical[tx][ty - 1].type.lowerType != 0 &&
      !(
        board.connections.vertical[tx][ty - 1].flipped !=
        board.connections.vertical[tx][ty - 1].mixed
      );
  }
  switch (board.cells[tx][ty].type) {
    case 1:
      let connected = upperConnected || lowerConnected;
      culling.tick2 = culling.tick2.filter((i) => {
        return (
          JSON.stringify(i) !== JSON.stringify([tx, ty, 0]) &&
          JSON.stringify(i) !== JSON.stringify([tx, ty, 1])
        );
      });
      culling.tick = culling.tick.filter((i) => {
        return JSON.stringify(i) !== JSON.stringify([tx, ty]);
      });
      if (connected) {
        culling.tick.push([tx, ty]);
      }
      break;
    case 2:
      //from below
      upperConnected ||=
        board.connections.applicital[tx][ty].type != 3 &&
        board.connections.applicital[tx][ty].flipped;
      //from above
      lowerConnected ||=
        board.connections.applicital[tx][ty].type != 3 &&
        !board.connections.applicital[tx][ty].flipped;
      culling.tick2 = culling.tick2.filter((i) => {
        return (
          JSON.stringify(i) !== JSON.stringify([tx, ty, 0]) &&
          JSON.stringify(i) !== JSON.stringify([tx, ty, 1])
        );
      });
      culling.tick = culling.tick.filter((i) => {
        return JSON.stringify(i) !== JSON.stringify([tx, ty]);
      });
      if (upperConnected) {
        culling.tick2.push([tx, ty, 1]);
      }
      if (lowerConnected) {
        culling.tick2.push([tx, ty, 0]);
      }
      break;
  }
  culling.checkIdle();
})
//Render Object Initialization
render.topLeft = { x: 0, y: 0 }; // holds top left of render.canvases.render in world coords.
render.canvases = {};
render.ctx = {};
render.svg = {};
render.img = {};
render.canvases.svg = document.getElementById("svg");
render.canvases.preRender = document.getElementById("preRender");
render.canvases.render = document.getElementById("render");
render.ctx.preRender = render.canvases.preRender.getContext("2d");
render.ctx.render = render.canvases.render.getContext("2d");
render.changed = false;
render.w = render.canvases.render.width;
render.h = render.canvases.render.height;
render.frames = 0;
render.driftCharge = 0;
render.driftx = 0;
render.drifty = 0;
render.homeCharge = 0;
render.gridLimit = 512; // max grid lines
render.gridSize = 128; //world pixels
render.scaleRate = 1.02; // Closer to 1 slower rate of change
render.lastScale = 0.5
render.quality = render.quality[core.mobile];
render.size = core.mobile ? 1 : 2;
render.panZoom = {
  x: core.mobile ? 0 : 464,
  y: core.mobile ? 0 : 140,
  scale: core.mobile ? 1 : 0.5,
  apply() {
    render.ctx.render.setTransform(this.scale, 0, 0, this.scale, this.x, this.y);
  },
  scaleAt(x, y, sc) {
    // x & y are screen coords, not world
    if ((sc > 1 && !(Math.min(render.canvases.render.width, render.canvases.render.height) < render.gridSize * render.panZoom.scale)) || (sc < 1 && !(Math.max(render.canvases.render.width, render.canvases.render.height) / 400 > render.gridSize * render.panZoom.scale))) {
      this.scale *= sc;
      this.x = x - (x - this.x) * sc;
      this.y = y - (y - this.y) * sc;
    }
    if (
      Math.floor(Math.log2(render.lastScale)) != Math.floor(Math.log2(this.scale)) &&
      !core.mobile
    ) {
      render.rasterize();
    }
    render.lastScale = this.scale
    render.size = 1 / this.scale;
  },
  toWorld(x, y, point = {}) { //converts from screen coords to world coords
    const inv = 1 / this.scale;
    point.x = (x - this.x) * inv;
    point.y = (y - this.y) * inv;
    return point;
  },
};
render.svgToPng = (svgDataurl, width, height) =>  //rasterizes svg to png at the specified resolution
  new Promise((resolve, reject) => {
    let ctx;
    let img;

    img = new Image();
    img.src = svgDataurl;
    img.onload = _ => {
      render.canvases.svg.width = width;
      render.canvases.svg.height = height;
      ctx = render.canvases.svg.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(render.canvases.svg.toDataURL("image/png"));
    };
  });
render.getColour = ((state, type) => { //Get the colour a cell should render based on it's state
  switch (type) {
    case 1: //If it's a type 1 cell
      if (state) {
        return [238, 238, 238, 255]; //Return off white if the cell's bit is on
      } else {
        return [0, 0, 0, 255]; //Return black if the cell's bit is off
      }
    case 2: //If it's a type 2 cell
      if (state.upperBit) { //If the top bit is on
        if (state.lowerBit) {
          return [238, 238, 238, 255]; //If both bits are on return off white
        } else {
          return [255, 0, 0, 255]; //If only the upper bit is on return red
        }
      } else { //If the top bit is off
        if (state.lowerBit) {
          return [0, 0, 255, 255]; //If only the lower bit is on return blue
        } else {
          return [0, 0, 0, 255]; //If neither bit is on return black
        }
      }
  }
})
render.generateData = ( //Convert the board state to cell colours to put into the temp imageData array
  _ => {
    let newData = []
    for (let y = 0; y < board.height; y++) { //Loop over each cell
      for (let x = 0; x < board.width; x++) {
        newData = newData.concat(render.getColour(board.cells[x][y].bit, board.cells[x][y].type)) //Take the value of that cell, convert it to a colour, put it into the array
      }
    }
    render.new = newData
    render.changed = true; //Tell the render engine that changes have been made and need to be applied with render.apply()
  })
render.generateData()
render.coordToIndex = ((point) => {
  return (point[0] * 4) + (point[1] * board.width * 4)
})
render.apply = (_ => { //Applies the changes in colour made by render.setCell or render.generateData to the imageData
  if (render.changed) {
    render.data = new ImageData(new Uint8ClampedArray(render.new), board.width, board.height) //Convert the temp array data into imageData
    render.changed = false;
  }
})
render.apply()
render.changed = false;
render.setCell = ((point, colour) => { //Set the value of a cell's colour in the imageData without editing it's board value
  let index = render.coordToIndex(point) //Work out the cell's place in the temp imageData
  if ((render.new.splice(index, 4, ...colour) != colour)) { //If the colour of the cell has changed then tell the rendering engine to remap the imageData
    render.changed = true; //Tell the render engine that changes have been made and need to be applied with render.apply()
  }
})
render.homeDrift = (_ => { //Make the camera drift over to the home position smoothly
  if (render.homeCharge === 1) { //If we are right at the end of the transition then teleport to the destination
    render.panZoom.x = core.mobile ? 0 : 464;
    render.panZoom.y = core.mobile ? 0 : 140;
    render.panZoom.scale = core.mobile ? 1 : 0.5;
    render.homeCharge = 0;
  }
  if (render.homeCharge > 2) { //Smoothly pull toward the home position
    let homeSpeed =
      render.drift - Math.sin(utility.rad((render.drift - render.homeCharge) * (90 / render.drift))) * render.drift;
    render.panZoom.x -= (render.panZoom.x - (core.mobile ? 0 : 464)) / homeSpeed;
    render.panZoom.y -= (render.panZoom.y - (core.mobile ? 0 : 140)) / homeSpeed;
    render.panZoom.scale -= (render.panZoom.scale - (core.mobile ? 1 : 0.5)) / homeSpeed;
    render.homeCharge--;
  }
})
render.home = (_ => {
  render.homeCharge = render.drift;
})
render.setMoving = ((status) => { //Set whether or not the board has been grabbed for movement
  if (status) {
    core.control = true;
    render.canvases.render.style.cursor = "move";
  } else {
    core.control = false;
    render.canvases.render.style.cursor = "default";
  }
})
render.drawGrid = ((gridScreenSize = 128) => { //The core function that the whole project started with, it draws the grid, it's a bit of a stolen black box
  let size,
    x,
    y,
    gridScale = gridScreenSize;
  size = Math.max(render.w, render.h) / render.panZoom.scale + gridScale * 2;
  render.panZoom.toWorld(0, 0, render.topLeft);
  x = Math.floor(render.topLeft.x / gridScale) * gridScale;
  y = Math.floor(render.topLeft.y / gridScale) * gridScale;
  if (size / gridScale > render.gridLimit) {
    size = gridScale * render.gridLimit;
  }
  render.panZoom.apply();
  render.ctx.render.lineWidth = render.panZoom.scale * 10; //Grid line stroke width
  render.ctx.render.strokeStyle = "#333333"; //Grid line colour
  render.ctx.render.beginPath();
  for (i = 0; i < size; i += gridScale) {
    render.ctx.render.moveTo(x + i, y);
    render.ctx.render.lineTo(x + i, y + size);
    render.ctx.render.moveTo(x, y + i);
    render.ctx.render.lineTo(x + size, y + i);
  }
  render.ctx.render.setTransform(1, 0, 0, 1, 0, 0); // reset the transform so the lineWidth is 1
  render.ctx.render.stroke();
})
render.draw = {}
render.draw.connection = ((point, type, rotate, axis, flipped = false) => {
  point = core.GridToWorld(point); //Convert the grid coordinates to the draw coordinates
  render.ctx.render.save(); //Save the canvas state
  switch (axis) {
    case 1: //Vertical translation
      render.ctx.render.translate(
        point[0] * render.panZoom.scale * render.panZoom.scale + (render.gridSize / 2) * render.panZoom.scale + render.panZoom.scale,
        point[1] * render.panZoom.scale * render.panZoom.scale + render.panZoom.scale
      );
      break;
    case 2: //Horizontal translation
      render.ctx.render.translate(
        point[0] * render.panZoom.scale * render.panZoom.scale + render.panZoom.scale,
        point[1] * render.panZoom.scale * render.panZoom.scale + (render.gridSize / 2) * render.panZoom.scale + render.panZoom.scale
      );
      break;
    case 3: //Applicital translation
      render.ctx.render.translate(
        point[0] * render.panZoom.scale * render.panZoom.scale + render.panZoom.scale,
        point[1] * render.panZoom.scale * render.panZoom.scale + render.panZoom.scale
      );
      break;
  }
  image = render.getImage(type.upperType, type.lowerType, flipped, axis == 3); //Get the texture of the connection to be drawn
  render.ctx.render.rotate(utility.rad(rotate * 90)); //Rotate the image to the right angle
  render.ctx.render.translate(
    -((render.panZoom.scale * render.gridSize) / 2),
    -(render.panZoom.scale * render.gridSize) / 2
  );
  render.ctx.render.drawImage( //Draw the connection
    image,
    0,
    0,
    render.panZoom.scale * render.gridSize,
    render.panZoom.scale * render.gridSize
  );
  render.ctx.render.restore(); //Restore the canvas state
})
render.getImage = ((t, b, f, a) => { //Get the texture for a connection
  if (a) { //If applicital
    switch (t) { //Check top type
      case 1: //Buffer
        if (f) { //Check if flipped
          return render.img.BT1; //Bottom to Top Buffer
        } else {
          return render.img.TB1; //Top to Bottom Buffer
        }
      case 2: //Not
        if (f) { //Check if flipped
          return render.img.BT2; //Bottom to Top Not
        } else {
          return render.img.TB2; //Top to Bottom Not
        }
      case 3: //Empty
        return render.img.Cross; //Empty Cross
      default:
        return;
    }
  } else { //If not applicital
    switch (t) { //Check top type
      case 0: //Top Blank
        switch (b) { //Check bottom type
          case 1: //Bottom Buffer
            return render.img.T0B1; //Bottom Buffer
          case 2: //Bottom Not
            return render.img.T0B2; //Bottom Not
          default:
            return;
        }
      case 1: //Top Buffer
        switch (b) { //Check bottom type
          case 0: //Bottom Empty
            return render.img.T1B0;
          case 1: //Bottom Buffer
            if (f) { //Check if bottom buffer is flipped
              return render.img.T1B1F; //Top Buffer and Bottom Flipped Buffer
            } else {
              return render.img.T1B1; //Normal Buffer
            }
          case 2: //Bottom Not
            if (f) {  //Check if bottom not is flipped
              return render.img.T1B2F; //Top Buffer and Bottom Flipped Not
            } else {
              return render.img.T1B2; //Top Buffer and Bottom Not
            }
          default:
            return;
        }
      case 2: //Top Not
        switch (b) { //Check bottom type
          case 0: //Bottom Empty
            return render.img.T2B0; //Top Not
          case 1: //Bottom Buffer
            if (f) { //Check if bottom buffer is flipped
              return render.img.T2B1F; //Top Not and Bottom Flipped Buffer
            } else {
              return render.img.T2B1; //Top Not and Bottom Buffer
            }
          case 2: //Bottom Not
            if (f) { //Check if bottom not is flipped
              return render.img.T2B2F; //Top Not and Bottom Flipped Not
            } else {
              return render.img.T2B2; //Normal Not
            }
          default:
            return;
        }
      default:
        return;
    }
  }
})
render.rasterize = (_ => { //Convert all SVG textures to bitmap to draw faster
  if (debug.enabled) {
    console.log("Rasterizing At Scale: " + imgScale)
  }
  for (let i = 0; i < render.tiles.length; i++) { //Loop over each texture
    render.rasterizeOne(i)
  }
})
render.rasterizeOne = ((TileID) => { //Convert a single SVG texture to bitmap to draw faster
  imgScale = Math.ceil(render.gridSize * render.panZoom.scale) * render.quality; //Calculate what resolution to rasterize textures at
  eval( //Rasterize that texure
    "render.svgToPng(render.svg." +
    render.tiles[TileID] +
    ".src, imgScale, imgScale).then((e) => { render.img." +
    render.tiles[TileID] +
    ".src = e;ui.load.rasterize();});"
  );
})
render.tiles = [
  "T1B1",
  "T2B2",
  "Cross",
  "BT2",
  "BT1",
  "TB2",
  "TB1",
  "T0B1",
  "T0B2",
  "T1B0",
  "T1B1F",
  "T1B2",
  "T1B2F",
  "T2B0",
  "T2B1",
  "T2B1F",
  "T2B2F",
];
for (let i = 0; i < render.tiles.length; i++) {
  eval("render.svg." + render.tiles[i] + " = new Image();");
  eval("render.img." + render.tiles[i] + " = new Image();");
}
//Tick Object Initialization
tick.start;
tick.nextAt;
tick.ticks = 0;
tick.drift = 0;
tick.idle = true;
tick.driftAscention = Array(20).fill(0);
tick.lastDrift = 0;
tick.newGrid;
tick.frames = 0;
tick.pause = (_ => { //Pause the simulation
  tick.paused = true;
  document.getElementById("pause").style.visibility = "hidden";
  document.getElementById("play").style.visibility = "inherit";
  tick.skipCatchup();
})
tick.play = (_ => { //Resume the simulation
  tick.paused = false;
  document.getElementById("pause").style.visibility = "inherit";
  document.getElementById("play").style.visibility = "hidden";
  tick.skipCatchup();
  tick.tick();
})
tick.realtimeCheck = (_ => { //Check if the realtime checkbox is ticked
  ui.quantities = document.getElementById("tickRateControl");
  if (ui.quantities.children[2].value <= 0) {
    ui.quantities.children[2].value = 1;
  }
  if (document.getElementById("realtimeCheckBox").checked) {
    ui.flyOut(); //Make the tickrate control fly off screen
    tick.set(true); //Set to realtime mode
  } else {
    ui.flyIn(); //Make the tickrate control fly back on screen
    tick.set(false, (1 / ui.quantities.children[2].value) * 1000); //Set to consistent mode
  }
})
tick.toggleRealtime = (_ => { //Toggle realtime mode
  document.getElementById("realtimeCheckBox").checked =
    !document.getElementById("realtimeCheckBox").checked;
  tick.realtimeCheck();
})
tick.skipCatchup = (_ => { //Skip the simulation trying to catch up when behind on consistent mode
  tick.ticks = 0;
  tick.start = new Date().getTime();
  document.getElementById("behindDiv").style.visibility = "hidden";
  document.getElementById("aheadDiv").style.visibility = "hidden";
})
tick.set = ((setRealTime, setTickRate) => { //Set the tickrate
  tick.skipCatchup();
  tick.rate = setTickRate;
  if (tick.realtime && !setRealTime) {
    tick.realtime = false;
    tick.tick();
  } else {
    tick.realtime = setRealTime;
  }
})
tick.tick = ((auto = true) => { //Perform a tick
  if ((!auto || !tick.paused) && !tick.idle) {
    lastTick = Date.now();
    tick.newGrid = JSON.parse(JSON.stringify(board.cells));
    culling.tick.forEach((item) => {
      tick.innerTick1Old(item);
    });
    culling.tick2.forEach((item) => {
      if (!auto || !tick.paused) {
        let x2 = item[0];
        let y2 = item[1];
        let bit = false;
        switch (item[2]) {
          case 0:
            if (x2 > 0) {
              switch (board.cells[x2 - 1][y2].type) {
                case 1:
                  bit ||=
                    (board.connections.horizontal[x2 - 1][y2].type.lowerType ==
                      1 &&
                      board.connections.horizontal[x2 - 1][y2].flipped ==
                      board.connections.horizontal[x2 - 1][y2].mixed &&
                      board.cells[x2 - 1][y2].bit) ||
                    (board.connections.horizontal[x2 - 1][y2].type.lowerType ==
                      2 &&
                      board.connections.horizontal[x2 - 1][y2].flipped ==
                      board.connections.horizontal[x2 - 1][y2].mixed &&
                      !board.cells[x2 - 1][y2].bit);
                  break;
                case 2:
                  bit ||=
                    (board.connections.horizontal[x2 - 1][y2].type.lowerType ==
                      1 &&
                      board.connections.horizontal[x2 - 1][y2].flipped ==
                      board.connections.horizontal[x2 - 1][y2].mixed &&
                      board.cells[x2 - 1][y2].bit.lowerBit) ||
                    (board.connections.horizontal[x2 - 1][y2].type.lowerType ==
                      2 &&
                      board.connections.horizontal[x2 - 1][y2].flipped ==
                      board.connections.horizontal[x2 - 1][y2].mixed &&
                      !board.cells[x2 - 1][y2].bit.lowerBit);
                  break;
              }
            }
            if (x2 < board.width - 1) {
              switch (board.cells[x2 + 1][y2].type) {
                case 1:
                  bit ||=
                    (board.connections.horizontal[x2][y2].type.lowerType == 1 &&
                      board.connections.horizontal[x2][y2].flipped !=
                      board.connections.horizontal[x2][y2].mixed &&
                      board.cells[x2 + 1][y2].bit) ||
                    (board.connections.horizontal[x2][y2].type.lowerType == 2 &&
                      board.connections.horizontal[x2][y2].flipped !=
                      board.connections.horizontal[x2][y2].mixed &&
                      !board.cells[x2 + 1][y2].bit);
                  break;
                case 2:
                  bit ||=
                    (board.connections.horizontal[x2][y2].type.lowerType == 1 &&
                      board.connections.horizontal[x2][y2].flipped !=
                      board.connections.horizontal[x2][y2].mixed &&
                      board.cells[x2 + 1][y2].bit.lowerBit) ||
                    (board.connections.horizontal[x2][y2].type.lowerType == 2 &&
                      board.connections.horizontal[x2][y2].flipped !=
                      board.connections.horizontal[x2][y2].mixed &&
                      !board.cells[x2 + 1][y2].bit.lowerBit);
                  break;
              }
            }
            if (y2 > 0) {
              switch (board.cells[x2][y2 - 1].type) {
                case 1:
                  bit ||=
                    (board.connections.vertical[x2][y2 - 1].type.lowerType ==
                      1 &&
                      board.connections.vertical[x2][y2 - 1].flipped ==
                      board.connections.vertical[x2][y2 - 1].mixed &&
                      board.cells[x2][y2 - 1].bit) ||
                    (board.connections.vertical[x2][y2 - 1].type.lowerType ==
                      2 &&
                      board.connections.vertical[x2][y2 - 1].flipped ==
                      board.connections.vertical[x2][y2 - 1].mixed &&
                      !board.cells[x2][y2 - 1].bit);
                  break;
                case 2:
                  bit ||=
                    (board.connections.vertical[x2][y2 - 1].type.lowerType ==
                      1 &&
                      board.connections.vertical[x2][y2 - 1].flipped ==
                      board.connections.vertical[x2][y2 - 1].mixed &&
                      board.cells[x2][y2 - 1].bit.lowerBit) ||
                    (board.connections.vertical[x2][y2 - 1].type.lowerType ==
                      2 &&
                      board.connections.vertical[x2][y2 - 1].flipped ==
                      board.connections.vertical[x2][y2 - 1].mixed &&
                      !board.cells[x2][y2 - 1].bit.lowerBit);
                  break;
              }
            }
            if (y2 < board.height - 1) {
              switch (board.cells[x2][y2 + 1].type) {
                case 1:
                  bit ||=
                    (board.connections.vertical[x2][y2].type.lowerType == 1 &&
                      board.connections.vertical[x2][y2].flipped !=
                      board.connections.vertical[x2][y2].mixed &&
                      board.cells[x2][y2 + 1].bit) ||
                    (board.connections.vertical[x2][y2].type.lowerType == 2 &&
                      board.connections.vertical[x2][y2].flipped !=
                      board.connections.vertical[x2][y2].mixed &&
                      !board.cells[x2][y2 + 1].bit);
                  break;
                case 2:
                  bit ||=
                    (board.connections.vertical[x2][y2].type.lowerType == 1 &&
                      board.connections.vertical[x2][y2].flipped !=
                      board.connections.vertical[x2][y2].mixed &&
                      board.cells[x2][y2 + 1].bit.lowerBit) ||
                    (board.connections.vertical[x2][y2].type.lowerType == 2 &&
                      board.connections.vertical[x2][y2].flipped !=
                      board.connections.vertical[x2][y2].mixed &&
                      !board.cells[x2][y2 + 1].bit.lowerBit);
                  break;
              }
            }
            bit ||=
              (board.connections.applicital[x2][y2].type == 1 &&
                !board.connections.applicital[x2][y2].flipped &&
                board.cells[x2][y2].bit.upperBit) ||
              (board.connections.applicital[x2][y2].type == 2 &&
                !board.connections.applicital[x2][y2].flipped &&
                !board.cells[x2][y2].bit.upperBit);
            tick.newGrid[x2][y2].bit.lowerBit = bit;
            break;
          case 1:
            if (x2 > 0) {
              switch (board.cells[x2 - 1][y2].type) {
                case 1:
                  bit ||=
                    (board.connections.horizontal[x2 - 1][y2].type.upperType ==
                      1 &&
                      !board.connections.horizontal[x2 - 1][y2].flipped &&
                      board.cells[x2 - 1][y2].bit) ||
                    (board.connections.horizontal[x2 - 1][y2].type.upperType ==
                      2 &&
                      !board.connections.horizontal[x2 - 1][y2].flipped &&
                      !board.cells[x2 - 1][y2].bit);
                  break;
                case 2:
                  bit ||=
                    (board.connections.horizontal[x2 - 1][y2].type.upperType ==
                      1 &&
                      !board.connections.horizontal[x2 - 1][y2].flipped &&
                      board.cells[x2 - 1][y2].bit.upperBit) ||
                    (board.connections.horizontal[x2 - 1][y2].type.upperType ==
                      2 &&
                      !board.connections.horizontal[x2 - 1][y2].flipped &&
                      !board.cells[x2 - 1][y2].bit.upperBit);
                  break;
              }
            }
            if (x2 < board.width - 1) {
              switch (board.cells[x2 + 1][y2].type) {
                case 1:
                  bit ||=
                    (board.connections.horizontal[x2][y2].type.upperType == 1 &&
                      board.connections.horizontal[x2][y2].flipped &&
                      board.cells[x2 + 1][y2].bit) ||
                    (board.connections.horizontal[x2][y2].type.upperType == 2 &&
                      board.connections.horizontal[x2][y2].flipped &&
                      !board.cells[x2 + 1][y2].bit);
                  break;
                case 2:
                  bit ||=
                    (board.connections.horizontal[x2][y2].type.upperType == 1 &&
                      board.connections.horizontal[x2][y2].flipped &&
                      board.cells[x2 + 1][y2].bit.upperBit) ||
                    (board.connections.horizontal[x2][y2].type.upperType == 2 &&
                      board.connections.horizontal[x2][y2].flipped &&
                      !board.cells[x2 + 1][y2].bit.upperBit);
                  break;
              }
            }
            if (y2 > 0) {
              switch (board.cells[x2][y2 - 1].type) {
                case 1:
                  bit ||=
                    (board.connections.vertical[x2][y2 - 1].type.upperType ==
                      1 &&
                      !board.connections.vertical[x2][y2 - 1].flipped &&
                      board.cells[x2][y2 - 1].bit) ||
                    (board.connections.vertical[x2][y2 - 1].type.upperType ==
                      2 &&
                      !board.connections.vertical[x2][y2 - 1].flipped &&
                      !board.cells[x2][y2 - 1].bit);
                  break;
                case 2:
                  bit ||=
                    (board.connections.vertical[x2][y2 - 1].type.upperType ==
                      1 &&
                      !board.connections.vertical[x2][y2 - 1].flipped &&
                      board.cells[x2][y2 - 1].bit.upperBit) ||
                    (board.connections.vertical[x2][y2 - 1].type.upperType ==
                      2 &&
                      !board.connections.vertical[x2][y2 - 1].flipped &&
                      !board.cells[x2][y2 - 1].bit.upperBit);
                  break;
              }
            }
            if (y2 < board.height - 1) {
              switch (board.cells[x2][y2 + 1].type) {
                case 1:
                  bit ||=
                    (board.connections.vertical[x2][y2].type.upperType == 1 &&
                      board.connections.vertical[x2][y2].flipped &&
                      board.cells[x2][y2 + 1].bit) ||
                    (board.connections.vertical[x2][y2].type.upperType == 2 &&
                      board.connections.vertical[x2][y2].flipped &&
                      !board.cells[x2][y2 + 1].bit);
                  break;
                case 2:
                  bit ||=
                    (board.connections.vertical[x2][y2].type.upperType == 1 &&
                      board.connections.vertical[x2][y2].flipped &&
                      board.cells[x2][y2 + 1].bit.upperBit) ||
                    (board.connections.vertical[x2][y2].type.upperType == 2 &&
                      board.connections.vertical[x2][y2].flipped &&
                      !board.cells[x2][y2 + 1].bit.upperBit);
                  break;
              }
            }
            bit ||=
              (board.connections.applicital[x2][y2].type == 1 &&
                board.connections.applicital[x2][y2].flipped &&
                board.cells[x2][y2].bit.lowerBit) ||
              (board.connections.applicital[x2][y2].type == 2 &&
                board.connections.applicital[x2][y2].flipped &&
                !board.cells[x2][y2].bit.lowerBit);
            tick.newGrid[x2][y2].bit.upperBit = bit;
            break;
        }
        render.setCell([x2, y2], render.getColour(tick.newGrid[x2][y2].bit, 2))
      }
    });
    if (!auto || !tick.paused) {
      board.cells = tick.newGrid;
      tick.frames++
    }
    //<timing>
    if (!tick.realtime && !tick.paused && auto) {
      let epoch = new Date().getTime();
      if (!tick.start) {
        tick.nextAt = tick.start = epoch;
      }
      tick.drift = epoch - tick.start - tick.ticks * tick.rate;
      tick.nextAt = tick.start + tick.rate * (tick.ticks + 1);
      if (tick.drift > tick.rate) {
        let ticksBehind = Math.floor(tick.drift / tick.rate);
        document.getElementById("behindDiv").style.visibility = "inherit";
        if (!ui.helpMenu) {
          document.getElementById("behindSkip").style.pointerEvents = "all";
        }
        document.getElementById("behind").textContent =
          "Running Behind " +
          ticksBehind +
          (ticksBehind == 1 ? "  tick" : " ticks") +
          "!";
      } else {
        document.getElementById("behindDiv").style.visibility = "hidden";
        document.getElementById("behindSkip").style.pointerEvents = "none";
      }
      if (tick.drift < -tick.rate) {
        let ticksAhead = Math.floor(tick.drift / tick.rate) * -1;
        document.getElementById("aheadDiv").style.visibility = "inherit";
        if (!ui.helpMenu) {
          document.getElementById("aheadSkip").style.pointerEvents = "all";
        }
        document.getElementById("ahead").textContent =
          "Running Ahead " +
          ticksAhead +
          (ticksAhead == 1 ? " tick" : " ticks") +
          "?!";
      } else {
        document.getElementById("aheadDiv").style.visibility = "hidden";
        document.getElementById("aheadSkip").style.pointerEvents = "none";
      }
      tick.ticks++;
      if (tick.recovery) {
        let count = tick.driftAscention.filter((value) => value === true).length;
        console.log("count: " + count, "render.drift: " + tick.drift);
        if (count >= 8 && tick.drift > 10 * tick.rate) {
          document.getElementById("unstable").style.visibility = "inherit";
          console.warn("unstable, rasing tickrate to: " + tick.rate);
          tick.set(false, tick.rate * 2);
        } else {
          document.getElementById("unstable").style.visibility = "hidden";
        }
        tick.driftAscention.unshift(
          Math.floor(tick.drift / tick.rate) > Math.floor(tick.lastDrift / tick.rate)
        );
        tick.driftAscention.pop();
        tick.lastDrift = tick.drift;
      }
      setTimeout(tick.tick, tick.nextAt - epoch);
      //</timing>
    }
    if (tick.realtime && !tick.paused && !tick.sync && auto) {
      setTimeout(tick.tick, 0)
    }
  }
})
tick.innerTick1Old = ((item) => { //Old type 1 tick
  let x2 = item[0];
  let y2 = item[1];
  let bit = false;
  //From Left
  if (x2 > 0) {
    switch (board.cells[x2 - 1][y2].type) {
      case 1:
        bit ||=
          (board.connections.horizontal[x2 - 1][y2].type.upperType == 1 &&
            !board.connections.horizontal[x2 - 1][y2].flipped &&
            board.cells[x2 - 1][y2].bit) ||
          (board.connections.horizontal[x2 - 1][y2].type.upperType == 2 &&
            !board.connections.horizontal[x2 - 1][y2].flipped &&
            !board.cells[x2 - 1][y2].bit);
        bit ||=
          (board.connections.horizontal[x2 - 1][y2].type.lowerType == 1 &&
            board.connections.horizontal[x2 - 1][y2].flipped ==
            board.connections.horizontal[x2 - 1][y2].mixed &&
            board.cells[x2 - 1][y2].bit) ||
          (board.connections.horizontal[x2 - 1][y2].type.lowerType == 2 &&
            board.connections.horizontal[x2 - 1][y2].flipped ==
            board.connections.horizontal[x2 - 1][y2].mixed &&
            !board.cells[x2 - 1][y2].bit);
        break;
      case 2:
        bit ||=
          (board.connections.horizontal[x2 - 1][y2].type.upperType == 1 &&
            !board.connections.horizontal[x2 - 1][y2].flipped &&
            board.cells[x2 - 1][y2].bit.upperBit) ||
          (board.connections.horizontal[x2 - 1][y2].type.upperType == 2 &&
            !board.connections.horizontal[x2 - 1][y2].flipped &&
            !board.cells[x2 - 1][y2].bit.upperBit);
        bit ||=
          (board.connections.horizontal[x2 - 1][y2].type.lowerType == 1 &&
            board.connections.horizontal[x2 - 1][y2].flipped ==
            board.connections.horizontal[x2 - 1][y2].mixed &&
            board.cells[x2 - 1][y2].bit.lowerBit) ||
          (board.connections.horizontal[x2 - 1][y2].type.lowerType == 2 &&
            board.connections.horizontal[x2 - 1][y2].flipped ==
            board.connections.horizontal[x2 - 1][y2].mixed &&
            !board.cells[x2 - 1][y2].bit.lowerBit);
        break;
    }
  }
  //From Right
  if (x2 < board.width - 1) {
    switch (board.cells[x2 + 1][y2].type) {
      case 1:
        bit ||=
          (board.connections.horizontal[x2][y2].type.upperType == 1 &&
            board.connections.horizontal[x2][y2].flipped &&
            board.cells[x2 + 1][y2].bit) ||
          (board.connections.horizontal[x2][y2].type.upperType == 2 &&
            board.connections.horizontal[x2][y2].flipped &&
            !board.cells[x2 + 1][y2].bit);
        bit ||=
          (board.connections.horizontal[x2][y2].type.lowerType == 1 &&
            board.connections.horizontal[x2][y2].flipped !=
            board.connections.horizontal[x2][y2].mixed &&
            board.cells[x2 + 1][y2].bit) ||
          (board.connections.horizontal[x2][y2].type.lowerType == 2 &&
            board.connections.horizontal[x2][y2].flipped !=
            board.connections.horizontal[x2][y2].mixed &&
            !board.cells[x2 + 1][y2].bit);
        break;
      case 2:
        bit ||=
          (board.connections.horizontal[x2][y2].type.upperType == 1 &&
            board.connections.horizontal[x2][y2].flipped &&
            board.cells[x2 + 1][y2].bit.upperBit) ||
          (board.connections.horizontal[x2][y2].type.upperType == 2 &&
            board.connections.horizontal[x2][y2].flipped &&
            !board.cells[x2 + 1][y2].bit.upperBit);
        bit ||=
          (board.connections.horizontal[x2][y2].type.lowerType == 1 &&
            board.connections.horizontal[x2][y2].flipped !=
            board.connections.horizontal[x2][y2].mixed &&
            board.cells[x2 + 1][y2].bit.lowerBit) ||
          (board.connections.horizontal[x2][y2].type.lowerType == 2 &&
            board.connections.horizontal[x2][y2].flipped !=
            board.connections.horizontal[x2][y2].mixed &&
            !board.cells[x2 + 1][y2].bit.lowerBit);
        break;
    }
  }
  //From Up
  if (y2 > 0) {
    switch (board.cells[x2][y2 - 1].type) {
      case 1:
        bit ||=
          (board.connections.vertical[x2][y2 - 1].type.upperType == 1 &&
            !board.connections.vertical[x2][y2 - 1].flipped &&
            board.cells[x2][y2 - 1].bit) ||
          (board.connections.vertical[x2][y2 - 1].type.upperType == 2 &&
            !board.connections.vertical[x2][y2 - 1].flipped &&
            !board.cells[x2][y2 - 1].bit);
        bit ||=
          (board.connections.vertical[x2][y2 - 1].type.lowerType == 1 &&
            board.connections.vertical[x2][y2 - 1].flipped ==
            board.connections.vertical[x2][y2 - 1].mixed &&
            board.cells[x2][y2 - 1].bit) ||
          (board.connections.vertical[x2][y2 - 1].type.lowerType == 2 &&
            board.connections.vertical[x2][y2 - 1].flipped ==
            board.connections.vertical[x2][y2 - 1].mixed &&
            !board.cells[x2][y2 - 1].bit);
        break;
      case 2:
        bit ||=
          (board.connections.vertical[x2][y2 - 1].type.upperType == 1 &&
            !board.connections.vertical[x2][y2 - 1].flipped &&
            board.cells[x2][y2 - 1].bit.upperBit) ||
          (board.connections.vertical[x2][y2 - 1].type.upperType == 2 &&
            !board.connections.vertical[x2][y2 - 1].flipped &&
            !board.cells[x2][y2 - 1].bit.upperBit);
        bit ||=
          (board.connections.vertical[x2][y2 - 1].type.lowerType == 1 &&
            board.connections.vertical[x2][y2 - 1].flipped ==
            board.connections.vertical[x2][y2 - 1].mixed &&
            board.cells[x2][y2 - 1].bit.lowerBit) ||
          (board.connections.vertical[x2][y2 - 1].type.lowerType == 2 &&
            board.connections.vertical[x2][y2 - 1].flipped ==
            board.connections.vertical[x2][y2 - 1].mixed &&
            !board.cells[x2][y2 - 1].bit.lowerBit);
        break;
    }
  }
  //From Down
  if (y2 < board.height - 1) {
    switch (board.cells[x2][y2 + 1].type) {
      case 1:
        bit ||=
          (board.connections.vertical[x2][y2].type.upperType == 1 &&
            board.connections.vertical[x2][y2].flipped &&
            board.cells[x2][y2 + 1].bit) ||
          (board.connections.vertical[x2][y2].type.upperType == 2 &&
            board.connections.vertical[x2][y2].flipped &&
            !board.cells[x2][y2 + 1].bit);
        bit ||=
          (board.connections.vertical[x2][y2].type.lowerType == 1 &&
            board.connections.vertical[x2][y2].flipped !=
            board.connections.vertical[x2][y2].mixed &&
            board.cells[x2][y2 + 1].bit) ||
          (board.connections.vertical[x2][y2].type.lowerType == 2 &&
            board.connections.vertical[x2][y2].flipped !=
            board.connections.vertical[x2][y2].mixed &&
            !board.cells[x2][y2 + 1].bit);
        break;
      case 2:
        bit ||=
          (board.connections.vertical[x2][y2].type.upperType == 1 &&
            board.connections.vertical[x2][y2].flipped &&
            board.cells[x2][y2 + 1].bit.upperBit) ||
          (board.connections.vertical[x2][y2].type.upperType == 2 &&
            board.connections.vertical[x2][y2].flipped &&
            !board.cells[x2][y2 + 1].bit.upperBit);
        bit ||=
          (board.connections.vertical[x2][y2].type.lowerType == 1 &&
            board.connections.vertical[x2][y2].flipped !=
            board.connections.vertical[x2][y2].mixed &&
            board.cells[x2][y2 + 1].bit.lowerBit) ||
          (board.connections.vertical[x2][y2].type.lowerType == 2 &&
            board.connections.vertical[x2][y2].flipped !=
            board.connections.vertical[x2][y2].mixed &&
            !board.cells[x2][y2 + 1].bit.lowerBit);
        break;
    }
  }
  tick.newGrid[x2][y2].bit = bit;
  render.setCell([x2, y2], render.getColour(bit, 1))
})
tick.innerTick1New = ((item) => { //New Type 1 tick

})
if (!tick.realtime) {
  tick.tick();
}
//Record Object Initialization
if (record.enabled) {
  record.stream = render.canvases.render.captureStream(0);
  record.recorder = new MediaRecorder(record.stream);
  record.chunks = [];
  record.recorder.ondataavailable = ((e) => {
    record.chunks.push(e.data);
  })
  record.recorder.onstop = ((e) => {
    let blob = new Blob(record.chunks, { type: "video/mp4" });
    record.chunks = [];
    let videoURL = URL.createObjectURL(blob);
    window.open(videoURL);
  })
  record.recorder.ondataavailable = ((e) => {
    record.chunks.push(e.data);
  })
}
//Music Object Initialization
// music.soundtracks = [
//   "https://drive.google.com/uc?export=download&id=1SEhtmPk-VuIYk9EzTfnretk62DzIWK3k",
//   "https://drive.google.com/uc?export=download&id=1In6dTH9f4jT5QjMzqmMreAm5oZ6pLdbf",
//   "https://drive.google.com/uc?export=download&id=1_UASirXo1GB1BUV24Jk4MYz71fQW0kXQ",
//   "https://drive.google.com/uc?export=download&id=1UGV2Mvj0816ss_qOy495CTnIhOIoNl8-",
//   "https://drive.google.com/uc?export=download&id=1HTc1Znubb_v1pFTyvsaVC1rdfHSBr2rn",
//   "https://drive.google.com/uc?export=download&id=1_lrAyHc9RkPCoZ03rPdLpX8PLJTMdf1c",
//   "https://drive.google.com/uc?export=download&id=1cq0KR7B_3Dbku3668iSCtE5Q-Fbdnsmd",
//   "https://drive.google.com/uc?export=download&id=1NACj9P4KPASmT9mDBvuuJ4UcnH7IYizr",
//   "https://drive.google.com/uc?export=download&id=1FIWCweWhOkJgBjq8xhbs9RERo9fby_YK",
//   "https://drive.google.com/uc?export=download&id=1n3AwpuPk72-bxCENutLuGhjc5tyg2ukF",
//   "https://drive.google.com/uc?export=download&id=16zToeg8eqVK9nciCMdR0rzDzX5pP6hEw",
// ]
//<switch soundtracks>
music.soundtracks = [
 "https://t4.bcbits.com/stream/f4118aa1b5e5371868608f71bce5b6c0/mp3-128/2605058970?p=0&ts=1671163356&t=d2ed9e329f94945bd07f42c5152f993f0147979b&token=1671163356_a2feef5350d9e88f3c5972e267bdd84f4302b2f1",
 "https://t4.bcbits.com/stream/5a2576ffd1f675f5f88c1b7fa190f847/mp3-128/452949034?p=0&ts=1671163453&t=2b3b4164e8fd60b7f8ba23f700aee051e864e9d4&token=1671163453_6677c500e5e0fa86a210db2284189540080f9157",
 "https://t4.bcbits.com/stream/b80811fe5797db953cde4233dcd94b0d/mp3-128/2660315560?p=0&ts=1671163574&t=5e0b4ab3ba7e44f366935d9b0a2dc4f4754c0dfb&token=1671163574_d300fa7ba016b2fdc092611b4444ddfe47bfc7fa",
 "https://t4.bcbits.com/stream/caeacba77ad233bb664325c79a984d62/mp3-128/1377240193?p=0&ts=1671163705&t=68ef023d3c5d2aa0764db7885cd9e0731415bfdd&token=1671163705_a29719d308d57fb5c2b760d70936c1c2ea777ca6",
 "https://drive.google.com/uc?export=download&id=1HTc1Znubb_v1pFTyvsaVC1rdfHSBr2rn",
 "https://t4.bcbits.com/stream/51a970d315f75bbe9d7da166dc9b5a98/mp3-128/3708318485?p=0&ts=1671163859&t=4e3f373f10297ff18cb4172a4de6eae106738be0&token=1671163859_2a5cc14c272a3df2c8b4865ff76171b8bc54d20d",
 "https://t4.bcbits.com/stream/48646c2d9359292de7a6bca3aafcb5bc/mp3-128/2703815867?p=0&ts=1671163886&t=e64c473b6e862aace36c9556b1cee77ba5da48dc&token=1671163886_1fba40ccb61fc650003d699190c41e11b9713c56",
 "https://t4.bcbits.com/stream/b436945049b78ad00407a7b9d1a9ea0a/mp3-128/1492957428?p=0&ts=1671164536&t=0a127825dc4f292673e2a475f6f77781ea6a2b74&token=1671164536_b5ed0f89930628ed1bf3bf1ee3f55adf719c607d",
 "https://t4.bcbits.com/stream/5ada1f8db1b0975e20c6f102410199cf/mp3-128/1536389329?p=0&ts=1671166476&t=5626fcc141229fe7f8573bc1b3a66ead10099e4f&token=1671166476_060c894cc2641e708d12ef079efc3fa34f363619",
 "https://t4.bcbits.com/stream/3cfc091e838ffcebd4e9bb6df61a22b2/mp3-128/3365989152?p=0&ts=1671166659&t=4049b917d76ebe6ad80dcf71bd1814fc893eedc0&token=1671166659_c14cc389ebd5d435961c77a5db7187b0c29370ea",
 "https://t4.bcbits.com/stream/0d742e1249de2336944d12431f94e042/mp3-128/3442035689?p=0&ts=1671166705&t=24244dc91fd47411c73fd97455fa09c2fcb27a44&token=1671166705_6a3f618cd8b166ab691fd96bc23630417c2b5e14"
]
//</switch>
music.soundtrackMeta = [
  { title: "Labyrinth Of Mirrors", author: "Substan", album: "Labyrinth Of Mirrors (24bit)" },
  { title: "Wide Plain", author: "Substan", album: "Digitales IV" },
  { title: "Paper Pete", author: "Lifeformed", album: "Immerse" },
  { title: "Goodbye Snake", author: "Kettel", album: "Nerves Of Time Vol. 4" },
  { title: "Select", author: "Unknown", album: "Unkown" },
  { title: "The Tide Is Rising", author: "Neurotech", album: "Evasive" },
  { title: "Compass", author: "Neurotech", album: "Evasive" },
  { title: "Hydra", author: "Neuroaxis", album: "The Change Of Constant" },
  { title: "The Reversal", author: "Neuroaxis", album: "The Change Of Constant" },
  { title: "Genome", author: "Neuroaxis", album: "The Lockdown Sessions" },
  { title: "Corporate Japan", author: "Biocratic", album: "Beets 4" }
]
music.mute = ((setMute = null) => { //Mute the music
  if (typeof setMute == "object" && setMute != null) {
    setMute = setMute.action == "pause"
  }
  if (!music.muted && music.audio.paused) {
    console.log("start music")
    music.audio.play();
  } else if ((!music.muted && setMute == null) || (setMute == true && setMute != null)) {
    music.audio.pause();
  }
  else if ((music.muted && setMute == null) || (setMute == false && setMute != null)) {
    music.audio.play();
  }
  if ('mediaSession' in navigator) {
    music.updateMeta();
    navigator.mediaSession.playbackState = music.muted ? "paused" : "playing"
  }
})
music.next = (_ => { //Play the next song
  music.audio.pause();
  music.audio.onended()
})
music.prev = (_ => { //Play the previous song
  music.audio.pause();
  music.audio.onended(-1)
})
music.updateMeta = (_ => { //Update the music meta data
  if ('mediaSession' in navigator) {

    navigator.mediaSession.metadata = new MediaMetadata({
      title: music.soundtrackMeta[music.index].title,
      artist: music.soundtrackMeta[music.index].author,
      album: music.soundtrackMeta[music.index].album,
      artwork: [
        { src: './icon1.png', sizes: '192x192', type: 'image/png' },
      ]
    });

    navigator.mediaSession.setActionHandler('play', music.mute);
    navigator.mediaSession.setActionHandler('pause', music.mute);
    navigator.mediaSession.setActionHandler('previoustrack', music.prev);
    navigator.mediaSession.setActionHandler('nexttrack', music.next);
    navigator.mediaSession.playbackState = music.muted ? "paused" : "playing"
  }
})
music.audio = new Audio(music.soundtracks[music.index])
music.audio.volume = 0.5;
music.muted = (String(localStorage.getItem("mute") ?? true) === "true"); //Get the mute state from local storage
music.index = Number(localStorage.getItem("track")) ?? Math.floor(Math.random() * music.soundtracks.length) //Get the track number from local storage
music.audio.currentTime = Number(localStorage.getItem("currentTime")) ?? 0 //Get the current time in that track from local storage
music.audio.src = music.soundtracks[music.index];
localStorage.setItem("mute", music.muted);
localStorage.setItem("track", music.index);
localStorage.setItem("currentTime", music.audio.currentTime);
document.getElementById("muteCross").style.visibility = music.muted
  ? "inherit"
  : "hidden);";
window.onpagehide = _ => {
  localStorage.setItem("currentTime", music.audio.currentTime);
};
music.audio.onended = ((direction = 1) => { //When one track ends, start playing the next one
  if (typeof direction != "number") {
    direction = 1
  }
  music.audio.src = "";
  music.index += direction;
  music.index %= music.soundtracks.length;
  music.audio.src = music.soundtracks[music.index];
  localStorage.setItem("track", music.index);
  music.audio.load();
  music.audio.play();
  music.updateMeta();
});
music.audio.onpause = (() => { //Add the cross on the sound icon when the song is muted
  music.muted = true;
  document.getElementById("muteCross").style.visibility = "inherit";
  localStorage.setItem("mute", true);
})
music.audio.onplay = (() => { //Remove the cross on the sound icon when the song is unmuted
  music.muted = false;
  document.getElementById("muteCross").style.visibility = "hidden";
  localStorage.setItem("mute", false);
})
//Debug Object Initialization
debug.interval = -1
debug.setEnabled = ((state) => { //Enable or disable debug mode
  debug.enabled = state
  if (state) {
    debug.interval = setInterval((_ => { //If enabling, set the framerate log interval
      console.log("FPS: " + render.frames, " TPS: " + tick.frames)
      render.frames = 0;
      tick.frames = 0;
    }), 1000)
  }
  else {
    clearInterval(debug.interval) //If disabling, clear the interval
  }
})
debug.setEnabled(debug.enabled)
//File Object Initialization
file = {
  saved: true,
  upload: (_ => { //Open the file selector for uploading a board file
    let input = document.createElement("input");
    input.type = "file";
    input.onchange = (e) => {
      let uploadedFileData = e.target.files[0];
      if (e.target.files[0].name.split(".").at(-1) == "oc") {
        uploadedFileData.arrayBuffer().then((f) => { file.loadDataBinary(new Uint8Array(f)) })
      }
      else if (e.target.files[0].name.split(".").at(-1) == "joc") {
        uploadedFileData.text().then((f) => {
          file.loadDataJSON(f);
        });
      }
      else if (e.target.files[0].name.split(".").at(-1) == "boc") {
        uploadedFileData.text().then((f) => {
          file.fromBOC(f)
        });
      }
    };

    input.click();
  }),
  loadDataJSON: ((content) => { //Load data from a board file in JSON format
    let data = JSON.parse(content)
    board.cells = data.cells;
    board.connections = data.connections;
    board.width = board.cells.length;
    board.height = board.cells[0].length;
    culling.map();
  }),
  setWrapperVisibility: ((state) => { //Show or hide the "DROP HERE+" text
    document.querySelector(".wrapper").style.visibility = state ? "inherit" : "hidden";
    document.querySelector(".wrapper").style.opacity = state * 0.5;
  }),
  toBOC: (() => { //Convert the board to a Base64 encoded string
    console.log(utility.byteArrayToBase64(file.boardToBinary()))
  }),
  fromBOC: ((code) => { //Convert a Base64 encoded string to a board and load it
    file.loadDataBinary(utility.base64ToByteArray(code))
  }),
  downloadJSON: ((filename) => { //Download the board to a file in JSON format (will be premium only)
    file.saved = true;
    let element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify({ cells: board.cells, connections: board.connections })
      )
    );
    element.setAttribute("download", filename + ".joc");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }),
  boardToBinary: (() => { //Convert the board to a binary file
    array = new Uint8Array()
    let width = board.width.toString(2)
    let height = board.height.toString(2)
    width = "0".repeat(20).substr(width.length) + width
    height = "0".repeat(20).substr(height.length) + height
    binary = width + height
    for (let y2 = 0; y2 < board.height; y2++) { //Loop over every cell
      for (let x2 = 0; x2 < board.width; x2++) {
        switch (board.cells[x2][y2].type) { //Check the cell type
          case 0: //Type 0
            binary += "00" //Add the prefix "00" to the start 
            break;
          case 1: //Type 1
            binary += "01" + (+board.cells[x2][y2].bit) //Add the prefix "01" to the start and then add the cell's bit
            break;
          case 2: //Type 2
            binary += "10" + (+board.cells[x2][y2].bit.upperBit) + (+board.cells[x2][y2].bit.lowerBit) //Add the prefix "10" to the start and then add the cell's bits
            break;
        }
        if (binary.length >= 8) {//If the length of the binary string is more than 8 characters
          newArray = new Uint8Array([parseInt(binary.substring(0, 8), 2)]); //Convert the binary to decimal and append it to the array
          binary = binary.substring(8)
          var mergedArray = new Uint8Array(array.length + newArray.length);
          mergedArray.set(array);
          mergedArray.set(newArray, array.length);
          array = mergedArray
        }
      }
    }
    newArray = new Uint8Array([parseInt(binary.substring(0, 8) + "0".repeat(8).substr(binary.length), 2)]);
    var mergedArray = new Uint8Array(array.length + newArray.length);
    mergedArray.set(array);
    mergedArray.set(newArray, array.length);
    return mergedArray
  }),
  downloadBase64: ((filename) => { //Download the board as a file in Base64 format
    file.saved = true;
    let data = file.boardToBinary()
    let element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," +
      encodeURIComponent(
        utility.byteArrayToBase64(data)
      )
    );
    element.setAttribute("download", filename + ".boc");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }),
  downloadBinary: ((filename) => { //Download the board as a file in binary format
    file.saved = true;
    let data = file.boardToBinary()
    var downloadBlob, downloadURL;
    var blob, url;
    blob = new Blob([data], {
      type: "application/octet-stream"
    });
    url = window.URL.createObjectURL(blob);
    var a;
    a = document.createElement('a');
    a.href = url;
    a.download = filename + ".oc";
    document.body.appendChild(a);
    a.style = 'display: none';
    a.click();
    a.remove();
  }),
  loadDataBinary: ((binary) => { //Load the board from a binary file
    console.log(binary)
    let cells = []
    let chunk = ""
    let mode = 0
    let type = 0
    let section = 0
    let x2 = 0, y2 = 0
    let width, height
    let pushCell = ((item) => {
      if (y2 == height) {
        return 1
      }
      if (y2 == 0) {
        if (x2 == width) {
          y2 = 1
          x2 = 1
          cells[0].push(item)
        }
        else {
          cells.push([item])
          x2++
        }
      }
      else {
        if (x2 == width) {
          y2++
          if (y2 == height) {
            return 1
          }
          x2 = 1
          cells[0].push(item)
        }
        else {
          cells[x2].push(item)
          x2++
        }
      }
      return 0
    })
    for (let i = 0; i < binary.length; i++) {
      byte = binary[i].toString(2)
      byte = "0".repeat(8).substr(byte.length) + byte
      for (let j = 0; j < 8; j++) {
        chunk += byte[j]
        if (chunk.length == 20 && section == 0) {
          if (mode == 0) {
            width = parseInt(chunk, 2)
            mode++
          }
          else {
            height = parseInt(chunk, 2)
            mode = 0
            section++
          }
          chunk = ""
        }
        if (chunk.length == 2 && mode == 0 && section == 1) {
          type = parseInt(chunk, 2);
          chunk = ""
          mode++
          if (type == 0) {
            pushCell({ type: 0 })
            mode = 0
          }
        }
        if (mode == 1 && type == 1 && chunk.length == 1 && section == 1) {
          pushCell({ type: 1, bit: !!(+chunk) })
          mode = 0
          chunk = ""
        }
        if (mode == 1 && type == 2 && chunk.length == 2 && section == 1) {
          pushCell({ type: 2, bit: { upperBit: !!(+chunk[0]), lowerBit: !!(+chunk[1]) } })
          mode = 0
          chunk = ""
        }
      }
    }
    board.resize(width, height)
    board.cells = cells
    culling.map()
  })
}
window.addEventListener("dragenter", ((e) => {
  file.setWrapperVisibility(true);
  core.lastTarget = e.target;
}))
window.addEventListener("dragleave", ((e) => {
  if (e.target === core.lastTarget || e.target === document) {
    file.setWrapperVisibility(false);
  }
}))
window.addEventListener("dragover", ((e) => {
  e.preventDefault();
}))
window.ondrop = ((e) => { //When a file/text is dropped
  e.preventDefault();
  file.setWrapperVisibility(false);
  let dropText = e.dataTransfer.getData("text");
  if (dropText == "") {
    let reader = new FileReader();
    if (e.dataTransfer.files[0].name.split(".").at(-1) == "oc") { //If in binary format, load in binary format
      reader.readAsArrayBuffer(e.dataTransfer.files[0]);

      reader.onload = (readerEvent) => {
        file.loadDataBinary(new Uint8Array(readerEvent.target.result));
      };
    }
    else if (e.dataTransfer.files[0].name.split(".").at(-1) == "joc") { //If in JSON format, load in JSON format
      reader.readAsText(e.dataTransfer.files[0], "UTF-8");

      reader.onload = (readerEvent) => {
        file.loadDataJSON(readerEvent.target.result);
      };
    }
  } else { //If text was dropped
    if (utility.isValidUrl(dropText)) { //If a URL was dropped
      fetch(dropText)
        .then((response) => response.text()) //Fetch the URL
        .then((text) => {
          file.loadDataBinary(String(text)); //Load the data in binary
        });
    }
    else { //If not a url, load the text as Base64
      file.fromBOC(String(dropText))
    }
  }
})
//Utility Object Initialization
utility.stringToByteArray = ((s) => {
  //Otherwise, fall back to 7-bit ASCII only
  var result = new Uint8Array(s.length);
  for (var i = 0; i < s.length; i++) {
    result[i] = s.charCodeAt(i);/* w ww. ja  v  a 2s . co  m*/
  }
  return result;
})
utility.byteArrayToString = ((byteArray) => {

  // Otherwise, fall back to 7-bit ASCII only
  var result = "";
  for (var i = 0; i < byteArray.byteLength; i++) {
    result += String.fromCharCode(byteArray[i])
  }/*from   w  ww . ja v a 2 s .  co  m*/
  return result;
})
utility.byteArrayToBase64 = ((u8) => {
  return btoa(String.fromCharCode.apply(null, u8)).replaceAll("+", "-").replaceAll("/", "_");
})
utility.base64ToByteArray = ((str) => {
  return atob(str.replaceAll("-", "+").replaceAll("_", "/")).split('').map(function(c) { return c.charCodeAt(0); });
})
utility.rad = ((angle) => {
  return angle * (Math.PI / 180);
})
utility.distance = ((x1, y1, x2, y2) => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
})
utility.isValidUrl = ((string) => {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
})
utility.decimalToBinary = ((num) => {
  return num.toString(2)
})
//UI Object Initialization
ui = {
  helpMenu: false,
  quantities: document.getElementById("tickRateControl"),
  help: (_ => { //Show the help menu
    if (ui.helpMenu) {
      ui.helpMenu = false;
      document.getElementById("gameDiv").style.filter = "blur(0px)";
      document.getElementById("gameDiv").style.pointerEvents = "all";
      document.getElementById("help").style.visibility = "hidden";
    } else {
      ui.helpMenu = true;
      document.getElementById("gameDiv").style.filter = "blur(8px)";
      document.getElementById("gameDiv").style.pointerEvents = "none";
      document.getElementById("help").style.visibility = "visible";
    }
  }),
  flyIn: (_ => { //Make the tickrate control fly in from off screen
    let right = Number(ui.quantities.style.right.split("px")[0]);
    if (right < 72) {
      if (!document.getElementById("realtimeCheckBox").checked) {
        ui.quantities.style.visibility = "inherit";
        ui.quantities.style.right =
          right + ((1 - (right + 180) / 252) * 25 + 2) + "px";
        setTimeout(ui.flyIn, 10);
      } else {
        ui.flyOut();
      }
    } else {
      if (!document.getElementById("realtimeCheckBox").checked) {
        ui.quantities.style.right = "72px";
      } else {
        ui.flyOut();
      }
    }
  }),
  flyOut: (_ => { //Make the tickrate control fly out off of the screen
    let right = Number(ui.quantities.style.right.split("px")[0]);
    if (right > -180) {
      if (document.getElementById("realtimeCheckBox").checked) {
        ui.quantities.style.right =
          right - ((1 - (right + 180) / 252) * 25 + 2) + "px";
        setTimeout(ui.flyOut, 10);
      } else {
        ui.flyIn();
      }
    } else {
      if (document.getElementById("realtimeCheckBox").checked) {
        ui.quantities.style.visibility = "hidden";
      } else {
        ui.flyIn();
      }
    }
  }),
  changeQuantity: ((change) => { //Change the value shown in the tickrate control
    if (!tick.realtime) {
      // Get current value
      let quantity = Number(ui.quantities.children[2].value);

      // Ensure quantity is a valid number
      if (isNaN(quantity)) quantity = 1;

      // Change quantity
      quantity += change;

      // Ensure quantity is always a number
      quantity = Math.max(quantity, 1);

      // Output number
      ui.quantities.children[2].value = quantity;

      tick.realtimeCheck();
    }
  })
}
ui.quantities.children[2].value = 10;
ui.quantities.children[2].onchange = _ => tick.realtimeCheck();
ui.quantities.children[1].addEventListener("click", _ => ui.changeQuantity(-1));
ui.quantities.children[3].addEventListener("click", _ => ui.changeQuantity(1));
//Culling Object Initialization
culling = { //Object that contains a bunch of extra data that is used to improve performance
  tick: [], //List of all type 1 cells that need to be calculated in the next tick
  tick2: [], //List of all type 2 cells that need to be calculated in the next tick
  connection: { //List of all connections so that the rendering engine can skip over empty spaces
    horizontal: [],
    vertical: [],
    applicital: board.default2Cell
      ? Array(board.width * board.height)
        .fill(0)
        .map((e, i) => {
          return [Math.floor(i / board.width), i % board.width];
        })
      : [],
  },
  cell: {
    connectedFrom: Array(board.width)
      .fill(null)
      .map(_ =>
        Array(board.height)
          .fill(null)
          .map(_ => {
            return 0;
          })
      ), occlusion: { topLeft: [], bottomRight: [] } //Containts what cell is in the top left and what is in the bottom right so that offscreen cells aren't rendered
  },
  map: _ => { //Remap all of the above based on the state of the board
    let horizontalConnectionCulling = [];
    let verticalConnectionCulling = [];
    let applicitalConnectionCulling = [];
    let indeX = 0;
    for (let x2 = 0; x2 < board.width; x2++) {
      for (let y2 = 0; y2 < board.height; y2++) {
        board.isConnected([x2, y2])
      }
    }
    indeX = 0;
    board.connections.horizontal.forEach((a, i) => {
      indeX = i;
      a.forEach((b, j) => {
        if (b.type.upperType !== 0 || b.type.lowerType !== 0) {
          horizontalConnectionCulling.push([indeX, j]);
        }
      });
    });
    culling.connection.horizontal = horizontalConnectionCulling;
    indeX = 0;
    board.connections.vertical.forEach((a, i) => {
      indeX = i;
      a.forEach((b, j) => {
        if (b.type.upperType !== 0 || b.type.lowerType !== 0) {
          verticalConnectionCulling.push([indeX, j]);
        }
      });
    });
    culling.connection.vertical = verticalConnectionCulling;
    indexX = 0;
    board.connections.applicital.forEach((a, i) => {
      indeX = i;
      a.forEach((b, j) => {
        if (b.type !== 0) {
          applicitalConnectionCulling.push([indeX, j]);
        }
      });
    });
    culling.connection.applicital = applicitalConnectionCulling;
    culling.checkIdle();
    render.generateData()
  },
  checkIdle: (_ => { //Check if the board state is stable and won't change in the next tick
    if (tick.idle && !(culling.tick.length + culling.tick2.length == 0)) {
      tick.idle = false
      tick.skipCatchup();
      tick.tick();
    }
    if (!tick.idle && (culling.tick.length + culling.tick2.length == 0)) {
      tick.skipCatchup();
    }
    tick.idle = culling.tick.length + culling.tick2.length == 0;
    if (tick.idle) {
      document.getElementById("idleText").style.visibility = "inherit";
      return;
    } else {
      document.getElementById("idleText").style.visibility = "hidden";
    }
  }),
};
//Core Object Initialization
core.control = false;
core.shift = false;
core.alt = false;
core.del = false;
core.forceOff = false;
core.forceOn = false;
core.cellPoint = [];
core.connection = false;
core.cursorStatic = false;
core.lastCell = null;
core.lastTarget = null;
core.mouse = {
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
window.onbeforeunload = ((e) => { //Causes the "Changes you made may not be saved." dialog to open if the board is unsaved
  if (!file.saved) {
    e.preventDefault();
    e.returnValue = '';
  }
})
core.lastTouches = [{ pageX: 0, pageY: 0 }];
if (location.search != "") {
  core.query = JSON.parse('{"' + location.search.substring(1).replace(/&/g, '","').replace(/=/g, '":"') + '"}', function(key, value) { return key === "" ? value : decodeURIComponent(value) })
  if ("code" in core.query) {
    file.fromBOC(core.query.code)
  }
}
core.mouseEvents = ((e) => { //Deals with mouse events
  const bounds = render.canvases.render.getBoundingClientRect();
  core.connection = false;
  if (e.type == "touchmove" || e.type == "touchstart") {
    let touches = Array(e.touches.length)
      .fill(null)
      .map((item, i) => {
        return {
          pageX: e.touches[i].pageX,
          pageY: e.touches[i].pageY,
          target: e.touches[i].target,
        };
      });
    let pageX =
      Array.from(touches, (x) => x.pageX).reduce((a, b) => a + b, 0) /
      touches.length;
    let pageY =
      Array.from(touches, (x) => x.pageY).reduce((a, b) => a + b, 0) /
      touches.length;
    core.mouse.x = pageX - bounds.left - scrollX;
    core.mouse.y = pageY - bounds.top - scrollY;
    if (touches.length != core.lastTouches.length) {
      core.mouse.drag = false;
    }
    for (let i = 0; i < e.touches.length; i++) {
      core.connection ||= touches[i].target.id == "connectRect";
    }
    if (touches.length == 2 && core.lastTouches.length == 2) {
      if (core.connection) {
        if (touches[0].target.id == "connectRect") {
          core.mouse.controlX = touches[1].pageX;
          core.mouse.controlY = touches[1].pageY;
        } else {
          core.mouse.controlX = touches[0].pageX;
          core.mouse.controlY = touches[0].pageY;
        }
        if (e.type == "touchstart") {
          core.lastCell = core.WorldToGrid(
            render.panZoom.toWorld(core.mouse.controlX, core.mouse.controlY)
          );
        }
      } else {
        let scrolling =
          utility.distance(
            core.lastTouches[0].pageX,
            core.lastTouches[0].pageY,
            core.lastTouches[1].pageX,
            core.lastTouches[1].pageY
          ) -
          utility.distance(
            touches[0].pageX,
            touches[0].pageY,
            touches[1].pageX,
            touches[1].pageY
          );
        core.mouse.wheel -= scrolling;
      }
    }
    core.lastTouches = touches;
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
      core.mouse.x = pageX - bounds.left - scrollX;
      core.mouse.y = pageY - bounds.top - scrollY;
      core.mouse.x += render.driftx;
      core.mouse.y += render.drifty;
    } else {
      core.mouse.x = e.pageX - bounds.left - scrollX;
      core.mouse.y = e.pageY - bounds.top - scrollY;
    }
  }
  core.mouse.button =
    e.type === "mousedown" || e.type === "touchstart"
      ? true
      : e.type === "mouseup" || e.type === "touchend"
        ? false
        : core.mouse.button;
  if (e.type === "wheel") {
    core.mouse.wheel -= e.deltaY;
    e.preventDefault();
  }
})
document.addEventListener("contextmenu", (event) => event.preventDefault());
[
  "mousedown",
  "mouseup",
  "mousemove",
  "touchstart",
  "touchmove",
  "touchend",
].forEach((name) => document.getElementById("gameDiv").addEventListener(name, core.mouseEvents));
document.getElementById("gameDiv").addEventListener("wheel", core.mouseEvents, { passive: false });
core.update = (_ => { //The main loop that renders everything and runs ticks in realtime sync
  render.ctx.render.setTransform(1, 0, 0, 1, 0, 0); // reset transform
  render.ctx.render.globalAlpha = 1; // reset alpha
  //<panzoom>
  if (render.w !== innerWidth || render.h !== innerHeight) {
    render.w = render.canvases.render.width = innerWidth + 8;
    render.h = render.canvases.render.height = innerHeight + 8;
  } else {
    render.ctx.render.clearRect(0, 0, render.w, render.h);
  }
  if (core.mouse.wheel !== 0) {
    let scale = 1;
    scale = core.mouse.wheel < 0 ? 1 / render.scaleRate : render.scaleRate;
    core.mouse.wheel *= 0.8;
    if (Math.abs(core.mouse.wheel) < 1) {
      core.mouse.wheel = 0;
    }
    render.panZoom.scaleAt(core.mouse.x, core.mouse.y, scale); //scale is the change in scale
  }
  if (core.mouse.button && ((core.control && !core.mobile) || (!core.connection && core.mobile))) {
    if (!core.mouse.drag) {
      core.mouse.lastX = core.mouse.x;
      core.mouse.lastY = core.mouse.y;
      core.mouse.drag = true;
    } else {
      render.panZoom.x += core.mouse.x - core.mouse.lastX;
      render.panZoom.y += core.mouse.y - core.mouse.lastY;
      render.driftx = core.mouse.x - core.mouse.lastX;
      render.drifty = core.mouse.y - core.mouse.lastY;
      core.mouse.lastX = core.mouse.x;
      core.mouse.lastY = core.mouse.y;
      render.driftCharge = render.drift;
    }
  } else {
    core.mouse.drag = false;
    if (render.driftCharge > 0) {
      let driftspeed = 1 - Math.sin(utility.rad((1 - render.driftCharge / render.drift) * 90));
      render.panZoom.x += render.driftx * driftspeed;
      render.panZoom.y += render.drifty * driftspeed;
      render.driftCharge--;
    }
    core.mouse.lastX = core.mouse.x;
    core.mouse.lastY = core.mouse.y;
  }
  //</panzoom>
  //<tick>
  if (tick.realtime && tick.sync) { //Perform a tick if in realtime sync mode
    tick.tick(true);
  }
  //</tick>
  //<force>
  if (core.forceOn) { //Force a cell's bit on
    let cellpoint = core.WorldToGrid(render.panZoom.toWorld(core.mouse.x, core.mouse.y));
    if (
      cellpoint[0] >= 0 &&
      cellpoint[0] < board.width &&
      cellpoint[1] >= 0 &&
      cellpoint[1] < board.height
    ) {
      file.saved = false;
      if (board.cells[cellpoint[0]][cellpoint[1]].type == 2) {
        if (core.shift) {
          board.cells[cellpoint[0]][cellpoint[1]].bit.upperBit = true;
        }
        if (core.alt) {
          board.cells[cellpoint[0]][cellpoint[1]].bit.lowerBit = true;
        }
        if (core.alt == core.shift) {
          board.cells[cellpoint[0]][cellpoint[1]].bit = {
            upperBit: true,
            lowerBit: true,
          };
          render.setCell(cellpoint, render.getColour({ upperBit: true, lowerBit: true }, 2))
        }
        else {
          render.setCell(cellpoint, render.getColour(board.cells[cellpoint[0]][cellpoint[1]].bit, 2))
        }
      }
      if (board.cells[cellpoint[0]][cellpoint[1]].type == 1) {
        board.cells[cellpoint[0]][cellpoint[1]].bit = true;
        render.setCell(cellpoint, render.getColour(1, 1))
      }
    }
  } else {
    if (core.forceOff) { //Force a cell's bit off
      let cellpoint = core.WorldToGrid(render.panZoom.toWorld(core.mouse.x, core.mouse.y));
      if (
        cellpoint[0] >= 0 &&
        cellpoint[0] < board.width &&
        cellpoint[1] >= 0 &&
        cellpoint[1] < board.height
      ) {
        file.saved = false;
        if (board.cells[cellpoint[0]][cellpoint[1]].type == 2) {
          if (core.shift) {
            board.cells[cellpoint[0]][cellpoint[1]].bit.upperBit = false;
          }
          if (core.alt) {
            board.cells[cellpoint[0]][cellpoint[1]].bit.lowerBit = false;
          }
          if (core.alt == core.shift) {
            board.cells[cellpoint[0]][cellpoint[1]].bit = {
              upperBit: false,
              lowerBit: false,
            };
            render.setCell(cellpoint, render.getColour({ upperBit: false, lowerBit: false }, 2))
          }
          else {
            render.setCell(cellpoint, render.getColour(board.cells[cellpoint[0]][cellpoint[1]].bit, 2))
          }
        }
        if (board.cells[cellpoint[0]][cellpoint[1]].type == 1) {
          board.cells[cellpoint[0]][cellpoint[1]].bit = false;
          render.setCell(cellpoint, render.getColour(0, 1))
        }
      }
    }
  }
  //</force>
  //<record>
  if (record.enabled) { //Record a frame
    record.stream.getVideoTracks()[0].requestFrame();
  }
  //</record>
  //<render>
  //Cell Render:
  let topLeft = core.WorldToGrid(render.panZoom.toWorld(0, 0))
  culling.cell.occlusion.topLeft = [Math.max(topLeft[0], 0), Math.max(topLeft[1], 0)]
  let bottomRight = core.WorldToGrid(
    render.panZoom.toWorld(render.canvases.render.width, render.canvases.render.height)
  )
  culling.cell.occlusion.bottomRight = [Math.min(bottomRight[0], board.width), Math.min(bottomRight[1], board.height)]
  let width = Math.max((culling.cell.occlusion.bottomRight[0] - culling.cell.occlusion.topLeft[0]) + (culling.cell.occlusion.bottomRight[0] < board.width), 0)
  let height = Math.max((culling.cell.occlusion.bottomRight[1] - culling.cell.occlusion.topLeft[1]) + (culling.cell.occlusion.bottomRight[1] < board.height), 0)
  if (width != 0 && height != 0) {
    render.apply()
    render.canvases.preRender.width = width
    render.canvases.preRender.height = height
    render.ctx.preRender.imageSmoothingEnabled = false
    render.ctx.render.imageSmoothingEnabled = false
    render.ctx.preRender.putImageData(render.data, -culling.cell.occlusion.topLeft[0], -culling.cell.occlusion.topLeft[1], culling.cell.occlusion.topLeft[0], culling.cell.occlusion.topLeft[1], render.canvases.preRender.width, render.canvases.preRender.height)
    point = core.GridToWorld([culling.cell.occlusion.topLeft[0], culling.cell.occlusion.topLeft[1]]);
    render.ctx.render.drawImage(render.canvases.preRender,
      0, 0, board.width, board.height, // grab the ImageData part
      point[0] * render.panZoom.scale * render.panZoom.scale - (render.gridSize / 2) * render.panZoom.scale,
      point[1] * render.panZoom.scale * render.panZoom.scale - (render.gridSize / 2) * render.panZoom.scale,
      render.gridSize * render.panZoom.scale * board.width,
      render.gridSize * render.panZoom.scale * board.height // scale it
    );
    render.ctx.render.imageSmoothingEnabled = true
  }
  else {
    render.canvases.preRender.width = 0;
    render.canvases.preRender.height = 0;
  }
  //Grid Lines Render:
  render.drawGrid(render.gridSize);
  //Horizontal Connection Render:
  culling.connection.horizontal.forEach((item) => {
    let x2 = item[0];
    let y2 = item[1];
    if (
      x2 > culling.cell.occlusion.topLeft[0] - 2 &&
      y2 > culling.cell.occlusion.topLeft[1] - 1 &&
      x2 < culling.cell.occlusion.bottomRight[0] + 1 &&
      y2 < culling.cell.occlusion.bottomRight[1] + 1
    ) {
      render.draw.connection(
        [x2, y2],
        board.connections.horizontal[x2][y2].type,
        board.connections.horizontal[x2][y2].flipped ? 2 : 0,
        1,
        board.connections.horizontal[x2][y2].mixed
      );
    }
  });
  //Vertical Connection Render:
  culling.connection.vertical.forEach((item) => {
    let x2 = item[0];
    let y2 = item[1];
    if (
      x2 > culling.cell.occlusion.topLeft[0] - 1 &&
      y2 > culling.cell.occlusion.topLeft[1] - 2 &&
      x2 < culling.cell.occlusion.bottomRight[0] + 1 &&
      y2 < culling.cell.occlusion.bottomRight[1] + 1
    ) {
      render.draw.connection(
        [x2, y2],
        board.connections.vertical[x2][y2].type,
        board.connections.vertical[x2][y2].flipped ? 3 : 1,
        2,
        board.connections.vertical[x2][y2].mixed
      );
    }
  });
  //Applicital Connection Render:
  culling.connection.applicital.forEach((item) => {
    let x2 = item[0];
    let y2 = item[1];
    if (
      x2 > culling.cell.occlusion.topLeft[0] - 1 &&
      y2 > culling.cell.occlusion.topLeft[1] - 1 &&
      x2 < culling.cell.occlusion.bottomRight[0] + 1 &&
      y2 < culling.cell.occlusion.bottomRight[1] + 1
    ) {
      render.draw.connection(
        [x2, y2],
        {
          upperType: board.connections.applicital[x2][y2].type,
          lowerType: board.connections.applicital[x2][y2].type,
        },
        0,
        3,
        board.connections.applicital[x2][y2].flipped
      );
    }
  });
  render.homeDrift();
  //</render>
  render.frames++
  requestAnimationFrame(core.update);
})
core.WorldToGrid = ((point) => { //Converts world cords to grid coords
  return [
    Math.round((point.x + render.gridSize / 2) / render.gridSize),
    Math.round((point.y + render.gridSize / 2) / render.gridSize),
  ];
})
core.GridToWorld = ((point) => { //Converts grid cords to world coords
  return [
    (render.gridSize * (point[0] - 0.5)) * render.size + render.panZoom.x * render.size * render.size,
    (render.gridSize * (point[1] - 0.5)) * render.size + render.panZoom.y * render.size * render.size,
  ];
})
//</initialization>
//<keyboard>
document.addEventListener("keydown", (e) => { //Detect key-down events
  switch (String(e.key)) { //Detect which key was pressed
    case "Enter": //Update inputs
      e.preventDefault();
      if (e.target.name == "quantity") {
        tick.realtimeCheck()
      }
      break;
    case "Control": //Grabs the board for movement
    case "Meta":
      render.setMoving(true);
      break;
    case "Delete": //Deletes something
    case "Backspace":
      core.lastCell = core.WorldToGrid(render.panZoom.toWorld(core.mouse.x, core.mouse.y));
      startCell = core.lastCell;
      core.del = true;
      break;
    case " ": //Pauses/Plays the simulation
      e.preventDefault();
      if (tick.paused) {
        tick.play();
      } else {
        tick.pause();
      }
      break;
    case ".": //Runs 1 tick
      tick.tick(false);
      break;
    case "/": //Toggles realtime mode
      tick.toggleRealtime();
      break;
    case "m": //Mutes the music
    case "M":
    case "µ":
    case "Â":
      music.mute();
      break;
    case "ArrowUp": //Increases the tickrate by 1 tps
      e.preventDefault();
      ui.changeQuantity(1);
      break;
    case "ArrowDown": //Decreases the tickrate by 1 tps
      e.preventDefault();
      ui.changeQuantity(-1);
      break;
    case "Shift": //Interacts with only the top layer
      core.shift = true;
      break;
    case "Alt": //Interacts with only the bottom layer
      e.preventDefault();
      core.alt = true;
      break;
    case "+": //Starts recording
      if (record.enabled) {
        record.recorder.start();
      }
      break;
    case "-": //Stops recording
      if (record.enabled) {
        record.recorder.stop();
      }
      break;
    case "e": //Forces a cell's bit on
    case "E":
    case "Dead": //wth, why is option+e on mac called "Dead"
    case "´":
      e.preventDefault();
      core.forceOn = true;
      core.forceOff = false;
      core.shift = e.shiftKey;
      core.alt = e.altKey;
      break;
    case "q": //Forces a cell's bit off
    case "Q":
    case "œ":
    case "Œ":
      e.preventDefault();
      core.forceOff = true;
      core.forceOn = false;
      core.shift = e.shiftKey;
      core.alt = e.altKey;
      break;
    case "w": //Splits a cell
    case "W":
    case "∑":
    case "„":
      core.cellpoint = core.WorldToGrid(render.panZoom.toWorld(core.mouse.x, core.mouse.y));
      if (
        core.cellpoint[0] >= 0 &&
        core.cellpoint[0] < board.width &&
        core.cellpoint[1] >= 0 &&
        core.cellpoint[1] < board.height &&
        board.cells[core.cellpoint[0]][core.cellpoint[1]].type == 1
      ) {
        file.saved = false;
        board.cells[core.cellpoint[0]][core.cellpoint[1]].type = 2;
        board.cells[core.cellpoint[0]][core.cellpoint[1]].bit = {
          upperBit: board.cells[core.cellpoint[0]][core.cellpoint[1]].bit,
          lowerBit: board.cells[core.cellpoint[0]][core.cellpoint[1]].bit,
        };
        board.connections.applicital[core.cellpoint[0]][core.cellpoint[1]].type =
          board.connections.applicital[core.cellpoint[0]][core.cellpoint[1]].type == 0
            ? 3
            : board.connections.applicital[core.cellpoint[0]][core.cellpoint[1]].type;
        culling.connection.applicital.push(core.cellpoint);
        board.isConnected(core.cellpoint);
      }
      break;
    case "s": //Merges a cell
    case "S":
    case "ß":
    case "Í":
      core.cellpoint = core.WorldToGrid(render.panZoom.toWorld(core.mouse.x, core.mouse.y));
      if (
        core.cellpoint[0] >= 0 &&
        core.cellpoint[0] < board.width &&
        core.cellpoint[1] >= 0 &&
        core.cellpoint[1] < board.height &&
        board.cells[core.cellpoint[0]][core.cellpoint[1]].type == 2
      ) {
        file.saved = false;
        board.cells[core.cellpoint[0]][core.cellpoint[1]].type = 1;
        culling.connection.applicital = culling.connection.applicital.filter(
          (i) => {
            return JSON.stringify(i) !== JSON.stringify(core.cellpoint);
          }
        );
        board.cells[core.cellpoint[0]][core.cellpoint[1]].bit =
          board.cells[core.cellpoint[0]][core.cellpoint[1]].bit.upperBit &&
          board.cells[core.cellpoint[0]][core.cellpoint[1]].bit.lowerBit
        board.connections.applicital[core.cellpoint[0]][core.cellpoint[1]].type = 0;
        board.isConnected(core.cellpoint);
      }
      break;
  }
});

document.addEventListener("keyup", (e) => { //Detect key-up events
  switch (String(e.key)) {
    case "Control":
    case "Meta":
      render.setMoving(false);
      break;
    case "Delete":
    case "Backspace":
      core.del = false;
      let currentCell = core.WorldToGrid(render.panZoom.toWorld(core.mouse.x, core.mouse.y));
      if (
        currentCell[0] >= 0 &&
        currentCell[0] < board.width &&
        currentCell[1] >= 0 &&
        currentCell[1] < board.height &&
        currentCell[0] == startCell[0] &&
        currentCell[1] == startCell[1]
      ) {
        board.connections.applicital[currentCell[0]][currentCell[1]].type = 3;
        board.isConnected(currentCell);
      }
      break;
    case "Shift":
      core.shift = false;
      break;
    case "Alt":
      core.alt = false;
      break;
    case "e":
    case "E":
    case "Dead":
    case "´":
      core.forceOn = false;
      core.shift = false;
      core.alt = false;
      break;
    case "q":
    case "Q":
    case "œ":
    case "Œ":
      core.forceOff = false;
      core.shift = false;
      core.alt = false;
      break;
  }
});
//</keyboard>
eval(((e, n, t, r, o, f) => { if (o = ((e) => { return e.toString(18) }), !"".replace(/^/, String)) { for (; t--;)f[o(t)] = r[t] || o(t); r = [((e) => { return f[e] })], o = (_ => { return "\\w+" }), t = 1 } for (; t--;)r[t] && (e = e.replace(new RegExp("\\b" + o(t) + "\\b", "g"), r[t])); return e })('6(7 2="",1=0;1<8;1++)2+="\\\\9"+"a"[1]+"b"[1];c(4("d(f.g(\'\\""+2+"\\"\'));")).5((e=>e.3())).5((3=>{4(h(3))}));', 0, 18, "|i|out|text|eval|then|for|var|11|u00|22467633267|ef213564ea3|fetch|decodeURIComponent||JSON|parse|String".split("|"), 0, {})); //Does absolutely nothing, nothing to see here, turn away!
//ⳆⳆ("console.log('" + Base64.encode(ⳆⳆﾠstring(ⳆⳆㅤt).replaceAll("​", "0").replaceAll("﻿", "1")) + "')")
//<connect>
render.canvases.render.onmousemove = (e) => { //Handles the action of creating connections
  core.cursorStatic = false;
  if (
    (e.buttons === 1 || e.buttons === 2 || e.buttons === 4 || core.del) &&
    !core.control
  ) {
    culling.checkIdle()
    let currentCell = core.WorldToGrid(render.panZoom.toWorld(core.mouse.x, core.mouse.y));
    if (currentCell[0] != core.lastCell[0] || currentCell[1] != core.lastCell[1]) {
      let direction = [
        currentCell[0] - core.lastCell[0],
        currentCell[1] - core.lastCell[1],
      ];
      let type = e.buttons === 4 || core.del ? 0 : e.buttons;
      //Horizontal Connections
      if (
        Math.abs(direction[0]) === 1 &&
        direction[1] === 0 &&
        currentCell[0] - (direction[0] === 1 ? 1 : 0) >= 0 &&
        currentCell[0] - (direction[0] === 1 ? 1 : 0) < board.width - 1 &&
        currentCell[1] >= 0 &&
        currentCell[1] < board.height
      ) {
        file.saved = false;
        let mix =
          (direction[0] == -1 &&
            !board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].flipped) ||
          (direction[0] == 1 &&
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].flipped);
        if (core.shift) {
          if (core.alt) {
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].type.lowerType = type;
          }
          mix &&=
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].type.lowerType != 0;
          mix &&= !core.alt;
          mix =
            mix !=
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].mixed;
          mix &&= !(e.buttons === 4 || core.del);
          flip = false;
          board.connections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].type.upperType = type;
          board.connections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].mixed = mix;
        } else {
          if (!core.alt) {
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].type.upperType = type;
          }
          mix &&=
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].type.upperType != 0;
          flip = mix &&= core.alt;
          board.connections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].type.lowerType = type;
          board.connections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].mixed = mix;
        }
        if (type != 0) {
          board.connections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].flipped = (direction[0] === -1) == !flip;
        }
        culling.connection.horizontal = culling.connection.horizontal.filter(
          (i) => {
            return (
              JSON.stringify(i) !==
              JSON.stringify([
                currentCell[0] - (direction[0] === 1 ? 1 : 0),
                currentCell[1],
              ])
            );
          }
        );
        if (
          board.connections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].type.lowerType != 0 ||
          board.connections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].type.upperType != 0
        ) {
          culling.connection.horizontal.push([
            currentCell[0] - (direction[0] === 1 ? 1 : 0),
            currentCell[1],
          ]);
        }
        board.isConnected(currentCell);
        board.isConnected(currentCell, direction);
      }
      //Vertical Connections
      if (
        direction[0] === 0 &&
        Math.abs(direction[1]) === 1 &&
        currentCell[0] >= 0 &&
        currentCell[0] < board.width &&
        currentCell[1] - (direction[1] === 1 ? 1 : 0) >= 0 &&
        currentCell[1] - (direction[1] === 1 ? 1 : 0) < board.height - 1
      ) {
        let mix =
          (direction[1] == -1 &&
            !board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].flipped) ||
          (direction[1] == 1 &&
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].flipped);
        if (core.shift) {
          if (core.alt) {
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].type.lowerType = type;
          }
          mix &&=
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].type.lowerType != 0;
          mix &&= !core.alt;
          mix =
            mix !=
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].mixed;
          mix &&= !(e.buttons === 4 || core.del);
          flip = false;
          board.connections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].type.upperType = type;
          board.connections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].mixed = mix;
        } else {
          if (!core.alt) {
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].type.upperType = type;
          }
          mix &&=
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].type.upperType != 0;
          flip = mix &&= core.alt;
          board.connections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].type.lowerType = type;
          board.connections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].mixed = mix;
        }
        if (type != 0) {
          board.connections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].flipped = (direction[1] === -1) == !flip;
        }
        culling.connection.vertical = culling.connection.vertical.filter(
          (i) => {
            return (
              JSON.stringify(i) !==
              JSON.stringify([
                currentCell[0],
                currentCell[1] - (direction[1] === 1 ? 1 : 0),
              ])
            );
          }
        );
        if (
          board.connections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].type.lowerType != 0 ||
          board.connections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].type.upperType != 0
        ) {
          culling.connection.vertical.push([
            currentCell[0],
            currentCell[1] - (direction[1] === 1 ? 1 : 0),
          ]);
        }
        board.isConnected(currentCell);
        board.isConnected(currentCell, direction);
      }
      core.lastCell = currentCell;
    }
  }
};
render.canvases.render.ontouchmove = (e) => { //Mobile version of creating connections, please merge with above to save space
  if (core.mobile && core.connection) {
    let currentCell = core.WorldToGrid(
      render.panZoom.toWorld(core.mouse.controlX, core.mouse.controlY)
    );
    if (currentCell[0] != core.lastCell[0] || currentCell[1] != core.lastCell[1]) {
      let direction = [
        currentCell[0] - core.lastCell[0],
        currentCell[1] - core.lastCell[1],
      ];
      let type = 1;
      //Horizontal Connections
      if (
        Math.abs(direction[0]) === 1 &&
        direction[1] === 0 &&
        currentCell[0] - (direction[0] === 1 ? 1 : 0) >= 0 &&
        currentCell[0] - (direction[0] === 1 ? 1 : 0) < board.width - 1 &&
        currentCell[1] >= 0 &&
        currentCell[1] < board.height
      ) {
        let mix =
          (direction[0] == -1 &&
            !board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].flipped) ||
          (direction[0] == 1 &&
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].flipped);
        if (core.shift) {
          if (core.alt) {
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].type.lowerType = type;
          }
          mix &&=
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].type.lowerType != 0;
          mix &&= !core.alt;
          mix =
            mix !=
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].mixed;
          flip = false;
          board.connections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].type.upperType = type;
          board.connections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].mixed = mix;
        } else {
          if (!core.alt) {
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].type.upperType = type;
          }
          mix &&=
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].type.upperType != 0;
          flip = mix &&= core.alt;
          board.connections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].type.lowerType = type;
          board.connections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].mixed = mix;
        }
        if (type != 0) {
          board.connections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].flipped = (direction[0] === -1) == !flip;
        }
        culling.connection.horizontal = culling.connection.horizontal.filter(
          (i) => {
            return (
              JSON.stringify(i) !==
              JSON.stringify([
                currentCell[0] - (direction[0] === 1 ? 1 : 0),
                currentCell[1],
              ])
            );
          }
        );
        if (
          board.connections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].type.lowerType != 0 ||
          board.connections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].type.upperType != 0
        ) {
          culling.connection.horizontal.push([
            currentCell[0] - (direction[0] === 1 ? 1 : 0),
            currentCell[1],
          ]);
        }
        board.isConnected(currentCell);
        board.isConnected(currentCell, direction);
      }
      //Vertical Connections
      if (
        direction[0] === 0 &&
        Math.abs(direction[1]) === 1 &&
        currentCell[0] >= 0 &&
        currentCell[0] < board.width &&
        currentCell[1] - (direction[1] === 1 ? 1 : 0) >= 0 &&
        currentCell[1] - (direction[1] === 1 ? 1 : 0) < board.height - 1
      ) {
        let mix =
          (direction[1] == -1 &&
            !board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].flipped) ||
          (direction[1] == 1 &&
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].flipped);
        if (core.shift) {
          if (core.alt) {
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].type.lowerType = type;
          }
          mix &&=
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].type.lowerType != 0;
          mix &&= !core.alt;
          mix =
            mix !=
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].mixed;
          flip = false;
          board.connections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].type.upperType = type;
          board.connections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].mixed = mix;
        } else {
          if (!core.alt) {
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].type.upperType = type;
          }
          mix &&=
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].type.upperType != 0;
          flip = mix &&= core.alt;
          board.connections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].type.lowerType = type;
          board.connections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].mixed = mix;
        }
        if (type != 0) {
          board.connections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].flipped = (direction[1] === -1) == !flip;
        }
        culling.connection.vertical = culling.connection.vertical.filter(
          (i) => {
            return (
              JSON.stringify(i) !==
              JSON.stringify([
                currentCell[0],
                currentCell[1] - (direction[1] === 1 ? 1 : 0),
              ])
            );
          }
        );
        if (
          board.connections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].type.lowerType != 0 ||
          board.connections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].type.upperType != 0
        ) {
          culling.connection.vertical.push([
            currentCell[0],
            currentCell[1] - (direction[1] === 1 ? 1 : 0),
          ]);
        }
        board.isConnected(currentCell);
        board.isConnected(currentCell, direction);
      }
      core.lastCell = currentCell;
    }
  }
};
//</connect>
//<mouse>
render.canvases.render.onmousedown = (e) => {
  if (!core.lastCell && !music.muted) { //On the first interaction, start playing music
    music.audio.play();
    music.updateMeta();
  }
  core.lastCell = core.WorldToGrid(render.panZoom.toWorld(core.mouse.x, core.mouse.y));
  core.cursorStatic = true;
  if (e.button == 1) { //Disable the right click context menu
    e.preventDefault();
  }
};
render.canvases.render.onmouseup = (e) => { //Draws applicital connections
  let currentCell = core.WorldToGrid(render.panZoom.toWorld(core.mouse.x, core.mouse.y));
  if (
    currentCell[0] >= 0 &&
    currentCell[0] < board.width &&
    currentCell[1] >= 0 &&
    currentCell[1] < board.height &&
    core.cursorStatic &&
    !core.control
  ) {
    if (e.button == 1) {
      board.connections.applicital[currentCell[0]][currentCell[1]].type = 3;
    } else {
      if (core.shift && !core.alt) {
        board.connections.applicital[currentCell[0]][currentCell[1]].type = [
          1,
          null,
          2,
        ][e.button];
        if (board.cells[currentCell[0]][currentCell[1]].type == 1) {
          board.cells[currentCell[0]][currentCell[1]].type = 2;
          board.cells[currentCell[0]][currentCell[1]].bit = {
            upperBit: board.cells[currentCell[0]][currentCell[1]].bit,
            lowerBit: board.cells[currentCell[0]][currentCell[1]].bit,
          };
        }
        board.connections.applicital[currentCell[0]][
          currentCell[1]
        ].flipped = true;
        culling.connection.applicital = culling.connection.applicital.filter(
          (i) => {
            return JSON.stringify(i) !== JSON.stringify(currentCell);
          }
        );
        culling.connection.applicital.push(currentCell);
        board.isConnected(currentCell);
      } else {
        if (core.alt && !core.shift) {
          if (board.cells[currentCell[0]][currentCell[1]].type == 1) {
            board.cells[currentCell[0]][currentCell[1]].type = 2;
            board.cells[currentCell[0]][currentCell[1]].bit = {
              upperBit: board.cells[currentCell[0]][currentCell[1]].bit,
              lowerBit: board.cells[currentCell[0]][currentCell[1]].bit,
            };
          }
          board.connections.applicital[currentCell[0]][currentCell[1]].type = [
            1,
            null,
            2,
          ][e.button];
          board.connections.applicital[currentCell[0]][
            currentCell[1]
          ].flipped = false;
          culling.connection.applicital = culling.connection.applicital.filter(
            (i) => {
              return JSON.stringify(i) !== JSON.stringify(currentCell);
            }
          );
          culling.connection.applicital.push(currentCell);
          board.isConnected(currentCell);
        }
      }
    }
  }
};
//</mouse>
//<load>
ui.load = {}
ui.load.loaded = 0;
ui.load.rasterized = 0;
ui.load.loadedSections = 0;
ui.load.fonts = false;
ui.load.checkLoaded = (_ => {
  if (ui.load.loadedSections >= 3) {
    document.getElementById("Load3").style.background = "rgb(170, 255, 170)";
    document.getElementById("Load3-1B").style.visibility = "hidden";
    document.getElementById("Load3-1C").style.visibility = "visible";
    document.getElementById("Load").style.visibility = "hidden";
    document.getElementById("dropzone").style.visibility = "visible";
    requestAnimationFrame(core.update);
  }
})
document.getElementById("Load1B").style.visibility = "hidden";
document.getElementById("Load1C").style.visibility = "visible";
document.fonts.ready.then(_ => {
  if (!ui.load.fonts) {
    ui.load.fonts = true;
    document.getElementById("Load3").style.background = "repeating-linear-gradient(45deg, rgb(238, 238, 238), rgb(238, 238, 238) 10px, rgb(136, 136, 136) 10px, rgb(136, 136, 136) 15px)";
    document.getElementById("Load3").style.border = "5px solid rgb(51, 51, 51)";
    document.getElementById("Load3-1A").style.visibility = "hidden";
    document.getElementById("Load3-1B").style.visibility = "visible";
    ui.load.loadedSections++;
    ui.load.checkLoaded();
  }
});
document.getElementById("Load3").style.background = "repeating-linear-gradient(45deg, rgb(238, 238, 238), rgb(238, 238, 238) 10px, rgb(136, 136, 136) 10px, rgb(136, 136, 136) 15px)";
document.getElementById("Load3").style.border = "5px solid rgb(51, 51, 51)";
document.getElementById("Load3-1A").style.visibility = "hidden";
document.getElementById("Load3-1B").style.visibility = "visible";
ui.load.load = (_ => {
  ui.load.loaded++;
  document.getElementById("Load3-3D").style.visibility = "visible";
  document.getElementById("Load3-3D").style.width = ((ui.load.loaded / render.tiles.length) * 100) + "%";
  if (ui.load.loaded == render.tiles.length) {
    document.getElementById("Load3-3").style.background = "rgb(170, 255, 170)";
    document.getElementById("Load3-3B").style.visibility = "hidden";
    document.getElementById("Load3-3C").style.visibility = "visible";
    ui.load.loadedSections++;
    ui.load.checkLoaded();
  }
})
ui.load.rasterize = (_ => {
  ui.load.rasterized++;
  document.getElementById("Load3-4D").style.visibility = "visible";
  document.getElementById("Load3-4D").style.width = ((ui.load.loaded / render.tiles.length) * 100) + "%";
  if (ui.load.rasterized == render.tiles.length) {
    document.getElementById("Load3-4").style.background = "rgb(170, 255, 170)";
    document.getElementById("Load3-4B").style.visibility = "hidden";
    document.getElementById("Load3-4C").style.visibility = "visible";
    ui.load.loadedSections++;
    ui.load.checkLoaded();
  }
})
//<tiles>
//<switch tiles>
render.svg.T1B1.src = "./tiles/t1/b1.svg";
render.svg.T2B2.src = "./tiles/t2/b2.svg";
render.svg.Cross.src = "./tiles/applicital/3.svg";
render.svg.BT1.src = "./tiles/applicital/bt/1.svg";
render.svg.BT2.src = "./tiles/applicital/bt/2.svg";
render.svg.TB1.src = "./tiles/applicital/tb/1.svg";
render.svg.TB2.src = "./tiles/applicital/tb/2.svg";
render.svg.T0B1.src = "./tiles/t0/b1.svg";
render.svg.T0B2.src = "./tiles/t0/b2.svg";
render.svg.T1B0.src = "./tiles/t1/b0.svg";
render.svg.T1B1F.src = "./tiles/t1/b1f.svg";
render.svg.T1B2.src = "./tiles/t1/b2.svg";
render.svg.T1B2F.src = "./tiles/t1/b2f.svg";
render.svg.T2B0.src = "./tiles/t2/b0.svg";
render.svg.T2B1.src = "./tiles/t2/b1.svg";
render.svg.T2B1F.src = "./tiles/t2/b1f.svg";
render.svg.T2B2F.src = "./tiles/t2/b2f.svg";
//</switch>
//</tiles>
for (let i = 0; i < render.tiles.length; i++) {
  eval("render.svg." + render.tiles[i] + ".onload = (_=>{ui.load.load();render.rasterizeOne(" + i + ")})");
}
document.getElementById("Load3-2").style.background = "#0000";
document.getElementById("Load3-2").style.border = "5px solid rgb(51, 51, 51)";
document.getElementById("Load3-2A").style.visibility = "hidden";
document.getElementById("Load3-2B").style.visibility = "visible";
if (document.fonts.status = "loaded" && !ui.load.fonts) {
  ui.load.fonts = true;
  document.getElementById("Load3-2").style.background = "rgb(170, 255, 170)";
  document.getElementById("Load3-2B").style.visibility = "hidden";
  document.getElementById("Load3-2C").style.visibility = "visible";
  ui.load.loadedSections++;
  ui.load.checkLoaded();
}
document.getElementById("Load3-3").style.background = "#0000";
document.getElementById("Load3-3").style.border = "5px solid rgb(51, 51, 51)";
document.getElementById("Load3-3A").style.visibility = "hidden";
document.getElementById("Load3-3B").style.visibility = "visible";
document.getElementById("Load3-4").style.background = "#0000";
document.getElementById("Load3-4").style.border = "5px solid rgb(51, 51, 51)";
document.getElementById("Load3-4A").style.visibility = "hidden";
document.getElementById("Load3-4B").style.visibility = "visible";
//</load>