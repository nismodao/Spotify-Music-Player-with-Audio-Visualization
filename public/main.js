var audioContext = new webkitAudioContext() || new AudioContext();

function init () {
  var analyser, canvas, canvasContext;
  baseAudio();
  baseCanvas();
  draw();
}

function baseAudio() {
  analyser = audioContext.createAnalyser();
  analyser.minDecibels = -85;
  analyser.maxDecibels = -10;
  analyser.smoothingTimeConstant = 0.77;
  analyser.fftSize = 2048;
  var audio = audioObject;
  audio.src = url;
  audio.crossOrigin = "Anonymous";
  var source = audioContext.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  source.mediaElement.play();
}

function draw() {
  webkitRequestAnimationFrame(draw) || requestAnimationFrame(draw);
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  var freqByteData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(freqByteData);
  var barWidth = (canvas.width /freqByteData.length)*5;
  var barHeight;
  var x = 0;
  if ($("#change").hasClass('maroon') || $("#change").hasClass('mint')) {
    canvasContext.strokeStyle = "white";  
  } else {
    canvasContext.strokeStyle = "black";  
  }
  for (var i = 0; i < freqByteData.length; i++) {
    barHeight = ((freqByteData[i] + freqByteData[i+1] + freqByteData[i+2] + freqByteData[i+3]+ 
    freqByteData[i+4]/2.5));  
    canvasContext.strokeRect(x, canvas.height - barHeight/2, barWidth, canvas.height);
    x += barWidth;
  }
}

function baseCanvas() {
  canvas = document.getElementById("here");
  canvasContext = canvas.getContext("2d");
  canvas.width = "1024";
  canvas.height = "400";
}

$("#change").on('click', function(e) {
  var target = e.target;
  var color = ["#f2f2f2", "#8ac2a2", "#ff6666", "#1ED760", "#605292"];
  if (target.classList.contains("green")) {   
    document.getElementById('here').style.background = color[0];
    target.classList.remove("green");
    target.classList.add("white");
  } else if (target.classList.contains("white")) {
    document.getElementById('here').style.background = color[1];
    target.classList.remove("white");
    target.classList.add("mint");
  } else if (target.classList.contains("mint")) {
    document.getElementById('here').style.background = color[2];
    target.classList.remove("mint");
    target.classList.add("magenta");
  } else if (target.classList.contains("magenta")) {
    document.getElementById('here').style.background = color[4];
    target.classList.remove("magenta");
    target.classList.add("maroon");
  } else {
    document.getElementById('here').style.background = color[3];
    target.classList.remove("maroon");
    target.classList.add("green");
  }
});
