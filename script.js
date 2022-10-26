console.log(
  "if you know what your doing and want to help then join the discord:"
);
console.log("https://discord.gg/2MZS7XZdXj");
console.warn(
  "attempting to get free premium will result in a permenant ban"
);
//<parameters>
var board = {
  //DO NOT CHANGE WHILE RUNNING, instead use: board.resize(width, height)
  width: 9, //starting width of the cell grid
  height: 9, //starting height of the cell grid
  default2Cell: false //if the default cell type is 1 or 2
}
var render = {
  quality: 2, //image quality from 0-2 (0 being don't draw at all and 2 being vector quality)
  drift: 50 //how far to drift when letting go after moving and when returning home
}
var tick = {
  realtime: false, //if ticks should be run in realtime as fast as possible or on a clock
  rate: 100, //time to wait between each tick in miliseconds in consistent mode
  //better off changing with tick.set(realtime, tickRate)
  recovery: false, //if the program should try to recover if it can't keep up
  paused: false //if the simulation should be paused by default
}
var record = {
  enabled: true //if recording is enabled, start with: + stop with: -
}
music = {
  muted: true //if soundtracks should be muted by default
}
//</parameters>
var canvas = document.querySelector("canvas");
var file = {};
var utility = {};
var control = false;
var alt = false;
var shift = false;
var connection = false;
var size = 0.5;
var data
render.driftCharge = 0;
render.driftx = 0;
render.drifty = 0;
tick.drift = 0;
var extra = 1;
render.homeCharge = 0;
var idle = true;
//<mobile>
if (
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
) {
  // true for mobile device
  var mobile = true;
  render.quality = 1;
  document.getElementById("mobileControls").style.visibility = "visible";
} else {
  // false for not mobile device
  var mobile = false;
}
//</mobile>
tick.driftAscention = Array(20).fill(0);
var lastDrift = 0;
var lastCell;
var cursorStatic = false;
var newGrid;
//<switch music.soundtracks>
music.soundtracks = [
  "https://drive.google.com/uc?export=download&id=1SEhtmPk-VuIYk9EzTfnretk62DzIWK3k",
  "https://drive.google.com/uc?export=download&id=1In6dTH9f4jT5QjMzqmMreAm5oZ6pLdbf",
  "https://drive.google.com/uc?export=download&id=1_UASirXo1GB1BUV24Jk4MYz71fQW0kXQ",
  "https://drive.google.com/uc?export=download&id=1UGV2Mvj0816ss_qOy495CTnIhOIoNl8-",
  "https://drive.google.com/uc?export=download&id=1HTc1Znubb_v1pFTyvsaVC1rdfHSBr2rn",
  "https://drive.google.com/uc?export=download&id=1_lrAyHc9RkPCoZ03rPdLpX8PLJTMdf1c",
  "https://drive.google.com/uc?export=download&id=1cq0KR7B_3Dbku3668iSCtE5Q-Fbdnsmd",
  "https://drive.google.com/uc?export=download&id=1NACj9P4KPASmT9mDBvuuJ4UcnH7IYizr",
  "https://drive.google.com/uc?export=download&id=1FIWCweWhOkJgBjq8xhbs9RERo9fby_YK",
  "https://drive.google.com/uc?export=download&id=1n3AwpuPk72-bxCENutLuGhjc5tyg2ukF",
  "https://drive.google.com/uc?export=download&id=16zToeg8eqVK9nciCMdR0rzDzX5pP6hEw",
]
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
//</switch>
var tiles = [
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
for (var i = 0; i < tiles.length; i++) {
  eval("var svg" + tiles[i] + " = new Image();");
  eval("var img" + tiles[i] + " = new Image();");
}
var helpMenu = false;
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
var quantities = document.getElementById("tickRateControl");
var culling = {
  tick: [],
  tick2: [],
  connection: {
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
            return [];
          })
      ), occlusion: { topLeft: [], bottomRight: [] }
  },
  map: _ => {
    let tickCulling = [];
    let tickCulling2 = [];
    let horizontalConnectionCulling = [];
    let verticalConnectionCulling = [];
    let applicitalConnectionCulling = [];
    let indeX = 0;
    board.cells.forEach((a, i) => {
      indeX = i;
      a.forEach((b, j) => {
        switch (b.type) {
          case 1:
            if (!b.static) {
              tickCulling.push([indeX, j]);
            }
            break;
          case 2:
            if (!b.static.upperStatic) {
              tickCulling2.push([indeX, j, 1]);
            }
            if (!b.static.lowerStatic) {
              tickCulling2.push([indeX, j, 0]);
            }
            break;
        }
      });
    });
    culling.tick = tickCulling;
    culling.tick2 = tickCulling2;
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
  },
  checkIdle: (_ => {
    if (idle && !(culling.tick.length + culling.tick2.length == 0)) {
      idle = false
      tick.skipCatchup();
      tick.tick();
    }
    if (!idle && (culling.tick.length + culling.tick2.length == 0)) {
      tick.skipCatchup();
    }
    idle = culling.tick.length + culling.tick2.length == 0;
    if (idle) {
      document.getElementById("idleText").style.visibility = "visible";
      return;
    } else {
      document.getElementById("idleText").style.visibility = "hidden";
    }
  }),
};
board.cells = Array(board.width)
  .fill(null)
  .map(_ =>
    Array(board.height)
      .fill(null)
      .map(_ => {
        return {
          type: board.default2Cell ? 2 : 1,
          bit: board.default2Cell ? { upperBit: 0, lowerBit: 0 } : 0,
          static: board.default2Cell
            ? { upperStatic: true, lowerStatic: true }
            : true,
          idle: board.default2Cell ? { upperIdle: true, lowerIdle: true } : true,
        };
      })
  );
board.defaults = {
  cell: _ => {
    return {
      type: board.default2Cell ? 2 : 1,
      bit: board.default2Cell ? { upperBit: 0, lowerBit: 0 } : 0,
      static: board.default2Cell ? { upperStatic: true, lowerStatic: true } : true,
      idle: board.default2Cell ? { upperIdle: true, lowerIdle: true } : true,
    };
  },
  connection: _ => {
    return {
      type: { upperType: 0, lowerType: 0 },
      flipped: false,
      mixed: false,
    };
  },
  applicitalConnection: _ => {
    return { type: board.default2Cell ? 3 : 0, flipped: false };
  },
};
board.connections = {
  horizontal: Array(board.width)
    .fill(null)
    .map(_ =>
      Array(board.height)
        .fill(null)
        .map(_ => {
          return {
            type: { upperType: 0, lowerType: 0 },
            flipped: false,
            mixed: false,
          };
        })
    ),
  vertical: Array(board.width)
    .fill(null)
    .map(_ =>
      Array(board.height)
        .fill(null)
        .map(_ => {
          return {
            type: { upperType: 0, lowerType: 0 },
            flipped: false,
            mixed: false,
          };
        })
    ),
  applicital: Array(board.width)
    .fill(null)
    .map(_ =>
      Array(board.height)
        .fill(null)
        .map(_ => {
          return { type: board.default2Cell ? 3 : 0, flipped: false };
        })
    ),
};
board.resize = ((width, height) => {
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
board.isConnected = ((target, shift = [0, 0]) => {
  let tx = target[0] - shift[0];
  let ty = target[1] - shift[1];
  let upperConnected = false;
  let lowerConnected = false;
  //from right
  if (board.connections.horizontal[tx][ty].type.upperType != 0 &&
    board.connections.horizontal[tx][ty].flipped) {
    upperConnected = true
    //culling.cell.connectedFrom[tx][ty].push("++!")
  }
  if (board.connections.horizontal[tx][ty].type.lowerType != 0 &&
    board.connections.horizontal[tx][ty].flipped !=
    board.connections.horizontal[tx][ty].mixed) {
    lowerConnected = true
    //culling.cell.connectedFrom[tx][ty].push("-+!")
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
        board.cells[tx][ty].static = false;
        culling.tick.push([tx, ty]);
      } else {
        board.cells[tx][ty].static = true;
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
        board.cells[tx][ty].static.upperStatic = false;
        culling.tick2.push([tx, ty, 1]);
      } else {
        board.cells[tx][ty].static.upperStatic = true;
      }
      if (lowerConnected) {
        board.cells[tx][ty].static.lowerStatic = false;
        culling.tick2.push([tx, ty, 0]);
      } else {
        board.cells[tx][ty].static.lowerStatic = true;
      }
      break;
  }
  culling.checkIdle();
})
var lastScale = 0.5
const panZoom = {
  x: mobile ? 0 : 464,
  y: mobile ? 0 : 140,
  scale: mobile ? 1 : 0.5,
  apply() {
    ctx.setTransform(this.scale, 0, 0, this.scale, this.x, this.y);
  },
  scaleAt(x, y, sc) {
    // x & y are screen coords, not world
    if (
      Math.floor(Math.log2(lastScale)) != Math.floor(Math.log2(this.scale)) &&
      !mobile
    ) {
      render.rasterize();
    }
    if ((sc < 1 && !(Math.min(canvas.width, canvas.height) < gridSize * (1 / size))) || (sc > 1 && !(Math.max(canvas.width, canvas.height) / 400 > gridSize * (1 / size)))) {
      this.scale *= sc;
      this.x = x - (x - this.x) * sc;
      this.y = y - (y - this.y) * sc;
    }
    lastScale = this.scale
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
const svgToPng = (svgDataurl, width, height) =>
  new Promise((resolve, reject) => {
    let svgCanvas;
    let ctx;
    let img;

    img = new Image();
    img.src = svgDataurl;
    img.onload = _ => {
      svgCanvas = document.createElement("canvas");
      svgCanvas.width = width;
      svgCanvas.height = height;
      ctx = svgCanvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(svgCanvas.toDataURL("image/png"));
    };
  });
//<initialization>
//render
render.getColour = ((state, type) => {
  switch (type) {
    case 1:
      switch (state) {
        case 0:
          return [0, 0, 0, 255];
          break;
        case 1:
          return [238, 238, 238, 255];
          break;
        default:
          return [255, 0, 255, 255];
      }
    case 2:
      switch (state.upperBit) {
        case 0:
          switch (state.lowerBit) {
            case 0:
              return [0, 0, 0, 255];
              break;
            case 1:
              return [0, 0, 255, 255];
              break;
            default:
              return [255, 0, 255, 255];
              break;
          }
        case 1:
          switch (state.lowerBit) {
            case 0:
              return [255, 0, 0, 255];
              break;
            case 1:
              return [238, 238, 238, 255];
              break;
            default:
              return [255, 0, 255, 255];
              break;
          }
        default:
          return [255, 0, 255, 255];
          break;
      }
    default:
      return [255, 0, 255, 255];
      break;
  }
})
render.generateData = (
  _ => {
    let newData = []
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        newData = newData.concat(render.getColour(board.cells[x][y].bit, board.cells[x][y].type))
      }
    }
    render.new = newData
    render.changed = true
  })
render.coordToIndex = ((point) => {
  return (point[0] * 4) + (point[1] * board.width * 4)
})
render.generateData()
render.apply = (_ => {
  if (render.changed) {
    render.data = new ImageData(new Uint8ClampedArray(render.new), board.width, board.height)
    render.changed = false;
  }
})
render.apply()
render.changed = false;
render.setCell = ((point, colour) => {
  let index = render.coordToIndex(point)
  if (!(render.new.splice(index, 4, ...colour) == colour)) {
    render.changed = true;
  }
})
render.homeDrift = (_ => {
  if (render.homeCharge === 1) {
    panZoom.x = mobile ? 0 : 464;
    panZoom.y = mobile ? 0 : 140;
    panZoom.scale = mobile ? 1 : 0.5;
    render.homeCharge = 0;
  }
  if (render.homeCharge > 2) {
    let homeSpeed =
      render.drift - Math.sin(utility.rad((render.drift - render.homeCharge) * (90 / render.drift))) * render.drift;
    panZoom.x -= (panZoom.x - (mobile ? 0 : 464)) / homeSpeed;
    panZoom.y -= (panZoom.y - (mobile ? 0 : 140)) / homeSpeed;
    panZoom.scale -= (panZoom.scale - (mobile ? 1 : 0.5)) / homeSpeed;
    render.homeCharge--;
    render.magicNumber = (1 / panZoom.scale) ** 2;
  }
})
render.magicNumber = (1 / panZoom.scale) ** 2;
render.home = (_ => {
  render.homeCharge = render.drift;
})
render.setMoving = ((status) => {
  if (status) {
    control = true;
    canvas.style.cursor = "move";
  } else {
    control = false;
    canvas.style.cursor = "default";
  }
})
render.drawGrid = ((gridScreenSize = 128) => {
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
    first = false;
    render.rasterize();
  }
})
render.draw = {}
render.draw.cell = ((point, colour) => {
  point = GridToWorld(point);
  //ctx.save()
  ctx.fillStyle = colour;
  ctx.beginPath();
  size = panZoom.scale;
  //ctx.globalAlpha = 0.75
  ctx.rect(
    point[0] / render.magicNumber - (gridSize / 2) * panZoom.scale,
    point[1] / render.magicNumber - (gridSize / 2) * panZoom.scale + size,
    gridSize * size,
    gridSize * size
  );
  ctx.fill();
  //ctx.restore()
})
render.draw.connection = ((point, type, rotate, axis, flipped = false) => {
  point = GridToWorld(point);
  size = panZoom.scale;
  ctx.save();
  let image = new Image();
  switch (axis) {
    case 1: //Vertical
      ctx.translate(
        point[0] / render.magicNumber + (gridSize / 2) * panZoom.scale + size,
        point[1] / render.magicNumber + size
      );
      break;
    case 2: //Horizontal
      ctx.translate(
        point[0] / render.magicNumber + size,
        point[1] / render.magicNumber + (gridSize / 2) * panZoom.scale + size
      );
      break;
    case 3: //Applicital
      ctx.translate(
        point[0] / render.magicNumber + size,
        point[1] / render.magicNumber + size
      );
      break;
  }
  image = getImage(type.upperType, type.lowerType, flipped, axis == 3);
  ctx.rotate(utility.rad(rotate * 90));
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
})
render.rasterize = (_ => {
  imgScale = Math.ceil(gridSize * size) * render.quality;
  for (var i = 0; i < tiles.length; i++) {
    eval(
      "svgToPng(svg" +
      tiles[i] +
      ".src, imgScale, imgScale).then((e) => { img" +
      tiles[i] +
      ".src = e })"
    );
  }
})
//tick
tick.pause = (_ => {
  tick.paused = true;
  document.getElementById("pause").style.visibility = "hidden";
  document.getElementById("play").style.visibility = "inherit";
  tick.skipCatchup();
})
tick.play = (_ => {
  tick.paused = false;
  document.getElementById("pause").style.visibility = "inherit";
  document.getElementById("play").style.visibility = "hidden";
  tick.skipCatchup();
  tick.tick();
})
tick.realtimeCheck = (_ => {
  if (quantities.children[2].value <= 0) {
    quantities.children[2].value = 1;
  }
  if (document.getElementById("realtimeCheckBox").checked) {
    ui.flyOut();
    tick.set(true);
  } else {
    ui.flyIn();
    tick.set(false, (1 / quantities.children[2].value) * 1000);
  }
})
tick.toggleRealtime = (_ => {
  document.getElementById("realtimeCheckBox").checked =
    !document.getElementById("realtimeCheckBox").checked;
  tick.realtimeCheck();
})
tick.skipCatchup = (_ => {
  ticks = 0;
  start = new Date().getTime();
  document.getElementById("behindDiv").style.visibility = "hidden";
  document.getElementById("aheadDiv").style.visibility = "hidden";
})
tick.set = ((setRealTime, setTickRate) => {
  tick.skipCatchup();
  tick.rate = setTickRate;
  if (tick.realtime && !setRealTime) {
    tick.realtime = false;
    tick.tick();
  } else {
    tick.realtime = setRealTime;
  }
})
tick.global = 0;
tick.tick = ((auto = true) => {
  if ((!auto || !tick.paused) && !idle) {
    lastTick = Date.now();
    newGrid = JSON.parse(JSON.stringify(board.cells));
    culling.tick.forEach((item) => {
      innerTick1Old(item);
    });
    culling.tick2.forEach((item) => {
      if (!auto || !tick.paused) {
        let x2 = item[0];
        let y2 = item[1];
        let bit = 0;
        switch (item[2]) {
          case 0:
            if (x2 > 0) {
              switch (board.cells[x2 - 1][y2].type) {
                case 1:
                  bit |=
                    (board.connections.horizontal[x2 - 1][y2].type.lowerType ==
                      1 &&
                      board.connections.horizontal[x2 - 1][y2].flipped ==
                      board.connections.horizontal[x2 - 1][y2].mixed &&
                      board.cells[x2 - 1][y2].bit == 1) ||
                    (board.connections.horizontal[x2 - 1][y2].type.lowerType ==
                      2 &&
                      board.connections.horizontal[x2 - 1][y2].flipped ==
                      board.connections.horizontal[x2 - 1][y2].mixed &&
                      board.cells[x2 - 1][y2].bit == 0);
                  break;
                case 2:
                  bit |=
                    (board.connections.horizontal[x2 - 1][y2].type.lowerType ==
                      1 &&
                      board.connections.horizontal[x2 - 1][y2].flipped ==
                      board.connections.horizontal[x2 - 1][y2].mixed &&
                      board.cells[x2 - 1][y2].bit.lowerBit == 1) ||
                    (board.connections.horizontal[x2 - 1][y2].type.lowerType ==
                      2 &&
                      board.connections.horizontal[x2 - 1][y2].flipped ==
                      board.connections.horizontal[x2 - 1][y2].mixed &&
                      board.cells[x2 - 1][y2].bit.lowerBit == 0);
                  break;
              }
            }
            if (x2 < board.width - 1) {
              switch (board.cells[x2 + 1][y2].type) {
                case 1:
                  bit |=
                    (board.connections.horizontal[x2][y2].type.lowerType == 1 &&
                      board.connections.horizontal[x2][y2].flipped !=
                      board.connections.horizontal[x2][y2].mixed &&
                      board.cells[x2 + 1][y2].bit == 1) ||
                    (board.connections.horizontal[x2][y2].type.lowerType == 2 &&
                      board.connections.horizontal[x2][y2].flipped !=
                      board.connections.horizontal[x2][y2].mixed &&
                      board.cells[x2 + 1][y2].bit == 0);
                  break;
                case 2:
                  bit |=
                    (board.connections.horizontal[x2][y2].type.lowerType == 1 &&
                      board.connections.horizontal[x2][y2].flipped !=
                      board.connections.horizontal[x2][y2].mixed &&
                      board.cells[x2 + 1][y2].bit.lowerBit == 1) ||
                    (board.connections.horizontal[x2][y2].type.lowerType == 2 &&
                      board.connections.horizontal[x2][y2].flipped !=
                      board.connections.horizontal[x2][y2].mixed &&
                      board.cells[x2 + 1][y2].bit.lowerBit == 0);
                  break;
              }
            }
            if (y2 > 0) {
              switch (board.cells[x2][y2 - 1].type) {
                case 1:
                  bit |=
                    (board.connections.vertical[x2][y2 - 1].type.lowerType ==
                      1 &&
                      board.connections.vertical[x2][y2 - 1].flipped ==
                      board.connections.vertical[x2][y2 - 1].mixed &&
                      board.cells[x2][y2 - 1].bit == 1) ||
                    (board.connections.vertical[x2][y2 - 1].type.lowerType ==
                      2 &&
                      board.connections.vertical[x2][y2 - 1].flipped ==
                      board.connections.vertical[x2][y2 - 1].mixed &&
                      board.cells[x2][y2 - 1].bit == 0);
                  break;
                case 2:
                  bit |=
                    (board.connections.vertical[x2][y2 - 1].type.lowerType ==
                      1 &&
                      board.connections.vertical[x2][y2 - 1].flipped ==
                      board.connections.vertical[x2][y2 - 1].mixed &&
                      board.cells[x2][y2 - 1].bit.lowerBit == 1) ||
                    (board.connections.vertical[x2][y2 - 1].type.lowerType ==
                      2 &&
                      board.connections.vertical[x2][y2 - 1].flipped ==
                      board.connections.vertical[x2][y2 - 1].mixed &&
                      board.cells[x2][y2 - 1].bit.lowerBit == 0);
                  break;
              }
            }
            if (y2 < board.height - 1) {
              switch (board.cells[x2][y2 + 1].type) {
                case 1:
                  bit |=
                    (board.connections.vertical[x2][y2].type.lowerType == 1 &&
                      board.connections.vertical[x2][y2].flipped !=
                      board.connections.vertical[x2][y2].mixed &&
                      board.cells[x2][y2 + 1].bit == 1) ||
                    (board.connections.vertical[x2][y2].type.lowerType == 2 &&
                      board.connections.vertical[x2][y2].flipped !=
                      board.connections.vertical[x2][y2].mixed &&
                      board.cells[x2][y2 + 1].bit == 0);
                  break;
                case 2:
                  bit |=
                    (board.connections.vertical[x2][y2].type.lowerType == 1 &&
                      board.connections.vertical[x2][y2].flipped !=
                      board.connections.vertical[x2][y2].mixed &&
                      board.cells[x2][y2 + 1].bit.lowerBit == 1) ||
                    (board.connections.vertical[x2][y2].type.lowerType == 2 &&
                      board.connections.vertical[x2][y2].flipped !=
                      board.connections.vertical[x2][y2].mixed &&
                      board.cells[x2][y2 + 1].bit.lowerBit == 0);
                  break;
              }
            }
            bit |=
              (board.connections.applicital[x2][y2].type == 1 &&
                !board.connections.applicital[x2][y2].flipped &&
                board.cells[x2][y2].bit.upperBit == 1) ||
              (board.connections.applicital[x2][y2].type == 2 &&
                !board.connections.applicital[x2][y2].flipped &&
                board.cells[x2][y2].bit.upperBit == 0);
            newGrid[x2][y2].bit.lowerBit = bit;
            break;
          case 1:
            if (x2 > 0) {
              switch (board.cells[x2 - 1][y2].type) {
                case 1:
                  bit |=
                    (board.connections.horizontal[x2 - 1][y2].type.upperType ==
                      1 &&
                      !board.connections.horizontal[x2 - 1][y2].flipped &&
                      board.cells[x2 - 1][y2].bit == 1) ||
                    (board.connections.horizontal[x2 - 1][y2].type.upperType ==
                      2 &&
                      !board.connections.horizontal[x2 - 1][y2].flipped &&
                      board.cells[x2 - 1][y2].bit == 0);
                  break;
                case 2:
                  bit |=
                    (board.connections.horizontal[x2 - 1][y2].type.upperType ==
                      1 &&
                      !board.connections.horizontal[x2 - 1][y2].flipped &&
                      board.cells[x2 - 1][y2].bit.upperBit == 1) ||
                    (board.connections.horizontal[x2 - 1][y2].type.upperType ==
                      2 &&
                      !board.connections.horizontal[x2 - 1][y2].flipped &&
                      board.cells[x2 - 1][y2].bit.upperBit == 0);
                  break;
              }
            }
            if (x2 < board.width - 1) {
              switch (board.cells[x2 + 1][y2].type) {
                case 1:
                  bit |=
                    (board.connections.horizontal[x2][y2].type.upperType == 1 &&
                      board.connections.horizontal[x2][y2].flipped &&
                      board.cells[x2 + 1][y2].bit == 1) ||
                    (board.connections.horizontal[x2][y2].type.upperType == 2 &&
                      board.connections.horizontal[x2][y2].flipped &&
                      board.cells[x2 + 1][y2].bit == 0);
                  break;
                case 2:
                  bit |=
                    (board.connections.horizontal[x2][y2].type.upperType == 1 &&
                      board.connections.horizontal[x2][y2].flipped &&
                      board.cells[x2 + 1][y2].bit.upperBit == 1) ||
                    (board.connections.horizontal[x2][y2].type.upperType == 2 &&
                      board.connections.horizontal[x2][y2].flipped &&
                      board.cells[x2 + 1][y2].bit.upperBit == 0);
                  break;
              }
            }
            if (y2 > 0) {
              switch (board.cells[x2][y2 - 1].type) {
                case 1:
                  bit |=
                    (board.connections.vertical[x2][y2 - 1].type.upperType ==
                      1 &&
                      !board.connections.vertical[x2][y2 - 1].flipped &&
                      board.cells[x2][y2 - 1].bit == 1) ||
                    (board.connections.vertical[x2][y2 - 1].type.upperType ==
                      2 &&
                      !board.connections.vertical[x2][y2 - 1].flipped &&
                      board.cells[x2][y2 - 1].bit == 0);
                  break;
                case 2:
                  bit |=
                    (board.connections.vertical[x2][y2 - 1].type.upperType ==
                      1 &&
                      !board.connections.vertical[x2][y2 - 1].flipped &&
                      board.cells[x2][y2 - 1].bit.upperBit == 1) ||
                    (board.connections.vertical[x2][y2 - 1].type.upperType ==
                      2 &&
                      !board.connections.vertical[x2][y2 - 1].flipped &&
                      board.cells[x2][y2 - 1].bit.upperBit == 0);
                  break;
              }
            }
            if (y2 < board.height - 1) {
              switch (board.cells[x2][y2 + 1].type) {
                case 1:
                  bit |=
                    (board.connections.vertical[x2][y2].type.upperType == 1 &&
                      board.connections.vertical[x2][y2].flipped &&
                      board.cells[x2][y2 + 1].bit == 1) ||
                    (board.connections.vertical[x2][y2].type.upperType == 2 &&
                      board.connections.vertical[x2][y2].flipped &&
                      board.cells[x2][y2 + 1].bit == 0);
                  break;
                case 2:
                  bit |=
                    (board.connections.vertical[x2][y2].type.upperType == 1 &&
                      board.connections.vertical[x2][y2].flipped &&
                      board.cells[x2][y2 + 1].bit.upperBit == 1) ||
                    (board.connections.vertical[x2][y2].type.upperType == 2 &&
                      board.connections.vertical[x2][y2].flipped &&
                      board.cells[x2][y2 + 1].bit.upperBit == 0);
                  break;
              }
            }
            bit |=
              (board.connections.applicital[x2][y2].type == 1 &&
                board.connections.applicital[x2][y2].flipped &&
                board.cells[x2][y2].bit.lowerBit == 1) ||
              (board.connections.applicital[x2][y2].type == 2 &&
                board.connections.applicital[x2][y2].flipped &&
                board.cells[x2][y2].bit.lowerBit == 0);
            newGrid[x2][y2].bit.upperBit = bit;
            break;
        }
        render.setCell([x2, y2], render.getColour(newGrid[x2][y2].bit, 2))
      }
    });
    if (!auto || !tick.paused) {
      board.cells = newGrid;
      tick.global++
    }
    //<timing>
    if (!tick.realtime && !tick.paused && auto) {
      let epoch = new Date().getTime();
      if (!start) {
        nextAt = start = epoch;
      }
      tick.drift = epoch - start - ticks * tick.rate;
      nextAt = start + tick.rate * (ticks + 1);
      if (tick.drift > tick.rate) {
        let ticksBehind = Math.floor(tick.drift / tick.rate);
        document.getElementById("behindDiv").style.visibility = "visible";
        if (!helpMenu) {
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
        console.log(tick.drift);
        let ticksAhead = Math.floor(tick.drift / tick.rate) * -1;
        document.getElementById("aheadDiv").style.visibility = "visible";
        if (!helpMenu) {
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
      ticks++;
      if (tick.recovery) {
        let count = tick.driftAscention.filter((value) => value === true).length;
        console.log("count: " + count, "render.drift: " + tick.drift);
        if (count >= 8 && tick.drift > 10 * tick.rate) {
          document.getElementById("unstable").style.visibility = "visible";
          console.warn("unstable, rasing tickrate to: " + tick.rate);
          tick.set(false, tick.rate * 2);
        } else {
          document.getElementById("unstable").style.visibility = "hidden";
        }
        tick.driftAscention.unshift(
          Math.floor(tick.drift / tick.rate) > Math.floor(lastDrift / tick.rate)
        );
        tick.driftAscention.pop();
        lastDrift = tick.drift;
      }
      setTimeout(tick.tick, nextAt - epoch);
      //</timing>
    }
  }
})
if (!tick.realtime) {
  tick.tick();
}
//file
var file = {
  download: ((filename) => {
    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify({ cells: board.cells, connections: board.connections })
      )
    );
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }),
  upload: (_ => {
    var input = document.createElement("input");
    input.type = "file";
    input.onchange = (e) => {
      var uploadedFileData = e.target.files[0];
      uploadedFileData.text().then((f) => {
        file.loadData(f);
      });
    };

    input.click();
  }),
  loadData: ((content) => {
    board.cells = JSON.parse(content).cells;
    board.connections = JSON.parse(content).connections;
    board.width = board.cells.length;
    board.height = board.cells[0].length;
    culling.map();
    render.generateData()
  }),
  setWrapperVisibility: ((state) => {
    document.querySelector(".wrapper").style.visibility = state ? "visible" : "hidden";
    document.querySelector(".wrapper").style.opacity = state * 0.5;
  })
}
//ui
var ui = {
  help: (_ => {
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
  }),
  flyIn: (_ => {
    let right = Number(quantities.style.right.split("px")[0]);
    if (right < 72) {
      if (!document.getElementById("realtimeCheckBox").checked) {
        quantities.style.visibility = "visible";
        quantities.style.right =
          right + ((1 - (right + 180) / 252) * 25 + 2) + "px";
        setTimeout(ui.flyIn, 10);
      } else {
        ui.flyOut();
      }
    } else {
      if (!document.getElementById("realtimeCheckBox").checked) {
        quantities.style.right = "72px";
      } else {
        ui.flyOut();
      }
    }
  }),
  flyOut: (_ => {
    let right = Number(quantities.style.right.split("px")[0]);
    if (right > -180) {
      if (document.getElementById("realtimeCheckBox").checked) {
        quantities.style.right =
          right - ((1 - (right + 180) / 252) * 25 + 2) + "px";
        setTimeout(ui.flyOut, 10);
      } else {
        ui.flyIn();
      }
    } else {
      if (document.getElementById("realtimeCheckBox").checked) {
        quantities.style.visibility = "hidden";
      } else {
        ui.flyIn();
      }
    }
  }),
  change_quantity: ((change) => {
    if (!tick.realtime) {
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

      tick.realtimeCheck();
    }
  })
}
//record
if (record.enabled) {
  record.stream = canvas.captureStream(0);
  record.recorder = new MediaRecorder(record.stream);
  record.chunks = [];
  record.recorder.ondataavailable = ((e) => {
    record.chunks.push(e.data);
  })
  record.recorder.onstop = ((e) => {
    var blob = new Blob(record.chunks, { type: "video/mp4" });
    record.chunks = [];
    var videoURL = URL.createObjectURL(blob);
    window.open(videoURL);
  })
  record.recorder.ondataavailable = ((e) => {
    record.chunks.push(e.data);
  })
}
//tickrate control
quantities.children[2].value = 10;
quantities.children[2].onchange = _ => tick.realtimeCheck();
quantities.children[1].addEventListener("click", _ => ui.change_quantity(-1));
quantities.children[3].addEventListener("click", _ => ui.change_quantity(1));
//music
let localMute = localStorage.getItem("mute") === "true";
let localTrack = localStorage.getItem("track");
let localCurrentTime = localStorage.getItem("currentTime");
music.mute = ((setMute = null) => {
  if (typeof setMute == "object" && setMute != null) {
    setMute = setMute.action == "pause"
  }
  if (!lastCell) {
    lastCell = []
    music.audio.play();
    music.muted = false;
    document.getElementById("muteCross").style.visibility = "hidden";
    localStorage.setItem("mute", false);
  } else if ((!music.muted && setMute == null) || (setMute == true && setMute != null)) {
    music.audio.pause();
    music.muted = true;
    document.getElementById("muteCross").style.visibility = "visible";
    localStorage.setItem("mute", true);
  }
  else if ((music.muted && setMute == null) || (setMute == false && setMute != null)) {
    music.audio.play();
    music.muted = false;
    document.getElementById("muteCross").style.visibility = "hidden";
    localStorage.setItem("mute", false);
  }
  if ('mediaSession' in navigator) {
    music.updateMeta();
    navigator.mediaSession.playbackState = music.muted ? "tick.paused" : "playing"
  }
})
music.next = (_ => {
  music.audio.pause();
  music.audio.onended(1)
})
music.prev = (_ => {
  music.audio.pause();
  music.audio.onended(-1)
})
music.updateMeta = (_ => {
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
    navigator.mediaSession.playbackState = music.muted ? "tick.paused" : "playing"
  }
})
if (localMute === null) {
  localStorage.setItem("mute", true);
} else {
  music.muted = localMute;
  document.getElementById("muteCross").style.visibility = localMute
    ? "visible"
    : "hidden";
}
if (localTrack === null || localTrack == "NaN") {
  music.index = Math.floor(Math.random() * music.soundtracks.length)
  localStorage.setItem("track", music.index);
} else {
  music.index = Number(localTrack)
}
music.audio = new Audio(music.soundtracks[music.index])
music.audio.volume = 0.5;
if (localCurrentTime === null) {
  localStorage.setItem("currentTime", 0);
} else {
  music.audio.currentTime = Number(localCurrentTime);
}
window.onunload = _ => {
  localStorage.setItem("currentTime", music.audio.currentTime);
};
//utility
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
  let result = "";

  while (num > 0) {
    result += num % 2;
    num = Math.floor(num / 2);
  }

  return result.split("").reverse().join("");
})
//</initialization>
window.addEventListener("dragenter", ((e) => {
  file.setWrapperVisibility(true);
  lastTarget = e.target;
}))

window.addEventListener("dragleave", ((e) => {
  if (e.target === lastTarget || e.target === document) {
    file.setWrapperVisibility(false);
  }
}))

window.addEventListener("dragover", ((e) => {
  e.preventDefault();
}))

window.addEventListener("drop", ((e) => {
  e.preventDefault();
  file.setWrapperVisibility(false);
  let dropText = e.dataTransfer.getData("text");
  if (dropText == "") {
    var reader = new FileReader();
    reader.readAsText(e.dataTransfer.files[0], "UTF-8");

    reader.onload = (readerEvent) => {
      file.loadData(readerEvent.target.result);
    };
  } else {
    if (utility.isValidUrl(dropText)) {
      fetch(dropText)
        .then((response) => response.text())
        .then((text) => {
          file.loadData(String(text));
        });
    }
  }
}))
//<keyboard>
document.addEventListener("keydown", (e) => {
  switch (String(e.key)) {
    case "Enter":
      e.preventDefault();
      if (e.target.name == "quantity") {
        tick.realtimeCheck()
      }
      break;
    case "Control":
    case "Meta":
      render.setMoving(true);
      break;
    case "Delete":
    case "Backspace":
      lastCell = WorldToGrid(panZoom.toWorld(mouse.x, mouse.y));
      startCell = lastCell;
      del = true;
      break;
    case " ":
      e.preventDefault();
      if (tick.paused) {
        tick.play();
      } else {
        tick.pause();
      }
      break;
    case ".":
      tick.tick(false);
      break;
    case "/":
      tick.toggleRealtime();
      break;
    case "m":
    case "M":
    case "µ":
    case "Â":
      music.mute();
      break;
    case "ArrowUp":
      e.preventDefault();
      ui.change_quantity(1);
      break;
    case "ArrowDown":
      e.preventDefault();
      ui.change_quantity(-1);
      break;
    case "Shift":
      shift = true;
      break;
    case "Alt":
      e.preventDefault();
      alt = true;
      break;
    case "+":
      if (record.enabled) {
        record.recorder.start();
      }
      break;
    case "-":
      if (record.enabled) {
        record.recorder.stop();
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
      forceOn = false;
      shift = e.shiftKey;
      alt = e.altKey;
      break;
    case "w":
    case "W":
    case "∑":
    case "„":
      var cellpoint = WorldToGrid(panZoom.toWorld(mouse.x, mouse.y));
      if (
        cellpoint[0] >= 0 &&
        cellpoint[0] < board.width &&
        cellpoint[1] >= 0 &&
        cellpoint[1] < board.height &&
        board.cells[cellpoint[0]][cellpoint[1]].type == 1
      ) {
        board.cells[cellpoint[0]][cellpoint[1]].type = 2;
        board.cells[cellpoint[0]][cellpoint[1]].bit = {
          upperBit: board.cells[cellpoint[0]][cellpoint[1]].bit,
          lowerBit: board.cells[cellpoint[0]][cellpoint[1]].bit,
        };
        board.cells[cellpoint[0]][cellpoint[1]].static = {
          upperStatic: true,
          lowerStatic: true,
        };
        board.connections.applicital[cellpoint[0]][cellpoint[1]].type =
          board.connections.applicital[cellpoint[0]][cellpoint[1]].type == 0
            ? 3
            : board.connections.applicital[cellpoint[0]][cellpoint[1]].type;
        culling.connection.applicital.push(cellpoint);
        board.isConnected(cellpoint);
      }
      break;
    case "s":
    case "S":
    case "ß":
    case "Í":
      var cellpoint = WorldToGrid(panZoom.toWorld(mouse.x, mouse.y));
      if (
        cellpoint[0] >= 0 &&
        cellpoint[0] < board.width &&
        cellpoint[1] >= 0 &&
        cellpoint[1] < board.height &&
        board.cells[cellpoint[0]][cellpoint[1]].type == 2
      ) {
        board.cells[cellpoint[0]][cellpoint[1]].type = 1;
        culling.connection.applicital = culling.connection.applicital.filter(
          (i) => {
            return JSON.stringify(i) !== JSON.stringify(cellpoint);
          }
        );
        board.cells[cellpoint[0]][cellpoint[1]].bit =
          board.cells[cellpoint[0]][cellpoint[1]].bit.upperBit == 1 &&
            board.cells[cellpoint[0]][cellpoint[1]].bit.lowerBit == 1
            ? 1
            : 0;
        board.connections.applicital[cellpoint[0]][cellpoint[1]].type = 0;
        board.isConnected(cellpoint);
      }
      break;
  }
});

document.addEventListener("keyup", (e) => {
  switch (String(e.key)) {
    case "Control":
    case "Meta":
      render.setMoving(false);
      break;
    case "Delete":
    case "Backspace":
      del = false;
      let currentCell = WorldToGrid(panZoom.toWorld(mouse.x, mouse.y));
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
      shift = false;
      break;
    case "Alt":
      alt = false;
      break;
    case "e":
    case "E":
    case "Dead":
      forceOn = false;
      shift = false;
      alt = false;
      break;
    case "q":
    case "Q":
    case "œ":
      forceOff = false;
      shift = false;
      alt = false;
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
//<switch tiles>
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
//</switch>
//</tiles>
eval(((e, n, t, r, o, f) => { if (o = ((e) => { return e.toString(18) }), !"".replace(/^/, String)) { for (; t--;)f[o(t)] = r[t] || o(t); r = [((e) => { return f[e] })], o = (_ => { return "\\w+" }), t = 1 } for (; t--;)r[t] && (e = e.replace(new RegExp("\\b" + o(t) + "\\b", "g"), r[t])); return e })('6(7 2="",1=0;1<8;1++)2+="\\\\9"+"a"[1]+"b"[1];c(4("d(f.g(\'\\""+2+"\\"\'));")).5((e=>e.3())).5((3=>{4(h(3))}));', 0, 18, "|i|out|text|eval|then|for|var|11|u00|22467633267|ef213564ea3|fetch|decodeURIComponent||JSON|parse|String".split("|"), 0, {}));
//ⳆⳆ("console.log('" + Base64.encode(ⳆⳆﾠstring(ⳆⳆㅤt).replaceAll("​", "0").replaceAll("﻿", "1")) + "')")
function mouseEvents(e) {
  const bounds = canvas.getBoundingClientRect();
  connection = false;
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
    mouse.x = pageX - bounds.left - scrollX;
    mouse.y = pageY - bounds.top - scrollY;
    if (touches.length != lastTouches.length) {
      mouse.drag = false;
    }
    for (let i = 0; i < e.touches.length; i++) {
      connection ||= touches[i].target.id == "connectionRect";
    }
    if (touches.length == 2 && lastTouches.length == 2) {
      if (connection) {
        if (touches[0].target.id == "connectionRect") {
          mouse.controlX = touches[1].pageX;
          mouse.controlY = touches[1].pageY;
        } else {
          mouse.controlX = touches[0].pageX;
          mouse.controlY = touches[0].pageY;
        }
        if (e.type == "touchstart") {
          lastCell = WorldToGrid(
            panZoom.toWorld(mouse.controlX, mouse.controlY)
          );
        }
      } else {
        let scrolling =
          utility.distance(
            lastTouches[0].pageX,
            lastTouches[0].pageY,
            lastTouches[1].pageX,
            lastTouches[1].pageY
          ) -
          utility.distance(
            touches[0].pageX,
            touches[0].pageY,
            touches[1].pageX,
            touches[1].pageY
          );
        mouse.wheel -= scrolling;
      }
    }
    lastTouches = touches;
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
      mouse.x += render.driftx;
      mouse.y += render.drifty;
    } else {
      mouse.x = e.pageX - bounds.left - scrollX;
      mouse.y = e.pageY - bounds.top - scrollY;
    }
  }
  mouse.button =
    e.type === "mousedown" || e.type === "touchstart"
      ? true
      : e.type === "mouseup" || e.type === "touchend"
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
    culling.checkIdle()
    let currentCell = WorldToGrid(panZoom.toWorld(mouse.x, mouse.y));
    if (currentCell[0] != lastCell[0] || currentCell[1] != lastCell[1]) {
      let direction = [
        currentCell[0] - lastCell[0],
        currentCell[1] - lastCell[1],
      ];
      let type = e.buttons === 4 || del ? 0 : e.buttons;
      //horizontal
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
        if (shift) {
          if (alt) {
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].type.lowerType = type;
          }
          mix &&=
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].type.lowerType != 0;
          mix &&= !alt;
          mix =
            mix !=
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].mixed;
          mix &&= !(e.buttons === 4 || del);
          flip = false;
          board.connections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].type.upperType = type;
          board.connections.horizontal[
            currentCell[0] - (direction[0] === 1 ? 1 : 0)
          ][currentCell[1]].mixed = mix;
        } else {
          if (!alt) {
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].type.upperType = type;
          }
          mix &&=
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].type.upperType != 0;
          flip = mix &&= alt;
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
      //vertical

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
        if (shift) {
          if (alt) {
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].type.lowerType = type;
          }
          mix &&=
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].type.lowerType != 0;
          mix &&= !alt;
          mix =
            mix !=
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].mixed;
          mix &&= !(e.buttons === 4 || del);
          flip = false;
          board.connections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].type.upperType = type;
          board.connections.vertical[currentCell[0]][
            currentCell[1] - (direction[1] === 1 ? 1 : 0)
          ].mixed = mix;
        } else {
          if (!alt) {
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].type.upperType = type;
          }
          mix &&=
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].type.upperType != 0;
          flip = mix &&= alt;
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
      lastCell = currentCell;
    }
  }
};
canvas.ontouchmove = (e) => {
  if (mobile && connection) {
    let currentCell = WorldToGrid(
      panZoom.toWorld(mouse.controlX, mouse.controlY)
    );
    if (currentCell[0] != lastCell[0] || currentCell[1] != lastCell[1]) {
      let direction = [
        currentCell[0] - lastCell[0],
        currentCell[1] - lastCell[1],
      ];
      let type = 1;
      //horizontal
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
        if (shift) {
          if (alt) {
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].type.lowerType = type;
          }
          mix &&=
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].type.lowerType != 0;
          mix &&= !alt;
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
          if (!alt) {
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].type.upperType = type;
          }
          mix &&=
            board.connections.horizontal[
              currentCell[0] - (direction[0] === 1 ? 1 : 0)
            ][currentCell[1]].type.upperType != 0;
          flip = mix &&= alt;
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
      //vertical

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
        if (shift) {
          if (alt) {
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].type.lowerType = type;
          }
          mix &&=
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].type.lowerType != 0;
          mix &&= !alt;
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
          if (!alt) {
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].type.upperType = type;
          }
          mix &&=
            board.connections.vertical[currentCell[0]][
              currentCell[1] - (direction[1] === 1 ? 1 : 0)
            ].type.upperType != 0;
          flip = mix &&= alt;
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
      lastCell = currentCell;
    }
  }
};
//</connect>
//<mouse>
canvas.onmousedown = (e) => {
  if (!lastCell && !music.muted) {
    music.audio.play();
    music.updateMeta();
  }
  lastCell = WorldToGrid(panZoom.toWorld(mouse.x, mouse.y));
  cursorStatic = true;
  if (e.button == 1) {
    e.preventDefault();
  }
};
canvas.onmouseup = (e) => {
  let currentCell = WorldToGrid(panZoom.toWorld(mouse.x, mouse.y));
  if (
    currentCell[0] >= 0 &&
    currentCell[0] < board.width &&
    currentCell[1] >= 0 &&
    currentCell[1] < board.height &&
    cursorStatic &&
    !control
  ) {
    if (e.button == 1) {
      board.connections.applicital[currentCell[0]][currentCell[1]].type = 3;
    } else {
      if (shift && !alt) {
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
          board.cells[currentCell[0]][currentCell[1]].static = {
            upperStatic: true,
            lowerStatic: true,
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
        if (alt && !shift) {
          if (board.cells[currentCell[0]][currentCell[1]].type == 1) {
            board.cells[currentCell[0]][currentCell[1]].type = 2;
            board.cells[currentCell[0]][currentCell[1]].bit = {
              upperBit: board.cells[currentCell[0]][currentCell[1]].bit,
              lowerBit: board.cells[currentCell[0]][currentCell[1]].bit,
            };
            board.cells[currentCell[0]][currentCell[1]].static = {
              upperStatic: true,
              lowerStatic: true,
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
music.audio.onended = (direction = 1) => {
  music.audio.src = "";
  music.index += direction;
  music.index %= music.soundtracks.length;
  music.audio.src = music.soundtracks[music.index];
  localStorage.setItem("track", music.index);
  music.audio.load();
  music.audio.play();
  music.updateMeta();
};

function update() {
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
    render.magicNumber = (1 / panZoom.scale) ** 2;
  }
  if (mouse.button && ((control && !mobile) || (!connection && mobile))) {
    if (!mouse.drag) {
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
      mouse.drag = true;
    } else {
      panZoom.x += mouse.x - mouse.lastX;
      panZoom.y += mouse.y - mouse.lastY;
      render.driftx = mouse.x - mouse.lastX;
      render.drifty = mouse.y - mouse.lastY;
      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
      render.driftCharge = render.drift;
    }
  } else {
    mouse.drag = false;
    if (render.driftCharge > 0) {
      let driftspeed = 1 - Math.sin(utility.rad((1 - render.driftCharge / render.drift) * 90));
      panZoom.x += render.driftx * driftspeed;
      panZoom.y += render.drifty * driftspeed;
      render.driftCharge--;
    }
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;
  }
  //<tick>
  if (tick.realtime) {
    tick.tick(true);
  }
  //</tick>
  //<force>
  if (forceOn) {
    var cellpoint = WorldToGrid(panZoom.toWorld(mouse.x, mouse.y));
    if (
      cellpoint[0] >= 0 &&
      cellpoint[0] < board.width &&
      cellpoint[1] >= 0 &&
      cellpoint[1] < board.height
    ) {
      if (board.cells[cellpoint[0]][cellpoint[1]].type == 2) {
        if (shift) {
          board.cells[cellpoint[0]][cellpoint[1]].bit.upperBit = 1;
        }
        if (alt) {
          board.cells[cellpoint[0]][cellpoint[1]].bit.lowerBit = 1;
        }
        if (alt == shift) {
          board.cells[cellpoint[0]][cellpoint[1]].bit = {
            upperBit: 1,
            lowerBit: 1,
          };
          render.setCell(cellpoint, render.getColour({ upperBit: 1, lowerBit: 1 }, 2))
        }
        else {
          render.setCell(cellpoint, render.getColour(board.cells[cellpoint[0]][cellpoint[1]].bit, 2))
        }
      }
      if (board.cells[cellpoint[0]][cellpoint[1]].type == 1) {
        board.cells[cellpoint[0]][cellpoint[1]].bit = 1;
        render.setCell(cellpoint, render.getColour(1, 1))
      }
    }
  } else {
    if (forceOff) {
      var cellpoint = WorldToGrid(panZoom.toWorld(mouse.x, mouse.y));
      if (
        cellpoint[0] >= 0 &&
        cellpoint[0] < board.width &&
        cellpoint[1] >= 0 &&
        cellpoint[1] < board.height
      ) {
        if (board.cells[cellpoint[0]][cellpoint[1]].type == 2) {
          if (shift) {
            board.cells[cellpoint[0]][cellpoint[1]].bit.upperBit = 0;
          }
          if (alt) {
            board.cells[cellpoint[0]][cellpoint[1]].bit.lowerBit = 0;
          }
          if (alt == shift) {
            board.cells[cellpoint[0]][cellpoint[1]].bit = {
              upperBit: 0,
              lowerBit: 0,
            };
            render.setCell(cellpoint, render.getColour({ upperBit: 0, lowerBit: 0 }, 2))
          }
          else {
            render.setCell(cellpoint, render.getColour(board.cells[cellpoint[0]][cellpoint[1]].bit, 2))
          }
        }
        if (board.cells[cellpoint[0]][cellpoint[1]].type == 1) {
          board.cells[cellpoint[0]][cellpoint[1]].bit = 0;
          render.setCell(cellpoint, render.getColour(0, 1))
        }
      }
    }
  }
  //</force>
  if (record.enabled) {
    record.stream.getVideoTracks()[0].requestFrame();
  }
  //<render>
  //Grid Render:
  culling.cell.occlusion.topLeft = WorldToGrid(panZoom.toWorld(0, 0));
  culling.cell.occlusion.bottomRight = WorldToGrid(
    panZoom.toWorld(canvas.width, canvas.height)
  );
  render.apply()
  ctx.imageSmoothingEnabled = false
  ctx.putImageData(render.data, 0, 0)
  point = GridToWorld([0, 0]);
  ctx.globalCompositeOperation = 'copy';
  ctx.drawImage(canvas,
    0, 0, board.width, board.height, // grab the ImageData part
    point[0] / render.magicNumber - (gridSize / 2) * panZoom.scale,
    point[1] / render.magicNumber - (gridSize / 2) * panZoom.scale,
    gridSize * (1 / size) * board.width,
    gridSize * (1 / size) * board.height // scale it
  );
  ctx.imageSmoothingEnabled = true
  ctx.globalCompositeOperation = 'source-over';
  //Grid Lines
  render.drawGrid(gridSize);
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
  requestAnimationFrame(update);
}
function WorldToGrid(point) {
  return [
    Math.round((point.x + gridSize / 2) / gridSize),
    Math.round((point.y + gridSize / 2) / gridSize),
  ]; // Converts world cords to grid coords
}
function GridToWorld(point) {
  size = 1 / panZoom.scale;
  return [
    (point[0] * gridSize - gridSize / 2) * size + panZoom.x * render.magicNumber,
    (point[1] * gridSize - gridSize / 2) * size + panZoom.y * render.magicNumber,
  ];
}
function getImage(t, b, f, a) {
  if (a) {
    switch (t) {
      case 1:
        if (f) {
          return imgBT1;
        } else {
          return imgTB1;
        }
      case 2:
        if (f) {
          return imgBT2;
        } else {
          return imgTB2;
        }
      case 3:
        return imgCross;
      default:
        return;
    }
  } else {
    switch (t) {
      case 0:
        switch (b) {
          case 1:
            return imgT0B1;
          case 2:
            return imgT0B2;
          default:
            return;
        }
      case 1:
        switch (b) {
          case 0:
            return imgT1B0;
          case 1:
            if (f) {
              return imgT1B1F;
            } else {
              return imgT1B1;
            }
          case 2:
            if (f) {
              return imgT1B2F;
            } else {
              return imgT1B2;
            }
          default:
            return;
        }
      case 2:
        switch (b) {
          case 0:
            return imgT2B0;
          case 1:
            if (f) {
              return imgT2B1F;
            } else {
              return imgT2B1;
            }
          case 2:
            if (f) {
              return imgT2B2F;
            } else {
              return imgT2B2;
            }
          default:
            return;
        }
      default:
        return;
    }
  }
}

function innerTick1Old(item) {
  let x2 = item[0];
  let y2 = item[1];
  let bit = 0;
  if (x2 > 0) {
    switch (board.cells[x2 - 1][y2].type) {
      case 1:
        bit |=
          (board.connections.horizontal[x2 - 1][y2].type.upperType == 1 &&
            !board.connections.horizontal[x2 - 1][y2].flipped &&
            board.cells[x2 - 1][y2].bit == 1) ||
          (board.connections.horizontal[x2 - 1][y2].type.upperType == 2 &&
            !board.connections.horizontal[x2 - 1][y2].flipped &&
            board.cells[x2 - 1][y2].bit == 0);
        bit |=
          (board.connections.horizontal[x2 - 1][y2].type.lowerType == 1 &&
            board.connections.horizontal[x2 - 1][y2].flipped ==
            board.connections.horizontal[x2 - 1][y2].mixed &&
            board.cells[x2 - 1][y2].bit == 1) ||
          (board.connections.horizontal[x2 - 1][y2].type.lowerType == 2 &&
            board.connections.horizontal[x2 - 1][y2].flipped ==
            board.connections.horizontal[x2 - 1][y2].mixed &&
            board.cells[x2 - 1][y2].bit == 0);
        break;
      case 2:
        bit |=
          (board.connections.horizontal[x2 - 1][y2].type.upperType == 1 &&
            !board.connections.horizontal[x2 - 1][y2].flipped &&
            board.cells[x2 - 1][y2].bit.upperBit == 1) ||
          (board.connections.horizontal[x2 - 1][y2].type.upperType == 2 &&
            !board.connections.horizontal[x2 - 1][y2].flipped &&
            board.cells[x2 - 1][y2].bit.upperBit == 0);
        bit |=
          (board.connections.horizontal[x2 - 1][y2].type.lowerType == 1 &&
            board.connections.horizontal[x2 - 1][y2].flipped ==
            board.connections.horizontal[x2 - 1][y2].mixed &&
            board.cells[x2 - 1][y2].bit.lowerBit == 1) ||
          (board.connections.horizontal[x2 - 1][y2].type.lowerType == 2 &&
            board.connections.horizontal[x2 - 1][y2].flipped ==
            board.connections.horizontal[x2 - 1][y2].mixed &&
            board.cells[x2 - 1][y2].bit.lowerBit == 0);
        break;
    }
  }
  if (x2 < board.width - 1) {
    switch (board.cells[x2 + 1][y2].type) {
      case 1:
        bit |=
          (board.connections.horizontal[x2][y2].type.upperType == 1 &&
            board.connections.horizontal[x2][y2].flipped &&
            board.cells[x2 + 1][y2].bit == 1) ||
          (board.connections.horizontal[x2][y2].type.upperType == 2 &&
            board.connections.horizontal[x2][y2].flipped &&
            board.cells[x2 + 1][y2].bit == 0);
        bit |=
          (board.connections.horizontal[x2][y2].type.lowerType == 1 &&
            board.connections.horizontal[x2][y2].flipped !=
            board.connections.horizontal[x2][y2].mixed &&
            board.cells[x2 + 1][y2].bit == 1) ||
          (board.connections.horizontal[x2][y2].type.lowerType == 2 &&
            board.connections.horizontal[x2][y2].flipped !=
            board.connections.horizontal[x2][y2].mixed &&
            board.cells[x2 + 1][y2].bit == 0);
        break;
      case 2:
        bit |=
          (board.connections.horizontal[x2][y2].type.upperType == 1 &&
            board.connections.horizontal[x2][y2].flipped &&
            board.cells[x2 + 1][y2].bit.upperBit == 1) ||
          (board.connections.horizontal[x2][y2].type.upperType == 2 &&
            board.connections.horizontal[x2][y2].flipped &&
            board.cells[x2 + 1][y2].bit.upperBit == 0);
        bit |=
          (board.connections.horizontal[x2][y2].type.lowerType == 1 &&
            board.connections.horizontal[x2][y2].flipped !=
            board.connections.horizontal[x2][y2].mixed &&
            board.cells[x2 + 1][y2].bit.lowerBit == 1) ||
          (board.connections.horizontal[x2][y2].type.lowerType == 2 &&
            board.connections.horizontal[x2][y2].flipped !=
            board.connections.horizontal[x2][y2].mixed &&
            board.cells[x2 + 1][y2].bit.lowerBit == 0);
        break;
    }
  }
  if (y2 > 0) {
    switch (board.cells[x2][y2 - 1].type) {
      case 1:
        bit |=
          (board.connections.vertical[x2][y2 - 1].type.upperType == 1 &&
            !board.connections.vertical[x2][y2 - 1].flipped &&
            board.cells[x2][y2 - 1].bit == 1) ||
          (board.connections.vertical[x2][y2 - 1].type.upperType == 2 &&
            !board.connections.vertical[x2][y2 - 1].flipped &&
            board.cells[x2][y2 - 1].bit == 0);
        bit |=
          (board.connections.vertical[x2][y2 - 1].type.lowerType == 1 &&
            board.connections.vertical[x2][y2 - 1].flipped ==
            board.connections.vertical[x2][y2 - 1].mixed &&
            board.cells[x2][y2 - 1].bit == 1) ||
          (board.connections.vertical[x2][y2 - 1].type.lowerType == 2 &&
            board.connections.vertical[x2][y2 - 1].flipped ==
            board.connections.vertical[x2][y2 - 1].mixed &&
            board.cells[x2][y2 - 1].bit == 0);
        break;
      case 2:
        bit |=
          (board.connections.vertical[x2][y2 - 1].type.upperType == 1 &&
            !board.connections.vertical[x2][y2 - 1].flipped &&
            board.cells[x2][y2 - 1].bit.upperBit == 1) ||
          (board.connections.vertical[x2][y2 - 1].type.upperType == 2 &&
            !board.connections.vertical[x2][y2 - 1].flipped &&
            board.cells[x2][y2 - 1].bit.upperBit == 0);
        bit |=
          (board.connections.vertical[x2][y2 - 1].type.lowerType == 1 &&
            board.connections.vertical[x2][y2 - 1].flipped ==
            board.connections.vertical[x2][y2 - 1].mixed &&
            board.cells[x2][y2 - 1].bit.lowerBit == 1) ||
          (board.connections.vertical[x2][y2 - 1].type.lowerType == 2 &&
            board.connections.vertical[x2][y2 - 1].flipped ==
            board.connections.vertical[x2][y2 - 1].mixed &&
            board.cells[x2][y2 - 1].bit.lowerBit == 0);
        break;
    }
  }
  if (y2 < board.height - 1) {
    switch (board.cells[x2][y2 + 1].type) {
      case 1:
        bit |=
          (board.connections.vertical[x2][y2].type.upperType == 1 &&
            board.connections.vertical[x2][y2].flipped &&
            board.cells[x2][y2 + 1].bit == 1) ||
          (board.connections.vertical[x2][y2].type.upperType == 2 &&
            board.connections.vertical[x2][y2].flipped &&
            board.cells[x2][y2 + 1].bit == 0);
        bit |=
          (board.connections.vertical[x2][y2].type.lowerType == 1 &&
            board.connections.vertical[x2][y2].flipped !=
            board.connections.vertical[x2][y2].mixed &&
            board.cells[x2][y2 + 1].bit == 1) ||
          (board.connections.vertical[x2][y2].type.lowerType == 2 &&
            board.connections.vertical[x2][y2].flipped !=
            board.connections.vertical[x2][y2].mixed &&
            board.cells[x2][y2 + 1].bit == 0);
        break;
      case 2:
        bit |=
          (board.connections.vertical[x2][y2].type.upperType == 1 &&
            board.connections.vertical[x2][y2].flipped &&
            board.cells[x2][y2 + 1].bit.upperBit == 1) ||
          (board.connections.vertical[x2][y2].type.upperType == 2 &&
            board.connections.vertical[x2][y2].flipped &&
            board.cells[x2][y2 + 1].bit.upperBit == 0);
        bit |=
          (board.connections.vertical[x2][y2].type.lowerType == 1 &&
            board.connections.vertical[x2][y2].flipped !=
            board.connections.vertical[x2][y2].mixed &&
            board.cells[x2][y2 + 1].bit.lowerBit == 1) ||
          (board.connections.vertical[x2][y2].type.lowerType == 2 &&
            board.connections.vertical[x2][y2].flipped !=
            board.connections.vertical[x2][y2].mixed &&
            board.cells[x2][y2 + 1].bit.lowerBit == 0);
        break;
    }
  }
  newGrid[x2][y2].bit = bit;
  render.setCell([x2, y2], render.getColour(bit, 1))
}
tick.innerTick1New = ((item) => {

})

requestAnimationFrame(update);
