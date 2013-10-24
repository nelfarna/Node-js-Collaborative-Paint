
$(function() { 
	var socket = io.connect(window.location.hostname);
	var canvas = document.getElementById('drawCanvas');
	var context = canvas.getContext('2d');
	var timePrev = $.now();
	var lColor = "blue";
	var lWidth = 10;
	var bgColor = "gainsboro";
	var erasing = false;

	canvas.height = 600;
	canvas.width = 600;

	init();

	function drawSegment(x1, y1, x2, y2, lineColor, lineWidth) {
	    context.beginPath();
	    context.moveTo(x1, y1);

	    context.quadraticCurveTo(x1, y1, x2, y2);
	    context.lineWidth = lineWidth;
	    context.lineCap = "round";
	    context.strokeStyle = lineColor;
	    context.stroke();
	    context.closePath();
	}


	canvas.onmousedown = canvas.ontouchstart = function (event) {
	    
	    var originX = (event.clientX || event.touches[0].pageX) - canvas.offsetLeft;
	    var originY = (event.clientY || event.touches[0].pageY) - canvas.offsetTop;
	    
	    canvas.onmousemove = canvas.ontouchmove = function (event) {
	        event.preventDefault();
	        
	        var newX = (event.clientX || event.touches[0].pageX) - canvas.offsetLeft;
	        var newY = (event.clientY || event.touches[0].pageY) - canvas.offsetTop;

	        drawSegment(originX, originY, newX, newY, lColor, lWidth);

	        if(($.now() - timePrev) > 10) {  // emit every 10ms
	        	
	        	socket.emit('draw', 
	        		{
	        			'x1': originX,
	        			'y1': originY,
	        			'x2': newX,
	        			'y2': newY,
	        			'color': lColor,
	        			'width': lWidth,
	        			'erase': erasing
	        		}
	        	);

	        	timePrev = $.now();
	        }
	        originX = newX;
	        originY = newY;

	    }
	    
	    canvas.onmouseup = canvas.onmouseout = canvas.ontouchend = function (e) {
	        canvas.onmousemove = canvas.ontouchmove = null; 
	    };
	    
	};

	socket.on('drawing', function(data) {
		var col = (data.erase) ? bgColor : data.color;
		drawSegment(data.x1, data.y1, data.x2, data.y2, col, data.width);
	});

	 socket.on('redraw', function(data) { 
	 	var col;
		for(var i = 0; i < data.length; i++) {
			col = (data[i].erase) ? bgColor : data[i].color;
			drawSegment(data[i].x1, data[i].y1, data[i].x2, data[i].y2, col, data[i].width);
		}	

	 });

	 socket.on('clearcanvas', function() {
	 	clearCanvas();
	 });

	 socket.on('clients', function(data) {
	 	$('#clients').empty();
	 	$('#clients').append("Users: " + data);
	 	 $("#clients").animate({
			color: "#990000",
			fontSize: 19
			}, 300, function() {
				$("#clients").animate({
				color: "#777777",
				fontSize: 12
				}, 300);
			});
	        
	    
	 });

	 $('span').click(function(event) {
	    if(event.target.id === 'erase') {
	    	lColor = bgColor;
	    	erasing = true;
	    } else if (event.target.id === 'reset') {
	    	clearCanvas();
	 		socket.emit('reset');
	    } else {
	   		lColor = event.target.id;
	   		erasing = false;
	   	}
	    $(this).closest('ul').find('span').not($(this))
	       .removeClass('selected');
	    $(this).addClass('selected');
	 });

	 $('a').click(function(event) {
	    if(event.target.id.slice(0, 2) == 'wd') {
	   	   lWidth = event.target.id.substr(2);
	   	   $(this).closest('ul').find('a').not($(this)).removeClass('selected');
	   	   $(this).addClass('selected');
	    } else {
	    	bgColor = event.target.id;
	    	if(erasing) {
				lColor = bgColor;
			}
	    	resetBackground();
	    	socket.emit('refresh');
	    } 

	 });


	 function clearCanvas () {
	 	context.clearRect(0, 0, canvas.width, canvas.height);
		resetBackground();
	 }

	 function resetBackground () {
	 	context.fillStyle = bgColor;
		context.fillRect(0,0,canvas.width,canvas.height);
		
	 }

	 function init () {
	 	clearCanvas();
	 	lColor = "blue";
		lWidth = 10;
	 	$("#blue").addClass('selected');
	    $("#w10").addClass('selected');
	    context.strokeStyle = lColor;
	 }
	 
	                
});            




