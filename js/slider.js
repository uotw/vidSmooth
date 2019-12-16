 //document.getElementById("myRange").value
 var vid;
 var html5Slider;
 var ticks = [];
 window.timestart = 0;
 var dragging = 0;

 function setupclip() {
 	vid = document.getElementById("clip");
 	vid.addEventListener("play", updateslider, false);
 	vid.addEventListener(
 		"loadedmetadata",
 		function() {
 			//window.duration = vid.window.duration;
      if(!window.timeend ){
 			    window.timeend = window.duration;
        }
 			getticks(window.duration);
 			loadscrubber();
 			arrowkeyscrub();
 		},
 		false
 	);
 	vid.addEventListener(
 		"ended",
 		function() {
 			//vid.load();
 			//$('#preview').click(function(){});
 			vid.pause();
 			vid.currentTime = window.timestart;
 			vid.play();
 		},
 		false
 	);
 }

 function loadscrubber() {
 	//window.tpf=2000/34329;
 	html5Slider = document.getElementById("scrubber");
 	noUiSlider.create(html5Slider, {
 		step: window.tpf,
 		margin: 0.2,
 		//limit:window.timeend,
 		tooltips: true, // [true, wNumb({ suffix: 's'}), true],
 		start: [window.timestart, window.timeend],
 		connect: true,
 		range: {
 			min: 0,
 			max: window.duration
 		}
 	});
 	html5Slider.removeAttribute('disabled');
 	html5Slider.noUiSlider.on("slide", function(values, handle) {
 		if (!vid.paused) {
 			vid.pause();
 			$("#clip").off("timeupdate");
 		}
 		$("#clip").off("timeupdate");
 		vid.currentTime = values[handle];
 		window.timestart = Number(values[0]);
 		window.timeend = Number(values[1]);
 	});
 }

 function getticks(duration) {
 	for (i = 0; i < duration; i++) {
 		ticks.push(i);
 	}
 }
 $("#previewclip").click(function() {
 	if (vid.paused) {
 		$('#previewclip').html('stop');
 		vid.currentTime = window.timestart;
 		vid.play();
 		html5Slider.noUiSlider.destroy();
 		updatescrubber();
 	} else {
 		vid.pause();
 		$('#previewclip').html('preview');
 		html5Slider.noUiSlider.destroy();
 		loadscrubber();
 	}
 });


 function updatescrubber() {
 	html5Slider = document.getElementById("scrubber");
 	var animationdur = Math.round(1000 * (window.timeend - window.timestart));
 	noUiSlider.create(html5Slider, {
 		animate: false,
 		//animationDuration: 1500, //animationdur,
 		//step: window.tpf,
 		tooltips: [false, true, false], // [true, wNumb({ suffix: 's'}), true],
 		start: [window.timestart, window.timestart, window.timeend],
 		connect: true,
 		range: {
 			min: 0,
 			max: window.duration
 		}
 	});
 	html5Slider.noUiSlider.set([window.timestart, window.timestart, window.timeend]);
 	html5Slider.noUiSlider.on("start", function(values, handle) {
 		vid.pause;
 		//html5Slider.noUiSlider.destroy();
 		//loadscrubber();
 	});
 }

 function arrowkeyscrub() {
 	$(document).keydown(function(e) {
 		if (e.which == 38) { //up
 			e.preventDefault();
 			var newtime = Number(html5Slider.noUiSlider.get()[1]) + window.tpf;
 			html5Slider.noUiSlider.set([null, newtime]);
 			vid.currentTime = html5Slider.noUiSlider.get()[1];
 			// enter pressed
 		} else if (e.which == 40) { //down
 			e.preventDefault();
 			var newtime = html5Slider.noUiSlider.get()[1] - window.tpf;
 			html5Slider.noUiSlider.set([null, newtime]);
 			vid.currentTime = html5Slider.noUiSlider.get()[1];
 		} else if (e.which == 37) { //left
 			e.preventDefault();
 			var newtime = html5Slider.noUiSlider.get()[0] - window.tpf;
 			html5Slider.noUiSlider.set([newtime, null]);
 			vid.currentTime = html5Slider.noUiSlider.get()[0];
 		} else if (e.which == 39) { //right
 			e.preventDefault();
 			var newtime = Number(html5Slider.noUiSlider.get()[0]) + window.tpf;
 			html5Slider.noUiSlider.set([newtime, null]);
 			vid.currentTime = html5Slider.noUiSlider.get()[0];
 		}
 	});
 }


 function updateslider() {
 	// if not playing, quit
 	if (vid.paused || vid.ended) return false;
 	html5Slider.setAttribute('disabled', true);

 	if (vid.currentTime >= window.timeend) {
 		vid.currentTime = window.timestart;
 		//html5Slider.noUiSlider.set([window.timestart,window.timestart,window.timeend]);
 	} else if (vid.currentTime < window.timestart) {
 		vid.currentTime = window.timestart;
 	}

 	html5Slider.noUiSlider.set([window.timestart, vid.currentTime, window.timeend]);
 	setTimeout(updateslider, 20);
 }

 $('.noUi-handle').click(function() {
 	vid.pause
 });