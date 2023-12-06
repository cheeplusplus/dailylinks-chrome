// http://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
function moveInArray(array, old_index, new_index) {
    array.splice(new_index, 0, array.splice(old_index, 1)[0]);
}

function intToByteArray(val) {
    const ints = val.toString(2);
    const pad = "00000000";
    const fullInts = pad.substring(0, pad.length - ints.length) + ints;
    const bytearr = fullInts.split("").map(function(v) { return v == "1"; });
    return bytearr;
}

function byteArrayToInt(arr) {
    const intStr = arr.map(function(v) { if (v) { return 1; } return 0; }).join("");
    const intVal = parseInt(intStr, 2);
    return intVal;
}