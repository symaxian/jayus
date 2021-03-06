if (typeof jgdoc == 'undefined')
{
    jgdoc = {}
    
    jgdoc._dataHandlers = [];
    
    jgdoc.setData = function(data)
    {
        for (var i = 0; i < jgdoc._dataHandlers.length; i++)
        {
            jgdoc._dataHandlers[i](data);
        }
    }
}

jgdoc.TreeItem = function(entityName, item)
{
    this._entityName = entityName;
    this._data = item;
    this._children = [];
    
}

jgdoc.Common = 
{
    addClass : function(element, className)
    {
        var s = element.className;
        var a = s.split(' ');
        for (var i = 0; i < a.length; i++)
        {
            if (a[i] == className)
            {
                return;
            }
        }
        a.push(className);
        element.className = a.join(' ');
    },
    
    removeClass : function(element, className)
    {
        var s = element.className;
        var a = s.split(' ');
        var found = false;
        for (var i = 0; i < a.length; i++)
        {
            if (a[i] == className)
            {
                a.splice(i, 1);
                found = true;
                break;
            }
        }
        element.className = a.join(' ');
        return found;
    },
    
    addListener : function(element, eventName, handler)
    {
        if (element.addEventListener)
        {
            element.addEventListener(eventName, handler, false);
        }
        else
        {
            element.attachEvent('on' + eventName, handler);
        }
    },
    
    removeListener : function(element, eventName, handler)
    {
        if (element.removeEventListener)
        {
            element.removeEventListener(eventName, handler, false);
        }
        else
        {
            element.detachEvent('on' + eventName, handler);
        }
    }    	
}

jgdoc.NavPanel = 
{
	clicked : function(e)
	{
		e = window.event? window.event : e;
		var target = e.target || e.srcElement;
		var entity = target;
		while (entity != null && entity.tagName != 'UL')
		{
			entity = entity.parentEntity;
		}
		if (entity)
		{
			var parent = entity.parentEntity;
			var current = parent.firstChild;
			while (current)
			{
				if (current != entity && current.entityType === 1)
				{
				    jgdoc.Common.addClass(current, "closed");
				}
				current = current.nextSibling;
			}
			jgdoc.Common.removeClass(entity, "closed");
		}
	},
	
	dummy : function()
	{
	}
}

/*
jgdoc.App = 
{
    initialize : function()
    {
    	this._container = document.getElementById("startup");
    	this._banner = document.getElementById("banner");
    	this._content = document.getElementById("docContent");
    	this._navigation = document.getElementById("navigation");
    	this._docScroll = document.getElementById("docScroll");
    	this._html = document.getElementsByTagName('html')[0];
    	this._body = document.getElementsByTagName("body")[0];
    	this._searchBlock = document.getElementById("searchBlock");
    	this._html.style.overflowY = "hidden";

    }
}*/

jgdoc.NavTree = 
{
	initialize : function(defaultName)
	{
		this._defaultName = defaultName;
	},
    
    
    setData : function(data) {
      this._data = data;
      this.processItems();
      this.render();
      this.openItem(this._defaultName);
    },

    sorter: function(o1, o2) {
      var l1 = o1.localName;
      var l2 = o2.localName;
      return l1 < l2? -1 : (l1 > l2 ? 1 : 0);
    },
    
    processItems : function() {
      var root;

      // Pass 1: Build index by fullName, and locate the root element
      this._byName = {};
      for (var i = 0; i < this._data.length; i++) {
        var d = this._data[i];
        if (d.fullName == "GLOBAL") {
          root = this._root = d;
        }
        this._byName[d.fullName] = d;
      }
    
      // Pass 2: Populate _children arrays
      for (var i = 0; i < this._data.length; i++) {
        var item = this._data[i];
        if (item.elementType == "logical_container" && item != this._root) {
          var parent = this._byName[item.parent];
          parent._children = parent._children || [];
          parent._children.push(item);
        }
      }
    },
    
    findItem : function(name)
    {
    	return this._byName[name];
    },
    
    /*setData : function(data)
    {
        this._data = data;
        data.sort(this.sorter);
        this._root = data[0];
        this.processItems();
        this.render();
        this.openItem(this._defaultName);
    },
    
    findItem : function(name)
    {
        if (name === '' || name == 'GLOBAL')
        {
            return this._root;
        }
        var s = name.split('.');
        var current = this._root._children;
        var found = null;
        for (var i = 0; i < s.length; i++)
        {
            var detected = false;
            for (var j = 0; j < current.length; j++)
            {
                var item = current[j];
                if (item.localName == s[i])
                {
                    detected = true;
                    current = item._children;
                    found = item;
                    break;
                }
            }
            if (!detected)
            {
                return false;
            }
        }
        return found;
    },
    
    processItems : function()
    {
        for (var i = 1; i < this._data.length; i++)
        {
            var item = this._data[i];
            if (item.elementType == "logical_container")
            {
                var parent = this.findItem(item.parent);
                if (!parent._children)
                {
                    parent._children = [];
                }
                parent._children.push(item);
            }
        }
    },
    
    
    sorter : function(item1, item2)
    {
        if (item1.parent == "")
        {
            return -1;
        }
        if (item2.parent == "")
        {
            return 1;
        }
        if (item1.parent == item2.parent)
        {
            return item1.localName < item2.localName? -1 : item1.localName > item2.localName? 1 : 0;
        }
        if (item1.parent == "GLOBAL")
        {
            return -1;
        }
        if (item2.parent == "GLOBAL")
        {
            return 1;
        }
        return item1.parent < item2.parent? -1 : 1;
    },
    */
        
    
    clicked : function(event)
    {
        event = window.event? window.event : event;
        var target = event.target || event.srcElement;
        var span = target.parentEntity;
        var li = span.parentEntity;
        var wasOpen = jgdoc.Common.removeClass(li, 'open');
        if (wasOpen)
        {
            jgdoc.Common.addClass(li, 'closed');
        } 
        else
        {
            jgdoc.Common.removeClass(li, 'closed');
            jgdoc.Common.addClass(li, 'open');
        }
        span.title = "Click to " + (wasOpen? "expand" : "collapse");
                
    },
    
    
    
    
    render : function()
    {
        var d = document.getElementById('content');
        d.innerHTML = '';
        var athis = this;
        function renderEntity(item)
        {
            var entity = document.createElement('li');
            entity.className = item.type;
            entity.innerHTML = "<span class='entity'><span class='markerSpace'>&nbsp;</span></span><a href='" + item.ref + "' title='" + item.summary + "'>" + item.localName + "</a>";
            var span = entity.firstChild;
            var img = span.firstChild;
            jgdoc.Common.addListener(img, 'mousedown', athis.clicked);
            if (item._children)
            {
                entity.className += (item == athis._root)? ' open' : ' closed';
                span.title = "Click to " + (item != athis._root? 'expand' : 'collapse');
                var subentity = document.createElement("ul");
                subentity.className = 'contents';
                for (var i = 0; i < item._children.length; i++)
                {
                    var child = renderEntity(item._children[i]);
                    subentity.appendChild(child);
                }
                entity.appendChild(subentity);
            }
            else
            {
                entity.className += ' leaf';
            }
            if (item.fullName == athis._defaultName)
            {
                entity.firstChild.nextSibling.className += ' currentEntity';
            }
            item._entity = entity;
            return entity;
        }
        var root = renderEntity(this._root);
        d.appendChild(root);
    },
    
    cancelEvent : function(event)
    {
        if (event.preventDefault)
        {
            event.preventDefault();
            event.stopPropagation();
        }
        else
        {
            event.preventDefault();
            event.stopPropagation();
        }
    },
    
    switchAll : function(doOpen)
    {
        var ac = doOpen? 'open' : 'closed';
        var rc = doOpen? 'closed' : 'open';
        
        var athis = this;
        
        function doSwitchEntity(aentity)
        {
            if (aentity._children)
            {
                if (doOpen || aentity != athis._root)
                {
                    jgdoc.Common.removeClass(aentity._entity, rc);
                    jgdoc.Common.addClass(aentity._entity, ac);
                }
                for (var i = 0; i < aentity._children.length; i++)
                {
                    doSwitchEntity(aentity._children[i]);
                }
            }
        }
        doSwitchEntity(this._root);
    },
    
    openItem : function(name)
    {
        this.switchAll(false);
        while (name != 'GLOBAL')
        {
        	var item = this.findItem(name);
        	if (item)
        	{
	        	var entity = item._entity;
	        	jgdoc.Common.removeClass(entity, 'closed');
	        	jgdoc.Common.addClass(entity, 'open');
	        	name = item.parent;
        	}
        	else
        	{
        		return;
        	}
        }    
    },    
    
    onOpenAll : function()
    {
        jgdoc.NavTree.switchAll(true);
    },
    
    onCloseAll : function()
    {
        jgdoc.NavTree.switchAll(false);
    }

};

jgdoc._dataHandlers.push(function(data)
{
	//jgdoc.App.initialize();
	jgdoc.NavTree.setData(data);
});
