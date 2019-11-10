var Engine = Matter.Engine,
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
var engine = Engine.create(),
    world = engine.world;

var width = window.innerWidth;
var height = window.innerHeight;

// create renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: width,
        height: height,
        pixelRatio: 2
    }
});

Render.run(render);

// create runner
var runner = Runner.create();
Runner.run(runner, engine);

World.add(world, [
    Bodies.rectangle(width/2, -25, width, 50, { isStatic: true }),
    Bodies.rectangle(width/2, height+25, width, 50, { isStatic: true }),
    Bodies.rectangle(width+25, height/2, 50, height, { isStatic: true }),
    Bodies.rectangle(-25, height/2, 50, height, { isStatic: true })
]);

// add gyro control
if (typeof window !== 'undefined') {
    var updateGravity = function(event) {
        var orientation = typeof window.orientation !== 'undefined' ? window.orientation : 0,
            gravity = engine.world.gravity;

        if (orientation === 0) {
            gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
            gravity.y = Common.clamp(event.beta, -90, 90) / 90;
        } else if (orientation === 180) {
            gravity.x = Common.clamp(event.gamma, -90, 90) / 90;
            gravity.y = Common.clamp(-event.beta, -90, 90) / 90;
        } else if (orientation === 90) {
            gravity.x = Common.clamp(event.beta, -90, 90) / 90;
            gravity.y = Common.clamp(-event.gamma, -90, 90) / 90;
        } else if (orientation === -90) {
            gravity.x = Common.clamp(-event.beta, -90, 90) / 90;
            gravity.y = Common.clamp(event.gamma, -90, 90) / 90;
        }
    };

    window.addEventListener('deviceorientation', updateGravity);
}

// get character data
HanziWriter.loadCharacterData('亂').then(function(charData) {
  let paths = [];
  charData.strokes.forEach(function(strokePath) {
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttributeNS(null, 'd', strokePath);
    paths.push(path);
  });
  createStrokes(paths);
});

function createStrokes (paths) {
  var means = [];
  var allVertexSets = [];

  for (var i = 0; i < paths.length; i += 1) {
    var vertexSets = [],
      color = Common.choose(['#556270', '#4ECDC4', '#C7F464', '#FF6B6B', '#C44D58']);

    var path = paths[i];
    var pts = Svg.pathToVertices(path, 30);
    var trfmd = Vertices.scale(pts, -0.3, 0.3, {x: 0, y: 0});
    var rttd = Vertices.rotate(trfmd, 3.14, {x: 0, y: 0});
    var mean = Vertices.mean(rttd);
    vertexSets.push(rttd);
    means.push(mean);
    allVertexSets.push(vertexSets);
  }

  var spawnCount = 0;
  var spawnInterval = setInterval(() => {
    for(var i = 0; i < allVertexSets.length; i++) {
      var color = '#FF0000';
      World.add(engine.world, Bodies.fromVertices(means[i].x + 120, means[i].y + 300, allVertexSets[i], {
          render: {
              fillStyle: color,
              strokeStyle: color
          }
      }, true));
    }
    spawnCount++;
    if(spawnCount >= 3) {
      clearInterval(spawnInterval);
    }
  }, 800);
}

// add mouse control
var mouse = Mouse.create(render.canvas),
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
