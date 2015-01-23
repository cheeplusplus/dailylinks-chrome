function loadOptions() {
    chrome.storage.sync.get(["links_keys"], optionsLoaded);
}

function optionsLoaded(obj) {
    loadLinks(obj.links_keys);
}

function bindPage() {
    jQuery("#open_in_tabs").click(openInTabs);
    jQuery("#daylist").change(dayChange);
}

var all_links;
var links_list;

function loadLinks(links) {
    all_links = links;

    var dow = (new Date()).getDay();
    jQuery("#daylist option").eq(dow + 1).prop("selected", true);
    loadLinkDay(dow);
}

function loadLinkDay(dow) {   
    var list_container = jQuery("#link_list");

    if (!all_links || all_links.length == 0) {
        list_container.text("No links are configured.");
        return;
    }

    links_list = new Array();
    var today_links = all_links.map(function(f) {
        return [intToByteArray(f[0]), f[1], f[2]];
    }).filter(function(f) {
        return f[0][7] && (dow == -1 || f[0][dow]);
    });

    if (today_links && today_links.length > 0) {
        list_container.empty();
        jQuery("#open_in_tabs").show();
    } else {
        list_container.text("Nothing today!");
        jQuery("#open_in_tabs").hide();
    }

    jQuery.each(today_links, function(i, item) {
        jQuery("<a>").attr("href", item[2]).text(item[1]).appendTo(list_container);
        jQuery("<br>").appendTo(list_container);
        links_list.push(item[2]);
    });
}

function dayChange(e) {
    var index = $("#daylist option:selected").index();
    loadLinkDay(index - 1);
}

function openInTabs() {
    if (!links_list || links_list.length == 0) return;
    jQuery.each(links_list, function(i, item) {
        chrome.tabs.create({ "url": item, "openerTabId": tab_id, "active": false });
    });
}

var tab_id;

jQuery(document).ready(function() {
    loadOptions();
    chrome.tabs.getCurrent(function(f) {
        tab_id = f.id;
        bindPage();
    });
});