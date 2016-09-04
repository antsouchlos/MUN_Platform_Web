//takes the the text of a select-option as an argument and returns only the relevant part for download (only the resolution name and topic - without the id)
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

//extract just the committee of a string of the form: "[committee]/[topic]/[name]"
function getCommittee(txt) {
    var result= "";
    
    for (i = 0; i < txt.length; i++) {
        if (txt.charAt(i) == '/')
            break;
        
        result += txt.charAt(i);
    }
    
    return result;
}

//extract just the name of a string of the form: "[committee]/[topic]/[name]"
function getName(txt) {
    var result= "";
    
    var writing = 0;
    
    for (i = 0; i < txt.length; i++) {
        if (writing < 2) {
            if (txt.charAt(i) == '/')
                writing++;
        } else {
            result += txt.charAt(i);
        }
    }
    
    return result;
}

//extract just the topic of a string of the form: "[committee]/[topic]/[name]"
function getTopic(txt) {
    var result= "";
    
    var writing = false;
    
    for (i = 0; i < txt.length; i++) {
        if (!writing) {
            if (txt.charAt(i) == '/')
                writing = true;
        } else {
        	if (txt.charAt(i) == '/')
        		break;
            result += txt.charAt(i);
        }
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
        var committee = getCommittee(relevant);
        var resName = getName(relevant);
        var resTopic = getTopic(relevant);
        
        alert(committee);
        alert(resName);
        alert(resTopic);

        //set up the firebase reference
        var storageRef = firebase.storage().ref();

        //download file
        storageRef.child("resolutions").child(committee).child(resTopic).child(resName).getDownloadURL().then(function(url) {
            document.location.href = url;
        }).catch(function(error) {
            alert("An error occurred while downloading file");
        });
    } else {
        alert("You must choose a resolution to download");
    }
}

//takes the value of a select-option (form: "Resolution [id]: [topic]/[name]") as an argument and returns the id
function getId(txt) {
    var result = "";
    
   	var writing = false;
    
    for (i = 0; i < txt.length; i++) {
        if (!writing) {
            if (txt.charAt(i) == ' ')
                writing = true;
        } else {
            if (txt.charAt(i) == ':')
                break;
            else
                result += txt.charAt(i);
        }
    }
    
    return parseInt(result);
}

//an array containing a copy of the resolutions' ids of "resList"
var resList_ids = [];

function getInsertionIndex(id) {
	var resList = document.getElementById("resList");
	
	var array = [];
	
	for (i = 0 ; i < resList_ids.length; i++) {
		if (resList_ids[i] == id-1)
			return (i +1);
		
		if (id < resList_ids[i])
			array.push(resList_ids[i]);
	}
	
	if (array.length == 0)
		return resList_ids.length;
	
	
	var smallest = id;
	
	for (i = 0; i < array.length; i++) {
		if (array[i] < smallest)
			smallest = array[i];
	}
	
	return (resList_ids.indexOf(smallest) -1);
}

function addChild(name, id) {
    var list = document.getElementById("resList");
    var item = document.createElement("option");
    item.text = "Resolution " + id + ": " + name;
    list.add(item);
    
    resList_ids.splice(getInsertionIndex(id), 0, id);
    list.add(item, getInsertionIndex(id));
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
function listen(reference, topic, committee) {
    //add an item to list when a child is added to the database
    reference.on('child_added', function(childSnapshot, prevChildKey) {
        if (prevChildKey == null)
            prevChildKey = "0";

        addChild(committee + '/' + topic + '/' + childSnapshot.val(), parseInt(childSnapshot.key));
    });

    //change an item's text when the value of the corresponding child is changed in the database
    reference.on('child_changed', function(childSnapshot, prevChildKey) {
        if (prevChildKey == null)
            prevChildKey = "0";

        changeChild(committee + '/' + topic + '/' + childSnapshot.val(), parseInt(childSnapshot.key)-1);
    });

    //remove an item when the corresponding child is removed from the database
    reference.on('child_removed', function(oldChildSnapshot) {
        removeChild(parseInt(oldChildSnapshot.key-1));
    });
}

function init() {
    //add listener to the logout button
    document.getElementById("logout_link").onclick = function () {
    	firebase.auth().signOut();
    	document.location.href = "index.html";
    	
    	//make sure the default link behaviour isn't followed
    	return false;
    };
    
    //add listener to the "download" button
    var download_link = document.getElementById("download_link");
    download_link.onclick = function() {
        download();
        return false;
    }
    
    var committee_array = ["environmental", "humanitarian", "political", "disarmament"];
    
    const resolutionRef = firebase.database().ref().child('resolutions');
    
    for (i = 0; i < 4; i++) {
    	var committeeRef = resolutionRef.child(committee_array[i]);
        listen(committeeRef.child("topic 1"), "topic 1", committee_array[i]);
        listen(committeeRef.child("topic 2"), "topic 2", committee_array[i]);
        listen(committeeRef.child("topic 3"), "topic 3", committee_array[i]);
        listen(committeeRef.child("topic 4"), "topic 4", committee_array[i]);
    }
    

}

window.onload = init;
