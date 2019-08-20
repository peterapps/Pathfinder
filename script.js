// https://www.redblobgames.com/pathfinding/a-star/introduction.html

var canvas, ctx, matrix, visited, came_from, start, end;

var speed = 20;

window.addEventListener("load", function(){
	// Generate canvas
	canvas = document.createElement("canvas");
	canvas.width = 5;
	canvas.height = 1;
	document.body.appendChild(canvas);

	ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;

	document.getElementById("chooser").addEventListener("change", handleFile, false);
	if (location.hash.length > 1) handleFile(false);

}, false);

function message(txt){
	document.getElementById("msg").innerHTML = txt;
}

function blank_map(val){
	var arr = [];
	for (var i = 0; i < canvas.height; i++){
		var row = [];
		for (var j = 0; j < canvas.width; j++){
			row.push(val);
		}
		arr.push(row);
	}
	return arr;
}

function handleFile(event){
	var img = new Image();
	img.addEventListener("load", function(){
		// Draw image
		var width = img.naturalWidth;
		var height = img.naturalHeight;
		canvas.width = width;
		canvas.height = height;
		ctx.drawImage(img, 0, 0, width, height);
		// Create map matrix
		var data = ctx.getImageData(0, 0, width, height);
		matrix = blank_map(0);
		for (var i = 0; i < data.data.length; i += 4){
			// Figure out value
			var gray = "128, 128, 128"; // Gray is (128, 128, 128)
			var green = "32, 192, 64"; // Green is (32, 192, 64)
			var r = data.data[i];
			var g = data.data[i + 1];
			var b = data.data[i + 2];
			var a = data.data[i + 3];
			var color = [r, g, b].join(", ");
			// Find coordinates on map
			var pixel_num = i / 4;
			var row = Math.floor(pixel_num / width);
			var col = pixel_num % width;
			matrix[row][col] = (color == gray) ? 1 : 0;
		}
		// Next step
		message("Click on a starting point in the gray");
		canvas.addEventListener("click", handleStart, false);
	}, false);
	if (event) img.src = URL.createObjectURL(event.target.files[0]);
	else img.src = location.hash.substring(1);
}

function getCursor(event){
	var rect = canvas.getBoundingClientRect();
	var x = (event.clientX - rect.left) * canvas.width / canvas.offsetWidth;
	var y = (event.clientY - rect.top) * canvas.height / canvas.offsetHeight;
	return {"x": Math.round(x), "y": Math.round(y)};
}

function handleStart(event){
	start = getCursor(event);
	canvas.removeEventListener("click", handleStart, false);
	ctx.fillStyle = "blue";
	ctx.fillRect(start.x, start.y, 1, 1);
	console.log("Start: (" + start.x + ", " + start.y + ")");
	message("Click on an ending point");
	canvas.addEventListener("click", handleEnd, false);
}

function handleEnd(event){
	end = getCursor(event);
	canvas.removeEventListener("click", handleEnd, false);
	ctx.fillStyle = "blue";
	ctx.fillRect(end.x, end.y, 1, 1);
	message("Calculating");
	console.log("End: (" + end.x + ", " + end.y + ")");
	checkEverywhere();
	message("Drawing route");
	drawRoute();
}

function checkEverywhere(){
	visited = blank_map(0);
	came_from = blank_map([0,0]);
	// Recursively visit each neighbor
	checkNeighbors(start.x, start.y, [0, 0]);
}

var RIGHT = [1, 0];
var LEFT = [-1, 0];
var UP = [0, -1];
var DOWN = [0, 1];

function isValid(c, r){
	return r >= 0 && r < matrix.length && c >= 0 && c < matrix[0].length;
}

function checkNeighbors(c, r, dir){
	if (!isValid(c, r)) return; // Out of bounds
	if (matrix[r][c] === 0) return; // Not road
	if (visited[r][c] > 0) return; // Already visited
	console.log("Checking: (" + c + ", " + r + ")");
	visited[r][c] += 1;
	ctx.fillStyle = "rgba(255,255,255,0.2)";
	ctx.fillRect(c, r, 1, 1);
	came_from[r][c] = dir;
	if (c == end.x && r == end.y) return; // Done searching
	checkNeighbors(c, r + 1, UP);
	checkNeighbors(c, r - 1, DOWN);
	checkNeighbors(c - 1, r, RIGHT);
	checkNeighbors(c + 1, r, LEFT);
}

function drawRoute(){
	ctx.strokeStyle = "red";
	var x = end.x;
	var y = end.y;
	console.log("Calcuating route");
	console.log(came_from);
	var shift = 1;
	var i = setInterval(function(){
		ctx.strokeStyle = "rgb(" + (255 * shift) + ",0," + (128 * (1 - shift)) + ")";
		shift *= 0.993;
		if (shift < 0) shift = 1;
		ctx.beginPath();
		ctx.moveTo(x, y);
		dir = came_from[y][x];
		console.log(dir);
		console.log("From (" + x + ", " + y + ") to (" + (x + dir[0]) + ", " + (y + dir[1]) + ")");
		x += dir[0];
		y += dir[1];
		ctx.lineTo(x, y);
		ctx.stroke();
		if ((x == start.x && y == end.y) || (dir[0] == 0 && dir[1] == 0)){
			console.log("Done");
			clearInterval(i);
		}
	}, speed);
}
