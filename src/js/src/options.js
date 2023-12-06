let links_state;

function loadLinks(keys) {
	if (!keys) keys = [];
	links_state = keys;

	// Get tbody
	const tableBody = jQuery("table#links_table tbody");

	// Clear tbody rows
	tableBody.empty();

	jQuery.each(keys, function(i, item) {
		const row = jQuery("<tr>");
		row.data("id", i+1);

		const orderCol = jQuery("<td>").text(i+1).appendTo(row);
		const moveDown = jQuery("<input>").attr("type", "button").on("click", moveLinkDown).appendTo(orderCol).val("v");
		if (i == keys.length - 1) {
			moveDown.css("visibility", "hidden").prop("disabled", true);
		}

		const moveUp = jQuery("<input>").attr("type", "button").on("click", moveLinkUp).appendTo(orderCol).val("^");
		if (i == 0) {
			moveUp.css("visibility", "hidden").prop("disabled", true);
		}

		const intArray = intToByteArray(item[0]);

		const dayCol = jQuery("<td>").appendTo(row);
		for (let c = 0; c < 7; c++) {
			jQuery("<input>").attr("type", "checkbox").data("day", c).on("click", updateDay).prop("checked", intArray[c]).appendTo(dayCol);
		}

		jQuery("<td>").text(item[1]).appendTo(row);
		
		const urlCol = jQuery("<td>").appendTo(row);
		jQuery("<a>").attr("href", item[2]).text(item[2]).appendTo(urlCol);

		const enabledCol = jQuery("<td>").appendTo(row);
		jQuery("<input>").attr("type", "checkbox").on("click", updateEnabled).prop("checked", intArray[7]).appendTo(enabledCol);

		const removeCol = jQuery("<td>").appendTo(row);
		jQuery("<input>").attr("type", "button").on("click", removeLink).appendTo(removeCol).val("-");

		tableBody.append(row);
	});
}

function saveLinks() {
	// Enforce data integrety
	if (!Array.isArray(links_state)) return;

	// Save to storage
	chrome.storage.sync.set({ "links_keys": links_state }).then(() => loadLinks(links_state));
}

const day_list = ["su", "mo", "tu", "we", "th", "fr", "sa"];

function addNewLink() {
	const tableFooter = jQuery("table#links_table tfoot");
	let day_array = "";
	let is_any_day_set = false;

	for (var x = 0; x < 7; x++) {
		const dayChecked = jQuery("input#day_" + day_list[x], tableFooter).prop("checked");
		if (dayChecked) {
			is_any_day_set = true;
			day_array += "1";
		} else {
			day_array += "0";
		}
	}

	if (!is_any_day_set) return;

	const name = jQuery("input#link_name", tableFooter).val();
	const url = jQuery("input#link_url", tableFooter).val();

	//var newObj = { "days": day_array, "name": name, "url": url, "enabled": true };
	const packed_array = parseInt(day_array + "1", 2);
	const newObj = [packed_array, name, url];

	links_state.push(newObj);
	saveLinks();
}

function getIdFromRow(e) {
	const button = jQuery(e.target);
	const row = button.parents("tr");
	const id = row.data("id");
	return id;	
}

function removeLink(e) {
	const id = getIdFromRow(e);
	if (id <= 0) return;

	links_state.splice(id-1, 1);
	saveLinks();
}

function moveLinkUp(e) {
	const id = getIdFromRow(e);
	if (id <= 1) return;
	const pos = id - 1;

	const old_index = pos;
	const new_index = pos - 1;
	moveInArray(links_state, old_index, new_index);
	saveLinks();
}

function moveLinkDown(e) {
	const id = getIdFromRow(e);
	if (id <= 0) return;
	if (id == links_state.length) return;
	const pos = id - 1;

	const old_index = pos;
	const new_index = pos + 1;
	moveInArray(links_state, old_index, new_index);
	saveLinks();
}

function updateDay(e) {
	const checkbox = jQuery(e.target);
	const trow = checkbox.parents("tr");
	const id = trow.data("id");
	if (id <= 0) return;

	const row = links_state[id - 1];
	const modDay = checkbox.data("day");
	const arr = intToByteArray(row[0]);
	arr[modDay] = checkbox.prop("checked");
	row[0] = byteArrayToInt(arr);
	//links_state[id - 1] = row;
	saveLinks();
}

function updateEnabled(e) {
	const checkbox = jQuery(e.target);
	const trow = checkbox.parents("tr");
	const id = trow.data("id");
	if (id <= 0) return;

	const row = links_state[id - 1];
	const arr = intToByteArray(row[0]);
	arr[7] = checkbox.prop("checked");
	row[0] = byteArrayToInt(arr);
	//links_state[id - 1] = row;
	saveLinks();
}

function showImportArea() {
	jQuery("#dump_area").show();
}

// Dumps in the old comicrss config format
function importLinksOld() {
	const textArea = jQuery("#dump_me");
	const lines = textArea.val().split("\n");
	const reg_tx = /array\(\"(\d+)\",\"(.+)\",\"(.+)\"\)/;
	for (let i = 0; i < lines.length; i++) {
		const line_str = lines[i];
		if ($.trim(line_str) == "") continue;

		let is_enabled = true;

		// array("0100010","DMFA","http://www.missmab.com/"),

		if (line_str.substring(0, 2) == "//") {
			is_enabled = false;
		}

		const matches = reg_tx.exec(line_str);
		if (!matches) {
			console.log("Error parsing " + line_str);
			return;
		}

		const datenums = matches[1];
		const name = matches[2];
		const url = matches[3];
		
		if (is_enabled) {
			datenums += "1";
		} else {
			datenums += "0";
		}

		const packed_array = parseInt(datenums, 2);

		const newObj = [packed_array, name, url];
		links_state.push(newObj);
	}

	saveLinks();
}

function importLinks() {
	const textArea = jQuery("#dump_me");
	const text = textArea.val();
	links_state = JSON.parse(text);
	saveLinks();
}

function exportLinks() {
	jQuery("#dump_area").show();
	jQuery("#dump_me").val(JSON.stringify(links_state));
}

jQuery(document).ready(() => {
	chrome.storage.sync.get(["links_keys"]).then(obj => loadLinks(obj.links_keys));
	jQuery("#link_add").on("click", addNewLink);
});