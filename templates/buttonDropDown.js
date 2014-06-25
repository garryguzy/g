<div class="btn-group <%=data.size?("btn-group-"+data.size):""%> c-btn-group-<%=data.widgetType%> <%=data.classname||""%>" data-name="<%=data.name%>">
 <% if(data.widgetType==1){%>
    <button type="button" class="btn dropdown-toggle c-btn-group-button <%=data.buttonclassname||""%>" data-toggle="dropdown">
      <%=data.buttonname%>
      <span class="caret"></span>
    </button>
   <% }%>
    <% if(data.widgetType==2){%>
        <button type="button" class="btn c-btn-group-button <%=data.buttonclassname||""%>"><%=data.buttonname%></button>
           <button type="button" class="btn dropdown-toggle <%=data.caretbuttonclassname||""%>" data-toggle="dropdown">
            <span class="caret"></span>
            <span class="sr-only">Toggle Dropdown</span>
          </button>
  <% } %>
    <ul class="dropdown-menu c-btn-group-dropdown-menu <%=data.dropdownmenuclassname||""%>">
      <% _.each(data.dropdownmenus,function(i){%>
        <li><a href="#" class="<%=i.classname||""%>" data-id="<%=i.id||""%>"><%=i.name%></a></li>
      <% }) %>
    </ul>
</div>