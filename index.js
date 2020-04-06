function main() {

  // Inisiasi kanvas WebGL
  var leftCanvas = document.getElementById("leftCanvas");
  var rightCanvas = document.getElementById("rightCanvas");
  var leftGL = leftCanvas.getContext("webgl");
  var rightGL = rightCanvas.getContext("webgl");

  // Inisiasi verteks
  var vertices = [
    [-0.7,   0.5],      // hor1
    [-0.8,   0.4],
    [0.6,    0.4],
    [0.7,    0.5],
    [-0.9,   0.3],     // hor2
    [-1.0,   0.2],
    [0.4,    0.2],
    [0.5,    0.3]

    // horver left

    // horver right

    // s 1
    
    // s 2

    // s 3
  ];

  var colors = [
    [0.0, 0.0, 1.0],    // biru
    [0.6, 0.6, 0.6],    // abuabu
    [0.0, 0.0, 0.0],    // hitam
  ];  

    // Inisiasi verteks
  function quad(a, b, c, d) {
    var indices = [a, b, c, c, d, a];
    for (var i=0; i<indices.length; i++) {
      for (var j=0; j<3; j++) {
        if(j == 2){
          rightVertices.push(cubePoints[indices[i]][j]);
        }
        
      }
      for (var j=0; j<3; j++) {
        cubeVertices.push(cubeColors[a][j]);
      }
    }
  }
  quad(1, 2, 3, 0); // Kubus depan
  quad(2, 6, 7, 3); // Kubus kanan
  quad(3, 7, 4, 0); // Kubus atas
  quad(4, 5, 1, 0); // Kubus kiri
  quad(5, 4, 7, 6); // Kubus belakang
  quad(6, 2, 1, 5); // Kubus bawah

  // var blockPoints = [
  //   [-0.7,  0.1,   0.2],  // A
  //   [-0.8, -0.1,   0.2],  // B
  //   [0.6,  -0.1,   0.2],  // C
  //   [0.7,   0.1,   0.2],  // D
  //   [-0.7,  0.1,  -0.2],  // E
  //   [-0.8, -0.1,  -0.2],  // F
  //   [0.6,  -0.1,  -0.2],  // G
  //   [0.7,   0.1,  -0.2]   // H
  // ]

  // Inisiasi VBO (Vertex Buffer Object)
  var leftVertexBuffer = leftGL.createBuffer();
  leftGL.bindBuffer(leftGL.ARRAY_BUFFER, leftVertexBuffer);
  leftGL.bufferData(leftGL.ARRAY_BUFFER, new Float32Array(left1Vertices), leftGL.STATIC_DRAW);
  leftGL.bindBuffer(leftGL.ARRAY_BUFFER, null);
  var rightVertexBuffer = rightGL.createBuffer();
  rightGL.bindBuffer(rightGL.ARRAY_BUFFER, rightVertexBuffer);
  rightGL.bufferData(rightGL.ARRAY_BUFFER, new Float32Array(rightVertices), rightGL.STATIC_DRAW);
  rightGL.bindBuffer(rightGL.ARRAY_BUFFER, null);

  // Definisi Shaders
  var leftVertexShaderCode = `
    attribute vec2 aPosition;
    void main(void) {
      gl_Position = vec4(aPosition, -0.5, 1.0);
    }
  `
  var leftFragmentShaderCode = `
    precision mediump float;
    void main() {
      gl_FragColor = vec4(0.3, 0.3, 0.3, 1.0);
    }
  `
  var rightVertexShaderCode = `
    attribute vec3 aPosition;
    attribute vec3 aColor;
    varying vec3 vColor;
    uniform mat4 matrix;

    void main(void) {
      vColor = aColor;
      gl_Position = matrix * vec4(aPosition, 1);
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
  leftGL.vertexAttribPointer(leftPosition, 2, leftGL.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
  leftGL.enableVertexAttribArray(leftPosition);

  rightGL.bindBuffer(rightGL.ARRAY_BUFFER, rightVertexBuffer);
  var rightPosition = rightGL.getAttribLocation(rightShaderProgram, "aPosition");
  rightGL.vertexAttribPointer(rightPosition, 3, rightGL.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
  rightGL.enableVertexAttribArray(rightPosition);
  var color = rightGL.getAttribLocation(rightShaderProgram, "aColor");
  rightGL.vertexAttribPointer(color, 3, rightGL.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
  rightGL.enableVertexAttribArray(color);
  rightGL.useProgram(rightShaderProgram);
  
  // Persiapan tampilan layar dan mulai menggambar secara berulang (animasi)

  const uniformLocations = {
      matrix: rightGL.getUniformLocation(rightShaderProgram, "matrix"),
  };

  const matrix = mat4.create();
  mat4.translate(matrix, matrix, [.2, .5, 0]);
  mat4.scale(matrix, matrix, [0.25, 0.25, 0.25]);

  function render() {
    // rotateX 0.25, rotateY 0.75, translate 1.5
    // fov = 60, ncd = 1, fcd = 1
    leftGL.clear(leftGL.COLOR_BUFFER_BIT);
    leftGL.drawArrays(leftGL.TRIANGLE_FAN, 0, left1Vertices.length);
    mat4.rotateZ(matrix, matrix, Math.PI/2 /70);
    mat4.rotateX(matrix, matrix, Math.PI/2 /70);
    rightGL.uniformMatrix4fv(uniformLocations.matrix, false, matrix);
    rightGL.clear(rightGL.COLOR_BUFFER_BIT | rightGL.DEPTH_BUFFER_BIT);
    rightGL.drawArrays(rightGL.TRIANGLES, 0, 3);
    requestAnimationFrame(render);
  }

  leftGL.clearColor(0.7, 0.7, 0.7, 1.0);
  leftGL.viewport(0, (leftGL.canvas.height - leftGL.canvas.width)/2, leftGL.canvas.width, leftGL.canvas.width);
  
  rightGL.clearColor(0.0, 0.0, 0.0, 1.0);
  rightGL.enable(rightGL.DEPTH_TEST);
  rightGL.viewport(0, (leftGL.canvas.height - leftGL.canvas.width)/2, rightGL.canvas.width, rightGL.canvas.width);
  render();
}