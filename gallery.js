//gallery组件提供比较方便的建立图片集的控制的功能
//
//该module用来画gallery,可以根据列数，行数，来画出相对应的gallery来
(function(){
var _g_gallery=function(options){
    this.init(options);
}
_g_gallery.prototype={
    init:function(opts){
        var defaults={
            containment:'.gallery',//也就是通常的mask遮罩的containment，用来遮盖content的外层layer
            parentWidth:800,
            parentHeight:700,
            imageWidth:400,
            imageHeight:500,
            src:null,
            title:null
        };
        this.options=opts?$.extend(true,{},defaults,opts):defaults; 
        _.bindAll(this);  
        this._rendergallery();
    },
    _rendergallery:function(){
        $(this.options.containment).html(_.template(this._template(),{img:this.options}));
    },
    _template:function(){
        var defaults=[
   ' <div class="modal fade slide-content in" style="display: block;">',
   '          <div class="modal-dialog">',
   '              <div class="modal-content">',
   '                  <div class="modal-header">',
    '                     <button type="button" class="close" aria-hidden="true">×</button>',
   '                      <h4 class="modal-title"><%=img.title%></h4>',
   '                  </div>',
   '                  <div class="modal-body"><img draggable="false" title="<%=img.title%>" src="<%=img.src%>"></div>',
    '                 <div class="modal-footer" style="display:none;">',
   '                      <button type="button" class="btn btn-default pull-left prev">',
    '                         <i class="glyphicon glyphicon-chevron-left"></i>',
     '                        Previous',
       '                  </button>',
        '                 <button type="button" class="btn btn-primary next">',
         '                    Next',
          '                   <i class="glyphicon glyphicon-chevron-right"></i>',
           '              </button>',
        '             </div>',
'                 </div>',
  '           </div>',
    '     </div>'
        ].join("");
       return defaults;
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.gallery=_g_gallery;
}
else{
    define(['_g/base','underscore'],function(){
        window._g.gallery=_g_gallery;
        return window._g.gallery; 
    })
}
})(window);