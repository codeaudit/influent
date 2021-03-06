/*
 * Copyright (C) 2013-2015 Uncharted Software Inc.
 *
 * Property of Uncharted(TM), formerly Oculus Info Inc.
 * http://uncharted.software/
 *
 * Released under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

define('dynamicLibs', function(require){
	//FIXME: should fix this up to load modules from a file to support user configurable views/modules
	var dynLibs = {
		'modules/infRenderer' : require('modules/infRenderer'),
		'modules/xfHeader' : require('modules/infHeader'),
		'modules/infEntityDetails' : require('modules/infEntityDetails'),
		'modules/infSankey' : require('modules/infSankey'),
		'modules/infTransactionTable' : require('modules/infTransactionTable'),
		'modules/infTransactionGraph' : require('modules/infTransactionGraph'),
		'modules/infFooter' : require('modules/infFooter'),
		'modules/infFileUpload' : require('modules/infFileUpload'),
		'modules/infWorkspace' : require('modules/infWorkspace'),
		'views/infAccountsView' : require('views/infAccountsView'),
		'views/infSummaryView' : require('views/infSummaryView'),
		'views/infTransactionsView' : require('views/infTransactionsView'),
		'views/infFlowView' : require('views/infFlowView')
	};

	return dynLibs;
});

/**
 * Main module that defines the application
 *
 */
define([
	'lib/module',
	'lib/util/params',
	'lib/communication/applicationChannels',
	'lib/infRouter',
	'cookieUtil',
	'lib/util/GUID',
	'lib/ui/xfModalDialog',
	'lib/sandbox',
	'lib/viewPlugins',
	'dynamicLibs'
],
function(
	modulesLib,
	params,
	appChannel,
	router,
	cookieUtil,
	GUID,
	dialog,
	Sandbox,
	viewPlugins,
	dynamicLibs
){

	// get key settings
	var urlFlags = (function() {
		function getQueryParam(name) {
			var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
				values = regex.exec(location.search);

			return values == null ? null : decodeURIComponent(values[1].replace(/\+/g, ' '));
		}

		return {
			sessionId : getQueryParam('sessionId') || '',
			capture : getQueryParam('capture') || false
		};

	}());


	/**
	 * Main application controller object that manages app state, history, etc.  It
	 * defers control to the mode controllers to handle transitions, DIV arrangement,
	 * etc.
	 */
	var App = function() {

		// Private state for the app
		var AppState = {
			modules : null,     // module manager

			// Defaults properties given to every module on start
			defaults : {

			}
		};

		AppState.modules = modulesLib.createManager(function( spec ) {
			// create a new sandbox with the default properties
			// this is passed to each module's ctor
			spec.state = _.clone(AppState.defaults);
			return new Sandbox( spec );
		});


		function startModules(settings) {
			// trace it out for now
			aperture.log.info('session: ' + settings.sessionId + ', capture: ' + settings.capture);

			var modules = AppState.modules;

			// Start the individual modules.
			// Remember, theoretically these should be capable of being shutdown on the fly,
			// otherwise maybe it shouldn't be a module.
			modules.start('infHeader', {div:'infHeader'});
			modules.start('infWorkspace', {div:'infWorkspace', sessionId: settings.sessionId});
			modules.start('infSummaryView', {});
			modules.start('infAccountsView', {});
			modules.start('infTransactionsView', {});
			modules.start('infFlowView', {});
			modules.start('infFooter', {div:'footer', capture: settings.capture});
			modules.start('infEntityDetails', {div:'popup'});
			modules.start('infTransactionTable', {div:'transactions-table'});
			modules.start('infTransactionGraph', {div:'chartTab'});
			modules.start('infSankey', {div:'sankey', capture: settings.capture});
			modules.start('infRenderer', {div:'cards', capture: settings.capture});
			modules.start('infFileUpload', {div:'fileUpload'});
			modules.start('infRest', {capture: settings.capture});

			viewPlugins.startViews();

			// Send a notification that all modules have been started.   This will kickoff initialization
			aperture.pubsub.publish(appChannel.ALL_MODULES_STARTED, {noRender : true});
		}

		// handle initialization of app state and cookies
		(function(){
			if (urlFlags.sessionId) {
				startModules(urlFlags);
			}
			else {
				var sessionRestorationEnabled = aperture.config.get()['influent.config']['sessionRestorationEnabled'];

				// use the application specific part of the host url to label the cookie distinctly
				var cookieId = aperture.config.get()['aperture.io'].restEndpoint.replace('%host%', 'sessionId');
				var cookie = cookieUtil.readCookie(cookieId);

				// handle loads and new sessions
				if (!cookie || !sessionRestorationEnabled) {
					startModules({sessionId: GUID.generateGuid(), capture: urlFlags.capture});
				} else {
					dialog.createInstance({
						title : 'Session Found',
						contents : 'A previous session of Influent was found. Attempt to reload it? Or start a new session?',
						buttons : {
							'Reload' : function() {
								startModules({sessionId: cookie, capture: urlFlags.capture});
							},
							'New Session' : function() {
								startModules({sessionId: GUID.generateGuid(), capture: urlFlags.capture});
							}
						}
					});
					cookieUtil.eraseCookie(cookieId);
				}
			}
		})();

		/**
		 * DOM is available, start the app
		 */
		this.start = function() {
			//FIXME this should be done by the router
			// initialize title
//			document.title = aperture.config.get()['influent.config'].title || 'Name Me';
		};
	};



	/*
	 * Public iface of the app
	 */
	return {
		app : null,

		setup : function() {
			this.app = new App();
		},

		start : function() {
			this.app.start();
		}
	};
});
