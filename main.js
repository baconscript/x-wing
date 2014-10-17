var camera, scene, renderer;
var effect, controls;
var element, container;

var clock = new THREE.Clock();

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setClearColor( 0x000000, 0 ); // the default
  element = renderer.domElement;
  container = document.getElementById('example');
  container.appendChild(element);

  //effect = new THREE.StereoEffect(renderer);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(90, 1, 0.001, 700);
  camera.position.set(0, 5, 30);
  scene.add(camera);

  controls = new THREE.OrbitControls(camera, element);
  controls.rotateUp(Math.PI / 4);
  controls.target.set(
    camera.position.x + 0.1,
    camera.position.y,
    camera.position.z
  );
  controls.noZoom = true;
  controls.noPan = true;
  controls.autoRotate = false;

  function setOrientationControls(e) {
    if (!e.alpha) {
      return;
    }

    controls = new THREE.DeviceOrientationControls(camera, true);
    controls.connect();
    controls.update();

    element.addEventListener('click', fullscreen, false);

    window.removeEventListener('deviceorientation', setOrientationControls);
  }
  window.addEventListener('deviceorientation', setOrientationControls, true);


  var light = new THREE.HemisphereLight(0x777777, 0x000000, 0.6);
  scene.add(light);

  var pointLight = new THREE.PointLight( 0xFFFFFF );
  pointLight.position.z = 1000;
  scene.add(pointLight);

  var texture = THREE.ImageUtils.loadTexture(
   'textures/patterns/checker.png'
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat = new THREE.Vector2(50, 50);
  texture.anisotropy = renderer.getMaxAnisotropy();

  var material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0xffffff,
    shininess: 20,
    shading: THREE.FlatShading,
    map: texture
  });

  var geometry = new THREE.PlaneGeometry(1000, 1000);

  var mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  scene.add(mesh);

  loadXWing(scene);

  window.addEventListener('resize', resize, false);
  setTimeout(resize, 1);
}

function loadXWing(scene){

    var material = new THREE.MeshPhongMaterial( { ambient: 0xb8860b, color: 0xffe4c4, specular: 0xffffff, shininess: 200 } );

    var loader = new THREE.STLLoader();
    loader.addEventListener( 'load', function ( event ) {

      var geometry = event.content;
      var mesh = new THREE.Mesh( geometry, material );

      mesh.position.set( 0, - 0.37, - 0.6 );
      mesh.rotation.set( - Math.PI / 2, 0, 0 );
      mesh.scale.set( 2, 2, 2 );

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      scene.add( mesh );

      Leap.loop(function(frame) {
          if(frame.hands.length) {
            var hand = frame.hands[0];
            mesh.position.y = (hand.palmPosition[1]-300)/5;
            mesh.position.x = -(hand.palmPosition[0]-300)/5;
            mesh.position.z = -(hand.palmPosition[2]-300)/5;
            var scale = 1-hand.grabStrength;
            mesh.scale.set(scale,scale,scale);
          }
      }).use('screenPosition', {});

    } );
    loader.load( '/x-wing.stl' );
}

function resize() {
  var width = container.offsetWidth;
  var height = container.offsetHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  if(effect) effect.setSize(width, height);
}

function update(dt) {
  resize();

  camera.updateProjectionMatrix();

  controls.update(dt);
}

function render(dt) {
  (effect||renderer).render(scene, camera);
}

function animate(t) {
  requestAnimationFrame(animate);

  update(clock.getDelta());
  render(clock.getDelta());
}

function fullscreen() {
  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if (container.msRequestFullscreen) {
    container.msRequestFullscreen();
  } else if (container.mozRequestFullScreen) {
    container.mozRequestFullScreen();
  } else if (container.webkitRequestFullscreen) {
    container.webkitRequestFullscreen();
  }
}
