/********************************************************************************
Copyright 2014 Savannah Scriptworks (savsw.org)
This file is part of node-rgb (http://github.com/savsw/node-rgb/).

    node-rgb is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    node-rgb is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with node-rgb.  If not, see <http://www.gnu.org/licenses/>.

Authors:
    Secesh aka Matthew R Chase (matt@chasefox.net)
********************************************************************************/

exports.wifiCon = function(){
	/*******************************************
	* This module provides control of the miLight type WiFi LED controller.
	* We prefer the WiFi370 controller and do not recommend this.
	* Please see the readme for more details about the controllers.
	***************************************************/
	var dgram = require('dgram')
	var sendMessage = function(command, value, callback, id){
		/*****************************
		This function sends a message to the superbrightleds.com WiFi-CON.  Reverse-engineering of the protocol
		discovered that it responds to three byte UDP messages.  The first byte is the command to perform.  The
		second byte is the value to send with the command.  The third byte is always the same, and therefore
		appears to act as an endOfTransmission flag.

			Arguments:
		    	command  : a decimal value.
		    	value    : a decimal value to be sent with the command.
		    	id       : optional value used to identify the message.  Can be used for
		    	           tracking the message through the asynchronous transmission process.
		    	callback : optional function will be called when sending is complete.  Callback will be called
		    	           with two arguments.  The first being any error returned by the datagram.send function,
		    	           the second being the optional id value.
		************************************************************************************************************/
	 	if(!HOST) return callback("Host address of WiFi-CON not set.  Before sending commands, you must call the setHost function.")
	 	var etx = 85 //hex value 55
		
		var m = new Buffer([command, value, etx])
		var socket = dgram.createSocket("udp4")
		socket.send(m, 0, m.length, PORT, HOST, function(e,b){
			//http://nodejs.org/api/dgram.html#dgram_socket_send_buf_offset_length_port_address_callback
			//It appears the second argument is the number of bytes sent.  I'm not sure what purpose it
			//serves, though.
			socket.close()
			if(callback) callback(e, id)
	    })
	}

	var PORT = 5577, HOST = "192.168.1.100"
	//when calling setHost, the argument should be a string.  The value can be either an IP address or a host name.
	this.setHost   = function(host){ HOST = host }

	var colors = {
	    "blue"       : 0,
	    "light blue" : 50,
	    "teal"       : 80,
	    "green"      : 100,
	    "yellow"     : 140,
	    "orange"     : 170,
	    "red"        : 180,
	    "purple"     : 190,
	    "pink"       : 200
	}
	this.mixColor  = function(string, decimal){
	    /******************************************
	     * this function enables you to create or overwrite predefined color strings. With color strings, you can say
	     * lights.setColor("red") instead of having to remember red is 180.  This function allows you to say:
	     * lights.mixColor("awesome", 237) if that's what you want.
	     * 
	     * This function takes two arguments; the first is the label for the second argument, which is the value of 
	     * the color.  It's called "decimal" because it's a base-10 integer, not because it's a floating point number.
	     **************************************************************************/
	    colors[string] = decimal
	}
	this.setColor  = function(color, callback, id){
	    if(typeof(color) == "string" && color in colors) color = colors[color]
	    if(!parseInt(color) === color) return console.trace("improper argument (" + color + ") supplied to setColor function with id: " + id)
	    sendMessage(32,color,callback,id)
	}

	this.turnOff   = function(callback, id){ sendMessage(33,00,callback,id) }
	this.turnOn    = function(callback, id){ sendMessage(34,00,callback,id) }
	this.brighten  = function(callback, id){ sendMessage(35,00,callback,id) }
	this.dim       = function(callback, id){ sendMessage(36,00,callback,id) }
	this.speedUp   = function(callback, id){ sendMessage(37,00,callback,id) }
	this.speedDown = function(callback, id){ sendMessage(38,00,callback,id) }
	this.modeUp    = function(callback, id){ sendMessage(39,00,callback,id) }
	this.modeDown  = function(callback, id){ sendMessage(40,00,callback,id) }
}

exports.wifi370 = function(ip, name){
	/*******************************************
	* This module provides control of the WiFi370 type LED controller.
	* We prefer this controller and recommend it.
	* Please see the readme for more details about the controllers.
	***************************************************/
	var net = require('net')
	var CONNECT = new Buffer([0, 1, 1, 3, 3, 7])
	var PORT = '5577' //the default port can be changed in the STA settings of the LED controller

	var controller = {
		socket: new net.Socket(),
		state : "init",
		connect: function(){ controller.socket.connect(PORT, ip) }
	}
	controller.socket.on("error", function(){ controller.state = "error" })
	controller.socket.on("close", function(){ controller.state = "close" })
	controller.socket.on("connect", function(){ 
		controller.state = "ready" 
		controller.socket.write(CONNECT)
		console.log((name || ip) + " is connected")
	})

	this.writeToLight = function(re,gr,bu,br){
		br = br || 100 //default brightness level is 100%
		/**********************************************************
		* This is the core of the protocol we discovered.  Commands
		* look like this:
		*     [STX], [RED], [GREEN], [BLUE], [ETX]
		* Each field is a hex byte with possible values 00-FF, which
		* are expressed in decimal as 0-255.
		*
		* Each command starts (the STX value) with a value of 86.
		* Each command ends (the ETX value) with a value of 170.
		*
		* The red, green, blue values combine to determine the color
		* and brightness level.  For example:
		*
		*     Bright red would be: 255,0,0
		*     reduce the value to dim; a dim red could be: 40,0,0
		*     Bright green would be: 0,255,0
		*     Bright purple would be: 255,0,255
		*     a dim purple could be 40,0,40
		*     a less dim purple could be 160,0,160
		*
		*     White is: 255,255,255
		*     Off is: 0,0,0
		************************************************************/
		re = Math.round(re * br / 100)
		gr = Math.round(gr * br / 100)
		bu = Math.round(bu * br / 100)

		if(controller.state == "ready"){
			controller.socket.write( new Buffer([86, re, gr, bu, 170]) )
		}else{
			//If the state isn't ready, we lost our socket.  Try to reconnect.
			controller.connect()
		}
	}
}