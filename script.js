!function ($) {


var dirToString = function(dir) {
	switch(dir)
	{
		case TOP: return "TOP";
		case BOTTOM: return "BOTTOM";
		case RIGHT: return "RIGHT";
		case LEFT: return "LEFT";
	}
	return "";
}


var Block = function(x,y, maze) {
	this.x = x;
	this.y = y;
	
	this.maze = maze;
	
	this.top = null;
	this.right = null;
	this.bottom = null;
	this.left = null;
	
	this.isborder = (x == 0 || x == maze.width+1 || y == 0 || y == maze.height+1);
	this.visited = this.isborder;
	
	this.html = $('<div>')
		.addClass('block')
		.css('width',maze.blockWidth)
		.css('height',maze.blockHeight)
		.css('top', maze.blockHeight * (y-1))
		.css('left', maze.blockWidth * (x-1));
}


var Maze = function(width, height) {
	this.TOP = 1;
	this.RIGHT = 2;
	this.BOTTOM = 4;
	this.LEFT = 8;
	
	this.width = width;
	this.height = height;
	this.blockWidth = window.innerWidth/this.width;
	this.blockHeight = window.innerHeight/this.height;

	this.maze = [];
	
	for (var y=0; y<this.height+2; y++) {
		this.maze.push([]);
		for (var x=0; x<this.width+2; x++) {
			this.maze[y].push(new Block(x,y, this));
		}
	}
	for (var y=0; y<this.height+2; y++) {
		this.connectBlocks(this.getBlock(0,y), this.getBlock(1,y));
		this.connectBlocks(this.getBlock(width,y), this.getBlock(width+1,y));
	}
	for (var x=0; x<this.width+2; x++) {
		this.connectBlocks(this.getBlock(x,0), this.getBlock(x,1));
		this.connectBlocks(this.getBlock(x,height), this.getBlock(x,height+1));
	}
	
	this.html = $('.maze');
	this.dfs(this.getBlock(1,1));
	this.render();
}

Maze.prototype.getBlock = function(x,y) {
	return this.maze[y][x];
}

Maze.prototype.connectBlocks = function(a,b) {
	if (a.x == b.x) { 
		if (a.y < b.y) {
			a.bottom = b;
			b.top = a;
		}
		if (a.y > b.y) {
			a.top = b;
			b.bottom = a;
		}
	}
	if (a.y == b.y) {
		if (a.x < b.x) {
			a.right = b;
			b.left = a;
		}
		if (a.x > b.x) {
			a.left = b;
			b.right = a;
		}
	}
}

Maze.prototype.dfs = function(block) {
	if (block.visited) { return -1; }
	block.visited = true;
	var x = block.x, y = block.y;

	if (x == 2 && y == 2) {
		console.log('hihi');
	}
	
	var dirs = [];
	if (block.right == null) { dirs.push(this.RIGHT); }
	if (block.left == null) { dirs.push(this.LEFT); }
	if (block.bottom == null) { dirs.push(this.BOTTOM); }
	if (block.top == null) { dirs.push(this.TOP); }
	
	while (dirs.length > 0) {
		var idx = Math.floor(Math.random() * dirs.length);
		var dir = dirs.splice(idx, 1)[0];
		if (dir == this.TOP && !this.getBlock(x,y-1).visited) {
			this.connectBlocks(block, this.getBlock(x,y-1));
			this.dfs(this.getBlock(x,y-1));
		}
		if (dir == this.RIGHT && !this.getBlock(x+1,y).visited) {
			this.connectBlocks(block, this.getBlock(x+1,y));
			this.dfs(this.getBlock(x+1,y));
		}
		if (dir ==this.BOTTOM && !this.getBlock(x,y+1).visited) {
			this.connectBlocks(block, this.getBlock(x,y+1));
			this.dfs(this.getBlock(x,y+1));
		}
		if (dir == this.LEFT && !this.getBlock(x-1,y).visited) {
			this.connectBlocks(block, this.getBlock(x-1,y));
			this.dfs(this.getBlock(x-1,y));
		}
	}
	return 0;
}

Maze.prototype.render = function() {
	for (var y=1; y<=this.height; y++) {
		for (var x=1; x<=this.width; x++) {
			var block = this.getBlock(x,y);
			if (block.top != null) { block.html.css('border-top', 'none'); }
			if (block.right != null) { block.html.css('border-right', 'none'); }
			if (block.bottom != null) { block.html.css('border-bottom', 'none'); }
			if (block.left != null) { block.html.css('border-left', 'none'); }
			this.html.append(block.html);
		}
	}
	
	this.getBlock(1, this.height).html.text('Start');
	this.getBlock(this.width, 1).html.text('E');
}


window.maze = new Maze(32, 18);

}(jQuery);
