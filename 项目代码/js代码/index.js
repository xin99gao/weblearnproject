let pattern = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    let chess = 1;
    let hasWinner = false;

    /** 渲染棋盘 */
    function build() {
      // 获取棋盘元素
      let board = document.getElementById('board');

      board.innerHTML = '';
let circle = document.createElement('i');
          circle.classList.add('iconfont', 'icon-circle', 'blue');
          // 创建叉叉棋子
          let cross = document.createElement('i');
          cross.classList.add('iconfont', 'icon-cross', 'purple');
          // 创建空棋子
          let empty = document.createElement('i');
      // 填充棋盘
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          let cell = document.createElement('div');
          cell.classList.add('cell');

          // 创建圆圈棋子
          

          let chessIcon =
            pattern[y * 3 + x] == 2 ? cross : pattern[y * 3 + x] == 1 ? circle : empty;
          cell.appendChild(chessIcon);
          cell.addEventListener('click', () => move(x, y));
          board.appendChild(cell);
        }
      }
    }

    /**
     * 把棋子放入棋盘
     *
     *   - 先把当前棋子代号给予当前 x，y 位置的元素
     *   - 检测是否有棋子已经赢了
     *   - 反转上一个棋子的代号，并且重新渲染棋盘
     *
     * @param {Number} x x轴
     * @param {Number} y y轴
     */
    function move(x, y) {
      if (hasWinner || pattern[y * 3 + x]) return;

      pattern[y * 3 + x] = chess;

      if ((hasWinner = check(pattern, chess))) {
        tips(chess == 2 ? '❌ is the winner!' : '⭕️ is the winner!');
      }

      chess = 3 - chess;

      build();

      if (hasWinner) return;

      let result = bestChoice(pattern, chess).result;
      let chessMark = chess == 2 ? '❌' : '⭕️';
      tips(
        result == -1
          ? `${chessMark} is going to loss!`
          : result == 0
          ? `${chessMark} is going to draw!`
          : `${chessMark} is going to win!`
      );
    }

    /**
     * 插入提示
     * @param {String} message 提示文案
     */
    function tips(message) {
      let tips = document.getElementById('tips');

      tips.innerHTML = '';

      let text = document.createElement('p');
      text.innerText = message;
      tips.appendChild(text);
    }

    /**
     * 检查棋盘中的所有棋子
     *
     *  - 找出是否已经有棋子获胜了
     *  - 有三个棋子连成一线就属于赢了
     *
     * @param {Array} pattern 棋盘数据
     * @param {Number} chess 棋子代号
     * @return {Boolean}
     */
    function check(pattern, chess) {
      // 首先检查所有横行
      for (let i = 0; i < 3; i++) {
        let win = true;
        for (let j = 0; j < 3; j++) {
          if (pattern[i * 3 + j] !== chess) win = false;
        }
        if (win) return true;
      }

      // 检查竖行
      for (let i = 0; i < 3; i++) {
        let win = true;
        for (let j = 0; j < 3; j++) {
          if (pattern[j * 3 + i] !== chess) win = false;
        }
        if (win) return true;
      }

      // 检查交叉行
      // 这里用花括号 "{}" 可以让 win 变量
      // 变成独立作用域的变量，不受外面的
      // win 变量影响

      // "反斜行 \ 检测"
      {
        let win = true;
        for (let j = 0; j < 3; j++) {
          if (pattern[j * 3 + j] !== chess) win = false;
        }
        if (win) return true;
      }

      // "正斜行 / 检测"
      {
        let win = true;
        for (let j = 0; j < 3; j++) {
          if (pattern[j * 3 + 2 - j] !== chess) win = false;
        }
        if (win) return true;
      }

      return false;
    }

    /**
     * 克隆棋盘数据
     * @param {Array} pattern 棋盘数据
     * @return {Array} 克隆出来的棋盘数据
     */
    function clone(pattern) {
      return Object.create(pattern);
    }

    /**
     * 检测当前棋子是否要赢了
     *
     *   - 循环整个棋盘
     *   - 跳过所有已经有棋子的格子
     *   - 克隆棋盘数据（因为我们要让下一个棋子都走一遍所有空位的地方
     *     看看会不会赢，如果直接在原来的棋盘上模拟，就会弄脏了数据）
     *   - 让当前棋子模拟走一下当前循环到的空位子
     *   - 然后检测是否会赢了
     *
     * @param {Array} pattern 棋盘数据
     * @param {Number} chess 棋子代号
     * @return {Null|Array} 如果能检测出要赢的位置，就返回位置 [y, x]
     */
    function willWin(pattern, chess) {
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          if (pattern[y * 3 + x]) continue;
          let tmp = clone(pattern);
          tmp[y * 3 + x] = chess;
          if (check(tmp, chess)) {
            return [x, y];
          }
        }
      }
      return null;
    }

    /**
     * 找到最佳结果
     *
     *   - 结果是 -1 就是最后会输
     *   - 结果是  1 就是最后会赢
     *   - 结果是  0 就是最后会和
     *
     * @param {Array} pattern 棋盘数据
     * @param {Number} chess 棋子代号
     */
    function bestChoice(pattern, chess) {
      // 定义可以赢的位置
      let point;

      // 如果当前局面，我们已经即将要赢了
      // 我们就可以直接返回结果了
      if ((point = willWin(pattern, chess))) {
        return {
          point: point,
          result: 1,
        };
      }

      // 定义一个结果，-2 是要比 -1，0，1 要小
      // 所以是一个最差的局面，我们需要从最差的局面开始
      // 数字变得越高，我们就越有机会赢
      let result = -2;
      point = null;
      outer: for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          // 跳过所有已经有棋子的地方（因为不能在这些地方放我们的棋子了）
          if (pattern[y * 3 + x]) continue;

          // 先克隆当前棋盘数据来做预测
          let tmp = clone(pattern);

          // 模拟我们的棋子下了这个位置
          tmp[y * 3 + x] = chess;

          // 找到我们下了这个棋子之后对手的最佳结果
          let opp = bestChoice(tmp, 3 - chess);

          if (-opp.result >= result) {
            result = -opp.result;
            point = [x, y];
          }

          if (result === 1) break outer;
        }
      }

      return {
        point: point,
        result: point ? result : 0,
      };
    }

    build(pattern);