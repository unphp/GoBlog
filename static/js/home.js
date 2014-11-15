$(document).ready(function () {
    //fixHeader();
    topButton();
    renderMarkdown();
    initComment();
	var initFuncList = $.regTotogooInitFunc();
    if (initFuncList !== undefined) {
        for (var k in initFuncList) {
            var func = initFuncList[k];
            func();
        }
    }
});

function fixHeader() {
    var $nav = $('#nav');
    var top = $nav.offset().top;
    console.log(top);
    $(window).scroll(function () {
        if (top < $(this).scrollTop()) {
            $nav.addClass("fixed").removeClass("text-center");
        } else {
            $nav.removeClass("fixed").addClass("text-center");
        }
    });
}

function topButton() {
    var top = $('#nav').offset().top;
    var $top = $('#go-top');
    $(window).scroll(function () {
        if (top < $(this).scrollTop()) {
            $top.removeClass("hide");
        } else {
            $top.addClass('hide');
        }
    });
    $top.on("click", function () {
        $('body,html').animate({scrollTop: 0}, 500);
        return false;
    })
}

function renderMarkdown() {
    var $md = $('.markdown');
    $md.each(function (i, item) {
        $(item).html(marked($(item).html().replace(/&gt;/g, '>')));
    });
    var code = $md.find('pre code');
    if (code.length) {
        $("<link>").attr({ rel: "stylesheet", type: "text/css", href: "/static/css/highlight.css"}).appendTo("head");
        $.getScript("/static/lib/highlight.min.js", function () {
            code.each(function (i, item) {
                hljs.highlightBlock(item)
            });
        });
    }
}

function initComment() {
    var $list = $('#comment-list');
    if (!$list.length) {
        return;
    }
    if (localStorage.getItem("comment-author")) {
        $('#comment-author').val(localStorage.getItem("comment-author"));
        $('#comment-email').val(localStorage.getItem("comment-email"));
        $('#comment-url').val(localStorage.getItem("comment-url"));
        $('#comment-avatar').attr("src", localStorage.getItem("comment-avatar"));
        $('.c-avatar').removeClass("null");
    }
    $('#comment-content').on("focus", function () {
        if ($('.c-avatar').hasClass("null")) {
            $('.c-avatar-field').remove();
            $('.c-info-fields').removeClass("hide");
        }
    });
    $('.not-me').on("click", function () {
        $('.c-avatar-field').remove();
        $('.c-info-fields').removeClass("hide");
        return false;
    });
    $('#comment-show').on("click", ".enable", function () {
        $("#comment-show").remove();
        $('#comment-form').removeClass("hide");
    });
    $('#comment-form').ajaxForm(function (json) {
        if (json.res) {
            localStorage.setItem("comment-author", $('#comment-author').val());
            localStorage.setItem("comment-email", $('#comment-email').val());
            localStorage.setItem("comment-url", $('#comment-url').val());
            localStorage.setItem("comment-avatar", json.comment.avatar);
            var tpl = $($('#comment-tpl').html());
            tpl.find(".c-avatar").attr("src", json.comment.avatar).attr("alt", json.comment.author);
            tpl.find(".c-author").attr("href", json.comment.url).text(json.comment.author);
            tpl.find(".c-reply").attr("rel", json.comment.id);
            tpl.find(".c-content").html(json.comment.content);
            if (json.comment.parent_md) {
                tpl.find(".c-p-md").html(marked(json.comment.parent_md));
            } else {
                tpl.find(".c-p-md").remove();
            }
            tpl.attr("id", "comment-" + json.comment.id);
            if (json.comment.status == "approved") {
                tpl.find(".c-check").remove();
            }
            $list.append(tpl);
            $('.cancel-reply').trigger("click");
            $('#comment-content').val("");
        } else {
            alert("提交失败!");
        }
    });
    $list.on("click", ".c-reply", function () {
        $('.reply-md').remove();
        var id = $(this).attr("rel");
        var pc = $('#comment-' + id);
        var md = "> @" + pc.find(".c-author").text() + "\n\n";
        md += "> " + pc.find(".c-content").html() + "\n";
        $('#comment-content').before('<div class="reply-md markdown">' + marked(md) + '</div>');
        $('#comment-parent').val(id);
        if ($('#comment-show').length) {
            $('#comment-show .enable').trigger("click");
        }
        $('.cancel-reply').show();
        var top = $('#comment-form').offset().top;
        $('body,html').animate({scrollTop: top}, 500);
        return false;
    });
    $('.cancel-reply').on("click", function () {
        $('.reply-md').remove();
        $('#comment-parent').val(0);
        $(this).hide();
        return false;
    });
}

$.extend({
    TotogooObjMap: {},
});

$.extend({
    regTotogooInitFunc: function() {
        if ($.TotogooObjMap["totogooInitFunc"] === undefined) {
            $.TotogooObjMap["totogooInitFunc"] = new Array();
        }
        return $.TotogooObjMap["totogooInitFunc"];
    }
});

$.extend({
    totogooList: function() {
        if ($.TotogooObjMap["totogooList"] === undefined) {
            var domain = location.protocol + "//" + location.hostname;
            $.TotogooObjMap["totogooList"] = new TotogooList();
        }
        return $.TotogooObjMap["totogooList"];
    }
});

function TotogooList() {
	this.pageTemplate = null;
    this.getPageTemplate = function() {
        if (null === this.pageTemplate) {
            var text = [];
            text.push('<ul class="pagination">');
            text.push('{{#showPage .}}');
            text.push('<li class="{{status}}">');
            text.push('<a href="{{url}}{{page}}">{{{text}}}</a>');
            text.push('</li>');
            text.push('{{/showPage}} ');
            text.push('<ul>');
            this.pageTemplate = text.join("");
        }
        return this.pageTemplate;
    };
    this.showPage = function(pageUrl,page,total,size) {
		if(page<1){
			page = 1;
		}
		var data = {
			count:total,
			size:size
		}
        Handlebars.registerHelper("showPage", function(row, options) {
            var out = [];
            if (row.count < row.size) {
                return "";
            }
            var pages = Math.ceil(parseInt(row.count) / parseInt(row.size));
            var pageSize = 6;
            var start, end = 0;
            if (pages < pageSize) {
                start = 1;
                end = pages;
            } else {
                start = (page - 3);
                end = page + 3;
                if ((page - 3) <= 0) {
                    start = 1;
                    end = pageSize + 1;
                }
                if ((page + 3) > pages) {
                    start = pages - pageSize;
                    end = pages;
                }
            }
            var firstPage = {
                status: "",
                url: pageUrl,
                page: 1,
                text: "<span>&laquo;</span>"
            };
            if (page === 1) {
                firstPage.status = "disabled";
            }
            out.push(options.fn(firstPage));
            for (var i = start; i <= end; i++) {
                var option = {
                    status: "",
                    url: pageUrl,
                    page: i,
                    text: i
                };
                if (parseInt(page) === i) {
                    option.status = "active";
                }
                out.push(options.fn(option));
            }
            var lastPage = {
                status: "",
                url: pageUrl,
                page: pages,
                text: "<span>&raquo;</span>"
            };
            if (page === pages) {
                lastPage.status = "disabled";
            }
            out.push(options.fn(lastPage));
            return out.join("");
        });
		var pateTemplate = Handlebars.compile(this.getPageTemplate());
		return pateTemplate(data);
    };
}
