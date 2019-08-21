// https://www.tutorialspoint.com/Graph-Data-Structure-in-Javascript#

class Point {
	constructor(x, y){
		this.x = x;
		this.y = y;
	}
	toString(){
		return "(" + this.x + ", " + this.y + ")";
	}
	equals(pt){
		return this.x == pt.x && this.y == pt.y;
	}
}

class SimpleGraph {
	constructor() {
		this.edges = {};
		this.nodes = [];
	}

	addNode(node) {
		this.nodes.push(node);
		this.edges[node] = [];
	}

	addEdge(node1, node2, weight = 1) {
		this.edges[node1].push({ node: node2, weight: weight });
		this.edges[node2].push({ node: node1, weight: weight });
	}

	addDirectedEdge(node1, node2, weight = 1) {
		this.edges[node1].push({ node: node2, weight: weight });
	}
}

class SquareGrid {
	constructor(matrix){
		this.width = matrix[0].length;
		this.height = matrix.length;
		this.matrix = matrix;
	}

	inBounds(loc){
		return loc.y >= 0 && loc.y < this.height && loc.x >= 0 && loc.x < this.width;
	}

	neighbors(loc){
		var results = [];
		var x = loc.x;
		var y = loc.y;
		var options = [new Point(x - 1, y), new Point(x + 1, y), new Point(x, y - 1), new Point(x, y + 1)];
		for (var i = 0; i < options.length; i++){
			var pt = options[i];
			if (this.inBounds(pt) && this.matrix[pt.y][pt.x] == 1) results.push(pt);
		}
		return results;
	}
}

class WeightedGrid extends SquareGrid {
	constructor(matrix){
		super(matrix);
		this.weights = {};
	}

	cost(from, to){
		if (to.y < 12) return 15;
		return (to in this.weights) ? this.weights[to] : 1;
	}
}

// https://www.redblobgames.com/pathfinding/a-star/implementation.html

class Queue {
	constructor(){
		this.elements = [];
	}

	empty(){
		return this.elements.length == 0;
	}

	put(x){
		this.elements.push(x);
	}

	get(){
		return this.elements.shift();
	}
}

class QElement {
	constructor(item, priority){
		this.item = item;
		this.priority = priority;
	}
}

class PriorityQueue extends Queue {
	constructor(){
		super();
	}

	put(item, priority){
		var q = new QElement(item, priority);
		var contain = false;
		// This can be optimized by using a heap
		for (var i = 0; i < this.elements.length; i++){
			if (this.elements[i].priority > q.priority){
				this.elements.splice(i, 0, q);
				contain = true;
				break;
			}
		}
		if (!contain) this.elements.push(q);
	}

	get(){
		return this.elements.shift().item;
	}
}
