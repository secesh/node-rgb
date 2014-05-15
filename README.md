rgb-led
=======

This project provides a communication driver, written for Node.JS, to ease the communication with
two types of WiFi LED controllers:

* WiFi370 (this is the recommended controller)
* WiFi-CON (aka MiLight aka EasyBulb - this is a cheaper controller and no longer recommended)

Both devices provide network access to an RGB LED controller. In their default state, they act
as a WiFi Access Point to provide a stand-alone wireless network. You can download a free app 
for your smartphone to control them. Both controllers can also be reconfigured to join your
existing network as a WiFi client. Operating in this mode (station mode) allows you to control
them from any host on your LAN.

With your LED controller integrated to a LAN, this package provides programmatic access 
allowing you to easily communicate with your color-changeable, dimming LED lights and 
light strips! The configuration portals of the WiFi LED controllers are not overly intuitive
and laden with bugs. We plan to document the process of reconfiguring their operating mode at
some point.

## Install

```bash
npm install rgb-led
```

## Basic Usage - WiFi 370 type controller
In this example, we will connect to the controller, turn the lights on, and set the color.

```node
var lights = require("rgb-led")
var led = require('rgb-led')
var Office = new led.wifi370('10.1.1.65')

//send arguments as: red, green, blue
//color values are 0-255.
Office.writeToLight(255, 255, 255)
```

## Advanced usage - WiFi 370 type controller
We've extended the basic example by adding a function to slowly and continuously cycle the
lights. We've also added STDIN bindings to receive key commands. Run the script from a
terminal, and you can use the arrow keys to adjust light color.

```node
/****************************************
* instantiate our lights.
* The first argument is an IP or hostname.
* The second argument is an optional name used when printing information to the console.
******************************************************************/
var led = require('rgb-led')
var Office = new led.wifi370('10.1.1.65', 'Office')
var Living = new led.wifi370('10.1.1.66', 'Living')

/**************************************
* The wifi370 controller takes three values
* representing voltage levels for red, green,
* and blue.
*
* In this block, we create an array of colors 
* that we'll use to continually and gradually
* fade the lights.
*******************************************/
var step = 1
var colors = []
//Fade red to green
for(var i=0; i<256; i+= step){
	colors.push({r: 255-i, g: i, b: 0})
}
//Fade green to blue
for(var i=0; i<256; i+= step){
	colors.push({r: 0, g: 255-i, b: i})
}
//Fade blue to red
for(var i=0; i<256; i+= step){
	colors.push({r: i, g: 0, b: 255-i})
}


var color = 0 //global variable marking our position within the colors array.
var brightness = 100 //global variable indicating the dim level.  100 is not dim.

function writeToLights(){
	//This function is a simple DRY wrapper. Brightness is an optional value.
	Office.writeToLight(colors[color].r, colors[color].g, colors[color].b, brightness)
	Living.writeToLight(colors[color].r, colors[color].g, colors[color].b, brightness)
}

function cycle(forward){
	//This function gets called continuously on an interval.  This is what 
	//keeps cycling our lights.  The forward variable indicates which
	//direction to cycle through the array; it gets used by keybindings to
	//right and left arrows for manually cycling the colors.
	if(forward){
		color++
		if(color >= colors.length) color = 0
	}else{
		color--
		if(color < 0) color = colors.length-1
	}
	
	writeToLights()
}

/***************************************
* And here's the block where we setup
* keybindings to allow manual changes
********************************************/
var stdin = process.stdin
stdin.setRawMode( true )
stdin.resume()
stdin.on( 'data', function( key ){
	if(key == '\x03'){
		//ctrl+c was pressed.
		process.exit()
	}else if(key == "\x1B\x5BC"){
		//Right arrow key was pressed; cycle forwards through the colors.
		cycle(true)
	}else if(key == "\x1B\x5BD"){
		//Left arrow key.  cycle backwards through the colors.
		cycle()
	}else if(key == "\x1B\x5BA"){
		//up arrow key.  increase the brightness level.
		if(brightness < 100) brightness += 1
		writeToLights()
	}else if(key == "\x1B\x5BB"){
		//down arrow key.  decrease the brightness level.
		if(brightness > 0) brightness -= 1
		writeToLights()
	}else{
		//we don't know what key was pressed.
		//uncomment the following to log the keypress so it can be implemented.
		//process.stdout.write( escape(key) )
	}
})

//This is the continuous interval that constantly changes the lights.
setInterval(function(){ cycle(true) }, 24000)
```

## The hardware

###WiFi-370 (preferred)
[Available on amazon](http://goo.gl/iU6QqW)

###WiFi-CON (no longer preferred)
This controller required multiple components and doesn't work as well - rather than allowing
full 0-255 RGB color values, it only provides a limited color wheel:
You need the WiFi module and a compatible LED controller. These are available from [wifiledlamp.com](http://goo.gl/vgGA6h) and they also [publish code](http://goo.gl/rw1raI).

###Lights
Need help figuring out LED lights? drop us a line.

## Thanks
We know this isn't a large project.  But we thought it was awesome fun and hope you totally
enjoy building upon this.  Tell us all about it if you like; we love to be inspired.
