//this module is use to check devices type and platform for global usage
// reference to device.js
(function(){
  var previousDevice, _addClass, _doc_element, _find, _handleOrientation, _hasClass, _orientation_event, _removeClass, _supports_orientation, _user_agent;


  var device = {};

  _doc_element = window.document.documentElement;

  _user_agent = window.navigator.userAgent.toLowerCase();

  device.ios = function() {
    return device.iphone() || device.ipod() || device.ipad();
  };

  device.iphone = function() {
    return _find('iphone');
  };

  device.ipod = function() {
    return _find('ipod');
  };

  device.ipad = function() {
    return _find('ipad');
  };

  device.android = function() {
    return _find('android');
  };

  device.androidPhone = function() {
    return device.android() && _find('mobile');
  };

  device.androidTablet = function() {
    return device.android() && !_find('mobile');
  };

  device.blackberry = function() {
    return _find('blackberry') || _find('bb10') || _find('rim');
  };

  device.blackberryPhone = function() {
    return device.blackberry() && !_find('tablet');
  };

  device.blackberryTablet = function() {
    return device.blackberry() && _find('tablet');
  };

  device.windows = function() {
    return _find('windows');
  };
  
  device.mac=function(){
      return _find('mac');
  };
  
  device.linux=function(){
      return _find('linux');
  };
  device.windowsPhone = function() {
    return device.windows() && _find('phone');
  };

  device.windowsTablet = function() {
    return device.windows() && _find('touch');
  };

  device.fxos = function() {
    return (_find('(mobile;') || _find('(tablet;')) && _find('; rv:');
  };

  device.fxosPhone = function() {
    return device.fxos() && _find('mobile');
  };

  device.fxosTablet = function() {
    return device.fxos() && _find('tablet');
  };

  device.meego = function() {
    return _find('meego');
  };

  device.mobile = function() {
    return device.androidPhone() || device.iphone() || device.ipod() || device.windowsPhone() || device.blackberryPhone() || device.fxosPhone() || device.meego();
  };

  device.tablet = function() {
    return device.ipad() || device.androidTablet() || device.blackberryTablet() || device.windowsTablet() || device.fxosTablet();
  };
  
  device.msie = function(){
      return ($.browser.msie||!!navigator.userAgent.match(/Trident\/7\./));
  }

  device.portrait = function() {
    return Math.abs(window.orientation) !== 90;
  };

  device.landscape = function() {
    return Math.abs(window.orientation) === 90;
  };

  device.noConflict = function() {
    //window.device = previousDevice;
    return this;
  };
  
  device.online=function(src,ifOnline,ifOffline){
    var img = new Image();
    img.onload = function()
    {
        console.log('online');
        ifOnline && ifOnline.constructor == Function && ifOnline();
    };
    img.onerror = function()
    {
        console.log('offline');
        ifOffline && ifOffline.constructor == Function && ifOffline();
    };
    img.src = src+'?t='+_g.uuid();        
  }
  
  device.screenSize = function(){
        var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName('body')[0],
            x = w.innerWidth || e.clientWidth || g.clientWidth,
            y = w.innerHeight|| e.clientHeight|| g.clientHeight;
        return {x:x,y:y};
  }

  _find = function(needle) {
    return _user_agent.indexOf(needle) !== -1;
  };

  _hasClass = function(class_name) {
    var regex;
    regex = new RegExp(class_name, 'i');
    return _doc_element.className.match(regex);
  };

  _addClass = function(class_name) {
    if (!_hasClass(class_name)) {
      return _doc_element.className += " " + class_name;
    }
  };

  _removeClass = function(class_name) {
    if (_hasClass(class_name)) {
      return _doc_element.className = _doc_element.className.replace(class_name, "");
    }
  };
  var initDom=function(){
      if (device.ios()) {
        if (device.ipad()) {
          _addClass("ios ipad tablet");
        } else if (device.iphone()) {
          _addClass("ios iphone mobile");
        } else if (device.ipod()) {
          _addClass("ios ipod mobile");
        }
      } else if (device.android()) {
        if (device.androidTablet()) {
          _addClass("android tablet");
        } else {
          _addClass("android mobile");
        }
      } else if (device.blackberry()) {
        if (device.blackberryTablet()) {
          _addClass("blackberry tablet");
        } else {
          _addClass("blackberry mobile");
        }
      } else if (device.windows()) {
        if (device.windowsTablet()) {
          _addClass("windows tablet");
        } else if (device.windowsPhone()) {
          _addClass("windows mobile");
        } else {
          _addClass("desktop");
        }
      } else if (device.fxos()) {
        if (device.fxosTablet()) {
          _addClass("fxos tablet");
        } else {
          _addClass("fxos mobile");
        }
      } else if (device.meego()) {
        _addClass("meego mobile");
      } else {
        _addClass("desktop");
      }      
  }


  _handleOrientation = function() {
    if (device.landscape()) {
      _removeClass("portrait");
      return _addClass("landscape");
    } else {
      _removeClass("landscape");
      return _addClass("portrait");
    }
  };

  _supports_orientation = "onorientationchange" in window;

  _orientation_event = _supports_orientation ? "orientationchange" : "resize";

  if (window.addEventListener) {
    window.addEventListener(_orientation_event, _handleOrientation, false);
  } else if (window.attachEvent) {
    window.attachEvent(_orientation_event, _handleOrientation);
  } else {
    window[_orientation_event] = _handleOrientation;
  }

  _handleOrientation();
  device.initDom=initDom;
  window._g_device=device;
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.device=_g_device;
}
else{
    define(['_g/base'],function(){
        window._g.device=_g_device;
        return window._g.device; 
    })
}
})(window);