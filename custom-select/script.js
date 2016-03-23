/**
 *  @name plugin
 *  @description description
 *  @version 1.0
 *  @options
 *    liTemplate
 *	  closeWhenClickingOutside
 *    onBeforeOpen
 *    animation
 *  @events
 *    event
 *  @methods
 *    init
 *    open
 *	  close
 *    enable
 *    disable
 *    reset
 *    select
 *    closeWhenClickingOutside
 *    animation
 *    destroy
 */

;(function($, window, undefined) {
  'use strict';

  var pluginName = 'fancySelectBox';
 
  var selectBoxIsDisabled = function(that) {
  	return that.selectionPresenter.hasClass('disabled');
  }

  var onSelectionPresenter = function(that, event) {
		toggleDropdownList(that);
	    event.stopPropagation();
	}
  
  var openDropdownList = function(that) {
  	if (that.options.animation) {
  		that.dropdownList.slideDown("slow");
  	}
  	else {
  		that.dropdownList.show();
  	}
  }
  var closeDropdownList = function(that) {
  		if (that.options.animation) {
  			that.dropdownList.slideUp("slow");
  		}
  		else {
  			that.dropdownList.hide();
  		}
	}
  
  var toggleDropdownList = function(that) {
  		if (that.options.animation) {
  			that.dropdownList.slideToggle("slow");
  		}
  		else {
  			that.dropdownList.toggle();
  		}
  	}
    	

  function Plugin(element, options) {
    this.element = $(element);
    this.options = $.extend({}, $.fn[pluginName].defaults, this.element.data(), options);
    this.init();
  }

  Plugin.prototype = {
    init: function() {
    	var that = this;
    	// Add event of clicking outside this custom select
    	$('html').click(function() {
    		if (that.options.closeWhenClickingOutside) {
    			closeDropdownList(that);
    		}
    	});

    	
	    var generateDropdownList = function() {
	  		
		    that.dropdownWrapper = $("<div></div>").addClass("dropdown-wrapper");
		    that.selectionPresenter = $("<div></div>").addClass("selection-presenter");
		    that.dropdownList = $("<ul></ul>").addClass("fancyDropdown");
		    
		    that.dropdownList.css("left", that.selectionPresenter.css("left"));
		    
		    that.selectOptions.each(function(index, val) {
		        //var liTemplate = $("<li data-option-id='" + index + "'>" + $(this).html() + "</li>" );
		        var liTemplate = $(that.options.liTemplate);
		        liTemplate.attr("data-option-id", index);
		        liTemplate.append($(this).html());
		        
		        // Bind event to liTemplate
		        // When user click on dropdown-list item, the selection-presenter will show 
		        // the value of option in originalSelect which has index indicated by 'data-option-id' attr in <li>
		        // THEN the dropdown-list will disapear and 
		        // we set the current value of originalSelect to the value has been selected
		        // from the dropdown list
		        liTemplate.click(function(e) {
		        	e.stopPropagation();

		            var selectedOptionIndex = $(this).data("option-id");
		            that.selectionPresenter.html(that.selectOptions.eq(selectedOptionIndex).html());
		            console.log("click on liTemplate");
		            closeDropdownList(that);
		            
		            that.originalSelect.val(that.selectOptions.eq(selectedOptionIndex).html()).trigger('change');

		        });
		        
		        that.dropdownList.append(liTemplate);
		    });
		    
		    that.dropdownList.find("li").first().click();
		    
		    // Bind event to selectionPresenter
		    // When user click on selectionPresenter, the dropdown list will be toggled.
		    that.selectionPresenter.click(function(e) {
		    	onSelectionPresenter(that, e);
		    });
		    
		    that.dropdownWrapper.append(that.selectionPresenter);
		    that.dropdownWrapper.append(that.dropdownList);
		   
	  }



      that.originalSelect = that.element;
      that.selectOptions = that.originalSelect.find("option");
      that.dropdownWrapper = null;
      that.selectionPresenter = null;
      that.dropdownList = null;


      generateDropdownList();
      that.originalSelect.after(that.dropdownWrapper);
      that.dropdownList.hide();
      that.originalSelect.hide();
      
      // Make the behavior on dropdownList affecting to originalSelect
      that.originalSelect.on('change', function() {
      	$.isFunction(that.options.onSelect) && that.options.onSelect.call(that, this.selectedIndex);
      	that.selectionPresenter.html(that.selectOptions.eq(this.selectedIndex).html());
      	closeDropdownList(that);
      });

      // Bind event 'beforeShow' to dropdownList
      // Being fired before the dropdownList showing
      that.dropdownList
      			.bind('beforeShow', function() {
      				if ($.isFunction(that.options.onBeforeOpen))
      					that.options.onBeforeOpen();

      				// Find all the elements using this plugin and close its dropdownlist if it's opened.
      				$('select').each(function() {
      					var instance = $.data(this, pluginName);
      					if (instance) {
      						if(instance['closeWhenClickingOutside']() && !$(this).is(that.originalSelect)) {
      							instance['close']();
      						}
      					}
      				}); 
      			});

      that.dropdownList.css("height", that.options.height + "px");

    },
    open: function() {
   	  if (!selectBoxIsDisabled(this)) {
   	  	openDropdownList(this);
   	  }
      	
    },
    close: function() {
      if (!selectBoxIsDisabled(this))
    	closeDropdownList(this);
    },
    disable: function() {
    	this.selectionPresenter.off('click').addClass("disabled");
    	this.originalSelect.prop('disabled', true);
    },
    enable: function() {
    	var that = this;
    	that.selectionPresenter.click(function(e) {
    		onSelectionPresenter(that, e);
    	}).removeClass('disabled');

    	that.originalSelect.prop('disabled', false);
    },
    reset: function() {
    	if (!this.selectionPresenter.hasClass('disabled')) {
	    	this.originalSelect
	    		.val(this.selectOptions.eq(0).html())
	    		.trigger('change');
    	}
    },
    select: function(index) {
    	if (!this.selectionPresenter.hasClass('disabled')) {
    		this.originalSelect
	    		.val(this.selectOptions.eq(index).html())
	    		.trigger('change');
    	}
    	
    },
    
    closeWhenClickingOutside: function(val) {
    	if (val == null) {
    		return this.options.closeWhenClickingOutside;
    	}
    	else {
    		this.options.closeWhenClickingOutside = val;
    	}
    },

    animation: function(val) {
    	if (val == null) {
    		return this.options.animation;
    	}
    	else {
    		this.options.animation = val;
    	}
    },

    destroy: function() {
      // remove events
      // deinitialize
      this.originalSelect.show();
      this.dropdownWrapper.remove();

    }
  };

  $.fn[pluginName] = function(options, params) {
    return this.each(function() {
      var instance = $.data(this, pluginName);
      if (!instance) {
        $.data(this, pluginName, new Plugin(this, options));
      } else if (instance[options]) {
        instance[options](params);
      }
    });
  };

  $.fn[pluginName].defaults = {
    onSelect: null,
    liTemplate: "<li></li>",
    closeWhenClickingOutside: true,
    onBeforeOpen: null,
    animation: false,
    height: 200
  };

  $(function() {
  	$('[data-' + pluginName + ']').on('customEvent', function() {
      // to do
    });

    $('[data-' + pluginName + ']')[pluginName]({
      key: 'custom'
    });
  });




}(jQuery, window));
