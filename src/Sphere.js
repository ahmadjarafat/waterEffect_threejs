


export class Sphere {
constructor(){

}

createSphere(gap, numOfCircles, scaleFactor, config) {
    const divisions = 50;
    const group = new THREE.Group();
    for (let i = 0; i <= numOfCircles; i++) {
      if (i !== 0 && i !== 1 && i !== 2 && i !== 3) {
        const vertices = [];
        for (let j = 0; j <= divisions; j++) {
          const v = (j / divisions) * (Math.PI * 2);

          const x = Math.sin(v);
          const z = Math.cos(v);

          vertices.push(x, i / gap, z);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(vertices, 3)
        );

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
}