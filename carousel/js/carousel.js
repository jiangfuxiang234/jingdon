/* 
    思考：如何给 jQuery 扩展内容或者说方法？
    扩展提问：$.extend 和 $.fn.extend 区别？

    $.extend		给 jQuery 类本身扩展方法（构造函数.xxx）
    $.fn.extend		给 jQuery 实例对象扩展方法（构造函数.prototype.xxx）

    我们这个组件是要给实例用的，所以要使用$.fn.extend
 */


$.fn.extend( // 在jQuery中添加一个扩展函数
    {
        carousel: function (option) {
            var obj = new Carousel(option, this); // new一个实例对象 为了能够取到原型上的innit初始化函数 这里的this谁调用就是谁，用户传参只要传一个option
            obj.innit()

        }
    }
)
function Carousel(options, wrap) {
    //根据面向对象的写法，在构造函数里一般要做的工作是，把所有的数据都挂载到this身上，并给一些初始值，这里也不例外
    this.wrap = wrap; 	//轮播图外层容器
    this.width = options.width || wrap.width(); // 轮播图容器的宽度
    this.height = options.height || wrap.height(); // 轮播图容器的高度
    this.list = options.list || []; // 轮播的内容列表（赋初始值用的是运算符或，表示如果用户没给内容列表，那就给它赋一个空数组）
    this.duration = options.duration || 5000; // 自动播放时间
    this.type = options.type || 'fade'; // 播放的方式
    this.autoPlay = options.autoPlay === undefined ? true : !!options.autoPlay;// 是否自动轮播（用户没有传，走默认true，传的话强制转成布尔值，即使它不小心传了一个字符串false，也会给它转成真正的布尔值，严谨一些）

    this.changeBtn = options.changeBtn || 'always';	// 箭头状态，always一直显示		hide隐藏	hover移入显示
    this.navShow = options.navShow == undefined ? true : !!options.navShow;	//是否显示小圆点
    this.navSize = options.navSize || 5;	//小圆点大小
    this.navPosition = options.navPosition || 'center';	//小圆点位置 left center right
    this.navColor = options.navColor || "rgba(255,255,255,.4)";	//小圆点的背景颜色
    this.navActiveColor = options.navActiveColor || "red";	 //小圆点激活的颜色

    // 以上的属性都是用户传递过来的，都已经保存在了 Carousel 实例对象上啦。但还有一些属性不要忘记啦，这些属性并不是用户传过来的，也不需要用户传，但是依然在存储到实例对象上
    this.len = this.list.length; // 轮播图内容的长度
    this.cn = 0; // 当前的索引值
    //this.ln = 0; // 上一个选中的索引
    this.timer = null; // 定时器
    this.canClick = true; // 是否执行切换动画 锁
}
Carousel.prototype.innit = function () {
    // 1. 生成结构
    this.createDom();
    // 2. 添加用户传的样式
    this.addStyle();
    // 3. 绑定功能事件
    this.bindEvent();
    // 4. 自动播放
    this.autoPlay && this.autoChange();

}

//1.生成结构
Carousel.prototype.createDom = function () {
    var This = this;
    this.carouselWrap = $('<div class="myCarousel"></div>');
    this.ul = $('<ul class="list"></ul>');  //内容父级
    this.prev = $('<div class="btn prev"><i class="iconfont icon-prev"></i></div>'); //左按钮
    this.next = $('<div class="btn next"><i class="iconfont icon-next"></i></div>'); //右按钮
    this.nav = $('<div class="nav"></div>');//小圆点
    for (var i = 0; i < this.len; i++) {
        $('<li></li)').html(this.list[i]).appendTo(this.ul); // 将用户传的结构添加到li中，再用ul包裹
        $('<span></span>').appendTo(this.nav)
    }
    this.type == 'animate' && this.ul.append($("<li></li>").html($(this.list[0]).clone(true))); // 如果是animate类型则要克隆第一个结构

    switch (this.changeBtn) {
        case 'hide': 
            this.prev.hide();
            this.next.hide();
            break;
        case 'hover': 
            this.prev.hide();
            this.next.hide(); // 先隐藏，后移入显示，再移出隐藏
            this.carouselWrap.hover(function () {
                This.prev.show();
                This.next.show();
            }, function () {
                This.prev.hide();
                This.next.hide();
            });
            break;
    }
    !this.navShow && this.nav.hide(); // 是否显示圆点

    this.carouselWrap.append(this.ul). // 将创建的结构插入到容器中
        append(this.prev).
        append(this.next).
        append(this.nav).
        addClass('carousel_' + this.type).
        appendTo(this.wrap);
    this.lis = this.ul.children(); // 先保存一下li和圆点元素
    this.spans = this.nav.children()
}

//2.添加用户传的样式
Carousel.prototype.addStyle = function () {
    this.lis.css('width', this.width);
    this.nav.css('text-align', this.navPosition);
    this.spans.css({
        'width': this.navSize,
        'hight': this.navSize,
        'background': this.navColor,
    }).eq(this.cn % this.len).css('background', this.navActiveColor) // this.cn % this.len 该公式是将第一个结构和第一个克隆结构的索引化为同一个值，都是0
}

//3.添加功能事件
Carousel.prototype.bindEvent = function () {
    var This = this;
    // 上一页
    this.prev.click(function () {
        if (!This.canClick) {
            return;
        }
        This.canClick = false;
        switch (This.type) {
            case 'fade':
                if (This.cn == 0) { //当前索引为0时还点击了上一页按钮, 则索引直接化为最后一张图片的索引，这里类型为fade没有进行克隆，所以最后一张图片的索引为This.len - 1
                    This.cn = This.len - 1;
                } else {
                    This.cn--;
                }
                This.change();
                break;
            case 'animate':
                if (This.cn == 0) { //当前索引为0时还点击了上一页按钮, 则直接跳到最后一张，这里This.len - 1的索引为倒数第二张图片，区别于fade的情况
                    This.ul.css('left', -This.cn * This.width)
                    This.cn = This.len - 1
                } else {
                    This.cn--
                }
                This.change();
        }
    })
    // 下一页
    this.next.click(function () {
        if (!This.canClick) {
            return;
        }
        This.canClick = false;
        switch (This.type) {
            case 'fade':
                if (This.cn == This.len - 1) {//当前索引为最后一张时还点击了下一页按钮, 则索引直接化为第一张图片的索引
                    This.cn = 0;
                } else {
                    This.cn++;
                }
                This.change();
                break;
            case 'animate':
                if (This.cn == This.len) {//当前索引为最后一张时还点击了下一页按钮, 则直接跳转到第一张图片，索引变为第二张图片
                    This.ul.css('left', 0)
                    This.cn = 1
                } else {
                    This.cn++
                }
                This.change();
                break;
        }
    })
    // 2、小圆点功能
    // 需要做的事儿：鼠标点击对应小圆点的时候，更新 cn，然后调用 change 方法即可
    this.nav.on('click', 'span', function () { // 事件委托
        if (!This.canClick) {
            return
        }
        This.canClick = false;
        This.cn = $(this).index(); // 获取点击的索引 这里的this是原生对象，不能直接调用jQuery的方法，所以要在外面包裹$()来转成jQuery对象
        This.change();
    })
    // 鼠标移入移出事件 移入暂停自动播放
    This.carouselWrap.mouseenter(function () {
        clearInterval(This.timer)
    }
    ).mouseleave(function () {
        This.autoChange && This.autoChange()
    }
    )

};

Carousel.prototype.change = function(){
    var This = this;
    switch(this.type){
        case 'fade' : this.lis.fadeOut().eq(this.cn).fadeIn(function(){ // 先全部图片淡出隐藏，然后当前索引的图片淡入显示
            This.canClick = true;
        }); break;
        case 'animate' : this.ul.animate({left : -this.cn * this.width}, // 记住要用负号
        function(){
            This.canClick = true;
        }); break;
    }
    // 更新圆点
    this.spans.css('background', this.navColor).eq(this.cn % this.len).
    css('background', this.navActiveColor)
}
// 自动播放
Carousel.prototype.autoChange = function(){
    var This = this;
    clearInterval(this.timer);
    this.timer = setInterval(function(){
        This.next.trigger('click')
    },This.duration)
}