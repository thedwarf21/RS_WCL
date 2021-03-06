# RS_WCL
Roquefort Softwares' Web Components Library

# Storage

Files of this library are suposed to be stored in seperated directories

CSS files are intended to be stored in a "css" named directory
JS files are intended to bo stored in another directory (e.g. : "scripts")

Both should be in the same directory root, or you will have to update the javascript code (CSS injection)

# Library itself

The library itself is stored into 2 files :

main.js script contains utilities functions
rs_wcl.js script defines the RS_WCL class that contains static methods used inside of the web conponents, for live binding, for example.

# Components

Most of the components, in this library, are designed to be intanciated in pure Javascript using a contructor with parameters, or directly in HTML code.
That's why 2 classes are defined. The one designed for HTML use instanciates the javascript one and puts it into a shadow DOM, including the coresponding CSS file.

The javascript class defines all the component's behavior.
