"use strict";

var system = require('system');

if (system.args.length === 1) {
	console.log('Usage: ' + system.args[0] + ' <test>');
	phantom.exit(-2);
}

var test = system.args[1];
var page = require('webpage').create();

page.onConsoleMessage = function(msg) {
	console.log(msg);
};

page.open('test_context.html', function(status) {
	console.log('TESTING ' + test);
	var out = page.evaluate(function(test) {
		var jedisTest = new JedisTest();
		try {
			switch (test) {
				case 'FLUSHALL':
					jedisTest.testGroupFlushAll();
					break;
				case 'KEYS':
					jedisTest.testGroupKeys();
					break;
				case 'LISTS':
					jedisTest.testGroupLists();
					break;
				case 'SETS':
					jedisTest.testGroupSets();
					break;
				case 'LOCALSTORAGE':
					jedisTest.testGroupLocalStorage();
				break;
			}
		}
		catch(err) {
			console.log('ERROR OCCURRED: ' + err);
			return false;
		}
		return true;
	}, test);
	if(out){
		console.log('TEST SUCCEEDED!');
		phantom.exit();
	}
	else {
		console.log('TEST FAILED!');
		phantom.exit(-1);
	}
});
