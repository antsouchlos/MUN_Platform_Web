function download() {
    var list = document.getElementById("resList");
    
    if (list.selectedIndex != -1) {
        //get selected list item
        var selectedItem = list.options[list.selectedIndex].text;
        
        //set up the firebase references
        var storageRef = firebase.storage().ref();
        
        //download file
        storageRef.child(selectedItem).getDownloadURL().then(function(url) {
            document.location.href = url;
        }).catch(function(error) {
            alert("An error occurred while downloading file");
        });
    } else {
        alert("You must choose a resolution to download");
    }
}

function init() {
    //fill the list with dummmie items
    for (i = 0; i < 30; i++) {
        var list = document.getElementById("resList");
        var item = document.createElement("option");
        item.text = "Resolution " + i;
        list.add(item);
    }
}

window.onload = init;