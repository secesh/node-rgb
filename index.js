/********************************************************************************
Copyright 2013 Matthew R Chase (matt@chasefox.net)
This file is part of node-rgb (http://github.com/secesh/node-rgb/).

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
********************************************************************************/

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

var PORT = 50000, HOST = "192.168.1.100"
//when calling setHost, the argument should be a string.  The value can be either an IP address or a host name.
exports.setHost   = function(host){ HOST = host }

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
exports.mixColor  = function(string, decimal){
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
exports.setColor  = function(color, callback, id){
    if(typeof(color) == "string" && color in colors) color = colors[color]
    if(!parseInt(color) === color) return console.trace("improper argument (" + color + ") supplied to setColor function with id: " + id)
    sendMessage(32,color,callback,id)
}

exports.turnOff   = function(callback, id){ sendMessage(33,00,callback,id) }
exports.turnOn    = function(callback, id){ sendMessage(34,00,callback,id) }
exports.brighten  = function(callback, id){ sendMessage(35,00,callback,id) }
exports.dim       = function(callback, id){ sendMessage(36,00,callback,id) }
exports.speedUp   = function(callback, id){ sendMessage(37,00,callback,id) }
exports.speedDown = function(callback, id){ sendMessage(38,00,callback,id) }
exports.modeUp    = function(callback, id){ sendMessage(39,00,callback,id) }
exports.modeDown  = function(callback, id){ sendMessage(40,00,callback,id) }
