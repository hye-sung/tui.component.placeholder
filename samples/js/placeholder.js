(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

tui.util.defineNamespace('tui.component.placeholder', require('./src/placeholder.js'));

tui.component.placeholder();

},{"./src/placeholder.js":2}],2:[function(require,module,exports){
/**
 * @fileoverview Generate the virtual placeholder on browsers isn't supported placehoder feature
 * @author NHN Ent. FE dev team.<dl_javascript@nhnent.com>
 */
'use strict';

var util = require('./util.js');

var Placeholder;

var isSupportPlaceholder,
    sharedInstance;

var browser = tui.util.browser;

var KEYCODE_BACK = 8,
    KEYCODE_TAB = 9;

if (browser.msie && (browser.version > 9 && browser.version <= 11)) {
    util.addCssRule({
        selector: ':-ms-input-placeholder',
        css: 'color:#fff !important;text-indent:-9999px;'
    });
}

isSupportPlaceholder = 'placeholder' in document.createElement('input') && !(browser.msie && browser.version <= 11);

/**
 * Placeholder Object
 * @constructor
 * @param {HTMLElement} elements - Selected 'input' elements
 * @example
 * tui.component.placeholder();
 * tui.component.placeholder(document.getElementById('add-area').getElementsByTagName('input'));
 */
Placeholder = tui.util.defineClass(/** @lends Placeholder.prototype */{
    init: function() {
        /**
         * Array pushed all 'input' elements in the current page
         * @type {Array}
         * @private
         */
        this._inputElems = [];
    },

    /**
     * Add elements in array
     * @param {HTMLElement} elements - selected 'input' elements
     */
    add: function(elements) {
        if (isSupportPlaceholder) {
            return;
        }

        this._inputElems = tui.util.toArray(elements || document.getElementsByTagName('input'));
    },

    /**
     * Generate virtual placeholders for the browser isnt't supported placeholder property
     */
    generatePlaceholder: function() {
        var self = this;

        tui.util.forEach(this._inputElems, function(elem) {
            var type = elem.type;

            if ((type === 'text' || type === 'password' || type === 'email') &&
                elem.getAttribute('placeholder')) {
                self._attachCustomPlaceholder(elem);
            }
        });
    },

    /**
     * Returns element's style value defined at css file
     * @param {HTMLElement} target - 'input' element
     * @returns {Object} Style info of 'input' element
     * @private
     */
    _getInitStyle: function(target) {
        var computedObj,
            styleInfo;

        if (window.getComputedStyle) {
            computedObj = window.getComputedStyle(target, null);

            styleInfo = {
                fontSize: computedObj.getPropertyValue('font-size'),
                paddingLeft: computedObj.getPropertyValue('padding-left')
            };
        } else {
            computedObj = target.currentStyle;

            styleInfo = {
                fontSize: computedObj.fontSize,
                paddingLeft: computedObj.paddingLeft
            };
        }

        return styleInfo;
    },

    /**
     * Attach a new virtual placeholder after a selected 'input' element and wrap this element
     * @param {HTMLElement} target - The 'input' element
     * @private
     */
    _attachCustomPlaceholder: function(target) {
        var initStyle = this._getInitStyle(target),
            wrapTag = document.createElement('span'),
            placeholder = target.getAttribute('placeholder'),
            inputValue = target.value;

        wrapTag.innerHTML = this._generateSpanTag(initStyle.paddingLeft, initStyle.fontSize, placeholder, inputValue);
        wrapTag.appendChild(target.cloneNode());

        target.parentNode.insertBefore(wrapTag, target.nextSibling);
        target.parentNode.removeChild(target);

        wrapTag.style.cssText = 'position:relative;line-height:1;';

        this._bindEventToVirtualPlaceholder(wrapTag);
    },

    /**
     * Bind events on the element
     * @param {HTMLElement} target - The wrapper tag of the 'input' element
     * @private
     */
    _bindEventToVirtualPlaceholder: function(target) {
        var inputTag = target.getElementsByTagName('input')[0],
            spanTag = target.getElementsByTagName('span')[0],
            spanStyle = spanTag.style;

        util.bindEvent(spanTag, 'click', function() {
            inputTag.focus();
        });

        util.bindEvent(inputTag, 'keydown', function(e) {
            var keyCode = e.which || e.keyCode;

            if (!(keyCode === KEYCODE_BACK || keyCode === KEYCODE_TAB)) {
                spanStyle.display = 'none';
            }
        });

        util.bindEvent(inputTag, 'keyup', function() {
            if (inputTag.value === '') {
                spanStyle.display = 'inline-block';
            }
        });
    },

    /**
     * Generate the virtual placeholder element
     * @param {Number} paddingLeft - Current 'input' element's left padding size
     * @param {Number} fontSize - Current 'input' element's 'font-size' property value
     * @param {String} placehoderText - Current 'input' element value of placeholder property
     * @param {String} inputValue - Current 'input' element value
     * @returns {String} String of virtual placehoder tag
     * @private
     */
    _generateSpanTag: function(paddingLeft, fontSize, placehoderText, inputValue) {
        var html = '<span style="position:absolute;left:0;top:50%;width:90%;';

        html += 'padding-left:' + paddingLeft + ';margin-top:' + (-(parseFloat(fontSize, 10) / 2) - 1) + 'px;';
        html += 'overflow:hidden;white-space:nowrap;text-overflow:ellipsis;*display:inline;zoom:1;';
        html += 'display:' + (inputValue !== '' ? 'none' : 'inline-block') + ';';
        html += 'color:#aaa;line-height:1.2;z-index:0;';
        html += 'font-size:' + fontSize + ';" UNSELECTABLE="on">' + placehoderText + '</span>';

        return html;
    }
});

sharedInstance = new Placeholder();

module.exports = function(elements) {
    sharedInstance.add(elements);
    sharedInstance.generatePlaceholder();
};

},{"./util.js":3}],3:[function(require,module,exports){
'use strict';

var util = {
    /**
     * Generate <style> tag and add css rule
     * @param {Object} ruleInfo - Value of selector and css property
     */
    addCssRule: function(ruleInfo) {
        var styleTag = document.createElement('style'),
            styleSheet,
            selector = ruleInfo.selector,
            css = ruleInfo.css;

        if (document.head) {
            document.head.appendChild(styleTag);
        } else {
            document.getElementsByTagName('head')[0].appendChild(styleTag);
        }

        styleSheet = styleTag.sheet || styleTag.styleSheet;

        if (styleSheet.insertRule) {
            styleSheet.insertRule(selector + '{' + css + '}', 0);
        } else {
            styleSheet.addRule(selector, css, 0);
        }
    },

    /**
     * Bind event to element
     * @param {HTMLElement} target - Tag for binding event
     * @param {String} eventType - Event type
     * @param {Function} callback - Event handler function
     */
    bindEvent: function(target, eventType, callback) {
        if (target.addEventListener) {
            target.addEventListener(eventType, callback, false);
        } else if (target.attachEvent) {
            target.attachEvent('on' + eventType, callback);
        } else {
            target['on' + eventType] = callback;
        }
    }
};

module.exports = util;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9wbGFjZWhvbGRlci5qcyIsInNyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG50dWkudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ3R1aS5jb21wb25lbnQucGxhY2Vob2xkZXInLCByZXF1aXJlKCcuL3NyYy9wbGFjZWhvbGRlci5qcycpKTtcblxudHVpLmNvbXBvbmVudC5wbGFjZWhvbGRlcigpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IEdlbmVyYXRlIHRoZSB2aXJ0dWFsIHBsYWNlaG9sZGVyIG9uIGJyb3dzZXJzIGlzbid0IHN1cHBvcnRlZCBwbGFjZWhvZGVyIGZlYXR1cmVcbiAqIEBhdXRob3IgTkhOIEVudC4gRkUgZGV2IHRlYW0uPGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbT5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbC5qcycpO1xuXG52YXIgUGxhY2Vob2xkZXI7XG5cbnZhciBpc1N1cHBvcnRQbGFjZWhvbGRlcixcbiAgICBzaGFyZWRJbnN0YW5jZTtcblxudmFyIGJyb3dzZXIgPSB0dWkudXRpbC5icm93c2VyO1xuXG52YXIgS0VZQ09ERV9CQUNLID0gOCxcbiAgICBLRVlDT0RFX1RBQiA9IDk7XG5cbmlmIChicm93c2VyLm1zaWUgJiYgKGJyb3dzZXIudmVyc2lvbiA+IDkgJiYgYnJvd3Nlci52ZXJzaW9uIDw9IDExKSkge1xuICAgIHV0aWwuYWRkQ3NzUnVsZSh7XG4gICAgICAgIHNlbGVjdG9yOiAnOi1tcy1pbnB1dC1wbGFjZWhvbGRlcicsXG4gICAgICAgIGNzczogJ2NvbG9yOiNmZmYgIWltcG9ydGFudDt0ZXh0LWluZGVudDotOTk5OXB4OydcbiAgICB9KTtcbn1cblxuaXNTdXBwb3J0UGxhY2Vob2xkZXIgPSAncGxhY2Vob2xkZXInIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JykgJiYgIShicm93c2VyLm1zaWUgJiYgYnJvd3Nlci52ZXJzaW9uIDw9IDExKTtcblxuLyoqXG4gKiBQbGFjZWhvbGRlciBPYmplY3RcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudHMgLSBTZWxlY3RlZCAnaW5wdXQnIGVsZW1lbnRzXG4gKiBAZXhhbXBsZVxuICogdHVpLmNvbXBvbmVudC5wbGFjZWhvbGRlcigpO1xuICogdHVpLmNvbXBvbmVudC5wbGFjZWhvbGRlcihkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRkLWFyZWEnKS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKSk7XG4gKi9cblBsYWNlaG9sZGVyID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBQbGFjZWhvbGRlci5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcnJheSBwdXNoZWQgYWxsICdpbnB1dCcgZWxlbWVudHMgaW4gdGhlIGN1cnJlbnQgcGFnZVxuICAgICAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9pbnB1dEVsZW1zID0gW107XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZCBlbGVtZW50cyBpbiBhcnJheVxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRzIC0gc2VsZWN0ZWQgJ2lucHV0JyBlbGVtZW50c1xuICAgICAqL1xuICAgIGFkZDogZnVuY3Rpb24oZWxlbWVudHMpIHtcbiAgICAgICAgaWYgKGlzU3VwcG9ydFBsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9pbnB1dEVsZW1zID0gdHVpLnV0aWwudG9BcnJheShlbGVtZW50cyB8fCBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIHZpcnR1YWwgcGxhY2Vob2xkZXJzIGZvciB0aGUgYnJvd3NlciBpc250J3Qgc3VwcG9ydGVkIHBsYWNlaG9sZGVyIHByb3BlcnR5XG4gICAgICovXG4gICAgZ2VuZXJhdGVQbGFjZWhvbGRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB0dWkudXRpbC5mb3JFYWNoKHRoaXMuX2lucHV0RWxlbXMsIGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgICAgICAgIHZhciB0eXBlID0gZWxlbS50eXBlO1xuXG4gICAgICAgICAgICBpZiAoKHR5cGUgPT09ICd0ZXh0JyB8fCB0eXBlID09PSAncGFzc3dvcmQnIHx8IHR5cGUgPT09ICdlbWFpbCcpICYmXG4gICAgICAgICAgICAgICAgZWxlbS5nZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJykpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9hdHRhY2hDdXN0b21QbGFjZWhvbGRlcihlbGVtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgZWxlbWVudCdzIHN0eWxlIHZhbHVlIGRlZmluZWQgYXQgY3NzIGZpbGVcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSB0YXJnZXQgLSAnaW5wdXQnIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBTdHlsZSBpbmZvIG9mICdpbnB1dCcgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldEluaXRTdHlsZTogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgIHZhciBjb21wdXRlZE9iaixcbiAgICAgICAgICAgIHN0eWxlSW5mbztcblxuICAgICAgICBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUpIHtcbiAgICAgICAgICAgIGNvbXB1dGVkT2JqID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGFyZ2V0LCBudWxsKTtcblxuICAgICAgICAgICAgc3R5bGVJbmZvID0ge1xuICAgICAgICAgICAgICAgIGZvbnRTaXplOiBjb21wdXRlZE9iai5nZXRQcm9wZXJ0eVZhbHVlKCdmb250LXNpemUnKSxcbiAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdDogY29tcHV0ZWRPYmouZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1sZWZ0JylcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb21wdXRlZE9iaiA9IHRhcmdldC5jdXJyZW50U3R5bGU7XG5cbiAgICAgICAgICAgIHN0eWxlSW5mbyA9IHtcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogY29tcHV0ZWRPYmouZm9udFNpemUsXG4gICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQ6IGNvbXB1dGVkT2JqLnBhZGRpbmdMZWZ0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN0eWxlSW5mbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGEgbmV3IHZpcnR1YWwgcGxhY2Vob2xkZXIgYWZ0ZXIgYSBzZWxlY3RlZCAnaW5wdXQnIGVsZW1lbnQgYW5kIHdyYXAgdGhpcyBlbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0IC0gVGhlICdpbnB1dCcgZWxlbWVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2F0dGFjaEN1c3RvbVBsYWNlaG9sZGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgdmFyIGluaXRTdHlsZSA9IHRoaXMuX2dldEluaXRTdHlsZSh0YXJnZXQpLFxuICAgICAgICAgICAgd3JhcFRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKSxcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgncGxhY2Vob2xkZXInKSxcbiAgICAgICAgICAgIGlucHV0VmFsdWUgPSB0YXJnZXQudmFsdWU7XG5cbiAgICAgICAgd3JhcFRhZy5pbm5lckhUTUwgPSB0aGlzLl9nZW5lcmF0ZVNwYW5UYWcoaW5pdFN0eWxlLnBhZGRpbmdMZWZ0LCBpbml0U3R5bGUuZm9udFNpemUsIHBsYWNlaG9sZGVyLCBpbnB1dFZhbHVlKTtcbiAgICAgICAgd3JhcFRhZy5hcHBlbmRDaGlsZCh0YXJnZXQuY2xvbmVOb2RlKCkpO1xuXG4gICAgICAgIHRhcmdldC5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh3cmFwVGFnLCB0YXJnZXQubmV4dFNpYmxpbmcpO1xuICAgICAgICB0YXJnZXQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0YXJnZXQpO1xuXG4gICAgICAgIHdyYXBUYWcuc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjpyZWxhdGl2ZTtsaW5lLWhlaWdodDoxOyc7XG5cbiAgICAgICAgdGhpcy5fYmluZEV2ZW50VG9WaXJ0dWFsUGxhY2Vob2xkZXIod3JhcFRhZyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmQgZXZlbnRzIG9uIHRoZSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0IC0gVGhlIHdyYXBwZXIgdGFnIG9mIHRoZSAnaW5wdXQnIGVsZW1lbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9iaW5kRXZlbnRUb1ZpcnR1YWxQbGFjZWhvbGRlcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgIHZhciBpbnB1dFRhZyA9IHRhcmdldC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW5wdXQnKVswXSxcbiAgICAgICAgICAgIHNwYW5UYWcgPSB0YXJnZXQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NwYW4nKVswXSxcbiAgICAgICAgICAgIHNwYW5TdHlsZSA9IHNwYW5UYWcuc3R5bGU7XG5cbiAgICAgICAgdXRpbC5iaW5kRXZlbnQoc3BhblRhZywgJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpbnB1dFRhZy5mb2N1cygpO1xuICAgICAgICB9KTtcblxuICAgICAgICB1dGlsLmJpbmRFdmVudChpbnB1dFRhZywgJ2tleWRvd24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIga2V5Q29kZSA9IGUud2hpY2ggfHwgZS5rZXlDb2RlO1xuXG4gICAgICAgICAgICBpZiAoIShrZXlDb2RlID09PSBLRVlDT0RFX0JBQ0sgfHwga2V5Q29kZSA9PT0gS0VZQ09ERV9UQUIpKSB7XG4gICAgICAgICAgICAgICAgc3BhblN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHV0aWwuYmluZEV2ZW50KGlucHV0VGFnLCAna2V5dXAnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChpbnB1dFRhZy52YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICBzcGFuU3R5bGUuZGlzcGxheSA9ICdpbmxpbmUtYmxvY2snO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgdGhlIHZpcnR1YWwgcGxhY2Vob2xkZXIgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBwYWRkaW5nTGVmdCAtIEN1cnJlbnQgJ2lucHV0JyBlbGVtZW50J3MgbGVmdCBwYWRkaW5nIHNpemVcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gZm9udFNpemUgLSBDdXJyZW50ICdpbnB1dCcgZWxlbWVudCdzICdmb250LXNpemUnIHByb3BlcnR5IHZhbHVlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBsYWNlaG9kZXJUZXh0IC0gQ3VycmVudCAnaW5wdXQnIGVsZW1lbnQgdmFsdWUgb2YgcGxhY2Vob2xkZXIgcHJvcGVydHlcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXRWYWx1ZSAtIEN1cnJlbnQgJ2lucHV0JyBlbGVtZW50IHZhbHVlXG4gICAgICogQHJldHVybnMge1N0cmluZ30gU3RyaW5nIG9mIHZpcnR1YWwgcGxhY2Vob2RlciB0YWdcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZW5lcmF0ZVNwYW5UYWc6IGZ1bmN0aW9uKHBhZGRpbmdMZWZ0LCBmb250U2l6ZSwgcGxhY2Vob2RlclRleHQsIGlucHV0VmFsdWUpIHtcbiAgICAgICAgdmFyIGh0bWwgPSAnPHNwYW4gc3R5bGU9XCJwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjA7dG9wOjUwJTt3aWR0aDo5MCU7JztcblxuICAgICAgICBodG1sICs9ICdwYWRkaW5nLWxlZnQ6JyArIHBhZGRpbmdMZWZ0ICsgJzttYXJnaW4tdG9wOicgKyAoLShwYXJzZUZsb2F0KGZvbnRTaXplLCAxMCkgLyAyKSAtIDEpICsgJ3B4Oyc7XG4gICAgICAgIGh0bWwgKz0gJ292ZXJmbG93OmhpZGRlbjt3aGl0ZS1zcGFjZTpub3dyYXA7dGV4dC1vdmVyZmxvdzplbGxpcHNpczsqZGlzcGxheTppbmxpbmU7em9vbToxOyc7XG4gICAgICAgIGh0bWwgKz0gJ2Rpc3BsYXk6JyArIChpbnB1dFZhbHVlICE9PSAnJyA/ICdub25lJyA6ICdpbmxpbmUtYmxvY2snKSArICc7JztcbiAgICAgICAgaHRtbCArPSAnY29sb3I6I2FhYTtsaW5lLWhlaWdodDoxLjI7ei1pbmRleDowOyc7XG4gICAgICAgIGh0bWwgKz0gJ2ZvbnQtc2l6ZTonICsgZm9udFNpemUgKyAnO1wiIFVOU0VMRUNUQUJMRT1cIm9uXCI+JyArIHBsYWNlaG9kZXJUZXh0ICsgJzwvc3Bhbj4nO1xuXG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH1cbn0pO1xuXG5zaGFyZWRJbnN0YW5jZSA9IG5ldyBQbGFjZWhvbGRlcigpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XG4gICAgc2hhcmVkSW5zdGFuY2UuYWRkKGVsZW1lbnRzKTtcbiAgICBzaGFyZWRJbnN0YW5jZS5nZW5lcmF0ZVBsYWNlaG9sZGVyKCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IHtcbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSA8c3R5bGU+IHRhZyBhbmQgYWRkIGNzcyBydWxlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHJ1bGVJbmZvIC0gVmFsdWUgb2Ygc2VsZWN0b3IgYW5kIGNzcyBwcm9wZXJ0eVxuICAgICAqL1xuICAgIGFkZENzc1J1bGU6IGZ1bmN0aW9uKHJ1bGVJbmZvKSB7XG4gICAgICAgIHZhciBzdHlsZVRhZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyksXG4gICAgICAgICAgICBzdHlsZVNoZWV0LFxuICAgICAgICAgICAgc2VsZWN0b3IgPSBydWxlSW5mby5zZWxlY3RvcixcbiAgICAgICAgICAgIGNzcyA9IHJ1bGVJbmZvLmNzcztcblxuICAgICAgICBpZiAoZG9jdW1lbnQuaGVhZCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZVRhZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKHN0eWxlVGFnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0eWxlU2hlZXQgPSBzdHlsZVRhZy5zaGVldCB8fCBzdHlsZVRhZy5zdHlsZVNoZWV0O1xuXG4gICAgICAgIGlmIChzdHlsZVNoZWV0Lmluc2VydFJ1bGUpIHtcbiAgICAgICAgICAgIHN0eWxlU2hlZXQuaW5zZXJ0UnVsZShzZWxlY3RvciArICd7JyArIGNzcyArICd9JywgMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHlsZVNoZWV0LmFkZFJ1bGUoc2VsZWN0b3IsIGNzcywgMCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZCBldmVudCB0byBlbGVtZW50XG4gICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0IC0gVGFnIGZvciBiaW5kaW5nIGV2ZW50XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50VHlwZSAtIEV2ZW50IHR5cGVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIEV2ZW50IGhhbmRsZXIgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBiaW5kRXZlbnQ6IGZ1bmN0aW9uKHRhcmdldCwgZXZlbnRUeXBlLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIGlmICh0YXJnZXQuYXR0YWNoRXZlbnQpIHtcbiAgICAgICAgICAgIHRhcmdldC5hdHRhY2hFdmVudCgnb24nICsgZXZlbnRUeXBlLCBjYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRbJ29uJyArIGV2ZW50VHlwZV0gPSBjYWxsYmFjaztcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbDtcbiJdfQ==
