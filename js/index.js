$('#shortcut .w').load('../components/head/shortcut.html'); //加载顶部导航模块
$('#header .w').load('../components/head/header.html'); //加载头部模块
$('#bannerWrap .menu').load('../components/banner/menu.html'); //加载菜单模块
$('#bannerWrap .banner').load('../components/banner/banner.html', function(){   //加载banner模块
    //load还有个回调函数，组件加载完成后就会触发
    $(this).carousel({
        list:$(this).find('.bannerImg'),
        type:'animate',
        /* width:590,
        height */
        navPosition:'left',
        navSize:10
    });
}); 

$('#bannerWrap .carousel').load('../components/banner/carousel.html', function(){   //加载banner模块
    //组件加载完成后就会触发
    $(this).carousel({
        list:$(this).find('.carouselImg'),
        navShow:false,
        changeBtn:'hover'
    })
}); 


$('#bannerWrap .userWrap .user').load('../components/user/user.html'); //加载用户模块
$('#bannerWrap .userWrap .news').load('../components/user/news.html'); //加载新闻模块
$('#bannerWrap .userWrap .service').load('../components/user/service.html'); //加载服务模块
$('#seckill').load('../components/seckill/seckill.html'); //加载秒杀模块