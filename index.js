let resized = false
let fullscreen = false

function main() {

  // Inisiasi kanvas WebGL
  var leftCanvas = document.getElementById("leftCanvas");
  var rightCanvas = document.getElementById("rightCanvas");
  var leftGL = leftCanvas.getContext("webgl");
  var rightGL = rightCanvas.getContext("webgl");
  
  resize();

  // Inisiasi verteks persegi
  
  var points = initVertices();

  var colors = [
    [0.0, 0.0, 1.0],    // biru
    [0.7, 0.7, 0.7],    // abuabu
    [0.9, 0.9, 0.9],    // putih
    [0.4, 0.4, 0.4]     // abuabu gelap
  ];

  var leftVertices = [];
  var rightVertices = [];

  function quad(a, b, c, d) {
    var indices = [a, b, c, c, d, a];
    for (var i=0; i<indices.length; i++) {
        leftVertices.push(points[indices[i]][0]);
        leftVertices.push(points[indices[i]][1]);
        for (var j=0; j<3; j++) {
            leftVertices.push(colors[0][j]);
        }
    }
  }

  function quadRight(a, b, c, d, color) {
    var indices = [a, b, c, c, d, a];
    for (var i=0; i<indices.length; i++) {
      for(var j=0; j<3; j++){
        rightVertices.push(points[indices[i]][j]);
      }
      for (var j=0; j<3; j++) {
          rightVertices.push(colors[color][j]);
      }
    }
  }

  function forRight(a, b, c, d, e, f, g, h){
    quadRight(b, c, d, a, 3);   // belakang
    quadRight(c, g, h, d, 1);   // kanan
    quadRight(d, h, e, a, 2);   // atas
    quadRight(e, f, b, a, 1);   // kiri
    quadRight(f, e, h, g, 0);   // depan
    quadRight(g, c, b, f, 3);   // bawah
  }

  for(var i=0; i<47; i++){
    quad((i*8)+1, (i*8)+2, (i*8)+3, (i*8));
    forRight((i*8), (i*8)+1, (i*8)+2, (i*8)+3, (i*8)+4, (i*8)+5, (i*8)+6, (i*8)+7);
  }
  
  // Inisiasi VBO (Vertex Buffer Object)
  var leftVertexBuffer = leftGL.createBuffer();
  leftGL.bindBuffer(leftGL.ARRAY_BUFFER, leftVertexBuffer);
  leftGL.bufferData(leftGL.ARRAY_BUFFER, new Float32Array(leftVertices), leftGL.STATIC_DRAW);
  leftGL.bindBuffer(leftGL.ARRAY_BUFFER, null);
  var rightVertexBuffer = rightGL.createBuffer();
  rightGL.bindBuffer(rightGL.ARRAY_BUFFER, rightVertexBuffer);
  rightGL.bufferData(rightGL.ARRAY_BUFFER, new Float32Array(rightVertices), rightGL.STATIC_DRAW);
  rightGL.bindBuffer(rightGL.ARRAY_BUFFER, null);

  // Definisi Shaders
  var leftVertexShaderCode = `
    attribute vec2 aPosition;
    attribute vec3 aColor;
    uniform mat2 matW;
    varying vec3 vColor;

    void main(void) {
      vColor = aColor;
      gl_Position = vec4(matW * vec2(aPosition), 0.0, 2.0);
    }
  `
  var leftFragmentShaderCode = `
    precision mediump float;
    varying vec3 vColor;

    void main() {
      gl_FragColor = vec4(vColor, 1.0);
    }
  `

  var rightVertexShaderCode = `
    attribute vec3 aPosition;
    attribute vec3 aColor;
    uniform mat4 matW;
    uniform mat4 matP;
    varying vec3 vColor;

    void main(void) {
      vColor = aColor;
      gl_Position = matW * vec4(aPosition, 1.0);
    }
  `
  var rightFragmentShaderCode = `
    precision mediump float;
    varying vec3 vColor;

    void main() {
      gl_FragColor = vec4(vColor, 1.0);
    }
  `

  // Proses kompilasi, penautan (linking), dan eksekusi Shaders
  var vertexShader = leftGL.createShader(leftGL.VERTEX_SHADER);
  leftGL.shaderSource(vertexShader, leftVertexShaderCode);
  leftGL.compileShader(vertexShader);
  var fragmentShader = leftGL.createShader(leftGL.FRAGMENT_SHADER);
  leftGL.shaderSource(fragmentShader, leftFragmentShaderCode);
  leftGL.compileShader(fragmentShader);
  var leftShaderProgram = leftGL.createProgram();
  leftGL.attachShader(leftShaderProgram, vertexShader);
  leftGL.attachShader(leftShaderProgram, fragmentShader);
  leftGL.linkProgram(leftShaderProgram);
  leftGL.useProgram(leftShaderProgram);

  var vertexShader = rightGL.createShader(rightGL.VERTEX_SHADER);
  rightGL.shaderSource(vertexShader, rightVertexShaderCode);
  rightGL.compileShader(vertexShader);
  var fragmentShader = rightGL.createShader(rightGL.FRAGMENT_SHADER);
  rightGL.shaderSource(fragmentShader, rightFragmentShaderCode);
  rightGL.compileShader(fragmentShader);
  var rightShaderProgram = rightGL.createProgram();
  rightGL.attachShader(rightShaderProgram, vertexShader);
  rightGL.attachShader(rightShaderProgram, fragmentShader);
  rightGL.linkProgram(rightShaderProgram);
  rightGL.useProgram(rightShaderProgram);

  // Pengikatan VBO dan pengarahan pointer atribut posisi dan warna
  leftGL.bindBuffer(leftGL.ARRAY_BUFFER, leftVertexBuffer);
  var leftPosition = leftGL.getAttribLocation(leftShaderProgram, "aPosition");
  leftGL.vertexAttribPointer(leftPosition, 2, leftGL.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0);
  leftGL.enableVertexAttribArray(leftPosition);
  var leftColor = leftGL.getAttribLocation(leftShaderProgram, "aColor");
  leftGL.vertexAttribPointer(leftColor, 3, leftGL.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
  leftGL.enableVertexAttribArray(leftColor);

  rightGL.bindBuffer(rightGL.ARRAY_BUFFER, rightVertexBuffer);
  var rightPosition = rightGL.getAttribLocation(rightShaderProgram, "aPosition");
  rightGL.vertexAttribPointer(rightPosition, 3, rightGL.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
  rightGL.enableVertexAttribArray(rightPosition);
  var rightColor = rightGL.getAttribLocation(rightShaderProgram, "aColor");
  rightGL.vertexAttribPointer(rightColor, 3, rightGL.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
  rightGL.enableVertexAttribArray(rightColor);
  
  var near = 1, far = 50, fov = 60 * Math.PI / 180 /2;
  var r = near * Math.tan(fov * Math.PI / 180 / 2);
  var projectionMatrix = [
      near/r, 0,      0,                      0,
      0,      near/r, 0,                      0,
      0,      0,      -(far+near)/(far-near), -1,
      0,      0,      -2*far*near/(far-near), 0
  ];

  var matrix3P = rightGL.getUniformLocation(rightShaderProgram,'matP');
  rightGL.uniformMatrix4fv(matrix3P, false, projectionMatrix);

  const uniformLocations = {
    matrix3W: rightGL.getUniformLocation(rightShaderProgram, 'matW'),
    matrix2: leftGL.getUniformLocation(leftShaderProgram, 'matW'),
  };

  const matrix2 = mat2.create();
  const matrix3W = mat4.create();
  mat4.scale(matrix3W, matrix3W, [0.5, 0.5, 0.5]);
  mat4.translate(matrix3W, matrix3W, [0.0, 0.0, -0.5]);

  // Persiapan tampilan layar dan mulai menggambar secara berulang (animasi)
  function render() {
    if (resized) {
			leftGL.viewport(0, (leftGL.canvas.height - leftGL.canvas.width)/2, leftGL.canvas.width, leftGL.canvas.width);
			rightGL.viewport(0, (leftGL.canvas.height - leftGL.canvas.width)/2, rightGL.canvas.width, rightGL.canvas.width);
			resized = false;
		}

    mat2.rotate(matrix2, matrix2, -0.25 * Math.PI / 180);
    leftGL.uniformMatrix2fv(uniformLocations.matrix2, false, matrix2);
    leftGL.clear(leftGL.COLOR_BUFFER_BIT);
    leftGL.drawArrays(leftGL.TRIANGLES, 0, leftVertices.length);


    mat4.rotateX(matrix3W, matrix3W, -0.25 * Math.PI / 180);
    mat4.rotateY(matrix3W, matrix3W, 0.75 * Math.PI / 180);
    rightGL.uniformMatrix4fv(uniformLocations.matrix3W, false, matrix3W);
    rightGL.clear(rightGL.COLOR_BUFFER_BIT | rightGL.DEPTH_BUFFER_BIT);
    rightGL.drawArrays(rightGL.TRIANGLES, 0, rightVertices.length);

    requestAnimationFrame(render);
  }

  leftGL.clearColor(0.7, 0.7, 0.7, 1.0);
  leftGL.viewport(0, (leftGL.canvas.height - leftGL.canvas.width)/2, leftGL.canvas.width, leftGL.canvas.width);

  rightGL.clearColor(0.0, 0.0, 0.0, 1.0);
  rightGL.enable(rightGL.DEPTH_TEST);
  rightGL.viewport(0, (leftGL.canvas.height - leftGL.canvas.width)/2, rightGL.canvas.width, rightGL.canvas.width);

  render();
}

function checkFullscreen(){
  if(!fullScreen){
      if(document.body.requestFullscreen)
          document.body.requestFullscreen();
      else if(document.body.webkitRequestFullscreen)
          document.body.webkitRequestFullscreen();
      else if(document.body.mozRequestFullScreen)
          document.body.mozRequestFullScreen();
      else if(document.body.msRequestFullscreen)
          document.body.msRequestFullscreen();
  }else{
      if (document.exitFullscreen) 
		      document.exitFullscreen();
      else if (document.mozCancelFullScreen)
		      document.mozCancelFullScreen();
      else if (document.webkitExitFullscreen) 
		      document.webkitExitFullscreen();
      else if (document.msExitFullscreen) 
		      document.msExitFullscreen();
  }
  fullscreen = !fullscreen;
}

function resize() {
	var leftCanvas = document.getElementById("leftCanvas");
	var rightCanvas = document.getElementById("rightCanvas");
	leftCanvas.width = rightCanvas.width = window.innerWidth/ 2 - 3;
	leftCanvas.height = rightCanvas.height = window.innerHeight;
	resized = true;
}