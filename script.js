let Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Composites = Matter.Composites,
    Common = Matter.Common,
    Vertices = Matter.Vertices,
    Svg = Matter.Svg,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies;

// create engine
let engine = Engine.create(),
    world = engine.world;

let width = window.innerWidth;
let height = window.innerHeight;

// create renderer
let render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: width,
        height: height,
        pixelRatio: 2,
        showCollisions: true
    }
});

let multiplier = 2;
let density = 0.1;

Render.run(render);

// create runner
let runner = Runner.create();
Runner.run(runner, engine);

World.add(world, [
    Bodies.rectangle(width/2, -25, width, 50, { isStatic: true }),
    Bodies.rectangle(width/2, height+25, width, 50, { isStatic: true }),
    Bodies.rectangle(width+25, height/2, 50, height, { isStatic: true }),
    Bodies.rectangle(-25, height/2, 50, height, { isStatic: true })
]);

const chars = ['萬','有','引','力'];
let it = 0;
let interval = setInterval(() => {
  let offx = width/8;
  let offy = 250;
  createChar(chars[it], { x: offx, y: offy });
  if(it == chars.length-1) clearInterval(interval);
  else it++;
}, 1000);

// add gyro control
let updateGravity = null;
if (typeof window !== 'undefined') {
    updateGravity = function(event) {
        let orientation = typeof window.orientation !== 'undefined' ? window.orientation : 0,
            gravity = engine.world.gravity;
        if (orientation === 0) {
            gravity.x = Common.clamp(event.gamma, -90, 90) / 90 * multiplier;
            gravity.y = Common.clamp(event.beta, -90, 90) / 90 * multiplier;
        } else if (orientation === 180) {
            gravity.x = Common.clamp(event.gamma, -90, 90) / 90 * multiplier;
            gravity.y = Common.clamp(-event.beta, -90, 90) / 90 * multiplier;
        } else if (orientation === 90) {
            gravity.x = Common.clamp(event.beta, -90, 90) / 90 * multiplier;
            gravity.y = Common.clamp(-event.gamma, -90, 90) / 90 * multiplier;
        } else if (orientation === -90) {
            gravity.x = Common.clamp(-event.beta, -90, 90) / 90 * multiplier;
            gravity.y = Common.clamp(event.gamma, -90, 90) / 90 * multiplier;
        }
    };
}

$(window).click( onClick );

function onClick() {
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', updateGravity);
        }
      })
      .catch(console.error);
  } else {
    // handle regular non iOS 13+ devices
  }
}

// get character data
function createChar(char,offset) {
  HanziWriter.loadCharacterData(char).then(function(charData) {
    let paths = [];
    charData.strokes.forEach(function(strokePath) {
      let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttributeNS(null, 'd', strokePath);
      paths.push(path);
    });
    createStrokes(paths,offset);
  });
}

function createStrokes (paths,offset) {
  let means = [];
  let allVertexSets = [];

  for (let i = 0; i < paths.length; i += 1) {
    let vertexSets = [];

    let path = paths[i];
    let pts = Svg.pathToVertices(path, 30);
    let trfmd = Vertices.scale(pts, -0.3, 0.3, {x: 0, y: 0});
    let rttd = Vertices.rotate(trfmd, 3.14, {x: 0, y: 0});
    let mean = Vertices.mean(rttd);
    vertexSets.push(rttd);
    means.push(mean);
    allVertexSets.push(vertexSets);
  }
  for(let i = 0; i < allVertexSets.length; i++) {
    let color = '#FF0000';
    World.add(engine.world, Bodies.fromVertices(means[i].x + offset.x, means[i].y + offset.y, allVertexSets[i], {
        render: {
            fillStyle: color,
            strokeStyle: color
        },
        density: density
    }, true));
  }
}

// add mouse control
let mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;
