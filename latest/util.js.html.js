tui.util.defineNamespace("fedoc.content", {});
fedoc.content["util.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>'use strict';\n\nvar util = {\n    /**\n     * Generate 'style' tag and add css rule\n     * @param  {Object} ruleInfo - selector and css value\n     */\n    addCssRule: function(ruleInfo) {\n        var styleTag = document.createElement('style'),\n            styleSheet,\n            selector = ruleInfo.selector,\n            css = ruleInfo.css;\n\n        if (document.head) {\n            document.head.appendChild(styleTag);\n        } else {\n            document.getElementsByTagName('head')[0].appendChild(styleTag);\n        }\n\n        styleSheet = styleTag.sheet || styleTag.styleSheet;\n\n        if (styleSheet.insertRule) {\n            styleSheet.insertRule(selector + '{' + css + '}', 0);\n        } else {\n            styleSheet.addRule(selector, css, 0);\n        }\n    },\n\n    /**\n     * Bind event to element\n     * @param  {HTMLElement} target - Tag for binding\n     * @param  {String} eventType - Event type\n     * @param  {Function} callback - Event handler function\n     */\n    bindEvent: function(target, eventType, callback) {\n        if (target.addEventListener) {\n            target.addEventListener(eventType, callback, false);\n        } else if (target.attachEvent) {\n            target.attachEvent('on' + eventType, callback);\n        } else {\n            target['on' + eventType] = callback;\n        }\n    }\n};\n\nmodule.exports = util;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"