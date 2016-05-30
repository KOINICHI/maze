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

var Item = function(block, character, type) {
	this.block = block;
	this.character = character;
	this.type = type;
	
	var font_size = Math.floor(Math.min(block.maze.blockWidth, block.maze.blockHeight) / 1.5);
	this.html = $('<div>')
		.addClass('item')
		.addClass(type)
		.text(character)
		.css('font-size', font_size)
		.css('line-height', block.maze.blockHeight + 'px');
}

Item.prototype.placeAt = function(block) {
	if (block == null) { return; }
	if (block.isborder) { return; }
	this.block.html.find(this.type).remove();
	this.block = block;
	this.block.html.html(this.html);
}

function Player(block, character) {
	Item.call(this, block, character, 'player');
	var that = this;
}
Player.prototype = Object.create(Item.prototype);
Player.constructor = Player;

function Goal(block, character) {
	Item.call(this, block, character, 'goal');
}
Goal.prototype = Object.create(Item.prototype);
Goal.constructor = Goal;

var Maze = function(width, height) {
	var that = this;
	
	this.TOP = 1;
	this.RIGHT = 2;
	this.BOTTOM = 4;
	this.LEFT = 8;
	
	this.width = width;
	this.height = height;
	this.blockWidth = Math.floor((window.innerWidth)/this.width);
	this.blockHeight = Math.floor((window.innerHeight)/this.height); // 4 for maze border
	
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
	
	this.html = $('<div>')
		.addClass('maze')
		.css('width', this.blockWidth * this.width)
		.css('height', this.blockHeight * this.height)
		.css('left', Math.floor((window.innerWidth - (this.blockWidth * this.width))/2))
		.css('top', Math.floor((window.innerHeight - (this.blockHeight * this.height))/2));
		
	this.dfs(this.getBlock(1,1));
	
	this.player = new Player(this.getBlock(1, this.height), '\u2B24');
	this.goal = new Goal(this.getBlock(this.width, 1), '\u2605');
	this.items = [];
	
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
	this.player.placeAt(this.getBlock(1, this.height));
	this.goal.placeAt(this.getBlock(this.width, 1));
	$('#maze-wrapper').html(this.html);
}



var blockSize = 80;
window.maze = new Maze(Math.floor(window.innerWidth / blockSize) , Math.floor(window.innerHeight / blockSize));

$(window).on('keydown', function(e) {
	var LEFT = 37, TOP = 38, RIGHT = 39, BOTTOM = 40;
	var player = this.maze.player;
	var goal = this.maze.goal;
	switch (e.which)
	{
		case LEFT   : player.placeAt(player.block.left);   break;
		case TOP    : player.placeAt(player.block.top);    break;
		case RIGHT  : player.placeAt(player.block.right);  break;
		case BOTTOM : player.placeAt(player.block.bottom); break;
	}
	if (player.block == goal.block) {
		blockSize = Math.max(20, blockSize-10);
		var x = Math.floor(window.innerWidth / blockSize);
		var y = Math.floor(window.innerHeight / blockSize);
		this.maze = new Maze(x, y);
	}
});

}(jQuery);
