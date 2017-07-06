<?php include('includes/header.php'); ?>

<!-- Post Template -->
<script id="post-template" type="text/x-handlebars-template">
    {{#each this}}
        <div class="post">
            <div class="image-post" style="background-image: url({{post-image}});"><a href="{{url}}"></a></div>
            <a href="{{url}}">
                <span class="user-info">
                    <img src="assets/images/user.png" alt="User Icon" class="user-icon">
                    <span class="user-name">{{user-name}}</span>
                </span>
                <span class="copy">{{copy}}</span>
            </a>
        </div>
    {{/each}}
</script>

<div class="content ptb60">
    <div class="container">
        <div class="divider"><span>Featured Tweets</span></div>
        <div class="posts clearfix">
            <!-- single post -->    
        </div>
    </div>
</div>


<?php include('includes/footer.php'); ?>



