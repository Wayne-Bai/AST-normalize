/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Automation to test $A.error()
 */
({
    testSimpleString : {
        test : function(cmp) {
            var errorMsg = "Simple text";
            $A.test.expectAuraError(errorMsg);
            $A.error(errorMsg);
            this.assertErrorMessage(errorMsg);
        }
    },
    testHtmlMarkup : {
        test : function(cmp) {
            var errorMsg = "<div>Run away, house on fire!</div>";
            $A.test.expectAuraError(errorMsg);
            $A.error(errorMsg);
            this.assertErrorMessage(errorMsg);
        }
     },
     testEscapedHtml : {
         test : function(cmp) {
            var errorMsg = "&lt;div&gt; Run forrest, run. &lt;/div&gt;";
            $A.test.expectAuraError(errorMsg);
            $A.error(errorMsg)
            this.assertErrorMessage(errorMsg);
        }
    },
    testStackTracePresent : {
        // A useful stacktrace isn't available on all browsers
        browsers : ["-IE7", "-IE8", "-IE9", "-IPAD", "-IPHONE", "-SAFARI"],
        test : function(cmp) {
            var errorMsg = "Verifying stack trace present";
            $A.test.expectAuraError(errorMsg);
            $A.error(errorMsg);
            this.assertErrorMessage(errorMsg);
            //
            // Stack traces are not consistent enough to look for content... grrr.
            //
            $A.test.assertTrue($A.test.getAuraErrorMessage().length > 35, "Missing stacktrace.");
        }
    },
    /**
     * Passing in an Error object for the message param is not proper usage and display "Unknown Error", but still
     * displays the Error message and stack (if available) to the user.
     */
    testErrorObjectAsMessageParam : {
        test : function(cmp) {
            $A.test.expectAuraError("Unknown Error");
            $A.error(new Error("foo"));
            this.assertErrorMessage("Unknown Error : foo");
        }
    },
    testEmptyErrorObjectAsMessageParam : {
        test : function(cmp) {
            $A.test.expectAuraError("Unknown Error");
            $A.error(new Error());
            this.assertErrorMessage("Unknown Error");
        }
    },
    testMapAsMessageParam : {
        test : function(cmp) {
            var map = { first: "first error", second: "second error" };
            var errorMsg = "Unknown Error : caught {\"first\":\"" + map['first'] +
                    '\",\"second\":\"' + map['second'] + "\"}";
            $A.test.expectAuraError(errorMsg);
            $A.error(map);
            this.assertErrorMessage(errorMsg);
        }
    },
    testMessageAndError : {
        test : function(cmp) {
            $A.test.expectAuraError("foo");
            $A.error("foo", new Error("bar"));
            this.assertErrorMessage("foo : bar");
        }
    },
    testDuplicateErrorMsgAllExpected : {
    	test : function(cmp) { 
    		//on test_priv: we allow duplication with expecting error messages
    		$A.test.expectAuraError("foo");
    		$A.test.expectAuraError("foo");
    		//on browser: error msg comes later will override previous one
    		$A.error("foo", new Error("bar1"));
    		$A.error("foo", new Error("bar2"));
    		this.assertErrorMessage("foo : bar2");
    	}
    },
    /**
     * Verify passing a string in for the Error param of $A.error() gives does
     * something sensible with the non-Error information it has.
     */
    testStringForErrorParam : {
        test : function(cmp) {
            $A.test.expectAuraError("foo");
            $A.error("foo", "bar");
           this.assertErrorMessage("foo : caught \"bar\"");
        }
    },
    assertErrorMessage : function(expectedMsg) {
        var messageDiv = $A.util.getElement("auraErrorMessage");
        $A.test.assertNotNull(messageDiv, "Aura error message box did is not present after $A.error()");
        $A.test.assertEquals(1, messageDiv.childNodes.length);
        $A.test.assertEquals("#text", messageDiv.childNodes[0].nodeName);
        var actualMsg = $A.test.getAuraErrorMessage();

        // Get rid of newlines for browser compatability, specifically IE.
        actualMsg = actualMsg.replace(/\r\n|\n/g, '');
        expectedMsg = expectedMsg.replace(/\r\n|\n/g, '');
        $A.test.assertStartsWith(expectedMsg, actualMsg, "$A.error failed to display proper error text. Expecting <"
            + expectedMsg + "> but got <" + actualMsg + ">");
    }
})
