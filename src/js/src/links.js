let all_links;
let links_list;

function loadLinks(links) {
    all_links = links;

    const dow = (new Date()).getDay();
    jQuery("#daylist option").eq(dow + 1).prop("selected", true);
    loadLinkDay(dow);
}

function loadLinkDay(dow) {   
    const list_container = jQuery("#link_list");

    if (!all_links || all_links.length == 0) {
        list_container.text("No links are configured.");
        return;
    }

    links_list = new Array();
    const today_links = all_links.map(function(f) {
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

function dayChange() {
    const index = $("#daylist option:selected").index();
    loadLinkDay(index - 1);
}

function openInTabs() {
    if (!links_list || links_list.length == 0) return;

    chrome.tabs.getCurrent().then(f => {
        const tab_id = f.id;
        jQuery.each(links_list, function(i, item) {
            chrome.tabs.create({ "url": item, "openerTabId": tab_id, "active": false });
        });
    });
}

jQuery(document).ready(() => {
    chrome.storage.sync.get(["links_keys"]).then(obj => loadLinks(obj.links_keys));

    jQuery("#open_in_tabs").on("click", openInTabs);
    jQuery("#daylist").on("change", dayChange);
});