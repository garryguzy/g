<% if(data.widgetType==1){ %>
<div class="input-group">
    <input type="text" class="form-control colorpicker" data-attr="<%=data.attr?data.attr:""%>" value="<%=data.value||"#000000"%>"/>
    <span class="input-group-addon"><i></i></span>
</div>
<% } %>
<% if(data.widgetType==2){ %>
    <input type="text" class="form-control colorpicker" data-attr="<%=data.attr?data.attr:""%>" value="<%=data.value||"#000000"%>"/>
<% } %>
<% if(data.widgetType==3){ %>
<div class="input-group">
    <input type="text" class="form-control colorpicker hide" data-attr="<%=data.attr?data.attr:""%>" value="<%=data.value||"#000000"%>"/>
    <span class="input-group-addon"><i></i></span>
</div>
<% } %>