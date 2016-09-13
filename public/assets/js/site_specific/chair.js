//global variables
var resList_ids = [];
var notRegistered = 0;
var prevID = 0;

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
function check() {
	document.getElementById("uploaded_txt").innerHTML = "";
	document.getElementById("archived_txt").innerHTML = "";
	document.getElementById("approval_txt").innerHTML = "";
	document.getElementById("aNumber_txt").innerHTML = "";
	document.getElementById("debate_txt").innerHTML = "";
	document.getElementById("GA_txt").innerHTML = "";
	
    var resList = document.getElementById("resList");

    if (resList.selectedIndex != -1) {
    	var id = resList_ids[resList.selectedIndex];
    	
        var metaReference = firebase.database().ref().child("metadata").child(id);
        
        var uploadedRef = metaReference.child("uploaded");
        var registeredRef = metaReference.child("registered");
        var aPanelRef = metaReference.child("aPanel");
        var aNumberRef = metaReference.child("aNumber");
        var debateRef = metaReference.child("debate");
        var gaRef = metaReference.child("ga");
        
        
        //detach listeners
        firebase.database().ref().child("metadata").child(prevID).child("id").off();
        firebase.database().ref().child("metadata").child(prevID).child("uploaded").off();
        firebase.database().ref().child("metadata").child(prevID).child("registered").off();
        firebase.database().ref().child("metadata").child(prevID).child("aPanel").off();
        firebase.database().ref().child("metadata").child(prevID).child("aNumber").off();
        firebase.database().ref().child("metadata").child(prevID).child("ga").off();
        
        //ID
        firebase.database().ref().child("metadata").child(id).child("id").on("value", function (snapshot) {
        	if (snapshot.exists())
            	document.getElementById("id_txt").innerHTML = snapshot.val().toString();
        	else 
        		document.getElementById("id_txt").innerHTML = "pending";
        });
        
        //upload time
        uploadedRef.on("value", function (snapshot) {
        	if (snapshot.exists())
        		document.getElementById("uploaded_txt").innerHTML = snapshot.val();
        	else 
        		document.getElementById("uploaded_txt").innerHTML = "pending";
        });
        
        //archived time
        registeredRef.on("value", function (snapshot) {
        	if (snapshot.exists())
        		document.getElementById("archived_txt").innerHTML = snapshot.val();
        	else 
        		document.getElementById("archived_txt").innerHTML = "pending";

        });
        
        //approval time
        aPanelRef.on("value", function (snapshot) {
        	if (snapshot.exists())
        		document.getElementById("approval_txt").innerHTML = snapshot.val();
        	else 
        		document.getElementById("approval_txt").innerHTML = "pending";
        });
        
        //aNumber time
        aNumberRef.on("value", function (snapshot) {
        	if (snapshot.exists())
        		document.getElementById("aNumber_txt").innerHTML = snapshot.val();
        	else 
        		document.getElementById("aNumber_txt").innerHTML = "pending";
        });
        
        //debate status
        debateRef.on("value", function(snapshot) {
        	if (snapshot.exists())
        		document.getElementById("debate_txt").innerHTML = snapshot.val();
        	else 
        		document.getElementById("debate_txt").innerHTML = "pending";
        });
        
        //ga status
        gaRef.on("value", function(snapshot) {
        	if (snapshot.exists())
        		document.getElementById("GA_txt").innerHTML = snapshot.val();
        	else 
        		document.getElementById("GA_txt").innerHTML = "pending";
        });
        
        prevID = id;
    } else {
        //alert("You must choose a resolution to check");
    }
}

function aNumberDownload() {
	var list = document.getElementById("AnumList");
	
	if (list.selectedIndex != -1) {
        //get selected list item
        var selectedItem = list.options[list.selectedIndex].text;
        
        //download the file
        firebase.storage().ref().child("A").child(getId(selectedItem).toString()).getDownloadURL().then(function(url) {
            document.location.href = url;
        }).catch(function(error) {
            alert("An error occurred while downloading file");
        });
	} else {
		alert("You must choose a resolution to download");
	}
}

function gaDownload() {
	var list = document.getElementById("GaList");
	
	if (list.selectedIndex != -1) {
        //get selected list item
        var selectedItem = list.options[list.selectedIndex].text;
        
        //download the file
        firebase.storage().ref().child("A").child(getId(selectedItem).toString()).getDownloadURL().then(function(url) {
            document.location.href = url;
        }).catch(function(error) {
            alert("An error occurred while downloading file");
        });
	} else {
		alert("You must choose a resolution to download");
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
        var metaReference = firebase.database().ref().child("metadata").child(resList_ids[getId(resList2.options[resList2.selectedIndex].value)-1]);
        
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
    	        
    	        firebase.database().ref().child("debate").child(getId(resList2.options[resList2.selectedIndex].value)).set(resList_ids[getId(resList2.options[resList2.selectedIndex].value)-1]);
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
		
		firebase.database().ref().child("D").child(getId(resList3.options[resList3.selectedIndex].value)).once("value", function(snapshot) {
			if (snapshot.exists()) {
				var originalId = snapshot.val();
				
				var metaReference = firebase.database().ref().child("metadata").child(originalId);

		        //check if the resolution already has a debate status
		        metaReference.once("value", function(snapshot) {
		        	if (snapshot.hasChild("ga")) {
		        	    //document.getElementById("debateMsg").style.visibility = "visible";
		        	} else {
		        		var gaReference = metaReference.child("ga");
		            	
		    	        if (GaApproved_radio.checked == true) {
		    	        	gaReference.set("approved");
		    	    	} else {
		    	    		gaReference.set("not approved");
		    	    	}
		    	        
		    	        firebase.database().ref().child("ga").child(getId(resList3.options[resList3.selectedIndex].value)).set(originalId);
		    	        document.getElementById("GaMsg3").style.visibility = "visible";
		        	}
		        });
			} else {
				alert("An error occurred");
			}
		});
	} else {
		alert("You must choose a resolution to update its debate status");
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
    
    item.text +=  name;
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
    	
    item.text += " " + name;

    list.remove(id -1 + notRegistered);
    list.add(item, id -1 + notRegistered);
}

function removeChild(index, listName) {
    var list = document.getElementById(listName);
    list.remove(index);
}

//listen for changes to the children of "reference" and update "resList" accordingly
function listen(reference, topic, listName) {
    //add an item to list when a child is added to the database
    reference.on("child_added", function(childSnapshot, prevChildKey) {
        if (prevChildKey == null)
            prevChildKey = "0";
        
        var id = -1;
        
        firebase.database().ref().child("metadata").child(parseInt(childSnapshot.key)).child("id").once("value", function(snapshot) {
        	if (snapshot.exists())
        		id = snapshot.val();
        	
            addChild(parseInt(childSnapshot.key), ': ' + topic + '/' + childSnapshot.val(), id, listName);
            check();
        });
    });
}

//like 'listen()', but only displays resolutions ready to have a debate status
function debateListen(listName) {
	firebase.database().ref().child("A_Number").on("child_added", function(snapshot) {
		addChild(snapshot.val(), "", parseInt(snapshot.key), listName);
	});
}

function gaStatusListen(listName) {
    firebase.database().ref().child("debate").on("child_added", function (snapshot) {
    	firebase.database().ref().child("metadata").child(snapshot.val()).child("debate").once("value", function(innerSnapshot) {
    		if (innerSnapshot.val() == "passed")
    			addChild(snapshot.val(), "", parseInt(snapshot.key), listName);
    	});
    });
}

function gaDownloadListen(listName) {
	firebase.database().ref().child("ga").on("child_added", function(snapshot) {
		firebase.database().ref().child("metadata").child(snapshot.val()).child("ga").once("value", function(innerSnapshot) {
			if (innerSnapshot.val() == "approved")
				addChild(snapshot.val(), "", parseInt(snapshot.key), listName);
		});
	});
}

function startListeners(committee) {
    const resolutionRef = firebase.database().ref().child("resolutions").child(committee);
    
    listen(resolutionRef.child("topic 1"), "topic 1", "resList");
    listen(resolutionRef.child("topic 2"), "topic 2", "resList");
    listen(resolutionRef.child("topic 3"), "topic 3", "resList");
    listen(resolutionRef.child("topic 4"), "topic 4", "resList");
	
    debateListen("resList2");
    
    debateListen("AnumList");
    
    gaStatusListen("resList3");
    
    gaDownloadListen("GaList");
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
    
    //check();
    
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
    document.getElementById("debateSubmit_link").onclick = function() {
    	submitDebateStatus();
    	
    	//make sure the default link behaviour isn't followed
    	return false;
    };
    
    //ga
    document.getElementById("GaSubmit_link").onclick = function() {
    	submitGaStatus();
    	
    	//make sure the default link behaviour isn't followed
    	return false;
    };
    
    //logout
    document.getElementById("logout_link").onclick = function() {
    	firebase.auth().signOut();
    	document.location.href = "index.html";
    	
    	//make sure the default link behaviour isn't followed
    	return false;
    };
    
    //a-number download
    document.getElementById("aNumber_download_link").onclick = function() {
    	aNumberDownload();
    	
    	//make sure the default link behaviour isn't followed
    	return false;
    };
    
    //ga download
    document.getElementById("GaDownload_link").onclick = function() {
    	gaDownload();
    	
    	//make sure default link behaviour isn't followed
    	return false;
    }
}

window.onload = init;
