// ── URL builder: works on Live Server (127.0.0.1) AND Firebase Hosting ──
const IS_LIVE_SERVER = ['127.0.0.1','localhost'].includes(window.location.hostname);
function buildWatchLink(slug, ep) {
    if (IS_LIVE_SERVER) return ep ? 'watch.html?slug='+slug+'&ep='+ep : 'watch.html?slug='+slug;
    return ep ? '/watch/'+slug+'?ep='+ep : '/watch/'+slug;
}
function buildBrowserLink(kw) {
    if (IS_LIVE_SERVER) return kw ? 'browser.html?keyword='+encodeURIComponent(kw) : 'browser.html';
    return kw ? '/browser?keyword='+encodeURIComponent(kw) : '/browser';
}

var type_sub_id = getCookie('type_sub_name');
var base_url = window.location.origin + '/';

$(document).ready(function () {
    const is_capcha = false;
    var lang_id = getCookie('lang_name');
    loadTitleLang(lang_id);

    $('#nav-menu-btn').click(function (e) {
        e.preventDefault();
        $('#search').removeClass('active');
        if ($(this).hasClass("active")) {
            $(this).removeClass('active');
        } else {
            $(this).addClass('active');
        }
        $('.nav-menu ul').not('li ul').slideToggle("fast");
    });

    $('#search-btn').click(function (e) {
        e.preventDefault();
        $('#nav-menu-btn').removeClass('active');
        $('.nav-menu ul').not('li ul').hide();
        if ($('#search').hasClass("active")) {
            $('#search').removeClass('active');
        } else {
            $('#search').addClass('active');
        }
    });

    $('.nav-menu ul li a').click(function (e) {
        if ($(this).parent().find('ul').length > 0) {
            e.preventDefault();
            if ($(this).hasClass("active")) {
                $(this).removeClass('active');
            } else {
                $('.nav-menu ul li a').removeClass('active');
                $('.nav-menu ul li ul').hide();
                $(this).addClass('active');
            }
            $(this).parent().find('ul').slideToggle("fast");
        }
    });

    $('#trending-label').click(function (e) {
        e.preventDefault();
        if ($(this).hasClass("show")) {
            $(this).removeClass('show');
            $(this).parent().find('.dropdown-menu').removeClass('show');
        } else {
            $(this).addClass('show');
            $(this).parent().find('.dropdown-menu').addClass('show');
        }
    });

    $('.lang-sw span').click(function (e) {
        var id = $(this).attr('data-value');
        setCookie('lang_name', id, 30);
        loadTitleLang(id, 1);
    });

    $('#player-server .server-type .tab').click(function (e) {
        e.preventDefault();
        const data_id = $(this).attr('data-id');
        $(this).parent().find('.tab').removeClass('active');
        $(this).addClass('active');
        $(this).parent().parent().find('.server-items').removeClass('active');
        $(this).parent().parent().find('.server-items[data-id=' + data_id + ']').addClass('active');
        setCookie('type_sub_name', data_id, 30);
    });

    $('#player-server .server-items .server').click(function (e) {
        const play_streaming = $(this).attr('data-video');
        $('.server-video').removeClass('active');
        $(this).addClass('active');
        loadIframePlayer2(play_streaming);
    });

    $('.modal-trigger').click(function (e) {
        e.preventDefault();
        const data_id = $(this).attr('data-id');
        modalPopupOpen(this, data_id);
    });

    $('.modal-poup').on('click', function (e) {
        if (e.target === this) { modalPopupClose(this); }
    });

    $('.dropdown button').click(function (e) {
        e.preventDefault();
        dropdownToggle(this);
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.dropdown').length) {
            $(".dropdown-menu").removeClass('show');
        }
    });

    // Search autocomplete
    var timer, value;
    var elm_form_search = '.ajax-search-quick';
    var elm_show_data = '.show-data';

    $(elm_form_search + " input[name='keyword']").on('keyup keydown paste focus blur', function (e) {
        var keyword = $(this).val();
        keyword = formatKeywords(keyword);
        if (e.type == 'keyup') {
            clearTimeout(timer);
            if (keyword.trim().length >= 2 && value != keyword) {
                timer = setTimeout(function () {
                    value = keyword;
                    doSearchQuick(keyword);
                }, 600);
            }
            if (keyword.trim().length == 0) {
                $(elm_show_data).hide().html('');
            }
        }
        if (e.type == 'focus') {
            if (keyword.trim().length > 0 && $(elm_show_data).html() !== "") {
                $(elm_show_data).show();
            }
        }
        if (e.type == 'blur') {
            if ($(elm_form_search).is(":hover") === !0) {
            } else {
                if ($(elm_show_data).is(":hover") === !0) {
                } else {
                    $(elm_show_data).hide();
                }
            }
        }
    });
});

function formatKeywords(keyword) {
    var key = keyword.replace(/\s+/g, "+");
    key = key.replace("&", "%");
    return key;
}

// Search using Jikan API (free, no key needed)
function doSearchQuick(keyword) {
    var elm_show_data = '.show-data';
    if (keyword.length < 2) return;
    $('.loadings.icon-search').show();
    
    fetch('https://api.jikan.moe/v4/anime?q=' + encodeURIComponent(keyword.replace(/\+/g,' ')) + '&limit=8&sfw=true')
        .then(r => r.json())
        .then(data => {
            $('.loadings.icon-search').hide();
            if (!data.data || data.data.length === 0) {
                $(elm_show_data).show().html('<div style="padding:12px;color:#aaa;text-align:center">No results found</div>');
                return;
            }
            var html = '<ul>';
            data.data.forEach(function(anime) {
                var slug = anime.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
                var img = anime.images?.jpg?.small_image_url || '';
                var ep = anime.episodes ? 'Ep: ' + anime.episodes : anime.status || '';
                html += '<li><a href="' + buildWatchLink(slug) + '">';
                if (img) html += '<img src="' + img + '" style="width:36px;height:50px;object-fit:cover;border-radius:3px;margin-right:8px;vertical-align:middle">';
                html += '<div style="display:inline-block;vertical-align:middle">';
                html += '<div style="font-weight:600;color:#222">' + anime.title + '</div>';
                html += '<div style="font-size:0.75rem;color:#666">' + ep + '</div>';
                html += '</div></a></li>';
            });
            html += '</ul>';
            $(elm_show_data).show().html(html);
        })
        .catch(() => { $('.loadings.icon-search').hide(); });
}

function modalPopupOpen(obj, elm) {
    elm = elm || 'login';
    $('.modal-poup').addClass('show');
    $('#load-fade-poup').html('<div class="modal-backdrop fade show"></div>');
    $('.modal-content').hide();
    $('.modal-content.' + elm).show();
}

function modalPopupClose(obj) {
    $('.modal-poup').removeClass('show');
    $('#load-fade-poup').html('');
}

function getLinkIframeDefault() {
    let link_iframe = '';
    const elm_link = '.server-video';
    const elm_tab = '.server-tab';
    if (type_sub_id) {
        $(elm_tab + ' .tab').each(function (index, element) {
            const data_tab_id = $(element).attr('data-id');
            if (data_tab_id == type_sub_id) {
                $(elm_link).removeClass('default');
                $('.server-items[data-id="' + data_tab_id + '"]').first().find('.server-video').addClass('default');
            }
        });
    }
    $(elm_link).each(function (index, element) {
        const link_tmp = $(element).attr('data-video');
        const data_tab = $(element).attr('data-tab');
        if ($(element).hasClass("default")) {
            if (link_tmp != '') {
                link_iframe = link_tmp;
                $(element).addClass('active');
                $(element).parent().addClass('active');
                $(elm_tab + ' .' + data_tab).addClass('active');
                return false;
            }
        }
    });
    if (link_iframe == '') {
        $(elm_link).each(function (index, element) {
            const link_tmp = $(element).attr('data-video');
            const data_tab = $(element).attr('data-tab');
            if (link_tmp != '') {
                link_iframe = link_tmp;
                $(element).addClass('active');
                $(element).parent().addClass('active');
                $(elm_tab + ' .' + data_tab).addClass('active');
                return false;
            }
        });
    }
    loadIframePlayer2(link_iframe);
}

function loadIframePlayer2(link_iframe) {
    if (link_iframe && link_iframe != '') {
        $('html,body').animate({ scrollTop: $(".play-video").offset().top }, 800);
        $(".play-video iframe").attr('src', link_iframe);
        $('.loading.watchs').show();
        setTimeout(function () { $('.loading.watchs').hide(); }, 1200);
    }
}

function setCookie(c_name, value, expiredays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = c_name + "=" + encodeURIComponent(value) + ";expires=" + exdate.toUTCString() + ";path=/";
}

function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? decodeURIComponent(keyValue[2]) : null;
}

function dropdownToggle(obj) {
    if ($(obj).parent().find('.dropdown-menu').hasClass("show")) {
    } else {
        $('.dropdown-menu').removeClass('show');
    }
    $(obj).parent().find('.dropdown-menu').toggleClass("show");
}

function loadEP(value) {
    var elm_dropdown = '.range .dropdown-item';
    $(elm_dropdown).removeClass('active');
    $(elm_dropdown + '[data-value="' + value + '"]').addClass('active');
    $('.dropdown-menu').hide();
    $('.dropdown.filter').removeClass('show');
    $(".range .dropdown-item").parent().parent().find('.dropdown-toggle').html(value);
    $(".ep-range").removeClass('active');
    $(".ep-range[data-range='" + value + "']").addClass('active');
}

function loadTitleLang(id, count) {
    count = count || 0;
    if (id == null) id = 'en';
    $('.lang-sw span').removeClass('active');
    $('.lang-sw span[data-value="' + id + '"]').addClass('active');
}

function loadTopViews(obj, id) {
    const text = $(obj).text();
    $("#trending-label").addClass('show').text(text);
    $(obj).parent().removeClass('show');
}

setInterval(showTime, 1000);
function showTime() {
    var time = new Date();
    var hour = time.getHours();
    var min = time.getMinutes();
    var sec = time.getSeconds();
    var am_pm = "AM";
    if (hour > 12) { hour -= 12; am_pm = "PM"; }
    if (hour == 0) { hour = 12; am_pm = "AM"; }
    hour = hour < 10 ? "0" + hour : hour;
    min = min < 10 ? "0" + min : min;
    sec = sec < 10 ? "0" + sec : sec;
    $('#clock').html(hour + ":" + min + ":" + sec + " " + am_pm);
}

var date = new Date();
$('#current-date').text(date.toLocaleDateString());
showTime();

// ===== ANIFILE: Load real anime from Jikan API =====
function loadAnimeSection(containerId, endpoint, limit) {
    limit = limit || 20;
    var $container = $('#' + containerId);
    if (!$container.length) return;
    
    $container.html('<div style="padding:20px;text-align:center"><div class="loadings" style="display:inline-block;width:30px;height:30px"></div></div>');
    
    fetch('https://api.jikan.moe/v4/' + endpoint + '?limit=' + limit + '&sfw=true')
        .then(r => r.json())
        .then(data => {
            if (!data.data) return;
            var html = '';
            data.data.forEach(function(anime) {
                var slug = (anime.title || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
                var img = anime.images?.jpg?.image_url || anime.images?.jpg?.small_image_url || '';
                var score = anime.score ? anime.score.toFixed(1) : '';
                var ep = anime.episodes || '?';
                var type = anime.type || 'TV';
                html += '<div class="flw-item">' +
                    '<div class="film-poster">' +
                    '<img src="' + img + '" alt="' + anime.title + '" class="film-poster-img" loading="lazy">' +
                    '<div class="film-poster-ahh">' +
                    '<a href="' + buildWatchLink(slug) + '" class="btn-play"><i class="fa-solid fa-play"></i></a>' +
                    '</div>' +
                    '<div class="tick ltr">' +
                    (score ? '<div class="tick-item tick-rate"><i class="fa-solid fa-star"></i> ' + score + '</div>' : '') +
                    '<div class="tick-item tick-eps">EP ' + ep + '</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="film-detail">' +
                    '<h3 class="film-name"><a href="/watch/' + slug + '">' + anime.title + '</a></h3>' +
                    '<div class="fd-infor"><span class="fdi-item">' + type + '</span></div>' +
                    '</div>' +
                    '</div>';
            });
            $container.html(html);
        })
        .catch(() => { $container.html('<div style="padding:20px;text-align:center;color:#aaa">Failed to load</div>'); });
}

// Load homepage sections on ready
$(document).ready(function() {
    loadAnimeSection('trending-now-container', 'top/anime', 12);
    loadAnimeSection('recent-container', 'anime?status=airing&order_by=popularity&sort=asc', 20);
    loadAnimeSection('popular-container', 'top/anime?filter=bypopularity', 12);
});