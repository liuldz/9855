// 全局变量
var global = {
      game_area: null,     // 拼图区域
      pics: [],            // 图片数组
      empty: null,         // 空白图片
      time: null,          // 时间控件
      step: null,          // 步数控件
      start: false,        // 是否开始游戏
      firstload: true,     // 是否首次加载
      difficulty: 1,       // 难度等级
      timeId: null         // 计时器id
}

window.onload = function () {
      if (global.firstload == true) { // 首次加载, 初始化变量
            global.firstload = false;
            global.game_area = document.getElementById('fifteen');
            global.step = document.getElementById('step');
            global.time = document.getElementById('time');
            global.difficulty = document.getElementsByTagName('select')[0];
      }
      else {   // 不是第一次加载, 移除旧的拼图
            while (global.game_area.hasChildNodes())
                  global.game_area.removeChild(global.game_area.firstChild);
      }

      // 创建拼图
      createPuzzle();

      global.empty = document.getElementById('empty');
      global.pics = document.getElementById('fifteen').children;
      for (var i = 0; i + 1 < global.pics.length; ++i) {
            // 设置点击事件监听器, 点击图片进行移动
            global.pics[i].onclick = function () {
                  if (!global.start)  // 未开始游戏, 不移动
                        return;
                  var clickPos = this.className.match(/[0-9]/g); // 被点击的图片坐标
                  var emptyPos = empty.className.match(/[0-9]/g); // 空白格的坐标
                  // 如果点击图片的坐标合法, 与空白格相邻，和空白格交换
                  if (isValid(clickPos, emptyPos)) {
                        var temp = this.className;
                        this.className = empty.className;
                        global.empty.className = temp;
                        ++global.step.innerHTML;
                        // 判断是否完成拼图
                        if (isDone())
                              success();
                  }
            };
      }

      if (global.start == true) {
            initPos(global.difficulty.selectedIndex + 1);  // 初始化图片位置
            global.time.textContent = '00:00';
            global.step.textContent = 0;
            global.timeId = setInterval(showTime, 1000);   // 定时器, 每秒执行一次
      }

      // 点击重新开始按钮, 清除定时器, 重新加载页面
      document.getElementById('restart').onclick = function () {
            clearInterval(global.timeId);
            global.start = true;
            window.onload();
      }
}

// 创建 4x4 的拼图
function createPuzzle() {
      // 先将16个存在DocumentFragment, 页面只需渲染一次, 提高性能
      var frag = document.createDocumentFragment();
      for (var i = 1; i <= 4; ++i) {
            for (var j = 1; j <= 4; ++j) {
                  if (i == 4 && j == 4) {
                        var empty = document.createElement("div");
                        empty.setAttribute('id', 'empty');
                        empty.setAttribute('class', 'row4 col4');
                        frag.appendChild(empty);
                        break;
                  }
                  var pic = document.createElement("div");
                  pic.setAttribute("id", "pic" + ((i - 1) * 4 + j));
                  pic.setAttribute("class", "row" + i + " col" + j);
                  frag.appendChild(pic);
            }
      }
      document.getElementById("fifteen").appendChild(frag);
}

// 初始化图片位置, 3 种不同难度
function initPos(difficulty) {
      var arr = [];
      if (difficulty == 1)
            arr = [10, 11, 14];
      else if (difficulty == 2)
            arr = [5, 6, 7, 9, 10, 11, 13, 14];
      else arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

      // 随机打乱数组
      arr.sort(function () {
            return Math.random() - 0.5;
      });

      // 每次交换3张图片的位置, 最后的拼图一定是可还原的
      // 难度越大, 交换的图片数越多
      for (i = 0; i < difficulty * 3; i += 3) {
            var temp = global.pics[arr[i]].className;
            global.pics[arr[i]].className = global.pics[arr[i + 1]].className;
            global.pics[arr[i + 1]].className = global.pics[arr[i + 2]].className;
            global.pics[arr[i + 2]].className = temp;
      }
}

// 显示游戏用时
function showTime() {
      var curTime = global.time.textContent.split(':'),
            min = parseInt(curTime[0]),
            sec = parseInt(curTime[1]);
      if (sec == 59) {
            ++min, sec = 0;
      }
      else {
            ++sec;
      }
      if (min < 10)
            min = '0' + min;
      if (sec < 10)
            sec = '0' + sec;
      global.time.innerHTML = min + ':' + sec
}

// 判断点击的图片坐标是否合法, 是否在空白格周围
function isValid(a, b) {
      return (a[0] == b[0] && Math.abs(a[1] - b[1]) == 1)
            || (a[1] == b[1] && Math.abs(a[0] - b[0]) == 1);
}

// 判断拼图是否完成，每个div的类名是否与位置对应
function isDone() {
      var done = true, pos = [];
      for (var i = 0; i < global.pics.length; ++i) {
            pos = global.pics[i].className.match(/[0-9]/g);
            id = global.pics[i].id.match(/[0-9]+/);
            if (id && id[0] != (pos[0] - 1) * 4 + parseInt(pos[1])) {
                  done = false;
                  break;
            }
      }
      return done;
}

// 完成拼图, 提示用时和步数
function success() {
      clearInterval(global.timeId);
      var curTime = global.time.textContent.split(':');
      var diff = global.difficulty.selectedIndex,
            str = '恭喜你通过' + global.difficulty[diff].textContent + ',用时';
      if (parseInt(curTime[0]))
            str += parseInt(curTime[0]) + '分';
      if (parseInt(curTime[1]))
            str += parseInt(curTime[1]) + '秒';
      str += ',走了' + global.step.textContent + '步\n';
      if (diff == 2)
            str += '是在下输了!';
      else
            str += '你可以继续挑战' + global.difficulty[diff + 1].textContent + '!';
      global.start = false;
      setTimeout(function () { alert(str) }, 500);
}
