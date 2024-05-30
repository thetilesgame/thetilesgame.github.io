// Written by Daniel Cohen Gindi
// danielgindi@gmail.com
// http://github.com/danielgindi/app-redirect

(function () {
    var queryString = {},
        browserMovedToBackground = false;

    var AppRedirect = {
        /** 
         * @expose 
         * @public
         * */
        queryString: queryString,

        redirect: function (options) {
            var hasIos = !!(options.iosApp || options.iosAppStore);
            var hasAndroid = !!(options.android);
            var hasOverallFallback = !!(options.overallFallback);

            var tryToOpenInMultiplePhases = function(urls) {
                browserMovedToBackground = false;
                var currentIndex = 0;
                var redirectTime = new Date();
                window.location = urls[currentIndex++];

                var next = function () {
                    if (urls.length > currentIndex) {
                        setTimeout(function () {
                            if (browserMovedToBackground) {
                                console.log('Browser moved to the background, we assume that we are done here');
                                return;
                            }

                            if (new Date() - redirectTime > 3000) {
                                console.log('Enough time has passed, the app is probably open');
                            } else {
                                redirectTime = new Date();
                                window.location = urls[currentIndex++];
                                next();
                            }
                        }, 10);
                    }
                };

                next();
            };

            if (hasIos && /iP(hone|ad|od)/.test(navigator.userAgent)) {
                var urls = [];
                if (options.iosApp) {
                    urls.push(options.iosApp);
                }
                if (options.iosAppStore) {
                    urls.push(options.iosAppStore);
                }
                tryToOpenInMultiplePhases(urls);
            } else if (hasAndroid && /Android/.test(navigator.userAgent)) {
                var intent = options.android;
                var intentUrl = 'intent://' + intent.host + '#Intent;' +
                            'scheme=' + encodeURIComponent(intent.scheme) + ';' + 
                            'package=' + encodeURIComponent(intent.package) + ';' + 
                            (intent.action ? 'action=' + encodeURIComponent(intent.action) + ';': '') + 
                            (intent.category ? 'category=' + encodeURIComponent(intent.category) + ';': '') + 
                            (intent.component ? 'component=' + encodeURIComponent(intent.component) + ';': '') + 
                            (intent.fallback ? 'S.browser_fallback_url=' + encodeURIComponent(intent.fallback) + ';': '') + 
                            'end';
                var anchor = document.createElement('a');
                document.body.appendChild(anchor);
                anchor.href = intentUrl;
                if (anchor.click) {
                    anchor.click();
                } else {
                    window.location = intentUrl;
                }
            } else if(hasOverallFallback) {
                window.location = options.overallFallback;
            } else {
                console.log('Unknown platform and no overallFallback URL, nothing to do');
            }
        }
    };

    /** @expose */
    window.AppRedirect = AppRedirect;
})();
