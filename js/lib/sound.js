var sound = (function () {
	'use strict';
	var callback = null;
	var pool = [];
	var playing = {};
	var index = 0;
	var sounds = {};
	sound = {
		init: function (Sounds, Callback) {
			sounds = Sounds;
			callback = Callback || function () {};
			this.keys = Object.keys(sounds);
			if (!this.keys.length) return;

			for (var name in sounds) {
				var audio = document.createElement('audio');
				sounds[name].audio = audio;
				audio.style.display = 'none';
				audio.autoplay = false;
				if (sounds[name].type === 'loop') {
					audio.loop = true;
				}
				sounds[name].lastFrame = false;
				var self = this;
				audio.addEventListener('loadeddata', function () {
					index += 1;
					self.load_next(self.keys[index]);
				}, false);
			}

			// start loop
			this.load_next(this.keys[index]);
		},
		mediaPlaybackRequiresUserGesture() {
			// test if play() is ignored when not called from an input event handler
			var video = document.createElement('video');
			video.play();
			return video.paused;
		},
		removeBehaviorsRestrictions() {
			for (var name in sounds) {
				sounds[name].audio.load();
			}
			window.removeEventListener('keydown', this.removeBehaviorsRestrictions);
			window.removeEventListener('mousedown', this.removeBehaviorsRestrictions);
			window.removeEventListener('touchstart', this.removeBehaviorsRestrictions);
		},
		load_next: function (name) {
			if (index < this.keys.length) {
				console.log(index, this.keys[index]);
				sounds[name].audio.src = 'sounds/'+ name +'.wav';
			} else {
				if (this.mediaPlaybackRequiresUserGesture()) {
					window.addEventListener('keydown', this.removeBehaviorsRestrictions);
					window.addEventListener('mousedown', this.removeBehaviorsRestrictions);
					window.addEventListener('touchstart', this.removeBehaviorsRestrictions);
				}
				callback();
			}
		},
		play: function (name) {
			if (sounds[name] && sounds[name].audio) {
				if (sounds[name].type === 'overlap') {
					if (sounds[name].lastFrame) return;
					sounds[name].lastFrame = true;
					setTimeout(function () {
						sounds[name].lastFrame = false;
					}, 40);
					var id = pool.length;
					pool.push(sounds[name].audio.cloneNode());
					pool[id].play();
					pool[id].onended = function () {
						pool.splice(pool.indexOf(this), 1);
						delete this;
					}
				}
				sounds[name].audio.play();
			}
		},
		stop: function (name) {
			sounds[name].audio.pause();
			sounds[name].audio.currentTime = 0;
		},
		isPlaying: function (name) {
			if (sounds[name]) {
				if (sounds[name].audio) return !sounds[name].audio.paused || sounds[name].audio.currentTime;
				else return false;
			} else {
				return false;
			}
		}
	}
	return sound;
})();