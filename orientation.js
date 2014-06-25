//重力感应，仅仅用于支持重力感应的移动设备
//dependencies: [base]
//重力感应的统一控制，这种统一控制在于将当前网站中所有可能会收到重力感应作用的元素的事件全部统一管理，统一触发
(function(){
var MAGIC_NUMBER=1;
var _g_orientation={
    init:function(){
        //绑定全局orientation事件
     if (_g.orientation.orientationSupport) {
        window.addEventListener('deviceorientation', _g.orientation.onDeviceOrientation);
        //setTimeout(this.onOrientationTimer, this.supportDelay);
      } else {

      } 
      _g.orientation.deltaX=0;
      _g.orientation.deltaY=0;    
    },
    orientationSupport:function(){
        return !!window.DeviceOrientationEvent;
    },
    onDeviceOrientation:function(){
        var movex,movey,xrange,yrange;
        // Validate environment and event properties.
        if (event.beta !== null && event.gamma !== null) {
    
          // Set orientation status.
          this.orientationStatus = 1;
    
          // Extract Rotation
          var x = ((event.beta-30)  || 0) / MAGIC_NUMBER; //  -90 :: 90 
          //x方向对应的手机是竖版的方向，横屏时是横屏的方向
          var y = ((event.gamma-30) || 0) / MAGIC_NUMBER; // -180 :: 180
          var portrait = window.innerHeight > window.innerWidth;
          //portrait检测横屏还是竖屏
          if(portrait){
              movex=y+30;
              movey=x;
              xrange=180;
              yrange=90;
          }
          else{
              movex=-(x+30);
              movey=y;
              xrange=90;
              yrange=180;
          }
          //_g.orientation.deltaX=movex-_g.orientation.deltaX;
          //_g.orientation.deltaY=movey-_g.orientation.deltaY;
          //console.log(event.beta);
          console.log(event.gamma);
          _.each(_g.orientation.orientationEvents,function(i){
              if(!i.scrollX) movex=0;
              if(!i.scrollY) movey=0;
              if(i.func){
                  i.func(-movex*i.speed,-movey*i.speed,xrange,yrange);//range传递的是重力感应的范围参数，有时候我们会感应speed，但是有时候我们也会采用range
              }
          })
          // Detect Orientation Change
          // var portrait = window.innerHeight > window.innerWidth;
          // if (this.portrait !== portrait) {
            // this.portrait = portrait;
            // this.calibrationFlag = true;
          // }
//     
          // // Set Calibration
          // if (this.calibrationFlag) {
            // this.calibrationFlag = false;
            // this.cx = x;
            // this.cy = y;
          // }
//     
          // // Set Input
          // this.ix = x;
          // this.iy = y;
          //对所有绑定的orientation事件进行处理
          
        }
    },
    // onOrientationTimer:function(event) {
        // if (_g.orientation.orientationSupport && _g.orientation.orientationStatus === 0) {
          // _g.orientation.disable();
          // _g.orientation.orientationSupport = false;
          // _g.orientation.enable();
        // }
    // },
    orientationEvents:[]
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.orientation=_g_orientation;
}
else{
    define(['_g/base'],function(){
        window._g.orientation=_g_orientation;
        return window._g.orientation; 
    })
}
})(window);