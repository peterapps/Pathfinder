// https://www.redblobgames.com/pathfinding/a-star/introduction.html

var canvas, ctx, matrix, graph, came_from;

var speed = 1;

window.addEventListener("load", function(){
	// Generate canvas
	canvas = document.createElement("canvas");
	canvas.width = 5;
	canvas.height = 1;
	document.body.appendChild(canvas);

	ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;

	document.getElementById("chooser").addEventListener("change", handleFile, false);
	if (location.hash.length > 1){
		document.getElementById("chooser").style.display = "none";
		handleFile(false);
	}

}, false);

function message(txt){
	document.getElementById("msg").innerHTML = txt;
}

function blank_map(val = 0){
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
	return new Point(Math.round(x), Math.round(y));
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
	console.log("End: (" + end.x + ", " + end.y + ")");

	traverseBreadth();
}

// https://www.redblobgames.com/pathfinding/a-star/implementation.html

// First Breadth Search
function traverseBreadth(){
	message("Calculating using First Breadth Search");
	color = "red";
	graph = new SquareGrid(matrix);

	var frontier = new Queue();
	frontier.put(start);
	came_from = {};
	came_from[start] = ' ';

	var loop = setInterval(function(){
		if (frontier.empty()){
			clearInterval(loop);
			drawRoute(color, traverseDijkstra);
			return;
		}

		var current = frontier.get();
		ctx.fillStyle = color;
		ctx.globalAlpha = 0.2;
		ctx.fillRect(current.x, current.y, 1, 1);

		if (current.equals(end)){
			clearInterval(loop);
			drawRoute("red", traverseDijkstra);
			return;
		};

		var neighbors = graph.neighbors(current);
		for (var i = 0; i < neighbors.length; i++){
			var next = neighbors[i];
			if (!(next in came_from)){
				frontier.put(next);
				came_from[next] = current;
			}
		}
	}, speed);
}

function drawRoute(color = "red", callback){
	ctx.globalAlpha = 1;
	ctx.strokeStyle = color;
	var pt = new Point(end.x, end.y);
	var i = setInterval(function(){
		ctx.beginPath();
		ctx.moveTo(pt.x, pt.y);
		pt = came_from[pt];
		ctx.lineTo(pt.x, pt.y);
		ctx.stroke();
		if (pt.equals(start)){
			console.log("Done");
			clearInterval(i);
			if (callback) callback();
		}
	}, speed);
}

// Dijkstra Search
function traverseDijkstra(){
	message("Calculated using Dijkstra search");
	color = "blue";
	graph = new WeightedGrid(matrix);

	var frontier = new PriorityQueue();
	frontier.put(start, 0);
	came_from = {};
	var cost_so_far = {};
	came_from[start] = ' ';
	cost_so_far[start] = 0;

	var loop = setInterval(function(){
		if (frontier.empty()){
			clearInterval(loop);
			drawRoute(color, traverseAStar);
			return;
		}

		var current = frontier.get();
		ctx.fillStyle = color;
		ctx.globalAlpha = 0.2;
		ctx.fillRect(current.x, current.y, 1, 1);

		if (current.equals(end)){
			clearInterval(loop);
			drawRoute(color, traverseAStar);
			return;
		};

		var neighbors = graph.neighbors(current);
		for (var i = 0; i < neighbors.length; i++){
			var next = neighbors[i];
			var new_cost = cost_so_far[current] + graph.cost(current, next);
			if (!(next in came_from) || new_cost < cost_so_far[next]){
				cost_so_far[next] = new_cost;
				priority = new_cost;
				frontier.put(next, priority);
				came_from[next] = current;
			}
		}
	}, speed);
}

// A star Search
function heuristic(a, b){
	return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function traverseAStar(){
	message("Calculated using A Star search");
	color = "yellow";
	graph = new WeightedGrid(matrix);

	var frontier = new PriorityQueue();
	frontier.put(start, 0);
	came_from = {};
	var cost_so_far = {};
	came_from[start] = ' ';
	cost_so_far[start] = 0;

	var loop = setInterval(function(){
		if (frontier.empty()){
			clearInterval(loop);
			drawRoute(color);
			return;
		}

		var current = frontier.get();
		ctx.fillStyle = color;
		ctx.globalAlpha = 0.2;
		ctx.fillRect(current.x, current.y, 1, 1);

		if (current.equals(end)){
			clearInterval(loop);
			drawRoute(color);
			return;
		};

		var neighbors = graph.neighbors(current);
		for (var i = 0; i < neighbors.length; i++){
			var next = neighbors[i];
			var new_cost = cost_so_far[current] + graph.cost(current, next);
			if (!(next in came_from) || new_cost < cost_so_far[next]){
				cost_so_far[next] = new_cost;
				priority = new_cost + heuristic(end, next);
				frontier.put(next, priority);
				came_from[next] = current;
			}
		}
	}, speed);
}
