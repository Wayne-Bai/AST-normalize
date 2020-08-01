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
({
	testDisplayDuration:{
        test:function(component){
        	var num = 1095957000000;
			var duration = $A.localizationService.duration(num, 'milliseconds');
	        $A.test.assertEquals("35 years", $A.localizationService.displayDuration(duration, false), "Both values should be same.");
	        $A.test.assertEquals("in 35 years", $A.localizationService.displayDuration(duration, true), "Both values should be same.");
        }
    },

	testDisplayDurationInDays:{
        test:function(component){
        	var num = 1095957000000;//Sep 23, 2004 4:30:00 PM
			var duration = $A.localizationService.duration(num, 'milliseconds');
    		$A.test.assertEquals(12684.6875, $A.localizationService.displayDurationInDays(duration), "Both values should be same.");
        }
    },

	testDisplayDurationInHours:{
        test:function(component){
        	var num = 1095957000000;//Sep 23, 2004 4:30:00 PM
			var duration = $A.localizationService.duration(num, 'milliseconds');
    		$A.test.assertEquals(304432.5, $A.localizationService.displayDurationInHours(duration), "Both values should be same.");
        }
    },

	testDisplayDurationInMilliseconds:{
        test:function(component){
        	var num = 1095957000000;//Sep 23, 2004 4:30:00 PM
			var duration = $A.localizationService.duration(num, 'milliseconds');
    		$A.test.assertEquals(num, $A.localizationService.displayDurationInMilliseconds(duration), "Both values should be same.");
        }
    },

	testDisplayDurationInMinutes:{
        test:function(component){
        	var num = 1095957000000;//Sep 23, 2004 4:30:00 PM
			var duration = $A.localizationService.duration(num, 'milliseconds');
    		$A.test.assertEquals(18265950, $A.localizationService.displayDurationInMinutes(duration), "Both values should be same.");
        }
    },

	testDisplayDurationInMonths:{
        test:function(component){
			var num = 1095957000000;//Sep 23, 2004 4:30:00 PM
			var duration = $A.localizationService.duration(num, 'milliseconds');
    		$A.test.assertEquals(422.8229166666667, $A.localizationService.displayDurationInMonths(duration), "Both values should be same.");
        }
    },

	testDisplayDurationInSeconds:{
        test:function(component){
			var num = 1095957000000;//Sep 23, 2004 4:30:00 PM
			var duration = $A.localizationService.duration(num, 'milliseconds');
    		$A.test.assertEquals(num/1000, $A.localizationService.displayDurationInSeconds(duration), "Both values should be same.");
        }
    },

	testDisplayDurationInYears:{
        test:function(component){
			var num = 1095957000000;//Sep 23, 2004 4:30:00 PM
			var duration = $A.localizationService.duration(num, 'milliseconds');
    		$A.test.assertEquals(34.75256849315068, $A.localizationService.displayDurationInYears(duration), "Both values should be same.");
        }
    },

    testGetDaysInDuration:{
        test:function(component){
			var num = 23;
			var duration = $A.localizationService.duration(num, 'days');
    		$A.test.assertEquals(num, $A.localizationService.getDaysInDuration(duration), "Both values should be same.");
        }
    },

    testGetHoursInDuration:{
        test:function(component){
			var num = 16;
			var duration = $A.localizationService.duration(num, 'hours');
    		$A.test.assertEquals(num, $A.localizationService.getHoursInDuration(duration), "Both values should be same.");
        }
    },

    testGetMillisecondsInDuration:{
        test:function(component){
			var num = 50;
			var duration = $A.localizationService.duration(num, 'milliseconds');
    		$A.test.assertEquals(num, $A.localizationService.getMillisecondsInDuration(duration), "Both values should be same.");
        }
    },

    testGetMinutesInDuration:{
        test:function(component){
			var num = 30;
			var duration = $A.localizationService.duration(num, 'minutes');
    		$A.test.assertEquals(num, $A.localizationService.getMinutesInDuration(duration), "Both values should be same.");
        }
    },

    testGetMonthsInDuration:{
        test:function(component){
			var num = 9;
			var duration = $A.localizationService.duration(num, 'months');
    		$A.test.assertEquals(num, $A.localizationService.getMonthsInDuration(duration), "Both values should be same.");
        }
    },

    testGetSecondsInDuration:{
        test:function(component){
			var num = 30;
			var duration = $A.localizationService.duration(num, 'seconds');
    		$A.test.assertEquals(num, $A.localizationService.getSecondsInDuration(duration), "Both values should be same.");
        }
    },

    testGetYearsInDuration:{
        test:function(component){
			var num = 13;
			var duration = $A.localizationService.duration(num, 'years');
    		$A.test.assertEquals(num, $A.localizationService.getYearsInDuration(duration), "Both values should be same.");
        }
    },

    testIsAfter:{
    	test:function(component){
            var format =  'MMM DD, YYYY h:mm:ss A';
	        var testCmp = component.find('myOutputDateTimeComp');
	        $A.test.assertNotNull(testCmp);
			$A.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},function(){
	        	var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
		        var dateObj1 = $A.localizationService.parseDateTime(outputDateStr, format, 'en');

		        // seconds
		        var dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2004 4:30:01 PM', format, 'en');
	    		$A.test.assertEquals(false, $A.localizationService.isAfter(dateObj1, dateObj2, 'seconds'), "date1 is not after date2.");
	    		$A.test.assertEquals(true, $A.localizationService.isAfter(dateObj2, dateObj1, 'seconds'), "date2 is after date1.");
	    		$A.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'seconds'), "Both dates are not same.");

	    		//minutes
	    		dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2004 4:31:00 PM', format, 'en');
	    		$A.test.assertEquals(false, $A.localizationService.isAfter(dateObj1, dateObj2, 'minutes'), "date1 is not after date2.");
	    		$A.test.assertEquals(true, $A.localizationService.isAfter(dateObj2, dateObj1, 'minutes'), "date1 is not after date2.");
	    		$A.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'minutes'), "Both dates are not same.");

	    		//minutes
	    		dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2004 5:30:00 PM', format, 'en');
	    		$A.test.assertEquals(false, $A.localizationService.isAfter(dateObj1, dateObj2, 'hours'), "date1 is not after date2.");
	    		$A.test.assertEquals(true, $A.localizationService.isAfter(dateObj2, dateObj1, 'hours'), "date1 is not after date2.");
	    		$A.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'hours'), "Both dates are not same.");

	    		//days
	    		dateObj2 = $A.localizationService.parseDateTime('Sep 24, 2004 4:30:00 PM', format, 'en');
	    		$A.test.assertEquals(false, $A.localizationService.isAfter(dateObj1, dateObj2, 'days'), "date1 is not after date2.");
	    		$A.test.assertEquals(true, $A.localizationService.isAfter(dateObj2, dateObj1, 'days'), "date1 is not after date2.");
	    		$A.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'days'), "Both dates are not same.");

	    		//months
	    		dateObj2 = $A.localizationService.parseDateTime('Oct 23, 2004 4:30:00 PM', format, 'en');
	    		$A.test.assertEquals(false, $A.localizationService.isAfter(dateObj1, dateObj2, 'months'), "date1 is not after date2.");
	    		$A.test.assertEquals(true, $A.localizationService.isAfter(dateObj2, dateObj1, 'months'), "date1 is not after date2.");
	    		$A.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'months'), "Both dates are not same.");

	    		//years
	    		dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2005 4:30:00 PM', format, 'en');
	    		$A.test.assertEquals(false, $A.localizationService.isAfter(dateObj1, dateObj2, 'years'), "date1 is not after date2.");
	    		$A.test.assertEquals(true, $A.localizationService.isAfter(dateObj2, dateObj1, 'years'), "date1 is not after date2.");
	    		$A.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'years'), "Both dates are not same.");
	        });
    	}
	},

	testIsBefore:{
    	test:function(component){
    	    var format =  'MMM DD, YYYY h:mm:ss A';
	        var testCmp = component.find('myOutputDateTimeComp');
	        $A.test.assertNotNull(testCmp);
			$A.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},function(){
	        	var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
		        var dateObj1 = $A.localizationService.parseDateTime(outputDateStr, format, 'en');

		        // seconds
		        var dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2004 4:30:01 PM', format, 'en');
	    		$A.test.assertEquals(true, $A.localizationService.isBefore(dateObj1, dateObj2, 'seconds'), "date1 is before date2.");
	    		$A.test.assertEquals(false, $A.localizationService.isBefore(dateObj2, dateObj1, 'seconds'), "date2 is not before date1.");
	    		$A.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'seconds'), "Both dates are not same.");

	    		//minutes
	    		dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2004 4:31:00 PM', format, 'en');
	    		$A.test.assertEquals(true, $A.localizationService.isBefore(dateObj1, dateObj2, 'minutes'), "date1 is before date2.");
	    		$A.test.assertEquals(false, $A.localizationService.isBefore(dateObj2, dateObj1, 'minutes'), "date1 is not before date2.");
	    		$A.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'minutes'), "Both dates are not same.");

	    		//minutes
	    		dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2004 5:30:00 PM', format, 'en');
	    		$A.test.assertEquals(true, $A.localizationService.isBefore(dateObj1, dateObj2, 'hours'), "date1 is before date2.");
	    		$A.test.assertEquals(false, $A.localizationService.isBefore(dateObj2, dateObj1, 'hours'), "date1 is not before date2.");
	    		$A.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'hours'), "Both dates are not same.");

	    		//days
	    		dateObj2 = $A.localizationService.parseDateTime('Sep 24, 2004 4:30:00 PM', format, 'en');
	    		$A.test.assertEquals(true, $A.localizationService.isBefore(dateObj1, dateObj2, 'days'), "date1 is before date2.");
	    		$A.test.assertEquals(false, $A.localizationService.isBefore(dateObj2, dateObj1, 'days'), "date1 is not before date2.");
	    		$A.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'days'), "Both dates are not same.");

	    		//months
	    		dateObj2 = $A.localizationService.parseDateTime('Oct 23, 2004 4:30:00 PM', format, 'en');
	    		$A.test.assertEquals(true, $A.localizationService.isBefore(dateObj1, dateObj2, 'months'), "date1 is before date2.");
	    		$A.test.assertEquals(false, $A.localizationService.isBefore(dateObj2, dateObj1, 'months'), "date1 is not before date2.");
	    		$A.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'months'), "Both dates are not same.");

	    		//years
	    		dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2005 4:30:00 PM', format, 'en');
	    		$A.test.assertEquals(true, $A.localizationService.isBefore(dateObj1, dateObj2, 'years'), "date1 is before date2.");
	    		$A.test.assertEquals(false, $A.localizationService.isBefore(dateObj2, dateObj1, 'years'), "date1 is not before date2.");
	    		$A.test.assertEquals(false, $A.localizationService.isSame(dateObj2, dateObj1, 'years'), "Both dates are not same.");
	        });
    	}
	},

	testIsSame:{
    	test:function(component){
    	    var format =  'MMM DD, YYYY h:mm:ss A';
            var testCmp = component.find('myOutputDateTimeComp');
            $A.test.assertNotNull(testCmp);
            $A.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},
                function(){
                    var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
                    var dateObj1 = $A.localizationService.parseDateTime(outputDateStr, format, 'en');
                    var dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2004 4:30:00 PM', format, 'en');

                    $A.test.assertEquals(true, $A.localizationService.isSame(dateObj1, dateObj2), "Both dates are same.");
                    $A.test.assertEquals(true, $A.localizationService.isSame(dateObj1, dateObj2, 'seconds'), "Both dates are same.");
                    $A.test.assertEquals(true, $A.localizationService.isSame(dateObj1, dateObj2, 'minutes'), "Both dates are same.");
                    $A.test.assertEquals(true, $A.localizationService.isSame(dateObj1, dateObj2, 'hours'), "Both dates are same.");
                    $A.test.assertEquals(true, $A.localizationService.isSame(dateObj1, dateObj2, 'days'), "Both dates are same.");
                    $A.test.assertEquals(true, $A.localizationService.isSame(dateObj1, dateObj2, 'weeks'), "Both dates are same.");
                    $A.test.assertEquals(true, $A.localizationService.isSame(dateObj1, dateObj2, 'months'), "Both dates are same.");
                    $A.test.assertEquals(true, $A.localizationService.isSame(dateObj1, dateObj2, 'years'), "Both dates are same.");
	        });
    	}
	},

    testEndOf:{
        test:function(component){
            var format =  'MMM DD, YYYY h:mm:ss A';
            var testCmp = component.find('myOutputDateTimeComp');
            $A.test.assertNotNull(testCmp);
            $A.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},
                function(){
                    var outputDateStr = $A.test.getText(testCmp.find('span').getElement());

                    var dateObj = $A.localizationService.endOf(outputDateStr, 'second');
                    $A.test.assertEquals('Sep 23, 2004 4:30:00 PM', $A.localizationService.formatDateTime(dateObj, format, 'en'), "Both values should be same.");

                    dateObj = $A.localizationService.endOf(outputDateStr, 'minute');
                    $A.test.assertEquals('Sep 23, 2004 4:30:59 PM', $A.localizationService.formatDateTime(dateObj, format, 'en'), "Both values should be same.");

                    dateObj = $A.localizationService.endOf(outputDateStr, 'hour');
                    $A.test.assertEquals('Sep 23, 2004 4:59:59 PM', $A.localizationService.formatDateTime(dateObj, format, 'en'), "Both values should be same.");

                    dateObj = $A.localizationService.endOf(outputDateStr, 'day');
                    $A.test.assertEquals('Sep 23, 2004 11:59:59 PM', $A.localizationService.formatDateTime(dateObj, format, 'en'), "Both values should be same.");

                    dateObj = $A.localizationService.endOf(outputDateStr, 'month');
                    $A.test.assertEquals('Sep 30, 2004 11:59:59 PM', $A.localizationService.formatDateTime(dateObj, format, 'en'), "Both values should be same.");

                    dateObj = $A.localizationService.endOf(outputDateStr, 'year');
                    $A.test.assertEquals('Dec 31, 2004 11:59:59 PM', $A.localizationService.formatDateTime(dateObj, format, 'en'), "Both values should be same.");
	        });
        }
    },


    testStartOf:{
        test:function(component){
            var format =  'MMM DD, YYYY h:mm:ss A';
            var testCmp = component.find('myOutputDateTimeComp');
            $A.test.assertNotNull(testCmp);
            $A.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},
                function(){
                    var outputDateStr = $A.test.getText(testCmp.find('span').getElement());

                    var dateObj = $A.localizationService.startOf(outputDateStr, 'second');
                    $A.test.assertEquals('Sep 23, 2004 4:30:00 PM', $A.localizationService.formatDateTime(dateObj, format, 'en'), "Both values should be same.");

                    dateObj = $A.localizationService.startOf(outputDateStr, 'minute');
                    $A.test.assertEquals('Sep 23, 2004 4:30:00 PM', $A.localizationService.formatDateTime(dateObj, format, 'en'), "Both values should be same.");

                    dateObj = $A.localizationService.startOf(outputDateStr, 'hour');
                    $A.test.assertEquals('Sep 23, 2004 4:00:00 PM', $A.localizationService.formatDateTime(dateObj, format, 'en'), "Both values should be same.");

                    dateObj = $A.localizationService.startOf(outputDateStr, 'day');
                    $A.test.assertEquals('Sep 23, 2004 12:00:00 AM', $A.localizationService.formatDateTime(dateObj, format, 'en'), "Both values should be same.");

                    dateObj = $A.localizationService.startOf(outputDateStr, 'month');
                    $A.test.assertEquals('Sep 01, 2004 12:00:00 AM', $A.localizationService.formatDateTime(dateObj, format, 'en'), "Both values should be same.");

                    dateObj = $A.localizationService.startOf(outputDateStr, 'year');
                    $A.test.assertEquals('Jan 01, 2004 12:00:00 AM', $A.localizationService.formatDateTime(dateObj, format, 'en'), "Both values should be same.");
	        });
        }
    },

    testFormatDate:{
        test:function(component){
            var testCmp = component.find('myOutputDateComp');
            $A.test.assertNotNull(testCmp);
            $A.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},
                function(){
                    var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
                    $A.test.assertEquals($A.localizationService.formatDate('Sep 23, 2004', 'MMM DD, YYYY', 'en'), outputDateStr, "Both dates should be same.");
                    $A.test.assertEquals($A.localizationService.formatDate('Sep 23, 2004', '', 'en'), outputDateStr, "Both dates should be same.");
                });
            var helper = component.getDef().getHelper();
            helper.testInvalidDateAndTime($A.localizationService.formatDate,'','','en',"Invalid date value","testFormatDate fail, Expected:Invalid date value");
            helper.testInvalidDateAndTime($A.localizationService.formatDate,'a','','en',"Invalid date value","testFormatDate fail, Expected:Invalid date value");
        }
    },

    testFormatDateUTC:{
        test:function(component){
            var testCmp = component.find('myOutputDateComp');
            $A.test.assertNotNull(testCmp);
            $A.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},
                function() {
                    var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
                    $A.test.assertEquals($A.localizationService.formatDateUTC('Sep 23, 2004', 'MMM DD, YYYY', 'en'),
                        'Sep 23, 2004', "formatDateUTC should keep the date constant");
                    $A.test.assertEquals($A.localizationService.formatDateUTC('Sep 23, 2004', 'MMM DD, YYYY', 'en'),
                         outputDateStr, "date should be the same as Fixed format UTC.");
                    $A.test.assertEquals($A.localizationService.formatDateUTC('Sep 23, 2004', '', 'en'), outputDateStr,
                        "date should be the same as Default [en] format UTC.");
                });
            var helper = component.getDef().getHelper();
            helper.testInvalidDateAndTime($A.localizationService.formatDateUTC,'','','en',"Invalid date value","testFormatDateUTC fail, Expected:Invalid date value");
            helper.testInvalidDateAndTime($A.localizationService.formatDateUTC,'a','','en',"Invalid date value","testFormatDateUTC fail, Expected:Invalid date value");
        }
    },

    
    testFormatDateTime:{
        test:function(component){
            var format =  'MMM DD, YYYY h:mm:ss A';
            var testCmp = component.find('myOutputDateTimeComp');
            $A.test.assertNotNull(testCmp);
            $A.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},
                function(){
                    var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
                    $A.test.assertEquals($A.localizationService.formatDateTime('Sep 23, 2004 4:30:00 PM', format, 'en'), outputDateStr, "Both datetimes should be same.");
                    $A.test.assertEquals($A.localizationService.formatDateTime('Sep 23, 2004 4:30:00 PM', '', 'en'), outputDateStr, "Both datetimes should be same.");
	        });
            var helper = component.getDef().getHelper();
            helper.testInvalidDateAndTime($A.localizationService.formatDateTime,'','','en',"Invalid date time value","testFormatDateTime fail, Expected:Invalid date time value");
            helper.testInvalidDateAndTime($A.localizationService.formatDateTime,'a','','en',"Invalid date time value","testFormatDateTime fail, Expected:Invalid date time value");
        }
    },
    
    /*
     * This test is excluded from ipad and iphone because safari on them treat daylight saving differently. as a result, 
     * we get "invalid date time" error on autobuild safari-ios (W-2123968)
     */
    testDaylightSavingTime: {
    	browsers: ["-IPAD","-IPHONE"],
        test:function(component){
            var expected1 = "Nov 3, 2013 12:01:00 AM";
            var expected2 = "Nov 3, 2013 1:01:00 AM";
            var expected3 = "Nov 3, 2013 2:01:00 AM";
            var helper = component.getDef().getHelper();
            helper.verifyDateAndTime(component,"myOutputDateTimeCompHongKong1",expected1);
            helper.verifyDateAndTime(component,"myOutputDateTimeCompHongKong2",expected2);
            helper.verifyDateAndTime(component,"myOutputDateTimeCompHongKong3",expected3);
            helper.verifyDateAndTime(component,"myOutputDateTimeCompNewYork1",expected1);
            helper.verifyDateAndTime(component,"myOutputDateTimeCompNewYork2",expected2);
            helper.verifyDateAndTime(component,"myOutputDateTimeCompNewYork3",expected2);
    	}
    },
    
    testFormatDateTimeUTC24HR:{
        test:function(component) {
    	var lang = 'en'; 
        var format = 'MMM DD, YYYY H:mm:ss A';
        //test end of summer time, 2004-10-31
        var dateAndTimeAMSummerTime = 'Oct 31, 2004 0:59:00 AM';
        var expectedAMSummerTime = dateAndTimeAMSummerTime;
        var actualAMSummerTime = $A.localizationService.formatDateTimeUTC(dateAndTimeAMSummerTime,format,lang);
        $A.test.assertEquals(expectedAMSummerTime,actualAMSummerTime,"get unexpected AMSummerTime in testFormatDateTimeUTC24HR of LocalizationService_TestTest");
        //test start of winter time
        var dateAndTimeAMWinterTime = 'Oct 31, 2004 1:01:00 AM';
        var expectedAMWinterTime = dateAndTimeAMWinterTime;
        var actualAMWinterTime = $A.localizationService.formatDateTimeUTC(dateAndTimeAMWinterTime,format,lang);
        $A.test.assertEquals(expectedAMWinterTime,actualAMWinterTime,"get unexpected AMWinterTime in testFormatDateTimeUTC24HR of LocalizationService_TestTest");
    	}
    },
    
    testFormatDateTimeUTC12HR:{
        test:function(component) {
            var lang = 'en'; 
            var format = 'MMM DD, YYYY h:mm:ss A';
            //test end of summer time
            var dateAndTimeAMSummerTime = 'Oct 31, 2004 0:59:00 AM';
            //we parse hour=0 to 12 because moment.js->formatTokenFunctions->h does this.hours() % 12 || 12
            var expectedAMSummerTime = 'Oct 31, 2004 12:59:00 AM';
            var actualAMSummerTime = $A.localizationService.formatDateTimeUTC(dateAndTimeAMSummerTime,format,lang);
            $A.test.assertEquals(expectedAMSummerTime,actualAMSummerTime,"get unexpected AMSummerTime in testFormatDateTimeUTC12HR of LocalizationService_TestTest");
            //test start of winter time
            var dateAndTimeAMWinterTime = 'Oct 31, 2004 1:01:00 AM';
            var expectedAMWinterTime = dateAndTimeAMWinterTime;
            var actualAMWinterTime = $A.localizationService.formatDateTimeUTC(dateAndTimeAMWinterTime,format,lang);
            $A.test.assertEquals(expectedAMWinterTime,actualAMWinterTime,"get unexpected AMWinterTime in testFormatDateTimeUTC12HR of LocalizationService_TestTest");
    	}
    },

    testFormatDateTimeUTC:{
        test:function(component){
            var format = 'MMM DD, YYYY h:mm:ss A';
            var testCmp = component.find('myOutputDateTimeComp');
            $A.test.assertNotNull(testCmp);
            $A.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},
                function(){
                    var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
                    var str = 'Sep 23, 2004 4:30:00 PM';
                    $A.test.assertEquals($A.localizationService.formatDateTimeUTC(str, format, 'en'), outputDateStr, "Both datetimes should be same.");
                    $A.test.assertEquals($A.localizationService.formatDateTimeUTC(str, '', 'en'), outputDateStr, "Both datetimes should be same.");
	        });
            var helper = component.getDef().getHelper();
            helper.testInvalidDateAndTime($A.localizationService.formatDateTimeUTC,'','','en',"Invalid date time value","testFormatDateTimeUTC fail, Expected:Invalid date time value");
            helper.testInvalidDateAndTime($A.localizationService.formatDateTimeUTC,'a','','en',"Invalid date time value","testFormatDateTimeUTC fail, Expected:Invalid date time value");
        }
    },

    testFormatTime:{
        test:function(component){
            var testCmp = component.find('myOutputTextComp');
            $A.test.assertNotNull(testCmp);
            var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
            $A.test.assertEquals($A.localizationService.formatTime('Sep 23, 2004 4:30:00 PM', 'h:mm:ss A', 'en'), outputDateStr, "Both times should be same.");
            $A.test.assertEquals($A.localizationService.formatTime('Sep 23, 2004 4:30:00 PM', '', 'en'), outputDateStr, "Both times should be same.");
            var helper = component.getDef().getHelper();
            helper.testInvalidDateAndTime($A.localizationService.formatTime,'','','en',"Invalid time value","testFormatTime fail, Expected:Invalid time value");
            helper.testInvalidDateAndTime($A.localizationService.formatTime,'a','','en',"Invalid time value","testFormatTime fail, Expected:Invalid time value");
        }
    },

    testFormatTimeUTC:{
        test:function(component){
            var testCmp = component.find('myOutputTextComp');
            $A.test.assertNotNull(testCmp);
            var outputDateStr = $A.test.getText(testCmp.find('span').getElement());

            str = 'Sep 23, 2004 4:30:00 PM';
            $A.test.assertEquals($A.localizationService.formatTimeUTC(str, 'h:mm:ss A', 'en'), outputDateStr, "Both times should be same.");
            $A.test.assertEquals($A.localizationService.formatTimeUTC(str, '', 'en'), outputDateStr, "Both times should be same.");
            var helper = component.getDef().getHelper();
            helper.testInvalidDateAndTime($A.localizationService.formatTimeUTC,'','','en',"Invalid time value","testFormatTimeUTC fail, Expected:Invalid time value");
            helper.testInvalidDateAndTime($A.localizationService.formatTimeUTC,'a','','en',"Invalid time value","testFormatTimeUTC fail, Expected:Invalid time value");
        
        }
    },

    testParseDateTime:{
        test:function(component){
            var format =  'MMM DD, YYYY h:mm:ss A';
            var testCmp = component.find('myOutputDateTimeComp');
            $A.test.assertNotNull(testCmp);
            $A.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},
                function(){
                    var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
                    var dateObj = $A.localizationService.parseDateTime('Sep 23, 2004 4:30:00 PM', format, 'en');
                    var dt = $A.localizationService.formatDateTime(dateObj, format, 'en');
                    $A.test.assertEquals(dt, outputDateStr, "Both dates should be same.");

                    $A.test.assertEquals(null, $A.localizationService.parseDateTime('', format, 'en'), "Expect null.");
                });
        }
    },

    testToISOString:{
        test:function(component){
            var dateObj = new Date(2004,10,23,12,30,59,123);
            var expected = dateObj.getUTCFullYear() + "-" +
                               (dateObj.getUTCMonth() + 1) + "-" +
                               dateObj.getUTCDate() + "T" +
                               (dateObj.getUTCHours() < 10 ? '0' + dateObj.getUTCHours() : dateObj.getUTCHours()) + ':' +
                               dateObj.getUTCMinutes() + ':' +
                               dateObj.getUTCSeconds() + '.' +
                               dateObj.getUTCMilliseconds() + 'Z';

            $A.test.assertEquals(expected, $A.localizationService.toISOString(dateObj), "Both dates should be same.");
            $A.test.assertEquals('', $A.localizationService.toISOString(''), "Expect ''.");
            $A.test.assertEquals(null, $A.localizationService.toISOString(null), "Expect null.");
        }
    },

    testParseDateTimeISO8601:{
        test:function(component){
        var format =  'MMM DD, YYYY h:mm:ss A';
            var testCmp = component.find('myOutputDateTimeComp');
            $A.test.assertNotNull(testCmp);
            $A.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},
                function(){
                    var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
                    var dateObj = $A.localizationService.parseDateTimeISO8601('2004-09-23T16:30:00');
                    var dt = $A.localizationService.formatDateTime(dateObj, format, 'en');
                    $A.test.assertEquals(dt, outputDateStr, "Both dates should be same.");
                    $A.test.assertEquals(null, $A.localizationService.parseDateTimeISO8601(''), "Expect null.");
	        });
        }
    },

    testParseDateTimeUTC:{
        test:function(component){
            var format =  'MMM DD, YYYY h:mm:ss A';
            var testCmp = component.find('myOutputDateTimeComp');
            $A.test.assertNotNull(testCmp);
            $A.test.assertEquals(null, $A.localizationService.parseDateTimeUTC('', format, 'en'), "Expected null.");
            $A.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},
                function(){
                    var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
                    var str = 'Sep 23, 2004 4:30:00 PM';
                    var dateObj = $A.localizationService.parseDateTimeUTC(str, format, 'en');
                    var dt = $A.localizationService.formatDateTimeUTC(dateObj, format, 'en');
                    $A.test.assertEquals(dt, outputDateStr, "Both dates should be same.");
                });
        }
    },

    testUTCToWallTime:{
        test:function(component){
            var format = 'MMM DD, YYYY h:mm:ss A';
            var testCmp = component.find('myOutputDateTimeComp');
            $A.test.assertNotNull(testCmp);
            $A.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},
                function(){
                    var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
                    var dateObj1 = $A.localizationService.parseDateTime('Sep 23, 2004 4:30:00 PM', format, 'en');

                    var callback1 = function(walltime){
                        var dt = $A.localizationService.formatDateTime(walltime, format, 'en');
                        $A.test.assertEquals(dt, outputDateStr, "Both dates should be same.");
                    }

                    $A.localizationService.UTCToWallTime(dateObj1, 'GMT', callback1);

                    // Now use EST
                    var dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2004 8:30:00 PM', format, 'en');

                    var callback2 = function(walltime){
                        var dt = $A.localizationService.formatDateTime(walltime, format, 'en');
                        $A.test.assertEquals(dt, outputDateStr, "Both dates should be same.");
                    }

                    $A.localizationService.UTCToWallTime(dateObj2, 'America/New_York', callback2);

                    // Now use PST
                    var dateObj3 = $A.localizationService.parseDateTime('Sep 23, 2004 11:30:00 PM', format, 'en');

                    var callback3 = function(walltime){
                        var dt = $A.localizationService.formatDateTime(walltime, format, 'en');
                        $A.test.assertEquals(dt, outputDateStr, "Both dates should be same.");
                    }

                    $A.localizationService.UTCToWallTime(dateObj3, 'America/Los_Angeles', callback3);

	        });
        }
    },

    testWallTimeToUTC:{
        test:function(component){
            var format =  'MMM DD, YYYY h:mm:ss A';
    	    var testCmp = component.find('myOutputDateTimeComp');
            $A.test.assertNotNull(testCmp);
            $A.test.addWaitFor(true, function(){return $A.test.getText(testCmp.find('span').getElement()).length > 0;},
                function(){

            	var outputDateStr = $A.test.getText(testCmp.find('span').getElement());
                var dateObj1 = $A.localizationService.parseDateTime('Sep 23, 2004 4:30:00 PM', format, 'en');

                    var callback1 = function(walltime){
                        var dt = $A.localizationService.formatDateTime(walltime, format, 'en');
                        $A.test.assertEquals(dt, outputDateStr, "Both dates should be same.");
                    }

                    $A.localizationService.WallTimeToUTC(dateObj1, 'GMT', callback1);

                    // Now use EST
                    var dateObj2 = $A.localizationService.parseDateTime('Sep 23, 2004 12:30:00 PM', format, 'en');

                    var callback2 = function(walltime){
                        var dt = $A.localizationService.formatDateTime(walltime, format, 'en');
                        $A.test.assertEquals(dt, outputDateStr, "Both dates should be same.");
                    }

                    $A.localizationService.WallTimeToUTC(dateObj2, 'America/New_York', callback2);

                    // Now use PST
                    var dateObj3 = $A.localizationService.parseDateTime('Sep 23, 2004 9:30:00 AM', format, 'en');

                    var callback3 = function(walltime){
                        var dt = $A.localizationService.formatDateTime(walltime, format, 'en');
                        $A.test.assertEquals(dt, outputDateStr, "Both dates should be same.");
                    }

                    $A.localizationService.WallTimeToUTC(dateObj3, 'America/Los_Angeles', callback3); 
                    
	        });
        }
    },

    testFormatNumber:{
        test:function(component){
            var testCmp = component.find('myOutputNumberComp');
            $A.test.assertNotNull(testCmp);
            $A.test.assertEquals('3.14', $A.test.getText(testCmp.find('span').getElement()), "Decimal part of value was not rounded up based on format.");
            $A.test.assertEquals("3.142", $A.localizationService.formatNumber(3.14159), "Both values should be same.");
            $A.test.assertEquals("3.146", $A.localizationService.formatNumber(3.14559), "Both values should be same.");
            $A.test.assertEquals("-3.142", $A.localizationService.formatNumber(-3.14159), "Both values should be same.");
            $A.test.assertEquals("-3.146", $A.localizationService.formatNumber(-3.14559), "Both values should be same.");
        }
    },

    testFormatPercent:{
        test:function(component){
            var testCmp = component.find('myOutputPercentComp');
            $A.test.assertNotNull(testCmp);
            $A.test.assertEquals('14.57%', $A.test.getText(testCmp.find('span').getElement()), "Decimal part of value was not rounded up based on format.");
            $A.test.assertEquals("15%", $A.localizationService.formatPercent(0.14566), "Both values should be same.");
            $A.test.assertEquals("315%", $A.localizationService.formatPercent(3.14559), "Both values should be same.");
            $A.test.assertEquals("314%", $A.localizationService.formatPercent(3.14119), "Both values should be same.");
            $A.test.assertEquals("-315%", $A.localizationService.formatPercent(-3.14559), "Both values should be same.");
            $A.test.assertEquals("-314%", $A.localizationService.formatPercent(-3.14119), "Both values should be same.");
        }
    },

    testFormatCurrency:{
        test:function(component){
            var testCmp = component.find('myOutputCurrencyComp');
            $A.test.assertNotNull(testCmp);
            $A.test.assertEquals('$1,234,567,890.00', $A.test.getText(testCmp.find('span').getElement()), "Decimal part of value was not rounded up based on format.");
            $A.test.assertEquals("($1,234,567,890.00)", $A.localizationService.formatCurrency(-1234567890), "Both values should be same.");
            $A.test.assertEquals("$1,234,567,890.32", $A.localizationService.formatCurrency(1234567890.321), "Both values should be same.");
            $A.test.assertEquals("$1,234,567,890.33", $A.localizationService.formatCurrency(1234567890.326), "Both values should be same.");

        }
    }
    
})
