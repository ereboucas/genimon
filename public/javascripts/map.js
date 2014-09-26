// 
// Esse código está muito feio. Precisa ser refatorado.
//

var map;
var role;
var currentRow = 0;
var currentCol = 0;
var container_name;
var cellRadius = 32;
var mapWidth = 37;
var mapHeight = 19;
var visibleDistance = 3; // Define a distancia que o jogador pode enxergar
var mapLoaded = false;

var stage;
var layer;
var cells;
var player;
var imageObj;
var arrows;
var hexagons;
var visiteds;

var pallete = [
		"#ff7f2a",
		"#ff7f2a",
		"#ffffff",
		"red",
		"green",
		"blue",
		"yellow"
];

var arrowsDirections = [
	"SE",
	"NE",
	"N",
	"NW",
	"SW",
	"S"
];

function loadMap(map_name) {
	$.ajax({
		url: 'maps/' + map_name
	}).done(function(data) {
		map = data;
		mapWidth = map["width"];
		mapHeight = map["height"];
		$('#map_title').html(map["title"]);
		for (var i in map["pallete"]) {
			pallete[i] = map["pallete"][i];
		}
		//$('#content').css('background-color', pallete[0]);
		//$('#board').css('background-color', pallete[0]);
		loadCells();
	}).fail(function(data) {
		alert('Falha ao conectar ao servidor');
	});
}

function mapSave() {
	$.ajax({
		url: '/cells/' + map_name,
		method: 'post',
		data: {
			'cells': cells
		}
	}).done(function(data) {
	});
}

function Cell(row, col) {
	this.row = row;
	this.col = col;
	this.color = pallete[1];
}

function mapX(row, col) {
	return 	1.5 * cellRadius * col + cellRadius;
}

function mapY(row, col) {
	return stage.getHeight() - 0.8660 * cellRadius - 1.7320 * cellRadius * row + 0.8660 * cellRadius * col;
}

function getCell(row, col) {
	return cells[parseInt(row) * mapWidth + parseInt(col)];
}

function getHexagon(row, col) {
	return hexagons[parseInt(row) * mapWidth + parseInt(col)];
}

function getVisited(row, col) {
	return visiteds[parseInt(row) * mapWidth + parseInt(col)];
}

function setCellColor(color) {
	cell = getCell(currentRow, currentCol);
	cell.color = color;
	hexagon = getHexagon(currentRow, currentCol);
	hexagon.setFill(color);
	layer.draw();
}

function distance(row0, col0, row1, col1) {
	var distRow = Math.abs(row1 - row0);
	var distCol = Math.abs(col1 - col0);
	var diff = Math.abs((row1 - row0) - (col1 - col0));
	return Math.max(diff, distRow, distCol);
}

function initMap(container_name) {

		// Graphics
		stage = new Kinetic.Stage({
			container: container_name,
			width: $(document).width(),
			height: $(document).height() - 60
		});
		layer = new Kinetic.Layer();
		stage.add(layer);

		// Data Structure
		hexagons = new Array();
		visiteds = new Array();
		for (var c in cells) {
			if (cells[c] != null) {
				row = parseInt(cells[c].row);
				col = parseInt(cells[c].col);
				hexagons[row * mapWidth + col] = new Kinetic.RegularPolygon({
					sides: 6,
					radius: cellRadius,
					rotationDeg: 30,
					strokeWidth: 1,
					fill: cells[c].color,
					y: mapY(row, col),
					x: mapX(row, col)
				});
				layer.add(hexagons[row * mapWidth + col]);				
			}
		}
		imageObj = new Image();
		imageObj.onload = function() {
			player = new Kinetic.Image({
				x: 0,
				y: 0,
				image: imageObj,
				width: 128,
				height: 90
			});
			layer.add(player);
			drawMap();
		}
		imageObj.src = "images/" + role + ".png";

		for (var i = 0; i < 6; i++) {
			$('.action-pallete[data-tag=' + i + ']').css('background-color', pallete[i]);
		}

		mapLoaded = true;

		// arrows = new Array();
		// for (var i = 0; i < 6; i++) {
		// 	arrows[i] = new Kinetic.RegularPolygon({
		// 		sides: 3,
		// 		radius: cellRadius * 0.2,
		// 		rotationDeg: i * 60,
		// 		strokeWidth: 1,
		// 		fill: pallete[2],
		// 		stroke: pallete[2],
		// 		name: arrowsDirections[i]
		// 	});
		// 	arrows[i].on('click', function(evt) {
		// 		eval("move" + this.getName() + "()");
		// 	});
		// 	layer.add(arrows[i]);
		// }

}

function loadCells() {

	cells = {}
	$.ajax({
		url: 'cells/' + map_name
	}).done(function(data) {
		for (var c in data) {
			cells[c] = data[c];
		}
		initMap('board');
	}).fail(function(data) {

		// Inicializa um mapa vazio

		for (var col = 0; col < mapWidth; col++) {
			for (var row = Math.floor(col / 2); row < Math.floor(col / 2) + mapHeight; row++) {
				if (row == Math.floor(col / 2) && col % 2 == 1)
					row = row + 1;
				var cell = new Cell(row, col); 
				cells[row * mapWidth + col] = cell;
			}
		}
		initMap('board');
	});
}

function drawMap() {

	for (var c in cells) {

		if (cells[c] != null) {

			var row = parseInt(cells[c].row);
			var col = parseInt(cells[c].col);

			var y = mapY(row, col);
			var x = mapX(row, col);

			//var color = (row == currentRow && col == currentCol ? 'lightblue' : pallete[1]);
			var color = cells[c].color;

			var hexagon = getHexagon(row, col);
			var visited = getVisited(row, col);

			if (row == currentRow && col == currentCol) {

				// for (var i = 0; i < 6; i++) {
				// 	arrows[i].setPosition(x + 1.2 * cellRadius * Math.cos(i / 3 * Math.PI - Math.PI / 6), y - 1.2 * cellRadius * Math.sin(i / 3 * Math.PI - Math.PI / 6));
				// }

				player.setX(x - cellRadius * 0.8660);
				player.setY(y - 0.80 * cellRadius);
				player.scale({x: cellRadius / 64.0, y: cellRadius / 64.0});
				player.show();

				visiteds[row * mapWidth + col] = true;
			}

			if (role == "engineer" || role == 'coach') {
				if (row == currentRow && col == currentCol) {
					hexagon.setOpacity(0.8);
				} else {
					hexagon.setOpacity(1.0);
				}
			} else {
				d = distance(currentRow, currentCol, row, col)
				if (visited) {
					hexagon.setOpacity(1.0);
				} else if (d <= visibleDistance) {
					hexagon.setOpacity(1.0 - d / visibleDistance);
				} else {
					hexagon.setOpacity(0.0);
				}
			}
			// for (var i = 0; i < 6; i++) {
			// 	arrows[i].setPosition(stage.getWidth() - 100  + 64 * Math.cos(i / 3 * Math.PI - Math.PI / 6), stage.getHeight() - 100 - 64 * Math.sin(i / 3 * Math.PI - Math.PI / 6));
			// }

			hexagon.setX(x);
			hexagon.setY(y);

			hexagon.setRadius(cellRadius);
			hexagon.setStroke(pallete[2]);

			hexagon.draw();

			// Setting events

			/*
			// should disable first
			hexagon.off('mousedown tap');

			if (row == currentRow + 1 && col == currentCol) {
				hexagon.on('mousedown tap', function() {
-					moveN();
				});
			} else if (row == currentRow + 1 && col == currentCol + 1) {
				hexagon.on('mousedown tap', function() {
					moveNE();
				});			
			} else if (row == currentRow && col == currentCol + 1) {
				hexagon.on('mousedown tap', function() {
					moveSE();
				});			
			} else if (row == currentRow - 1 && col == currentCol) {
				hexagon.on('mousedown tap', function() {
					moveS();
				});			
			} else if (row == currentRow - 1 && col == currentCol - 1) {
				hexagon.on('mousedown tap', function() {
					moveSW();
				});		
			} else if (row == currentRow && col == currentCol - 1) {
				hexagon.on('mousedown tap', function() {
					moveNW();
				});		
			}
			*/

		}

	}

	stage.draw();

}

function moveN() {
	currentRow = Math.min(currentRow + 1, Math.floor(currentCol / 2) + mapHeight - 1);
	drawMap();
}

function moveNE() {
	currentCol = Math.min(currentCol + 1, mapWidth - 1);
	currentRow = Math.min(currentRow + 1, Math.floor(currentCol / 2) + mapHeight - 1);
	drawMap();
}
function moveSE() {
	currentCol = Math.min(currentCol + 1, mapWidth - 1);
	drawMap();
}
function moveS() {
	currentRow = Math.max(currentRow - 1, Math.floor(currentCol / 2) + currentCol % 2);
	drawMap();
}
function moveSW() {
	currentCol = Math.max(currentCol - 1, 0);
	currentRow = Math.max(currentRow - 1, Math.floor(currentCol / 2) + currentCol % 2);
	drawMap();
}
function moveNW() {
	currentCol = Math.max(currentCol - 1, 0);
	drawMap();
}

function zoomIn() {
	cellRadius = Math.min(cellRadius + 4, 64);
	drawMap();
}

function zoomOut() {
	cellRadius = Math.max(cellRadius - 4, 16);
	drawMap();
}

$(document).ready(function() {

	$('.action-menu').click(function() {
		window.location.href = 'index.html';
	});

	$('.action-pallete').click(function() {
		setCellColor(pallete[$(this).data('tag')]);
	});

	$('.action-upload').click(function() {
		mapSave();
	});

	$('#zoom_in').click(function() {
		zoomIn();
	});

	$('#zoom_out').click(function() {
		zoomOut();
	});

	$(window).resize(function() {
		if (mapLoaded) {
			stage.setWidth($(window).width());
			stage.setHeight($(window).height() - 60);
			drawMap();
		}
	});


	$(document).keydown(function(ev) {

		switch(ev.which) {
			case 81:  // q
				moveNW();
				break;
			case 38:  // up-arrow
			case 87:  // w
				moveN();
				break;
			case 39:  // right-arrow
			case 69: // e
				moveNE();
				break;
			case 37: // left-arrow
			case 65: // a
				moveSW();
				break;
			case 40: // down-arrow
			case 83: // s
				moveS();
				break;
			case 68: // d
				moveSE();
				break;
			case 187: // +
				zoomIn();
				break;
			case 189: // -
				zoomOut();
				break;
			case 49:
				setCellColor(pallete[0]);
				break;
			case 50:
				setCellColor(pallete[1]);
				break;
			case 51:
				setCellColor(pallete[2]);
				break;			
			case 52:
				setCellColor(pallete[3]);
				break;			
			case 53:
				setCellColor(pallete[4]);
				break;			
			case 54:
				setCellColor(pallete[5]);
				break;			
			default:
		};

	});

	role = localStorage.getItem('role');

	if (role != 'engineer') {
		$('.action-pallete').hide();
		$('.action-upload').hide();
	}

	map_name = localStorage.getItem('map');

	loadMap(map_name);

});
