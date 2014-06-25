//该module用来画grid,可以根据列数，行数，来画出相对应的grid来
(function(){
var _g_grid=function(options){
    this.init(options);
}
_g_grid.prototype={
    init:function(opts){
        var defaults={
            containment:'.grid',//也就是通常的mask遮罩的containment，用来遮盖content的外层layer
            iRows:1,
            iCols:1,
            iRowspace:5,
            iColspace:2,
            iCellBgColor:'#FFF',
            iGridBgColor:'#FFF',
            iGridWidth:500,
            iGridHeight:800,
            gridClass:'grid-content'
        };
        this.options=opts?$.extend(true,{},defaults,opts):defaults; 
        _.bindAll(this);  
        this._renderGrid();
    },
    _renderGrid:function(){
        this.options.iCellWidth=parseInt((this.options.iGridWidth-this.options.iColspace*(this.options.iCols+1))/this.options.iCols,10);
        this.options.iCellHeight=parseInt((this.options.iGridHeight-this.options.iRowspace*(this.options.iRows+1))/this.options.iRows,10);
        $(this.options.containment).html(_.template(this._template(),{griddata:this.options}));
    },
    _template:function(){
        var defaults=[
          ' <table class="<%=griddata.gridClass%>" style="position:absolute;width:<%=griddata.iGridWidth%>px;height:<%=griddata.iGridHeight%>px;background:<%=griddata.iGridBgColor%>;">',
        '    <tbody>',
       '     <% for(i=0;i<griddata.iRows;i++){%>',
       '       <tr style="">',
       '         <% for(j=0;j<griddata.iCols;j++){%>',
       '         <td style="width:<%=griddata.iCellWidth%>px;height:<%=griddata.iCellHeight%>px;padding-left:<%=(griddata.iColspace+"px")%>;padding-top:<%=(griddata.iRowspace+"px")%>;padding-right:<%=(j==griddata.iCols-1)?(griddata.iColspace+"px"):0%>;padding-bottom:<%=(i==griddata.iRows-1)?(griddata.iRowspace+"px"):0%>"><div style="width:100%;height:100%;background:<%=griddata.iCellBgColor%>;"></div></td>',
        '        <% } %>',
       '       </tr>',
      '       <% } %>',
       '     </tbody>',
      '  </table>'
        ].join("");
       return defaults;
    }
}
if(typeof require=="undefined"){
    if(!window._g) window._g={};
    window._g.grid=_g_grid;
}
else{
    define(['_g/base','underscore'],function(){
        window._g.grid=_g_grid;
        return window._g.grid; 
    })
}
})(window);