import "./styles.css";
import * as THREE from "three";
import { Text } from "./Text";
import TouchTexture from "./TouchTexture";
import { EffectComposer, RenderPass, EffectPass } from "postprocessing";
import { WaterEffect } from "./WaterEffect";
import { Planes } from "./Planes";


const image1 = require("./static/sphere-background.jpg");


let images = [image1];


export class App {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.composer = new EffectComposer(this.renderer);
    
    this.raycaster = new THREE.Raycaster();
    this.intersectPoint = new THREE.Vector3();
    this.groupBigSphere = new THREE.Mesh();
    this.groupSmallSphere = new THREE.Mesh();
    this.basicMesh = new THREE.Mesh();
    this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    document.body.append(this.renderer.domElement);
    this.renderer.domElement.id = "webGLApp";

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.camera.position.z = 50;
    this.disposed = false;
    this.scene_1 = new THREE.Scene();
    this.scene_2 = new THREE.Scene();
    this.scene_1.background = new THREE.Color(0x161624);

    this.clock = new THREE.Clock();

    this.assets = {};
    // this.raycaster = new THREE.Raycaster();
    this.hitObjects = [];

    this.touchTexture = new TouchTexture();

    this.data = {
      text: ["DON'T", "LOOK", "BACK"],
      images: images
    };

    this.subjects = [new Planes(this, images)];
    // this.subjects = [];

    this.tick = this.tick.bind(this);
    this.onResize = this.onResize.bind(this);
    this.mouse = {};
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);

    this.init = this.init.bind(this);
    this.loader = new Loader();
    this.loadAssets().then(this.init);
  }
  loadAssets() {
    const loader = this.loader;
    const assets = this.assets;
    return new Promise((resolve, reject) => {
      // loadTextAssets(assets, loader);

      this.subjects.forEach((subject) => subject.load(loader));

      loader.onComplete = () => {
        resolve();
      };
    });
  }

  
  onPlaneHover(i) {
    // const text = this.subjects[1];
    // if (i === 0) {
    //   text.updateText("DON'T");
    // } else if (i === 1) {
    //   text.updateText("LOOK");
    // } else if (i === 2) {
    //   text.updateText("BACK");
    // }
  }
  initComposer() {
    const renderPass = new RenderPass(this.scene_1, this.camera);
    this.waterEffect = new WaterEffect({ texture: this.touchTexture.texture });
    const waterPass = new EffectPass(this.camera, this.waterEffect);
    waterPass.renderToScreen = true;
    renderPass.renderToScreen = false;
    this.composer.addPass(renderPass);
    this.composer.addPass(waterPass);
  }

  createSphere(gap, numOfCircles, scaleFactor, config) {
    const divisions = 50;
    const group = new THREE.Group();
    for (let i = 0; i <= numOfCircles; i++) {
      if (i !== 0 && i !== 1 && i !== 2 && i !== 3) {
        
        const geometry = new THREE.Geometry();

        for (let j = 0; j <= divisions; j++) {
          const v = (j / divisions) * (Math.PI * 2);
          const x = Math.sin(v);
          const z = Math.cos(v);
          geometry.vertices.push(new THREE.Vector3(x, i / gap, z));
        }
        

        const material = new THREE.LineBasicMaterial({
          color: new THREE.Color(0xffffff),
          linewidth: 1
        });
        const line = new THREE.Line(geometry, material);
        line.scale.setScalar(i * scaleFactor);
        line.rotateX(Math.PI / 2);
        line.rotateZ(Math.PI / 4);
        line.rotateY(Math.PI / 2);
        group.add(line);
      }
    }
    config(group);
    return group;
  }


  init() {
    this.touchTexture.initTexture();
    const assets = this.assets;
    
    const group1 = this.createSphere(6, 8, 1.5, (group) => {
      group.rotateX(Math.PI / 2);
      group.rotateY(Math.PI / 2);
      this.groupBigSphere.add(group);
    });
  
    const group2 = this.createSphere(6, 8, -1.5, (group) => {
      group.rotateX(Math.PI / 2);
      group.rotateY(Math.PI / 2);
      this.groupBigSphere.add(group);
    });
  
    const group3 = this.createSphere(5, 8, -0.3, (group) => {
      group.rotateX(Math.PI / 2);
      group.rotateY(Math.PI / 2);
      this.groupSmallSphere.add(group);
    });

    const geometry = new THREE.SphereGeometry(1, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0x641e16 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.rotateX(Math.PI / 3);
  
    this.groupSmallSphere.add(sphere);
    // group2.children[4].removeFromParent();
    group2.position.set(group1.position.x + 27, group1.position.y - 27, 0);
    this.groupBigSphere.position.set(-10, 10, 0);
    this.groupSmallSphere.position.set(24, -24, 0);
    this.basicMesh.add(this.groupSmallSphere);
    this.basicMesh.add(this.groupBigSphere);
    this.basicMesh.scale.set(0.8,0.8,0.8);
    this.scene_2.add(this.basicMesh);

    // document.addEventListener("mousemove", onMouseMove, false);
    // const textGeometry2 = createGeometry({
    //   font: assets.font,
    //   align: "center",
    //   width: 600,
    //   text: Array.from({ length: 100 }, () => "water").join(" ")
    // });
    // const textMaterial2 = createTextMaterial(assets.glyphs, {
    //   color: "rgba(20,20,20,1.0)"
    // });
    // const textMesh2 = new THREE.Mesh(textGeometry2, textMaterial2);
    // scale = 0.1;
    // console.log(textGeometry2.layout);
    // textMesh2.scale.x = scale;
    // textMesh2.scale.y = -scale;
    // textMesh2.position.z += -0.1;
    // textMesh2.position.x = (-textGeometry2.layout.width / 2) * scale;
    // textMesh2.position.y =
    //   (-textGeometry2.layout.height / 2) * scale +
    //   (-textGeometry2.layout.lineHeight / 4) * scale;
    // this.scene.add(textMesh2);

    this.initTextPlane();
    this.addHitPlane();
    this.subjects.forEach((subject) => subject.init());
    this.initComposer();

    // this.addImagePlane();

    this.tick();

    window.addEventListener("resize", this.onResize);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("touchmove", this.onTouchMove);
  }
  onTouchMove(ev) {
    const touch = ev.targetTouches[0];
    this.onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  }
  onMouseMove(ev) {
    const raycaster = this.raycaster;
    this.mouse = {
      x: ev.clientX / window.innerWidth,
      y: 1 - ev.clientY / window.innerHeight
    };
    this.touchTexture.addTouch(this.mouse);

    raycaster.setFromCamera(
      {
        x: (ev.clientX / window.innerWidth) * 2 - 1,
        y: -(ev.clientY / window.innerHeight) * 2 + 1
      },
      this.camera
    );

    //////////////////////////
    this.mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.raycaster.ray.intersectPlane(this.plane, this.intersectPoint);
    const matrix = new THREE.Matrix4();
    const finalPosition = this.intersectPoint.clone();
    console.log(finalPosition);
    finalPosition.x = -this.intersectPoint.y;
    finalPosition.y = this.intersectPoint.x;
    matrix.lookAt(
      finalPosition,
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1)
    );
    this.basicMesh.quaternion.setFromRotationMatrix(matrix);
    // var intersections = raycaster.intersectObjects(this.hitObjects);
    // if (intersections.length > 0) {
    //   const intersect = intersections[0];
    //   this.touchTexture.addTouch(intersect.uv);
    // }
    this.subjects.forEach((subject) => {
      if (subject.onMouseMove) {
        subject.onMouseMove(ev);
      }
    });
  }
  addImagePlane() {
    const viewSize = this.getViewSize();

    let width = viewSize.width / 4.5;

    const geometry = new THREE.PlaneBufferGeometry(
      width,
      viewSize.height * 0.8,
      1,
      1
    );
    let x = -viewSize.width / 2 + width / 2 + viewSize.width / 5 / 1.5;

    let space = (viewSize.width - (viewSize.width / 5 / 1.5) * 2 - width) / 2;
    for (let i = 0; i < 3; i++) {
      const material = new THREE.MeshBasicMaterial({ color: 0x484848 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x += x + i * space;
      this.scene_1.add(mesh);
    }
  }
  initTextPlane() {
    const viewSize = this.getViewSize();

    const geometry = new THREE.PlaneBufferGeometry(
      viewSize.width,
      viewSize.height,
      1,
      1
    );
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uMap: new THREE.Uniform(this.touchTexture.texture),
        uLines: new THREE.Uniform(5),
        uLineWidth: new THREE.Uniform(0.01),
        uLineColor: new THREE.Uniform(new THREE.Color(0x202030))
      },
      transparent: true,
      fragmentShader: `
        uniform sampler2D uMap;
        uniform float uLines;
        uniform float uLineWidth;
        uniform vec3 uLineColor;
        varying vec2 vUv;
        void main(){
          vec3 color = vec3(1.);
          color = vec3(0.);
          float line = step(0.5-uLineWidth/2.,fract(vUv.x * uLines)) - step(0.50 +uLineWidth/2.,fract(vUv.x * uLines));
          color += line * uLineColor;
          gl_FragColor = vec4(uLineColor,line);
        }
      `,
      vertexShader: `
        varying vec2 vUv;

        void main(){
          vec3 pos = position.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
          vUv = uv;
        }
      `
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -0.001;
    this.scene_1.add(mesh);
  }
  addHitPlane() {
    const viewSize = this.getViewSize();
    const geometry = new THREE.PlaneBufferGeometry(
      viewSize.width,
      viewSize.height,
      1,
      1
    );
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);

    this.hitObjects.push(mesh);
  }
  getViewSize() {
    const fovInRadians = (this.camera.fov * Math.PI) / 180;
    const height = Math.abs(
      this.camera.position.z * Math.tan(fovInRadians / 2) * 2
    );

    return { width: height * this.camera.aspect, height };
  }
  dispose() {
    this.disposed = true;
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("mousemove", this.onMouseMove);
    this.scene_1.children.forEach((child) => {
      child.material.dispose();
      child.geometry.dispose();
    });
    if (this.assets.glyphs) this.assets.glyphs.dispose();

    this.hitObjects.forEach((child) => {
      if (child) {
        if (child.material) child.material.dispose();
        if (child.geometry) child.geometry.dispose();
        // child.dispose();
      }
    });
    if (this.touchTexture) this.touchTexture.texture.dispose();
    this.scene_1.dispose();
    this.renderer.dispose();
    this.composer.dispose();
  }
  update() {
    this.touchTexture.update();
    this.subjects.forEach((subject) => {
      subject.update();
    });
  }
  render() {
    this.composer.render(this.clock.getDelta());
    this.renderer.render(this.scene_2, this.camera);
  }
  tick() {
    if (this.disposed) return;
    this.render();
    this.update();
    requestAnimationFrame(this.tick);
  }
  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.composer.setSize(window.innerWidth, window.innerHeight);
    this.subjects.forEach((subject) => {
      subject.onResize(window.innerWidth, window.innerHeight);
    });
  }

}


class Loader {
  constructor() {
    this.items = [];
    this.loaded = [];
  }
  begin(name) {
    this.items.push(name);
  }
  end(name) {
    this.loaded.push(name);
    if (this.loaded.length === this.items.length) {
      this.onComplete();
    }
  }
  onComplete() {}
}
