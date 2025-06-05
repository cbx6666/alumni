<script>

export default {

}

</script>

<template>

<aside class="aside">
    <nav>
        <ul class="nav-links">
            <li><a href="#home">首页</a></li>
            <li><a href="#about">关于我们</a></li>
            <li><a href="#events">活动</a></li>
            <li><a href="#news">新闻</a></li>
            <li><a href="#contact">联系我们</a></li>
        </ul>
    </nav>
</aside>

</template>

<style scoped>

.aside {
    width: 200px;
    background-color: rgb(47, 47, 149);
    padding: 20px;
    position: fixed;
    height: 100%;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    border: 0 solid;
    top: 80px;
    left: 0;
    z-index: 999;
    font-family: 'Arial', sans-serif;
}

</style>
