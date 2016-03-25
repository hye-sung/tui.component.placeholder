/**
 * @fileoverview Generate custom placehoder on browsers not supported 'placehoder'
 * @author NHN Ent. FE dev team.<dl_javascript@nhnent.com>
 */

'use strict';

var util = require('./util.js');

var Placeholder,
    isSupportPlaceholder,
    browser = tui.util.browser,
    hasComputedStyleFunc = window.getComputedStyle ? true : false,
    KEYCODE_BACK = 8,
    KEYCODE_TAB = 9;

if (browser.msie && (browser.version > 9 && browser.version <= 11)) {
    util.addCssRule({
        selector: ':-ms-input-placeholder',
        css: 'color:#fff !important;text-indent:-9999px;'
    });
} else if (browser.chrome || browser.safari) {
    util.addCssRule({
        selector: 'input:-webkit-autofill',
        css: '-webkit-box-shadow: 0 0 0 1000px white inset;'
    });
}

isSupportPlaceholder = 'placeholder' in document.createElement('input') && !(browser.msie && browser.version <= 11);

/**
 * Create placeholder class
 * @class Placeholder
 * @constructor
 */
 Placeholder = tui.util.defineClass(/** @lends Placeholder.prototype */{
     init: function() {
         /**
          * Array pushed 'input' tags in current page
          * @type  {Array}
          * @private
          */
         this._inputElems = [];

         this.add();
     },

     /**
      * When create dynamic 'input' tag and append on page, generate custom placeholder
      * @param {HTMLElement[]} elements - All 'input' tags
      * @returns {Boolean} If a browser support 'placeholder' property and has any condition, returns
      * @example
      * tui.component.Placeholder.add(document.getElementsByTagName('input'));
      * @api
      */
     add: function(elements) {
         if (isSupportPlaceholder) {
             return false;
         }

         if (elements) {
             this._inputElems = this._inputElems.concat(tui.util.toArray(elements));
         } else {
             this._inputElems = tui.util.toArray(document.getElementsByTagName('input'));
         }

         if (this._inputElems.length) {
             this._generatePlaceholder(this._inputElems);
         }
     },

     /**
      * Return style info of imported style
      * @param  {HTMLElement} elem - First 'input' tag
      * @returns {Object} Style info
      * @private
      */
     _getInitStyle: function(elem) {
         var computedObj,
             styleInfo;

         if (hasComputedStyleFunc) {
             computedObj = window.getComputedStyle(elem, null);
             styleInfo = {
                 fontSize: computedObj.getPropertyValue('font-size'),
                 fixedHeight: computedObj.getPropertyValue('line-height'),
                 fixedWidth: computedObj.getPropertyValue('width')
             };
         } else {
             computedObj = elem.currentStyle;
             styleInfo = {
                 fontSize: computedObj.fontSize,
                 fixedHeight: computedObj.lineHeight,
                 fixedWidth: computedObj.width
             };
         }

         return styleInfo;
     },

     /**
      * Generator virtual placeholders for browser not supported 'placeholder' property
      * @private
      */
     _generatePlaceholder: function() {
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
      * Attach a new custom placehoder tag after a selected 'input' tag and wrap 'input' tag
      * @param  {HTMLElement} target - The 'input' tag
      * @private
      */
     _attachCustomPlaceholder: function(target) {
         var initStyle = this._getInitStyle(target),
             fontSize = initStyle.fontSize,
             fixedHeight = initStyle.fixedHeight,
             wrapTag = document.createElement('span'),
             placeholder = target.getAttribute('placeholder');

         target.style.cssText = this._getInputStyle(fontSize, fixedHeight);

         wrapTag.innerHTML = this._generateSpanTag(fontSize, placeholder);
         wrapTag.appendChild(target.cloneNode());

         target.parentNode.insertBefore(wrapTag, target.nextSibling);
         target.parentNode.removeChild(target);

         wrapTag.style.cssText = this._getWrapperStyle(initStyle.fixedWidth);

         this._bindEventToCustomPlaceholder(wrapTag);
     },

     /**
      * Bind event custom placehoder tag
      * @param  {HTMLElement} target - The 'input' tag's wrapper tag
      * @private
      */
     _bindEventToCustomPlaceholder: function(target) {
         var inputTag = target.getElementsByTagName('input')[0],
             spanTag = target.getElementsByTagName('span')[0],
             spanStyle = spanTag.style;

         util.bindEvent(spanTag, 'mousedown', function(e) {
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
      * Get style of 'input' tag's parent tag
      * @param  {Number} fixedWidth - The 'input' tag's 'width' property value
      * @returns {String} String of custom placehoder wrapper tag's style
      * @private
      */
     _getWrapperStyle: function(fixedWidth) {
         return 'position:relative;display:inline-block;*display:inline;zoom:1;width:' + fixedWidth + ';';
     },

     /**
      * Get style of 'input' tag
      * @param  {Number} fontSize - The 'input' tag's 'font-size' property value
      * @param  {Number} fixedHeight - The 'input' tag's 'line-height' property value
      * @returns {String} String of 'input' tag's style
      * @private
      */
     _getInputStyle: function(fontSize, fixedHeight) {
         return 'font-size:' + fontSize + ';height:' + fixedHeight + ';line-height:' + fixedHeight + ';';
     },

     /**
      * [function description]
      * @param  {Number} fontSize - Current ''input' tag's 'font-size' property value
      * @param  {String} placehoderText - Current 'input' tag's value
      * @returns {String} String of custom placehoder tag
      * @private
      */
     _generateSpanTag: function(fontSize, placehoderText) {
         var html = '<span style="position:absolute;left:0;top:50%;color:#aaa;';

         html += 'display:inline-block;margin-top:' + (-(parseFloat(fontSize, 10) / 2 + 1)) + 'px;';
         html += 'font-size:' + fontSize + '" UNSELECTABLE="on">' + placehoderText + '</span>';

         return html;
     }
});

module.exports = new Placeholder();
