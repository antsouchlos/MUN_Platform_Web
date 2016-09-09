//global variables
var resList_ids = [];
var notRegistered = 0;

//takes the value of a select-option (form: "Resolution [id]: [topic]/[name]") as an argument and returns the id
function getId(txt) {
    var result = "";
    
   	var writing = false;
    
    for (i = 0; i < txt.length; i++) {
        if (!writing) {
            if (txt.charAt(i) == ' ')
                writing = true;
        } else {
            if (txt.charAt(i) == ' ')
                break;
            else
                result += txt.charAt(i);
        }
    }

    return parseInt(result);
}

function uploadDateAndTime(id) {   
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
    
    firebase.database().ref().child("metadata").child(id.toString()).child("uploaded").set(dateAndTime);
}

function hideUIElements() {
    //hide messages
    document.getElementById("msg_text").style.visibility = "hidden";
    //document.getElementById("debateMsg").style.visibility = "hidden";
    //document.getElementById("debateMsg2").style.visibility = "hidden";
    document.getElementById("debateMsg3").style.visibility = "hidden";
    document.getElementById("GaMsg3").style.visibility = "hidden";
    
    //reset the elements
    document.getElementById("fileChooser").value = "";
    document.getElementById("resName").value = "";
    document.getElementById("topicView").selectedIndex = 0;
    document.getElementById("resList").selectedIndex = 0;
    document.getElementById("resList2").selectedIndex = 0;
}

//gets called when the selected element of the "chek" select box changes
//TODO: make sure the 'check' function gets called every time, even if the selection doesn't change
function check() {
	document.getElementById("uploaded_txt").innerHTML = "";
	document.getElementById("archived_txt").innerHTML = "";
	document.getElementById("approoval_txt").innerHTML = "";
	document.getElementById("aNumber_txt").innerHTML = "";
	document.getElementById("debate_txt").innerHTML = "";
	
    var resList = document.getElementById("resList");

    if (resList.selectedIndex != -1) {
    	var id = resList_ids[resList.selectedIndex];
    	
        var metaReference = firebase.database().ref().child("metadata").child(id);
        
        var uploadedRef = metaReference.child("uploaded");
        var registeredRef = metaReference.child("registered");
        var aPanelRef = metaReference.child("aPanel");
        var aNumberRef = metaReference.child("aNumber");
        var debateRef = metaReference.child("debate");
        
        uploadedRef.once("value", function (snapshot) {
        	if (snapshot.exists())
        		document.getElementById("uploaded_txt").innerHTML = snapshot.val();
        });
        
        registeredRef.once("value", function (snapshot) {
        	if (snapshot.exists())
        		document.getElementById("archived_txt").innerHTML = snapshot.val();

        });
        
        firebase.database().ref().child("D").child(id).child("n").once("value", function (snapshot) {
        	if (snapshot.exists())
            	document.getElementById("id_txt").innerHTML = snapshot.val().toString();
        	else 
        		document.getElementById("id_txt").innerHTML = "Resolution not yet registered";
    	
        });
        
        aPanelRef.once("value", function (snapshot) {
        	if (snapshot.exists())
        		document.getElementById("approoval_txt").innerHTML = snapshot.val();
        });
        
        aNumberRef.once("value", function (snapshot) {
        	if (snapshot.exists())
        		document.getElementById("aNumber_txt").innerHTML = snapshot.val();
        });
        
        debateRef.once("value", function(snapshot) {
        	if (snapshot.exists())
        		document.getElementById("debate_txt").innerHTML = snapshot.val();
        });

    } else {
        //alert("You must choose a resolution to check");
    }
}

function upload(committee, file) {
    var topicView = document.getElementById("topicView");
    var resName = document.getElementById("resName").value;

    if (committee != "null") {
        document.getElementById("msg_text").style.visibility = "hidden";

        if (resName == "") {
            alert("You must choose a name for the resolution");
        } else if (file == null) {
            alert("You must choose a file to upload");
        } else if (topicView.selectedIndex == -1 || topicView.options[topicView.selectedIndex].text == "- Topic -") {
            alert("You must choose a topic");
        } else {
            //Get the selected topic
            var topic = topicView.options[topicView.selectedIndex].text;

            var storageRef = firebase.storage().ref("resolutions/" + committee + "/" + topic + "/" + resName);

            //upload file
            storageRef.put(file).on('state_changed',
                function progress(snapshot) {},
                function error(err) {},

                function complete() {
                    document.getElementById("msg_text").style.visibility = "visible";

                    var counterRef = firebase.database().ref().child("counter");

                    var counter = 1;
                    
                    //add the new resolution to the database
                    counterRef.once("value", function(snapshot) {
                        if (snapshot.exists())
                            counter = snapshot.val() + 1;

                        //add the new resolution to the database
                        firebase.database().ref().child("resolutions").child(committee).child(topic).child(counter).set(resName);
                        uploadDateAndTime(counter, "uploaded");
                        
                        //update the counter
                        counterRef.set(counter);
                    });
                }
            );
        }
    } else {
        alert("An error occurred while uploading resolution");

    }
}

function submitDebateStatus() {
    //document.getElementById("debateMsg").style.visibility = "hidden";
    //document.getElementById("debateMsg2").style.visibility = "hidden";
    document.getElementById("debateMsg3").style.visibility = "hidden";
    
	var debatePassed_radio = document.getElementById("debatePassed_radio");
	var resList2 = document.getElementById("resList2");
	
	//make sure an item is selected
	if (resList2.selectedIndex != -1) {
        var metaReference = firebase.database().ref().child("metadata").child(resList_ids[resList2.selectedIndex]);
        
        //check if the resolution already has a debate status
        metaReference.once('value', function(snapshot) {
        	if (snapshot.hasChild("debate")) {
        	    //document.getElementById("debateMsg").style.visibility = "visible";
        	} else {
        		var debateReference = metaReference.child("debate");
        		
    	        if (debatePassed_radio.checked == true) {
    	    		debateReference.set("passed");
    	    	} else {
    	    		debateReference.set("failed");
    	    	}
    	        
    	        document.getElementById("debateMsg3").style.visibility = "visible";
        	}
        });
	} else {
		//alert("You must choose a resolution to update its debate status");
	}
}

function submitGaStatus() {
	document.getElementById("GaMsg3").style.visibility = "hidden";
	
	var GaApproved_radio = document.getElementById("GaApproved_radio");
	var resList3 = document.getElementById("resList3");
	
	//make sure an item is selected
	if (resList3.selectedIndex != -1) {
        var metaReference = firebase.database().ref().child("metadata").child(resList_ids[resList3.selectedIndex]);
        
        //check if the resolution already has a debate status
        metaReference.once('value', function(snapshot) {
        	if (snapshot.hasChild("ga")) {
        	    //document.getElementById("debateMsg").style.visibility = "visible";
        	} else {
        		var gaReference = metaReference.child("ga");
        		
    	        if (GaApproved_radio.checked == true) {
    	        	gaReference.set("approoved");
    	    	} else {
    	    		gaReference.set("not approoved");
    	    	}
    	        
            	alert("DEBUG");
    	        
    	        document.getElementById("GaMsg3").style.visibility = "visible";
        	}
        });
	} else {
		//alert("You must choose a resolution to update its debate status");
	}
}

function addChild(originalId, name, id, listName) {
    var list = document.getElementById(listName);
    var item = document.createElement("option");
    
    if (id == -1) {
    	item.text += "ID [not registered]";
    	notRegistered++;
    	id = 1 - notRegistered;
    } else
    	item.text += "ID " + id.toString();
    
    item.text += ": " + name;
    list.add(item, id -1 + notRegistered);
    
    if (listName == "resList")
    	resList_ids.splice(id -1 + notRegistered, 0, originalId);
    	
}

function changeChild(name, id, listName) {
    var list = document.getElementById(listName);
    var item = document.createElement("option");

    if (id == -1) {
    	item.text += "ID [not registered]";
		id = 1 - notRegistered;
    } else {
    	item.text += "ID " + id.toString();
    	notRegistered--;
    }
    	
    item.text += ": " + name;

    list.remove(id -1 + notRegistered);
    list.add(item, id -1 + notRegistered);
}

//listen for changes to the children of "reference" and update "resList" accordingly
function listen(reference, topic, listName) {
    //add an item to list when a child is added to the database
    reference.on("child_added", function(childSnapshot, prevChildKey) {
        if (prevChildKey == null)
            prevChildKey = "0";
        
        var id = -1;
        
        firebase.database().ref().child('D').child(parseInt(childSnapshot.key)).child('n').once("value", function(snapshot) {
        	if (snapshot.exists())
        		id = snapshot.val();
        	
            addChild(parseInt(childSnapshot.key), topic + '/' + childSnapshot.val(), id, listName);
        });
    });

    //change an item's text when the value of the corresponding child is changed in the database
    reference.on("child_changed", function(childSnapshot, prevChildKey) {
        if (prevChildKey == null)
            prevChildKey = "0";
        
        var id = -1;
        
        firebase.database().ref().child('D').child(parseInt(childSnapshot.key)).child('n').once("value", function(snapshot) {
        	if (snapshot.exists())
        		id = snapshot.val();
        	
            changeChild(topic + '/' + childSnapshot.val(), id, listName);
        });
    });
}

//like 'listen()', but only displays resolutions ready to have a debate status
function debateListen(reference, topic, listName) {
    //add an item to list when a child is added to the database
    reference.on("child_added", function(childSnapshot, prevChildKey) {
        if (prevChildKey == null)
            prevChildKey = "0";
        
        var id = -1;
        
        firebase.database().ref().child("D").child(parseInt(childSnapshot.key)).child("n").once("value", function(snapshot) {
        	if (snapshot.exists()) {
            	firebase.database().ref().child("metadata").child(parseInt(childSnapshot.key)).child("aNumber").once("value", function(metaSnapshot) {
            		if (metaSnapshot.exists()) {
                    	id = parseInt(snapshot.val());
                    	
                        addChild(parseInt(childSnapshot.key), topic + '/' + childSnapshot.val(), id, listName);	
            		}
            	});	
        	}
        });
    });

    //change an item's text when the value of the corresponding child is changed in the database
    reference.on("child_changed", function(childSnapshot, prevChildKey) {
        if (prevChildKey == null)
            prevChildKey = "0";
        
        var id = -1;
        
        firebase.database().ref().child("D").child(parseInt(childSnapshot.key)).child("n").once("value", function(snapshot) {
        	if (snapshot.exists()) {
            	firebase.database().ref().child("metadata").child(parseInt(childSnapshot.key)).child("aNumber").once("value", function(metaSnapshot) {
            		if (metaSnapshot.exists()) {
                    	id = parseInt(snapshot.key);
                    	
                        changeChild(topic + '/' + childSnapshot.val(), id, listName);
            		}
            	});	
        	}
        });
    });
}

function gaStatusListen(reference, topic, listName) {
    //add an item to list when a child is added to the database
    reference.on("child_added", function(childSnapshot, prevChildKey) {
        if (prevChildKey == null)
            prevChildKey = "0";
        
        var id = -1;
        
        firebase.database().ref().child("D").child(parseInt(childSnapshot.key)).child("n").once("value", function(snapshot) {
        	if (snapshot.exists()) {
            	firebase.database().ref().child("metadata").child(parseInt(childSnapshot.key)).child("debate").once("value", function(metaSnapshot) {
            		if (metaSnapshot.val() == "passed") {
                    	id = parseInt(snapshot.val());
                    	
                        addChild(parseInt(childSnapshot.key), topic + '/' + childSnapshot.val(), id, listName);	
            		}
            	});	
        	}
        });
    });

    //change an item's text when the value of the corresponding child is changed in the database
    reference.on("child_changed", function(childSnapshot, prevChildKey) {
        if (prevChildKey == null)
            prevChildKey = "0";
        
        var id = -1;
        
        firebase.database().ref().child("D").child(parseInt(childSnapshot.key)).child("n").once("value", function(snapshot) {
        	if (snapshot.exists()) {
            	firebase.database().ref().child("metadata").child(parseInt(childSnapshot.key)).child("debate").once("value", function(metaSnapshot) {
            		if (metaSnapshot.val() == "passed") {
                    	id = parseInt(snapshot.key);
                    	
                        changeChild(topic + '/' + childSnapshot.val(), id, listName);
            		}
            	});	
        	}
        });
    });
}

function startListeners(committee) {
    const resolutionRef = firebase.database().ref().child("resolutions").child(committee);
    
    listen(resolutionRef.child("topic 1"), "topic 1", "resList");
    listen(resolutionRef.child("topic 2"), "topic 2", "resList");
    listen(resolutionRef.child("topic 3"), "topic 3", "resList");
    listen(resolutionRef.child("topic 4"), "topic 4", "resList");
	
    debateListen(resolutionRef.child("topic 1"), "topic 1", "resList2");
    debateListen(resolutionRef.child("topic 2"), "topic 2", "resList2");
    debateListen(resolutionRef.child("topic 3"), "topic 3", "resList2");
    debateListen(resolutionRef.child("topic 4"), "topic 4", "resList2");
    
    gaStatusListen(resolutionRef.child("topic 1"), "topic 1", "resList3");
    gaStatusListen(resolutionRef.child("topic 2"), "topic 2", "resList3");
    gaStatusListen(resolutionRef.child("topic 3"), "topic 3", "resList3");
    gaStatusListen(resolutionRef.child("topic 4"), "topic 4", "resList3");
}

function init() {
	hideUIElements();
	
    var currentCommittee = "null";
    
    var fired = false;
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if (!fired) {
            fired = true;
            
            var studentOfficer = "Student officer";

            var email = firebaseUser.email;

            if (email == "political@dsamun.com") {
                document.getElementById("studentOfficer_text").innerHTML = studentOfficer;
                document.getElementById("committee_text").innerHTML = "Special Political and Decolonization Committee";
                currentCommittee = "political";
            } else if (email == "disarmament@dsamun.com") {
                document.getElementById("studentOfficer_text").innerHTML = studentOfficer;
                document.getElementById("committee_text").innerHTML = "Disarmament and International Security Commitee";
                currentCommittee = "disarmament";
            } else if (email == "humanitarian@dsamun.com") {
                document.getElementById("studentOfficer_text").innerHTML = studentOfficer;
                document.getElementById("committee_text").innerHTML = "Social, Humanitarian and Cultural Committee";
                currentCommittee = "humanitarian";
            } else if (email == "environmental@dsamun.com") {
                document.getElementById("studentOfficer_text").innerHTML = studentOfficer;
                document.getElementById("committee_text").innerHTML = "Environmental Committee";
                currentCommittee = "environmental";
            }
        	
            //listen for resolution uploads
            startListeners(currentCommittee);
        }
    });
    
    check();
    
    //get the selected file
    var file = null;
    document.getElementById("fileChooser").addEventListener('change', function(e) {
        file = e.target.files[0];
    });
    
    //-------- Button/Link - listeners --------
    
    //upload
    document.getElementById("upload_link").onclick = function() {
    	upload(currentCommittee, file);
        
        //make sure the default link behaviour doesn't happen
        return false;
    }
    
    //debate
    document.getElementById("debateSubmit_link").onclick = function () {
    	submitDebateStatus();
    	
    	//make sure the default link behaviour isn't followed
    	return false;
    };
    
    //ga
    document.getElementById("GaSubmit_link").onclick = function () {
    	submitGaStatus();
    	
    	//make sure the default link behaviour isn't followed
    	return false;
    };
    
    //logout
    document.getElementById("logout_link").onclick = function () {
    	firebase.auth().signOut();
    	document.location.href = "index.html";
    	
    	//make sure the default link behaviour isn't followed
    	return false;
    };
}

window.onload = init;
