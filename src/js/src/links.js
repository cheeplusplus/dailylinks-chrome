function loadOptions() {
    chrome.storage.sync.get(["links_keys"], optionsLoaded);
}

function optionsLoaded(obj) {
    loadLinks(obj.links_keys);
}

function bindPage() {
    jQuery("#open_in_tabs").click(openInTabs);
}

var links_list;

function loadLinks(links) {
    var list_container = jQuery("#link_list");

    if (!links || links.length == 0) {
        list_container.text("No links are configured.");
        return;
    }

    var dow = (new Date()).getDay();
    links_list = new Array();

    var today_links = links.map(function(f) {
        return [intToByteArray(f[0]), f[1], f[2]];
    }).filter(function(f) {
        return f[0][7] && f[0][dow];
    });

    if (today_links && today_links.length > 0) {
        list_container.empty();
        jQuery("#open_in_tabs").show();
    }

    jQuery.each(today_links, function(i, item) {
        jQuery("<a>").attr("href", item[2]).text(item[1]).appendTo(list_container);
        jQuery("<br>").appendTo(list_container);
        links_list.push(item[2]);
    });
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