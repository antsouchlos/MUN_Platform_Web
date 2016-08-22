function download() {
    var list = document.getElementById("resList");
    
    //make sure something is selected
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

function addChild(name, id) {
    var list = document.getElementById("resList");
    var item = document.createElement("option");
    item.text = "Resolution " + id + ": " + name;
    list.add(item);
}

function changeChild(name, index) {
    var list = document.getElementById("resList");
    var item = document.createElement("option");
    item.text = "Resolution " + (index+1) + ": " + name;
    
    list.remove(index);
    list.add(item, index);
}

function removeChild(index) {
    var list = document.getElementById("resList");
    list.remove(index);
}

function init() {
    //set up reference to '/resolutions'
    const resolutionRef = firebase.database().ref().child('resolutions');
    
    //----synchronize items of 'resList' in realtime----
    //add an item to list when a child is added to the database
    resolutionRef.on('child_added', function(childSnapshot, prevChildKey) {
        if (prevChildKey == null)
            prevChildKey = "0";
        
        addChild(childSnapshot.val(), parseInt(prevChildKey) + 1);
    });
    
    //change an item's text when the value of the corresponding child is changed in the database
    resolutionRef.on('child_changed', function(childSnapshot, prevChildKey) {
        if (prevChildKey == null)
            prevChildKey = "0";
        
        changeChild(childSnapshot.val(), parseInt(prevChildKey));
    });
    
    //remove an item when the corresponding child is removed from the database
    resolutionRef.on('child_removed', function(oldChildSnapshot) {
        removeChild(parseInt(oldChildSnapshot.key-1));
    });
}

window.onload = init;