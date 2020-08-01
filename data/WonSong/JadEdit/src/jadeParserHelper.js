/**
 * JadEdit: Embeddable JavaScript Editor using Jade Syntax
 *
 * @author William Weithers
 */

var JadEditJadeParserHelper = (function () {

    'use strict';

    function JadEditJadeParserHelper() {
        if (!(this instanceof JadEditJadeParserHelper)) {

            return new JadEditJadeParserHelper();

        }

        this.getProcessedTag = function (child_level) {
            var currentLevel = levels[child_level];

            if (currentLevel.isCreating('any')) {
                currentLevel.flush();
            }

            var aReturnValue = [currentLevel.sTagName];

            if (currentLevel.aClassList.length > 0) {
                aReturnValue.push(CLASS_ATTRIBUTE.replace(ZERO_PLACE_HOLDER, currentLevel.aClassList.join(' ')));
            }
            if (currentLevel.sId !== EMPTY_STRING) {
                aReturnValue.push(ID_ATTRIBUTE.replace(ZERO_PLACE_HOLDER, currentLevel.sId));
            }
            if (currentLevel.sAttributeList !== EMPTY_STRING) {
                aReturnValue.push(currentLevel.sAttributeList);
            }

            return {
                'withoutAttribute': currentLevel.sTagName,
                'withAttribute': aReturnValue.join(' '),
                'isTextOnly': currentLevel.bContinuingText
            };
        };

        this.flush = function (child_level) {
            levels[child_level].flush();
        };

        levels[0] = new LevelObj();
    }

    //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
    // Constants
    //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
    var REGEX_BEGIN_TAG = /[a-z]$/i;
    var REGEX_BEGIN_CLASS = /\.$/;
    var REGEX_BEGIN_ID = /#$/;
    var REGEX_BEGIN_ATTRIBUTE_LIST = /\($/;
    var REGEX_END_ATTRIBUTE_LIST = /\)$/;
    var REGEX_BEGIN_ATRIBUTE_NAME = /[a-z]$/i;
    var REGEX_END_ATTRIBUTE_NAME = /=$/;
    var REGEX_BEGIN_ATTRIBUTE_VALUE = /['"]$/;
    var REGEX_ESCAPE_CHAR = /\\$/;
    var REGEX_SPACE = /\s$/;
    var REGEX_CHILD_LEVEL = /\t/;
    var REGEX_CONTINUE_TEXT = /^\|$/;
    var REGEX_ACCEPTED_OTHER_CHARS = /[a-z0-9_-]$/i;
    var REGEX_NEW_LINE = /^$/;
    var NO_SPACE = -1;
    var EMPTY_STRING = '';
    var ZERO_PLACE_HOLDER = '{0}';
    var CLASS_ATTRIBUTE = 'class="' + ZERO_PLACE_HOLDER + '"';
    var ID_ATTRIBUTE = 'id="' + ZERO_PLACE_HOLDER + '"';

    //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
    // Flags
    //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

    //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
    // Stored Values
    //_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
    var levels = [];

    function LevelObj() {
        this.bCreatingTag = false;
        this.bCreatingClass = false;
        this.bCreatingId = false;
        this.bCreatingAttributeList = false;

        this.bCreatingAttributeName = false;
        this.bHaveAttributeName = false;
        this.bCreatingAttributeValue = false;
        this.bEscapingNextChar = false;
        this.bFinishedProcessing = false;
        this.bContinuingText = false;
        this.bFinalized = false;

        this.aClassList = [];

        this.sCurrentValue = EMPTY_STRING;
        this.sBeginAttributeValueQuote = null;
        this.sTagName = EMPTY_STRING;
        this.sId = EMPTY_STRING;
        this.sAttributeList = EMPTY_STRING;
        this.regEndAttributeValue = null;
        this.sCurrentCreationValue = EMPTY_STRING;

        this.iReturnValue = -1;

        function isFlag(property) {
            var result = false;
            if (this.hasOwnProperty(property) && typeof(this[property]) === 'boolean') {
                result = true;
            }
            return result;
        }

        this.isCreating = function (field) {
            var result = null;
            if (isFlag.call(this, field)) {
                result = this[field];
            } else {
                result = xor(this.bCreatingTag, this.bCreatingClass, this.bCreatingId, this.bCreatingAttributeList);
            }
            return result;
        };

        this.reset = function () {
            this.bCreatingTag = false;
            this.bCreatingClass = false;
            this.bCreatingId = false;
            this.bCreatingAttributeList = false;

            this.bCreatingAttributeName = false;
            this.bHaveAttributeName = false;
            this.bCreatingAttributeValue = false;
            this.bEscapingNextChar = false;
            this.bFinishedProcessing = false;
            this.bContinuingText = false;
            this.bFinalized = false;

            this.aClassList = [];

            this.sCurrentValue = EMPTY_STRING;
            this.sBeginAttributeValueQuote = null;
            this.sTagName = 'br';
            this.sId = EMPTY_STRING;
            this.sAttributeList = EMPTY_STRING;
            this.regEndAttributeValue = null;
            this.sCurrentCreationValue = EMPTY_STRING;

            this.iReturnValue = -1;

        };
        this.finishCreation = function (maintain_status) {
            var value = '' + this.sCurrentCreationValue;
            if (this.bCreatingTag) {
                this.sTagName = value;
                if (maintain_status !== true) {
                    this.bCreatingTag = false;
                }
            }
            else if (this.bCreatingId) {
                this.sId = value;
                if (maintain_status !== true) {
                    this.bCreatingId = false;
                }
            }
            else if (this.bCreatingClass) {
                if (this.aClassList.indexOf(this.sCurrentCreationValue) === -1) {
                    if (maintain_status === true && value.startsWith(this.aClassList[this.aClassList.length - 1])) {
                        this.aClassList.pop();
                    }
                    this.aClassList.push(value);
                }
                if (maintain_status !== true) {
                    this.bCreatingClass = false;
                }
            } else if (this.bCreatingAttributeList) {
                this.sAttributeList = value;
                if (maintain_status !== true) {
                    this.bCreatingAttributeList = false;
                }
            }

            if (maintain_status !== true) {
                this.sCurrentCreationValue = EMPTY_STRING;
            }
        };
        this.finalize = function () {
            this.finishCreation();
            this.toggleOn('bFinalized');
        };
        this.flush = function () {
            this.finishCreation(true);
            this.iReturnValue = this.sCurrentValue.length;
        };
        this.toggleOn = function (name) {
            if (isFlag.call(this, name)) {
                this[name] = true;
            }
        };
        this.toggleOff = function (name) {
            if (isFlag.call(this, name)) {
                this[name] = false;
            }
        };
        this.isOn = function (property) {
            var result = false;
            if (isFlag.call(this, property)) {
                result = this[property];
            }
            if (arguments.length > 1) {
                result = xor(result, this.isOn(Array.prototype.slice.call(arguments, 1)));
            }
            return result;
        };
        this.addToCurrentValue = function (character) {
            this.sCurrentValue += character;
        };

        this.addToCurrentCreationValue = function (character) {
            this.sCurrentCreationValue += character;
        };
        this.setCurrentCreationValue = function (character) {
            this.sCurrentCreationValue = character;
        };
    }

    function newLevel(child_level) {
        if (child_level === levels.length) {
            levels[child_level - 1].finalize();
            levels[child_level] = new LevelObj();
        }
    }

    function reset(child_level) {
        if (child_level === 0) {
            levels = [];
            levels[0] = new LevelObj();
        } else if (child_level < levels.length) {
            levels[child_level].reset();
        } else {
            levels[child_level - 1].finalize();
            newLevel(child_level);
        }
    }

    function throwInvalidError(character, current_value) {
        var msg = 'Character "{0}" is not valid at this point in the line. [{1}].';
        var errMsg = null;
        if (/\t/.test(character)) {
            errMsg = msg.replace('{0}', '[tab]').replace('{1}', current_value);
        } else if (character === ' ') {
            errMsg = msg.replace('{0}', '[space]').replace('{1}', current_value);
        } else {
            errMsg = msg.replace('{0}', character).replace('{1}', current_value);
        }
        throw new Error(errMsg);
    }

    function processCharacter(character, child_level) {
        var currentLevel = levels[child_level];

        // if the passed character is white space and there is not creation occuring
        // set the return value to either 0, if the current value is null, or the
        // length of the current value.
        if (!( currentLevel.isOn('bFinalized') )) {
            if (REGEX_SPACE.test(character) || REGEX_CONTINUE_TEXT.test(character)) {
                if (REGEX_CONTINUE_TEXT.test(character)) {
                    currentLevel.sTagName = '';
                    currentLevel.toggleOn('bContinuingText');
                }
                if (currentLevel.isCreating('bCreatingAttributeValue')) {
                    currentLevel.addToCurrentCreationValue(character);
                } else {
                    currentLevel.finalize();
                }
            }
            else if (REGEX_BEGIN_TAG.test(character) && !currentLevel.isCreating('any')) {
                currentLevel.toggleOn('bCreatingTag');
                currentLevel.addToCurrentCreationValue(character);
            }
            else if (REGEX_BEGIN_CLASS.test(character)) {
                if (!currentLevel.isCreating('any')) {
                    throwInvalidError(character, currentLevel.sCurrentValue);
                }
                else if (currentLevel.isOn('bCreatingAttributeValue')) {
                    currentLevel.addToCurrentCreationValue(character);
                } else {
                    currentLevel.finishCreation();
                    currentLevel.toggleOn('bCreatingClass');
                }
            }
            else if (REGEX_BEGIN_ID.test(character)) {
                if (!currentLevel.isCreating('any')) {
                    throwInvalidError(character, currentLevel.sCurrentValue);
                }
                else if (currentLevel.isOn('bCreatingAttributeValue')) {
                    currentLevel.addToCurrentCreationValue(character);
                } else {
                    currentLevel.finishCreation();
                    currentLevel.toggleOn('bCreatingId');
                }
            }
            else if (REGEX_BEGIN_ATTRIBUTE_LIST.test(character)) {
                if (!currentLevel.isCreating('any')) {
                    throwInvalidError(character, currentLevel.sCurrentValue);
                }
                else if (currentLevel.isOn('bCreatingAttributeValue')) {
                    currentLevel.addToCurrentCreationValue(character);
                } else {
                    currentLevel.finishCreation();
                    currentLevel.toggleOn('bCreatingAttributeList');
                    currentLevel.toggleOn('bCreatingAttributeName');
                }
            }
            else if (REGEX_END_ATTRIBUTE_LIST.test(character)) {
                if (!currentLevel.isCreating('any')) {
                    throwInvalidError(character, currentLevel.sCurrentValue);
                }
                else if (currentLevel.isOn('bCreatingAttributeValue')) {
                    currentLevel.addToCurrentCreationValue(character);
                } else {
                    currentLevel.finishCreation();
                }
            }
            else if (REGEX_END_ATTRIBUTE_NAME.test(character)) {
                if (!( currentLevel.isOn('bCreatingAttributeValue', 'bCreatingAttributeName') )) {
                    throwInvalidError(character, currentLevel.sCurrentValue);
                }
                else if (currentLevel.isOn('bCreatingAttributeValue')) {
                    currentLevel.addToCurrentCreationValue(character);
                }
                else if (currentLevel.isCreating('any')) {
                    currentLevel.toggleOn('bHaveAttributeName');
                    currentLevel.addToCurrentCreationValue(character);
                }
            } else if (REGEX_BEGIN_ATTRIBUTE_VALUE.test(character)) {
                if (!( currentLevel.isOn('bHaveAttributeName', 'bCreatingAttributeValue', 'bEscapingNextChar') )) {
                    throwInvalidError(character, currentLevel.sCurrentValue);
                } else if (currentLevel.sBeginAttributeValueQuote === null) {
                    currentLevel.sBeginAttributeValueQuote = character;
                    currentLevel.toggleOn('bCreatingAttributeValue');
                    currentLevel.addToCurrentCreationValue(character);
                } else if (currentLevel.sBeginAttributeValueQuote === character) {
                    if (currentLevel.isOn('bEscapingNextChar')) {
                        currentLevel.toggleOff('bEscapingNextChar');
                    } else {
                        currentLevel.toggleOff('bCreatingAttributeValue');
                        currentLevel.toggleOff('bHaveAttributeName');
                        currentLevel.sBeginAttributeValueQuote = null;
                    }
                    currentLevel.addToCurrentCreationValue(character);
                }
            } else if (REGEX_ESCAPE_CHAR.test(character)) {
                if (currentLevel.isOn('bCreatingAttributeValue')) {
                    currentLevel.toggleOn('bEscapingNextChar');
                    currentLevel.addToCurrentCreationValue(character);
                }
            }
            else if (REGEX_ACCEPTED_OTHER_CHARS.test(character)) {
                if (currentLevel.isCreating('any')) {
                    currentLevel.addToCurrentCreationValue(character);
                } else {
                    currentLevel.addToCurrentCreationValue(character);
                }
            } else {
                currentLevel.addToCurrentCreationValue(character);
            }
            currentLevel.addToCurrentValue(character);
            currentLevel.iReturnValue = currentLevel.sCurrentValue.length;
        }
    }

    function process(value, child_level) {

        if (levels[child_level] === undefined) {
            reset(child_level);
        }

        var currentLevel = levels[child_level];

        if (REGEX_NEW_LINE.test(value)) {	// if this is a new line, reset all stored values.
            reset(child_level);
        }
        // if value begins with the currently stored value then
        // the user has added a new character...
        else if (value.startsWith(currentLevel.sCurrentValue)) {
            // ... so process just the last character of the value
            // passing the entire value as the 'this' context to
            // processCharacter.
            if (value.length > currentLevel.sCurrentValue.length) {
                value.substring(currentLevel.sCurrentValue.length).split('').forEach(function (character) {
                    processCharacter(character, child_level);
                });
            }
        }
        else if (currentLevel.sCurrentValue.startsWith(value)) {
            currentLevel.reset();
            currentLevel.sCurrentValue.split('').forEach(function (character) {
                processCharacter(character, child_level);
            });
        }
        else {
            currentLevel.reset();
            value.split('').forEach(function (character) {
                processCharacter(character, child_level);
            });
        }
        return levels[child_level].iReturnValue;
    }

    String.prototype.customIndexOfSpace = function (level) {
        if (this === undefined || this === null) {
            throw new Error('Attempt to call customIndexOfSpace on null or undefined value.');
        }

        return process(this.toString(), level);
    };

    if (!( 'startsWith' in String.prototype)) {
        String.prototype.startsWith = function (value) {
            if (value === null || value === undefined) {
                return false;
            }

            var stringValue = this;

            return stringValue.toString().indexOf(value) === 0;
        };
    }

    function xor(first, second){
        var result = ( (first || second ) && !(first && second) );
        if( arguments.length > 2 ){
            var next = Array.prototype.slice.call(arguments,2);
            next.unshift(result);
            result = xor.apply(null,next);
        }
        return result;
    }

    return JadEditJadeParserHelper;

})();
