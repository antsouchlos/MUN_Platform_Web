//takes the the text of a select-option as an argument and returns only the relevant part for download (only the resolution name and topic - without the id
function getRelevant(itemValue) {
    var result = "";

    var writing = false;

    for (i = 0; i < itemValue.length; i++) {
        if (!writing) {
            if (itemValue.charAt(i) == ':') {
                i++;
                writing = true;
            }
        } else {
            result += itemValue.charAt(i);
        }
    }

    return result;
}

//extract just the name of a string of the form: "[topic]/[name]"
function getName(txt) {
    var result= "";
    
    var writing = false;
    
    for (i = 0; i < txt.length; i++) {
        if (!writing) {
            if (txt.charAt(i) == '/')
                writing = true;
        } else {
            result += txt.charAt(i);
        }
    }
    
    return result;
}

//extract just the topic of a string of the form: "[topic]/[name]"
function getTopic(txt) {
    var result= "";
        
    for (i = 0; i < txt.length; i++) {
        if (txt.charAt(i) == '/')
            break;
        
        result += txt.charAt(i);
    }
    
    return result;
}

function download() {
    var list = document.getElementById("resList");

    //make sure something is selected
    if (list.selectedIndex != -1) {
        //get selected list item
        var selectedItem = list.options[list.selectedIndex].text;

        //get just the resolution's name and topic from the text of the item
        var relevant = getRelevant(selectedItem);
        var resName = getName(relevant);
        var resTopic = getTopic(relevant);

        //set up the firebase reference
        var storageRef = firebase.storage().ref();

        //download file
        storageRef.child("resolutions").child(resTopic).child(resName).getDownloadURL().then(function(url) {
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

//listen for changes to the children of "reference" and update "resList" accordingly
function listen(reference, topic) {
    //add an item to list when a child is added to the database
    reference.on('child_added', function(childSnapshot, prevChildKey) {
        if (prevChildKey == null)
            prevChildKey = "0";

        addChild(topic + '/' + childSnapshot.val(), parseInt(prevChildKey) + 1);
    });

    //change an item's text when the value of the corresponding child is changed in the database
    reference.on('child_changed', function(childSnapshot, prevChildKey) {
        if (prevChildKey == null)
            prevChildKey = "0";

        changeChild(topic + '/' + childSnapshot.val(), parseInt(prevChildKey));
    });

    //remove an item when the corresponding child is removed from the database
    reference.on('child_removed', function(oldChildSnapshot) {
        removeChild(parseInt(oldChildSnapshot.key-1));
    });
}

function init() {
    //add listener to the "download" button
    var download_link = document.getElementById("download_link");
    download_link.onclick = function() {
        download();
        return false;
    }
    
    const resolutionRef = firebase.database().ref().child('resolutions');
    
    listen(resolutionRef.child("topic_1"), "topic_1");
    listen(resolutionRef.child("topic_2"), "topic_2");
    listen(resolutionRef.child("topic_3"), "topic_3");
    listen(resolutionRef.child("topic_4"), "topic_4");
}

window.onload = init;