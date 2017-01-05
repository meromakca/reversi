/*　オセロを作る！　*/

/* DOMの解釈が終わったら実行
window.addEventListener("DOMContentLoaded", function() { }, false);  */

/* windowが読み込まれたら？実行
window.onload = function() { }  */

/* windowが読み込まれたら？実行2
window.addEventListener("load", function() { }, false);  */

//  windowが読み込まれたら実行 上書きされない
window.addEventListener("load", function() {
		let canvas = document.getElementById("canvas_board");
		if (canvas.getContext) {
				draw_line();
				//canvas要素に対してイベントを設定
				format(board);
				draw_board(board);
				canvas.addEventListener("click", canvasClick, false);
		} else {
				alert("使えない機能です");
		}
}, false);

var board = new Array(8*8);

//配列を初期位置に初期化
function format(board) {
		let stone = new Stone("white");
		for (let i=0; i<board.length; i++) {
				board[i] = stone.empty;
		}
		board[3*8 + 3] = stone.white;
		board[3*8 + 4] = stone.black;
		board[4*8 + 4] = stone.white;
		board[4*8 + 3] = stone.black;
}

var kaisuu = 0;

//canvasがクリックされたら
function canvasClick(e) {
		//クリックされた要素の配列の番号を調べる
		let index = getArrayIndex(e);
		//console.log("配列番号は" + index + "です");

		let stone;
		if (kaisuu%2 == 0) {
				stone = new Stone("white");
		} else {
				stone = new Stone("black");
		}
		console.log("kaisuu=" + kaisuu);
		//すでに石が置かれていないか
		if (board[index] != stone.empty) { return; }

		//置けるか9方向調べる
		let flog = false;
		for (let iy=-1; iy<=1; iy++) {
				for (let ix=-1; ix<=1; ix++) {
						if (ix==0 && iy==0) { continue; }
						let i = index + iy*8 + ix;
						if (board[i] == stone.empty) {
								continue;
						} else if (board[i] == stone.mine) {
								continue;
						} else if (board[i] == stone.rival) {
								//ここに置いた時、自分の色で挟めるか
								let numbers = getFlipNumbers(ix, iy, index, stone);
								//挟めるなら挟んだ石を自分の色に変える
								if (numbers > 0) {
										setBoard(ix, iy, index, stone, numbers);
										flog = true;
								}
						}
				}
		}
		if (flog) { kaisuu++; }
		if (kaisuu%2 == 0) {
				document.getElementById("junban").innerHTML = "白の番です";
		} else {
				document.getElementById("junban").innerHTML = "黒の番です";
		}
		//盤を描画する
		draw_board(board);
}

//受け取った数だけ配列に入れる
function setBoard(ix, iy, index, stone, numbers) {
		let i = index;
		for (let n=0; n<=numbers; n++) {
				board[i] = stone.mine;
				i = i + iy*8 + ix;
		}
}

//ここに置いた時、自分の色で挟めるか
function getFlipNumbers(ix, iy, index, stone) {
		//はみ出し判定　横に行き過ぎないようにする。
		const IndexX = index%8;
		const IndexY = Math.floor(index/8);

		let distance = getDistance_xy(index);
		let endX = distance.distanceX;
		let endY = distance.distanceY;

		let i = index + iy*8 + ix;
		var numbers = 0;
		while (true) {
				if (i<0 || i>=64) {
						return 0;
				}

				if (board[i] == stone.rival) {
						numbers++;
						i = i + iy*8 + ix;
						endX = endX + ix;
						endY = endY + iy;
				} else if (board[i] == stone.empty) {
						console.log("置けません");
						return 0;
				} else if (board[i] == stone.mine) {
						//挟める
						console.log("置けるはずです");
						return numbers;
				}

				if (endX <= 0 && ix == -1 || 7 < endX && ix == 1) { return 0; }
				if (endY <= 0 && iy == -1 || 7 < endY && iy == 1) { return 0; }
		}
}

//値から距離xとyを返す
function getDistance_xy (index) {
		let x = index%8;
		let y = Math.floor(index/8);
		return {
				distanceX: x,
				distanceY: y
		};
}

//クリックされた位置がどのインデックスか調べる
function getArrayIndex(e) {
		let rect = e.target.getBoundingClientRect();
		let x = e.clientX - rect.left;
		let y = e.clientY - rect.top;

		console.log("x=" + Math.floor(x/52) + "の");
		console.log("y=" + Math.floor(y/52) + "がクリックされました。");
		return Math.floor(y/52)*8 + Math.floor(x/52);
}


//石
var Stone = function(mine) {
		if (!(this instanceof Stone)) {
				return new Stone();
		}
		//駒の種類
		this.empty = "空";
		this.white = "白";
		this.black = "黒";

		self = this;
		this.mine = self[mine];
		this.rival = self.empty;
		if (self.mine == self.white) {
				self.rival = self.black;
		} else {
				self.rival = self.white;
		}
}


/*　canvasにboardの状態を描画
 *　引数：board配列
 *　戻り：なし	*/
function draw_board(board) {
		let canvas = document.getElementById("canvas_board");
		let context = canvas.getContext("2d");
		//canvas クリア
		context.clearRect(0, 0, 418, 418);

		//線を描画
		draw_line();

		//石を描画
		let stone = new Stone();
		for (let iy=0; iy<8; iy++) {
				for (let ix=0; ix<8; ix++) {
						let place = ix + iy*8;
						if (board[place] == stone.empty) {
								continue;
						} else if (board[place] == stone.white) {
								context.fillStyle = "rgb(255, 255, 255)";
						} else if (board[place] == stone.black) {
								context.fillStyle = "rgb(0, 0, 0)";
						}
						let x = ix*50 + ix*2 + 26;
						let y = iy*50 + iy*2 + 26;
						context.beginPath();
						context.arc(x, y, 20, 0, Math.PI*2, false);
						context.fill();
				}
		}
}

//盤の線を描画する
function draw_line() {
		let canvas = document.getElementById("canvas_board");
		let context = canvas.getContext("2d");

		for (let i=0; i<9; i++) {
				let x = i*50 + i*2 + 1;
				context.beginPath();
				context.moveTo(x, 0);
				context.lineTo(x, 418);
				context.stroke();
				let y = i*50 + i*2 + 1;
				context.beginPath();
				context.moveTo(0, y);
				context.lineTo(418, y);
				context.stroke();
		}
}

