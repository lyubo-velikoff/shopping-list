var twitter = {};

twitter.lastScrollTop = 0;
twitter.ajaxCallsCount = 0;
twitter.loading = false;


twitter.manageNav = function() {
    if ($(window).scrollTop() > 20) {
        $('.main-title, .body-content').addClass('shrink');
    } else {
        $('.main-title, .body-content').removeClass('shrink');
    }
};


twitter.loadPosts = function() {
    var source   = $("#post-template").html();
    var template = Handlebars.compile(source);
    twitter.loading = true;
    $.ajax({
        type: "GET",
        url: "/twitter/app/includes/classes/api.php",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function(data) {
            $(".posts").append(template(data));    
            twitter.loading = false;
            twitter.ajaxCallsCount++;
        } 
        // TODO: return error
    });
}

$(document).ready(function() {
    twitter.manageNav();
    twitter.loadPosts();
});
$(window).scroll(function (event) {
    twitter.manageNav();

    var top = $(this).scrollTop();

    // load posts only when: 
    // detect that the scrolling is down
    // + the scroll reached 80%
    // + its not loading at the moment
    // + the number of calls < 5
    if (top > twitter.lastScrollTop && top >= ($(document).height() - $(window).height()) * 0.8 && !twitter.loading && twitter.ajaxCallsCount < 5){
        // downscroll code
        twitter.loadPosts();
    } else {
        // upscroll code
    }

   twitter.lastScrollTop = top;
});
