;(function(window){
    //制作文章内容导航
    var doc = window.document;
    var Util = {
        find: function(selector){
            return doc.querySelectorAll(selector);
        },
        findOne: function(selector){
            return doc.querySelector(selector);
        },
        slice: Array.prototype.slice
    }
    var h1 = Util.find("h1");
    var ul = doc.createElement("ul");
    var liHtml = [];
    var timer;

    //设置菜单参数
    var options = {
        ulId: 'myArticleMenu',      //菜单项id                              OK
        liId: 'wpMenuAt',           //文章中h1的id                          OK
        bgColor: 'rgb(218, 245, 223)',  //菜单中每一项的背景色              OK  
        activeBgColor: 'rgb(162, 214, 154)',    //菜单项激活的背景色        OK
        resDistance: 50,            //文章中h1的响应距离，即距离顶部多少像素的时候激活菜单      OK
        easeGoing: true,            //是否进行缓慢移动                      TODO
        speed: 1000,                //缓慢移动的速度                        TODO
        dragEnable: true,           //是否支持可拖动                        OK
        savePos: true,              //是否本地保存菜单位置                  OK
        endFunction: function(){    //最后一项激活时的调用函数              OK
            console.log("恭喜，你已经阅读完了");
        },                          
        externals: true,            //是否允许外部脚本                      OK
        externalsLink: '/wp-content/common/article.css' //外部css样式表     OK
    }


    //获取h1内容的时候，给h1复制一个id
    //id用于和菜单同步
    for(var i = 2, j = 0; i < h1.length-1; i++, j++){
        h1[i].id = options.liId + i;
        liHtml.push("<li><a href='#" + options.liId  + i + "'>" + h1[i].innerHTML + "</a></li>");
    }

    //设置样式并输出
    ul.innerHTML = liHtml.join("");
    var ulHeight = ul.offsetHeight;
    ul.id = options.ulId;
    ul.style.backgroundColor = options.bgColor;
    ul.style.position = "fixed";
    ul.style.margin = "0 0 0 0";
    ul.style.top = '50%';
    ul.style.marginTop = -(Math.floor(ulHeight/2)) + "px";
    ul.style.right = 0;
    doc.body.appendChild(ul);
    if(options.savePos){
        localStorage.myArticleMenuWidth = ul.offsetWidth + 10 + 'px';
    }

    //初始化位置
    if(options.dragEnable && options.savePos){
        if(localStorage.myArticleMenuX !== '' && localStorage.myArticleMenuY !== ''){
            ul.style.left = localStorage.myArticleMenuX;
            ul.style.top = localStorage.myArticleMenuY;
            ul.style.width = localStorage.myArticleMenuWidth;
        }else{
            localStorage.myArticleMenuX = '';
            localStorage.myArticleMenuY = '';
        }
    }

    //鼠标滚轮事件
	var newLi = document.querySelectorAll("#" + options.ulId + " li");
    var newH1 = Util.slice.call(h1, 2, h1.length-1);
    var activeCount = true;
    window.addEventListener("mousewheel", moveTo);

    //鼠标点击事件
    ul.addEventListener("click", clickTo);    

    function moveTo(){
        //样式联动
		for(var i = 0; i < newH1.length; i++){
			var curTop = newH1[i].getBoundingClientRect().top;
            newLi[i].style.backgroundColor = options.bgColor;
            if( i !== newH1.length - 1 ){
			    var nextTop = newH1[i+1].getBoundingClientRect().top;
                if(curTop < options.resDistance && nextTop >= options.resDistance){
                    newLi[i].style.backgroundColor = options.activeBgColor;
                }else{
                    newLi[i].style.backgroundColor = options.bgColor;
                }
            }else{
                if(curTop < options.resDistance){
                    newLi[i].style.backgroundColor = options.activeBgColor; 
                }else{
                    newLi[i].style.backgroundColor = options.bgColor;
                }
            }
		}
        //当最后一项即活动的时候，同时激活结束时的函数
        if(newLi[newLi.length-1].style.backgroundColor === options.activeBgColor){
            if(options.endFunction && activeCount){
                options.endFunction();
                activeCount = false;
            }
            return;
        }
    }

    function clickTo(e){
        e = e || window.event;
        target = e.target || e.srcElement;
        if(target.nodeName === 'A'){
            for(var i = 0; i < newLi.length; i++){
                newLi[i].style.backgroundColor = options.bgColor;
                newLi[i].childNodes[0].style.backgroundColor = options.bgColor;
            }
            target.style.backgroundColor = options.activeBgColor;
        }
    }

    //允许加载外部脚本定义主题 
    if(options.externals){
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = options.externalsLink;
        document.head.appendChild(link);
    }

    //支持菜单拖动
    if(options.dragEnable){
        var dragHead = document.createElement("div");
        var text = document.createTextNode("拖拽");
        dragHead.setAttribute('class', 'dragHead');
        dragHead.appendChild(text);
        ul.appendChild(dragHead);
        ul.style.width = localStorage.myArticleMenuWidth;
        dragHead.addEventListener("mousedown", drag);
    };

    function drag(e){
        e = e || window.event;
        target = e.target || e.srcElement;
        var disX = e.clientX - ul.offsetLeft;
        var disY = e.clientY - ul.offsetTop;
        document.onmousemove = function(e){
            e = e || window.event;
            ul.style.left = e.clientX - disX + "px";        
            ul.style.top = e.clientY - disY + "px";        
        }
        document.onmouseup = function(){
            document.onmousemove =null;
            if(options.savePos){
                localStorage.myArticleMenuX = ul.style.left;
                localStorage.myArticleMenuY = ul.style.top;
            }
        }
        return false;
    }
})(window)
