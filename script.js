<script>
(function() {
    // Function to detect the browser type
    function getBrowser() {
        var userAgent = navigator.userAgent;

        if (userAgent.indexOf("Edg") > -1) {
            return "Edge";
        } else if (userAgent.indexOf("Firefox") > -1) {
            return "Firefox";
        } else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
            return "Safari";
        } else if (userAgent.indexOf("Chrome") > -1) {
            return "Chrome";
        } else {
            return "Other";
        }
    }

    // Log or use browser information to adjust behavior
    var browser = getBrowser();
    console.log("User's browser: " + browser);

    // Function to check if an external script request is blocked by adding a <script> tag
    function checkScriptBlocked(url, callback) {
        var script = document.createElement('script');
        script.src = url;
        script.onload = function() {
            // If the script loads successfully, it is not blocked
            callback(0); // Changed false to 0
        };
        script.onerror = function() {
            // If the script fails to load, it is blocked (or unavailable)
            callback(1); // Changed true to 1
        };
        document.head.appendChild(script);
    }

    // Variables to store check results
    var adBlockDetected = 0; // Default to 0 (false)
    var facebookRequestBlocked = null; // We initialize to null to ensure we detect when check completes
    var googleAnalyticsRequestBlocked = null;
    var googleAdsRequestBlocked = null;
    var bingAdsRequestBlocked = null; // Added for Bing Ads

    // Function to check if all results are ready and send the data to Google Apps Script using an image request
    function sendResult() {
        if (facebookRequestBlocked !== null && googleAnalyticsRequestBlocked !== null && googleAdsRequestBlocked !== null && bingAdsRequestBlocked !== null) {
            // Construct the URL to send the data to Google Apps Script
            var gtmImageUrl = 'https://script.google.com/macros/s/AKfycbxcbUUnEZSZ6iqKVyJClEvRjQPwKAmwWlykasQ-ktfjNDxPH8ns-9v6VqoMSE3LpKsc/exec' +
                '?adBlockDetected=' + adBlockDetected +
                '&facebookRequestBlocked=' + facebookRequestBlocked +
                '&googleAnalyticsRequestBlocked=' + googleAnalyticsRequestBlocked +
                '&googleAdsRequestBlocked=' + googleAdsRequestBlocked +
                '&bingAdsRequestBlocked=' + bingAdsRequestBlocked +
                '&browser=' + encodeURIComponent(browser) +
                '&gacookie=' + encodeURIComponent(getCookie('_ga')) +
                '&hostname=' + encodeURIComponent(window.location.hostname) +
                '&pageURL=' + encodeURIComponent(window.location.href);

            // Create a new Image object to send the data as an image request (Custom Image in GTM)
            var img = new Image();
            img.src = gtmImageUrl;
            console.log("Sending data to Google Sheets: " + gtmImageUrl);
        }
    }

    // Utility function to get the value of a cookie by name
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length === 2) return parts.pop().split(";").shift();
        return "";
    }

    // Create a bait element for basic ad blocker detection
    var bait = document.createElement('div');
    bait.innerHTML = '&nbsp;';
    bait.className = 'pub_300x250 pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links';
    bait.style.width = '1px';
    bait.style.height = '1px';
    bait.style.position = 'absolute';
    bait.style.left = '-10000px';
    bait.style.top = '-10000px';

    // Append bait element to the body
    document.body.appendChild(bait);

    // Run detection after a short delay
    setTimeout(function() {
        // Check if the bait element was blocked
        if (bait.offsetHeight === 0 || bait.offsetWidth === 0 || window.getComputedStyle(bait).display === 'none') {
            adBlockDetected = 1; // Set to 1 (true) if adblock is detected
        }

        // Remove the bait element
        document.body.removeChild(bait);

        // Check if requests to Facebook, Google Analytics, Google Ads, and Bing Ads are blocked using <script> injection
        checkScriptBlocked('https://connect.facebook.net/en_US/fbevents.js', function(blocked) {
            facebookRequestBlocked = blocked;
            sendResult(); // Call sendResult after Facebook check completes
        });

        checkScriptBlocked('https://www.google-analytics.com/analytics.js', function(blocked) {
            googleAnalyticsRequestBlocked = blocked;
            sendResult(); // Call sendResult after Google Analytics check completes
        });

        checkScriptBlocked('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', function(blocked) {
            googleAdsRequestBlocked = blocked;
            sendResult(); // Call sendResult after Google Ads check completes
        });

        checkScriptBlocked('https://bat.bing.com/bat.js', function(blocked) {
            bingAdsRequestBlocked = blocked;
            sendResult(); // Call sendResult after Bing Ads check completes
        });

    }, 100); // 100ms delay for proper detection
})();
</script>
