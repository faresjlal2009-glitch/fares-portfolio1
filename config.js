/* =====================================================
   FARES JLAL Portfolio - إعدادات Supabase
   ===================================================== */
(function () {
    window.PortfolioConfig = {
        SUPABASE_URL: "https://oyxctzzcpszatzczyvqg.supabase.co",
        // ضع هنا Publishable Key الخاص بمشروعك محليًا.
        // لا تستخدم service_role أو Secret Key في المتصفح.
        SUPABASE_ANON_KEY: "sb_publishable_AAAHBKHFSJYHdZNP8fcEXw_d3fdiuMf",
        checkInternetConnection: function () {
            return window.navigator.onLine;
        },
        showError: function (message) {
            console.error(message);
        },
        validateResponseData: function (data) {
            return Array.isArray(data) && data.length > 0;
        }
    };
})();
