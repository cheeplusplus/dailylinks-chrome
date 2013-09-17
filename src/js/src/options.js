function loadOptions() {
	chrome.storage.sync.get(["links_keys"], optionsLoaded);
}

function optionsLoaded(obj) {
	loadLinks(obj.links_keys);
}

function bindOptions() {
	jQuery("#link_add").click(addNewLink);
	jQuery("#dump_button").click(dumpLinks);
}

var links_state;

function loadLinks(keys) {
	if (!keys) keys = [];
	links_state = keys;

	// Get tbody
	var tableBody = jQuery("table#links_table tbody");

	// Clear tbody rows
	tableBody.empty();

	jQuery.each(keys, function(i, item) {
		var row = jQuery("<tr>");
		row.data("id", i+1);

		var orderCol = jQuery("<td>").text(i+1).appendTo(row);
		var moveDown = jQuery("<input>").attr("type", "button").click(moveLinkDown).appendTo(orderCol).val("v");
		if (i == keys.length - 1) {
			moveDown.css("visibility", "hidden").prop("disabled", true);
		}

		var moveUp = jQuery("<input>").attr("type", "button").click(moveLinkUp).appendTo(orderCol).val("^");
		if (i == 0) {
			moveUp.css("visibility", "hidden").prop("disabled", true);
		}

		var intArray = intToByteArray(item[0]);

		var dayCol = jQuery("<td>").appendTo(row);
		for (var c = 0; c < 7; c++) {
			jQuery("<input>").attr("type", "checkbox").data("day", c).click(updateDay).prop("checked", intArray[c]).appendTo(dayCol);
		}

		jQuery("<td>").text(item[1]).appendTo(row);
		
		var urlCol = jQuery("<td>").appendTo(row);
		jQuery("<a>").attr("href", item[2]).text(item[2]).appendTo(urlCol);

		var enabledCol = jQuery("<td>").appendTo(row);
		jQuery("<input>").attr("type", "checkbox").click(updateEnabled).prop("checked", intArray[7]).appendTo(enabledCol);

		var removeCol = jQuery("<td>").appendTo(row);
		jQuery("<input>").attr("type", "button").click(removeLink).appendTo(removeCol).val("-");

		tableBody.append(row);
	});
}

function saveLinks() {
	// Enforce data integrety
	if (!(links_state instanceof Array)) return;

	// Save to storage
	chrome.storage.sync.set( { "links_keys": links_state }, function() {
		loadLinks(links_state);
	});
}

var day_list = ["su", "mo", "tu", "we", "th", "fr", "sa"];

function addNewLink() {
	var tableFooter = jQuery("table#links_table tfoot");
	var order = links_state.length;
	var day_array = "";
	var is_any_day_set = false;

	for (var x = 0; x < 7; x++) {
		var dayChecked = jQuery("input#day_" + day_list[x], tableFooter).prop("checked");
		if (dayChecked) {
			is_any_day_set = true;
			day_array += "1";
		} else {
			day_array += "0";
		}
	}

	if (!is_any_day_set) return;

	var name = jQuery("input#link_name", tableFooter).val();
	var url = jQuery("input#link_url", tableFooter).val();

	//var newObj = { "days": day_array, "name": name, "url": url, "enabled": true };
	var packed_array = parseInt(day_array + "1", 2);
	var newObj = [packed_array, name, url];

	links_state.push(newObj);
	saveLinks();
}

function getIdFromRow(e) {
	var button = jQuery(e.target);
	var row = button.parents("tr");
	var id = row.data("id");
	return id;	
}

function removeLink(e) {
	var id = getIdFromRow(e);
	if (id <= 0) return;

	links_state.splice(id-1, 1);
	saveLinks();
}

function moveLinkUp(e) {
	var id = getIdFromRow(e);
	if (id <= 1) return;
	var pos = id - 1;

	var old_index = pos;
	var new_index = pos - 1;
	moveInArray(links_state, old_index, new_index);
	saveLinks();
}

function moveLinkDown(e) {
	var id = getIdFromRow(e);
	if (id <= 0) return;
	if (id == links_state.length) return;
	var pos = id - 1;

	var old_index = pos;
	var new_index = pos + 1;
	moveInArray(links_state, old_index, new_index);
	saveLinks();
}

function updateDay(e) {
	var checkbox = jQuery(e.target);
	var row = checkbox.parents("tr");
	var id = row.data("id");
	if (id <= 0) return;

	var row = links_state[id - 1];
	var modDay = checkbox.data("day");
	row.days[modDay] = checkbox.prop("checked");
	saveLinks();
}

function updateEnabled(e) {
	var checkbox = jQuery(e.target);
	var row = checkbox.parents("tr");
	var id = row.data("id");
	if (id <= 0) return;

	var row = links_state[id - 1];
	row.enabled = checkbox.prop("checked");
	saveLinks();
}

function showDumpZone() {
	jQuery("#dump_area").show();
}

// Dumps in the old comicrss config format
function dumpLinks() {
	var textArea = jQuery("#dump_me");
	var lines = textArea.val().split("\n");
	var reg_tx = /array\(\"(\d+)\",\"(.+)\",\"(.+)\"\)/;
	for (var i = 0; i < lines.length; i++) {
		var line_str = lines[i];
		if ($.trim(line_str) == "") continue;

		var is_enabled = true;

		// array("0100010","DMFA","http://www.missmab.com/"),

		if (line_str.substring(0, 2) == "//") {
			is_enabled = false;
		}

		var matches = reg_tx.exec(line_str);
		if (!matches) {
			console.log("Error parsing " + line_str);
			return;
		}

		var datenums = matches[1];
		var name = matches[2];
		var url = matches[3];
		
		if (is_enabled) {
			datenums += "1";
		} else {
			datenums += "0";
		}

		var packed_array = parseInt(datenums, 2);

		var newObj = [packed_array, name, url];
		links_state.push(newObj);
	}

	saveLinks();
}

jQuery(document).ready(function() {
	loadOptions();
	bindOptions();
});