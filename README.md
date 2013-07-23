rgb-led
=======

This project provides a communication driver, written for Node.JS, to ease the communication with
The WiFi-CON (aka MiLight aka EasyBulb), a device that provides network access to an RGB LED 
controller.  The WiFi-CON can act as a wifi client, which enables it to integrate with your existing
LAN.  It can also act as a WiFi Access Point to provide a stand-alone network (enabling client access
from your smartphone).  The initial commit of this project does not include information about how to
configure your WiFi-CON.  It features a rather unintuitive, buggy, and poorly documented management
portal.

With the WiFi-CON integrated to a LAN, this package provides programmatic access allowing you
to easily communicate with your color-changeable, dimming LED lights and light strips!

## Install

```bash
npm install rgb-led
```

## Basic Usage
In this example, we will connect to the controller, turn the lights on, and set the color.

```node
var lights = require("rgb-led")

lights.setHost("led") //This argument can be a hostname or IP Address.
lights.turnOn()

lights.setColor(189) //Color is a one-byte value.  In decimal, this is expressed in the range 0-255.
```

## Intermediate usage
In this example, we'll build on the basic usage example by setting the lights to slowly change.
We provide a simple routine that will increment the color of the lights one step every 112 seconds.
Because the LED controller supports 256 colors, this cycle will take about 8 hours to complete.
And then it starts over and just keeps going.

```node
var lights = require("rgb-led")
lights.setHost("led")
lights.turnOn()
var color = 0

lights.setColor(color)
setInterval(function(){
    lights.setColor(color)
    color++
    if(color >= 256) color = 0
}, 112000)
```

## The hardware
Apparently the WiFi module works with multiple products.  It's super cheap generic hardware 
manufactured in china.  It's not obvious what all it works with or who really makes it, though
it bears a copyright from CEC Huada Electronic Design Co., Ltd.  Are they DBA HED International?
Because that's who produced the android application from which the protocol was discovered.

Anyway, we came across the device as a way to bridge LED light strips to a network, so that's 
what we'll give as an example.  In this case, you need two controllers.  One connects to your 
LED strips, the other is the WiFi module.  Both are supplied by superbrightleds.com.  This project
is not associated with that site; we simply love the fact that they sell the wifi module, which
is awesome, and we wanted to enable programmatic access to it.  Doing so took just a bit of
reverse-engineering the protocol.

Here's the controller you need: [goo.gl/WCqUL](http://goo.gl/WCqUL)
and here's the wifi module: [goo.gl/uOjA9F](http://goo.gl/uOjA9F)

## Thanks
We know this isn't a large project.  But we thought it was awesome fun and hope you totally
enjoy building upon this.  Tell us all about it if you like; we love to be inspired.  If 
you're feeling generous, the tip jar can be found [![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=55A8WG9PDX2AU)
