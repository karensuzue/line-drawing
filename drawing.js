"use strict";
var gl;
const MAX_POINTS = 50;
var color_palette = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

var total_points = 0;
var color_value;

var mouseX = 0;
var mouseY = 0;
var current_coord = null;
var has_moved = false;

var vBuffer;
var cBuffer;

window.onload = function init() {
    color_value = color_palette[0];

    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MAX_POINTS * sizeof['vec2'], gl.STATIC_DRAW);
    /*
        Setup the size of the buffer to hold MAX_POINTS number of vec2 objects (for vertices).
        Hint: You can find the size of the types using the sizeof dictionary from MV.js
    */

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MAX_POINTS * sizeof['vec4'], gl.STATIC_DRAW);

    /*
        Setup the size of the buffer to hold MAX_POINTS number of vec4 objects (for color).
        Hint: You can find the size of the types using the sizeof dictionary from MV.js
    */

    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    /*
        Add listeners for mouse actions and the dropdown list
        Make sure that when the page is refreshed, the dropdown list
        is set to the first value in the list.
    */

    canvas.addEventListener('click', function(event) {        
        var coord = vec2(event.clientX, event.clientY);
        var clip_coord = to_clip(coord, canvas);
        
        if (total_points <= MAX_POINTS) {
            gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec2'] * total_points, flatten(clip_coord));

            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, sizeof['vec4'] * total_points, flatten(color_value));

            has_moved = false;

            total_points++;
        }
    });

    var dropdown = document.getElementById("colors");
    dropdown.addEventListener('change', function(event) {
        var color = event.target.value;
        if (color == "black") {
            color_value = color_palette[0];
        }

        if (color == "red") {
            color_value = color_palette[1];
        }

        if (color == "yellow") {
            color_value = color_palette[2];
        }

        if (color == "green") {
            color_value = color_palette[3];
        }

        if (color == "blue") {
            color_value = color_palette[4];
        }

        if (color == "magenta") {
            color_value = color_palette[5];
        }

        if (color == "cyan") {
            color_value = color_palette[6];
        }
 
    });

    canvas.addEventListener("mousemove", function(event) {
        mouseX = event.clientX;
        mouseY = event.clientY;

        current_coord = to_clip(vec2(mouseX, mouseY), canvas);
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, total_points * sizeof['vec2'], flatten(current_coord));

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, total_points * sizeof['vec4'], flatten(color_value));

        has_moved = true;

    });

    render();
}


function clear_screen() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    current_coord = null;
    total_points = 0;
    has_moved = false;

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MAX_POINTS * sizeof['vec2'], gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MAX_POINTS * sizeof['vec4'], gl.STATIC_DRAW);

}


function to_clip(coord, canvas) {
    /*
        Helper function to convert the mouse coordinates from javascript to clip coordinate space.
        Hint: check the book and the textbook examples on github
    */
   var clip_coord = vec2(2 * coord[0]/canvas.width - 1, 
    2 * (canvas.height - coord[1])/canvas.height - 1);

    return clip_coord;
}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    /*
        Add logic for rendering lines and the cursor point.
        Use the techniques shown in class to have the function 
        render multiple times to show an animation.
    */
    if (has_moved) {
        var temp = total_points + 1; // exclude the cursor point
        gl.drawArrays(gl.LINE_STRIP, 0, temp); // 0 to current number of points added
        gl.drawArrays(gl.POINTS, total_points, 1);
    }
    else {
        gl.drawArrays(gl.LINE_STRIP, 0, total_points);
    }    

    window.requestAnimationFrame(render);
}