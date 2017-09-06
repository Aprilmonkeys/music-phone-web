(function(window) {
	window.nav = function(navWrap, callback) {
		var navList = navWrap.children[0];
		transformCss(navList, 'translateZ', 0.1);
		//定义元素初始位置
		var eleY = 0;
		var startY = 0;
		//快速滑屏
		var beginValue = 0;
		var beginTime = 0;
		var endValue = 0;
		var endTime = 0;
		var disValue = 0;
		var disTime = 1;
		var Tween = {
			//滑动的中间状态是匀速
			Linear: function(t, b, c, d) {
				return c * t / d + b;
			},
			//两边回弹状态
			easeOut: function(t, b, c, d, s) {
				if(s == undefined) s = 1.70158;
				return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
			}
		};
		var timer = 0;
		navWrap.addEventListener('touchstart', function(event) {
			var touch = event.changedTouches[0];
			//即点即停
			clearInterval(timer);
			//清除过渡
			navList.style.transition = 'none';
			//元素初始位置
			eleY = transformCss(navList, 'translateY');
			startY = touch.clientY;
			beginValue = eleY;
			beginTime = new Date().getTime(); //获取当前时间
			//清空
			disValue = 0;
			if(callback && callback['start']) {
				callback['start']();
			}
		});
		//touchmove
		navWrap.addEventListener('touchmove', function(event) {
			var touch = event.changedTouches[0];
			var endY = touch.clientY;
			var disY = endY - startY;
			var translateY = disY + eleY;
			var minY = document.documentElement.clientHeight - navList.offsetHeight;
			//加判断 限制2边的临界
			var scale = 0;
			if(translateY > 0) {
				//空白 橡皮筋的效果 手指滑动的距离 和 list移动的距离
				scale = 1 - translateY / document.documentElement.clientHeight;
				translateY = translateY * scale;
			} else if(translateY < minY) {
				var over = minY - translateY;
				scale = 1 - over / document.documentElement.clientHeight
				translateY = minY - over * scale;
			};
			//元素位置确定
			transformCss(navList, 'translateY', translateY)
			// 在move里的 结束时间 结束距离
			endTime = new Date().getTime();
			endValue = translateY;
			disTime = endTime - beginTime;
			disValue = endValue - beginValue;
			if(callback && callback['move']) {
				callback['move']();
			}
		});
		//快速滑屏
		navWrap.addEventListener('touchend', function(event) {
			var touch = event.changedTouches[0];
			var speed = disValue / disTime;
			var target = transformCss(navList, 'translateY') + speed * 100;
			var minY = document.documentElement.clientHeight - navList.offsetHeight;
			//范围限定 橡皮筋回弹
			var type = 'Linear';
			if(target > 0) {
				target = 0;
				type = 'easeOut';
			} else if(target < minY) {
				target = minY;
				type = 'easeOut';
			};
			var time = 10;
			moveTween(type, target, time);
		});

		function moveTween(type, target, time) {
			//t:当前次数
			var t = 0;
			//b:元素初始位置
			var b = transformCss(navList, 'translateY');
			var c = target - b;
			var d = time / 0.2;
			clearInterval(timer);
			timer = setInterval(function() {
				t++;
				if(t > d) {
					clearInterval(timer);
					if(callback && callback['end']) {
						callback['end']();
					}
				} else {
					var point = Tween[type](t, b, c, d);
					transformCss(navList, 'translateY', point);
					//touchend
					if(callback && callback['move']) {
						callback['move']();
					}
				};
			}, 200);
		}
}
	})(window);
//全局方法可以直接调用