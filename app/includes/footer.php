</div> <!-- ends body content -->
<!-- load scripts after the page loads, significantly increases the page speed -->
<script type="text/javascript">

    function downloadJSAtOnload() {
        var element = document.createElement("script");
        element.src = "assets/js/app.min.js";
        document.body.appendChild(element);
    }
    if (window.addEventListener) 
        window.addEventListener("load", downloadJSAtOnload, false);
    else if (window.attachEvent)
    window.attachEvent("onload", downloadJSAtOnload);
    else window.onload = downloadJSAtOnload;
</script>

</body>
</html>
