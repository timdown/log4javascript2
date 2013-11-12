(function(api) {
    var UNDEFINED = "undefined",
        STRING = "string",
        OBJECT = "object",
        FUNCTION = "function",
        NULL = "null",
        Strings = api.Strings,
        Arrays = api.Arrays,
        toStr = Strings.toStr,
        splitIntoLines = Strings.splitIntoLines,
        arrayIndexOf = Arrays.indexOf,
        isArrayLike = Arrays.isArrayLike,
        reportError = api.reportError,
        exceptionToStr = api.exceptionToStr,
        canEvaluateProperty = api.canEvaluateProperty;


    function Formattable() {}

    Formattable.prototype.toFormatted = function() {
        reportError("Formattable: Formattable object must have a toFormatted method");
    };

    api.createFormattable = function(constructorFunc, toFormattedFunc) {
        constructorFunc.prototype = new Formattable();
        constructorFunc.prototype.toFormatted = toFormattedFunc;
    };

    api.expandObject = function() {
        var STRING_NODE = 1, ARRAY_NODE = 2, OBJECT_NODE = 3, EXPANDED_NODE = 4;

        function expandProperty(obj, prop, levels, isArray, expansion) {
            try {
                return expand(obj[prop], levels, expansion, isArray ? null : prop);
            } catch (ex) {
                return new Node(STRING_NODE, "(Error formatting " + (isArray ? "array member" : "object property") +
                        ". Details: " + exceptionToStr(ex) + ")", "" + prop);
            }
        }

        function Node(type, value, propertyName, quoted) {
            this.type = type;
            this.propertyName = propertyName;
            this.value = quoted ? '"' + value + '"' : value;
            this.nodes = [];
        }

        api.extend(Node.prototype, {
            toDefaultString: function(indentation, lines, expansion) {
                var i, len, line;
                lines = lines || [];

                if (this.type == STRING_NODE) {
                    var valueLines = splitIntoLines(this.value);
                    for (i = 0, len = valueLines.length - 1; i <= len; ++i) {
                        line = valueLines[i];
                        if (i == 0 && this.propertyName) {
                            line = this.propertyName + ": " + line;
                        }
                        lines.push(indentation + line);
                    }
                } else if (this.type == EXPANDED_NODE) {
                    line = toStr(this.value) + " (already expanded)";
                    if (this.propertyName) {
                        line = this.propertyName + ": " + line;
                    }
                    lines.push(indentation + line);
                } else {
                    var startChar, endChar;
                    if (this.type == ARRAY_NODE) {
                        startChar = "[";
                        endChar = "]";
                    } else {
                        startChar = "{";
                        endChar = "}";
                    }
                    line = startChar;
                    if (this.propertyName) {
                        line = this.propertyName + ": " + line;
                    }
                    lines.push(indentation + line);
                    var childIndentation = indentation + "  ";
                    for (i = 0, len = this.nodes.length - 1; i <= len; ++i) {
                        this.nodes[i].toDefaultString(childIndentation, lines, expansion);
                        if (i != len) {
                            lines[lines.length - 1] += ",";
                        }
                    }
                    lines.push(indentation + endChar);
                }
                return lines;
            }

        });

        function Expansion(obj, maxDepth, showMethods, alphabetical, quoteStrings) {
            this.maxDepth = maxDepth;
            this.showMethods = showMethods;
            this.alphabetical = alphabetical;
            this.quoteStrings = quoteStrings;
            this.expandedObjects = [];
            this.objectExpansions = [];

            this.rootNode = expand(obj, maxDepth, this);
        }

        api.extend(Expansion.prototype, {
            registerObjectExpansion: function(object, expansionNode) {
                var objectExpandedIndex = this.expandedObjects.length;
                this.expandedObjects[objectExpandedIndex] = object;
                this.objectExpansions[objectExpandedIndex] = expansionNode;
            },

            getObjectExpansion: function(obj) {
                var objectExpandedIndex = arrayIndexOf(this.expandedObjects, obj);
                return objectExpandedIndex > -1 ? this.objectExpansions[objectExpandedIndex] : null;
            },

            toDefaultString: function() {
                return this.rootNode.toDefaultString("", [], this);
            }
        });

        function expand(obj, levels, expansion, propertyName) {
            var i, len, objectExpansion, childLevels, node;

            /* First, check if there's a renderer that wants to handle this object */
            var renderer = api.getRenderer(obj);
            if (renderer) {
                return new Node(STRING_NODE, renderer.doRender(obj), propertyName);
            } else if (obj === null) {
                return new Node(STRING_NODE, NULL, propertyName);
            } else {
                switch (typeof obj) {
                    case UNDEFINED:
                        return new Node(STRING_NODE, NULL, propertyName);
                    case STRING:
                        return new Node(STRING_NODE, obj, propertyName, expansion.quoteStrings);
                    case FUNCTION:
                        return new Node(STRING_NODE, "" + obj, propertyName);
                    case OBJECT:
                        if (obj instanceof Formattable) {
                            return new Node(STRING_NODE, obj.toFormatted(), propertyName);
                        } else if (Object.prototype.toString.call(obj) == "[object Date]") {
                            return new Node(STRING_NODE, obj.toString(), propertyName);
                        } else if ((objectExpansion = expansion.getObjectExpansion(obj))) {
                            return new Node(EXPANDED_NODE, objectExpansion, propertyName);
                        } else if (isArrayLike(obj) && levels > 0) {
                            childLevels = levels - 1;
                            node = new Node(ARRAY_NODE, null, propertyName);

                            for (i = 0, len = obj.length; i < len; ++i) {
                                if (canEvaluateProperty(obj, i)) {
                                    node.nodes.push(expandProperty(obj, i, childLevels, true, expansion));
                                }
                            }

                            expansion.registerObjectExpansion(obj, node);
                            return node;
                        } else if (levels > 0) {
                            childLevels = levels - 1;
                            node = new Node(OBJECT_NODE, null, propertyName);

                            // Separate the properties from the methods, filtering out methods if required
                            var propertyNames = [], methodNames = [], isMethod;

                            for (var p in obj) {
                                if (canEvaluateProperty(obj, p)) {
                                    isMethod = (typeof obj[p] == FUNCTION);
                                    if (!isMethod || expansion.showMethods) {
                                        (isMethod ? methodNames : propertyNames).push(p);
                                    }
                                }
                            }

                            // Sort the property names
                            if (expansion.alphabetical) {
                                propertyNames.sort();
                                methodNames.sort();
                            }
                            if (methodNames.length) {
                                propertyNames = propertyNames.concat(methodNames);
                            }

                            // Create expansions for each property
                            for (i = 0, len = propertyNames.length; i < len; ++i) {
                                node.nodes.push(expandProperty(obj, propertyNames[i], childLevels, false, expansion));
                            }

                            expansion.registerObjectExpansion(obj, node);
                            return node;
                        }
                        /* Deliberately dropping through to default case */

                    default:
                        /* Covers Booleans, Numbers, host objects and any object that is not being expanded */
                        return new Node(STRING_NODE, toStr(obj), propertyName);
                }
            }
        }

        return function(obj, maxDepth, indentation, quoteStrings, alphabetical, showMethods) {
            //console.log(obj, maxDepth, indentation, quoteStrings, alphabetical, showMethods, new Expansion(obj, maxDepth, showMethods, alphabetical, quoteStrings));
            return new Expansion(obj, maxDepth, showMethods, alphabetical, quoteStrings);
        };
    }();
})(log4javascript);
