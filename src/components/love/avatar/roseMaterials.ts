import * as THREE from 'three';

export function curvedPetal() {
  const shape = new THREE.Shape();
  shape.moveTo(0, -.5); shape.bezierCurveTo(.55, -.35, .6, .35, .12, .5); shape.quadraticCurveTo(0, .42, -.12, .5); shape.bezierCurveTo(-.6, .35, -.55, -.35, 0, -.5);
  const geometry = new THREE.ShapeGeometry(shape, 16);
  const pos = geometry.getAttribute('position');
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i); pos.setZ(i, x * x * .85 + y * y * .25); }
  geometry.computeVertexNormals(); return geometry;
}
export function petalTexture(color: string) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const base = new THREE.Color(color);
    const gradient = ctx.createLinearGradient(0, 256, 160, 0);
    gradient.addColorStop(0, base.clone().multiplyScalar(.45).getStyle());
    gradient.addColorStop(.6, base.getStyle()); gradient.addColorStop(1, base.clone().lerp(new THREE.Color('white'), .2).getStyle());
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = base.clone().multiplyScalar(.6).getStyle(); ctx.lineWidth = .5;
    for (let i = 0; i < 60; i++) { ctx.globalAlpha = .08 + (i % 4) * .02; ctx.beginPath(); ctx.moveTo(128, 256); ctx.quadraticCurveTo(i * 4, 128, i * 5, 0); ctx.stroke(); }
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}