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

function getInsertionIndex(id, list) {
	var array = [];
	
	for (i = 0 ; i < list.length; i++) {
		if (list[i] == id-1)
			return (i+1);
		
		if (id < list[i])
			array.push(list[i]);
	}
	
	if (array.length == 0)
		return 0;
	
	
	var smallest = id;
	
	for (i = 0; i < array.length; i++) {
		if (array[i] < smallest)
			smallest = array[i];
	}
	
	return (list.indexOf(smallest) -1);
}

function addChild(name, id, listName) {
    var list = document.getElementById(listName);
    var item = document.createElement("option");
    item.text = "Resolution " + id + ": " + name;
    
    resList_ids.splice(getInsertionIndex(id, resList_ids), 0, id);
    list.add(item, getInsertionIndex(id, resList_ids));
}

function changeChild(name, index, listName) {
    var list = document.getElementById(listName);
    var item = document.createElement("option");
    item.text = "Resolution " + (index+1) + ": " + name;

    list.remove(index);
    list.add(item, index);
}

function removeChild(index, listName) {
    var list = document.getElementById(listName);
    list.remove(index);
}

//listen for changes to the children of "reference" and update "resList" accordingly
function listen(reference, topic, committee, listName) {
    //add an item to list when a child is added to the database
    reference.on('child_added', function(childSnapshot, prevChildKey) {
        if (prevChildKey == null)
            prevChildKey = "0";

        addChild(committee + '/' + topic + '/' + childSnapshot.val(), parseInt(childSnapshot.key), listName);
    });

    //change an item's text when the value of the corresponding child is changed in the database
    reference.on('child_changed', function(childSnapshot, prevChildKey) {
        if (prevChildKey == null)
            prevChildKey = "0";

        changeChild(committee + '/' + topic + '/' + childSnapshot.val(), parseInt(childSnapshot.key)-1, listName);
    });

    //remove an item when the corresponding child is removed from the database
    reference.on('child_removed', function(oldChildSnapshot) {
        removeChild(parseInt(oldChildSnapshot.key-1), listName);
    });
}

function getDateAndTime() {
    var currentDate = new Date();
    var dateAndTime = "";
    
    var day = currentDate.getDay(); 
    
    //translate the day from a number to a string
    if (day == 0) {
        dateAndTime += "Sun, ";
    } else if (day == 1) {
        dateAndTime += "Mon, ";
    } else if (day == 2) {
        dateAndTime += "Tue, ";
    } else if (day == 3) {
        dateAndTime += "Wed, ";
    } else if(day == 4) {
        dateAndTime += "Thu, ";
    } else if(day == 5) {
        dateAndTime += "Fri, ";
    } else {
        dateAndTime += "Sat, ";
    }
    
    //set the time
    dateAndTime += currentDate.getHours() + ':' + currentDate.getMinutes() + ":" + currentDate.getSeconds();
    
    return dateAndTime;
}

function register() {
	document.getElementById("resRegistered_msg").style.visibility = "hidden";
	document.getElementById("resRegistered_msg4").style.visibility = "hidden";
	
	var list = document.getElementById("resList_registration");
	
	//make sure a resolution is selected
	if (list.selectedIndex != -1) {
		var option_text = list[list.selectedIndex].text;
		
		var dRef = firebase.database().ref().child("D");
		
		dRef.child(getId(option_text)).once("value", function (snapshot) {
			if (!snapshot.exists()) {
				var counter = 1;
				
				dRef.child("counter").once("value", function (snapshot) {
					if (snapshot.exists()) {
						counter = snapshot.val();
					}
					
					var resRef = dRef.child(getId(option_text));

					resRef.child("n").set(counter);
					resRef.child("committee").set(getCommittee(getRelevant(option_text)));
					resRef.child("topic").set(getTopic(getRelevant(option_text)));
					resRef.child("name").set(getName(getRelevant(option_text)));
					
					firebase.database().ref().child("metadata").child(getId(option_text).toString()).child("registered").set(getDateAndTime());
					
					//add 1 to the value of the counter
					dRef.child("counter").set(counter+1);
					
					document.getElementById("resRegistered_msg4").style.visibility = "visible";
				});	
			} else {
				document.getElementById("resRegistered_msg").style.visibility = "visible";
			}
		});
	} else {
		("You must select a resolution to register");
	}
}

function submit_aPanel() {
	document.getElementById("resRegistered_msg2").style.visibility = "hidden";
	document.getElementById("resRegistered_msg5").style.visibility = "hidden";
	
	var list = document.getElementById("resList_aPanel");
	
	//make sure a resolution is selected
	if (list.selectedIndex != -1) {
		var id = parseInt(getRelevant(list[list.selectedIndex].text));
		
		firebase.database().ref().child("A_Panel").child(id).once("value", function (snapshot) {
			if (!snapshot.exists()) {
				firebase.database().ref().child("A_Panel").child(id).set("");
				
				firebase.database().ref().child("metadata").child(parseInt(id)).child("aPanel").set(getDateAndTime());
				
				document.getElementById("resRegistered_msg5").style.visibility = "visible";
			} else {
				document.getElementById("resRegistered_msg2").style.visibility = "visible";
			}
		});
	} else {
		alert("You must select a resolution to register to the A-Panel");
	}
}

function submit_aNumber() {
	document.getElementById("resRegistered_msg3").style.visibility = "hidden";
	document.getElementById("resRegistered_msg6").style.visibility = "hidden";
	
	var list = document.getElementById("resList_aNumber");
	
	//make sure a resolution is selected
	if (list.selectedIndex != -1) {
		var id = parseInt(getRelevant(list[list.selectedIndex].text));
		
		firebase.database().ref().child("A_Number").child(id).once("value", function(snapshot) {
			if (!snapshot.exists()) {
				firebase.database().ref().child("A_Number").child(id).set("");
				
				firebase.database().ref().child("metadata").child(parseInt(id)).child("aNumber").set(getDateAndTime());
				
				document.getElementById("resRegistered_msg6").style.visibility = "visible";
			} else {
				document.getElementById("resRegistered_msg3").style.visibility = "visible";
			}
		});
	} else {
		alert("You must select a resolution to give an A-Number to");
	}
}

function listenAPanel() {
	var list = document.getElementById("resList_aPanel");
	
	var dRef = firebase.database().ref().child("D");
	
	dRef.on("child_added", function(snapshot, prevChildKey) {
		if (snapshot.key.toString() != "counter") {
			var item = document.createElement("option");
			item.text = "ID: " + snapshot.child("n").val();
			
			list.add(item, snapshot.child("n").val()-1);
		}
	});
}

function listenANumber() {
	var list = document.getElementById("resList_aNumber");
	
	var aRef = firebase.database().ref().child("A_Panel");
	
	aRef.on("child_added", function(snapshot, prevChildKey) {
		if (snapshot.key.toString() != "counter") {
			var item = document.createElement("option");
			item.text = "ID: " + snapshot.key;
			
			list.add(item, parseInt(snapshot.key) -1);
		}
	});
}

function init() {
	
	document.getElementById("resRegistered_msg").style.visibility = "hidden";
	document.getElementById("resRegistered_msg2").style.visibility = "hidden";
	document.getElementById("resRegistered_msg3").style.visibility = "hidden";
	document.getElementById("resRegistered_msg4").style.visibility = "hidden";
	document.getElementById("resRegistered_msg5").style.visibility = "hidden";
	document.getElementById("resRegistered_msg6").style.visibility = "hidden";

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
        
        //make sure the default link behaviour isn't followed
        return false;
    }
    
    var committee_array = ["environmental", "humanitarian", "political", "disarmament"];
    
    const resolutionRef = firebase.database().ref().child('resolutions');
    
    for (i = 0; i < 4; i++) {
    	var committeeRef = resolutionRef.child(committee_array[i]);
        listen(committeeRef.child("topic 1"), "topic 1", committee_array[i], "resList");
        listen(committeeRef.child("topic 2"), "topic 2", committee_array[i], "resList");
        listen(committeeRef.child("topic 3"), "topic 3", committee_array[i], "resList");
        listen(committeeRef.child("topic 4"), "topic 4", committee_array[i], "resList");
    }
    
    for (i = 0; i < 4; i++) {
    	var committeeRef = resolutionRef.child(committee_array[i]);
        listen(committeeRef.child("topic 1"), "topic 1", committee_array[i], "resList_registration");
        listen(committeeRef.child("topic 2"), "topic 2", committee_array[i], "resList_registration");
        listen(committeeRef.child("topic 3"), "topic 3", committee_array[i], "resList_registration");
        listen(committeeRef.child("topic 4"), "topic 4", committee_array[i], "resList_registration");
    }
    
    listenAPanel();
    listenANumber();
    
    //add listener to the "register" button
    var register_link = document.getElementById("register_link");
    register_link.onclick = function() {
        register();
        
        //make sure the default link behaviour isn't followed
        return false;
    }
    
    //add listener to the a-panel "submit" button
    var aPanel_link = document.getElementById("aPanel_link");
    aPanel_link.onclick = function() {
        submit_aPanel();
        
        //make sure the default link behaviour isn't followed
        return false;
    }
    
    //add listener to the a-number "submit" button
    var aNumber_link = document.getElementById("aNumber_link");
    aNumber_link.onclick = function() {
        submit_aNumber();
        
        //make sure the default link behaviour isn't followed
        return false;
    }
    
    firebase.database().ref().child("D").child("counter").once("value", function(snapshot) {
    	var counter = 1;
    	
    	if (snapshot.exists())
    		counter = snapshot.val();
    	
    	document.getElementById("next_id_txt").innerHTML = counter.toString();
    	
    });
}

window.onload = init;
