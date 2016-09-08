//takes the value of a select-option (form: "Resolution [id]: [topic]/[name]") as an argument and return the id
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
    var resolutionRef = firebase.database().ref().child("metadata").child(id.toString()).child("uploaded");
    
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
    
    //se the time
    dateAndTime += currentDate.getHours() + ':' + currentDate.getMinutes() + ":" + currentDate.getSeconds();
    
    resolutionRef.set(dateAndTime);
}

var notRegistered = 0;

function addChild(name, id, listName) {
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
}

var notRegistered2 = 0;

function changeChild(name, id, listName) {
    var list = document.getElementById(listName);
    var item = document.createElement("option");
    
    if (id == -1) {
    	item.text += "ID [not registered]";
		notRegistered2++;
		id = 1 - notRegistered2;
    } else
    	item.text += "ID " + id.toString();
    
    item.text += ": " + name;

    list.remove(index);
    list.add(item, id -1 + notRegistered2);
}

//listen for changes to the children of "reference" and update "resList" accordingly
//TODO: find another way of getting the resolutions
function listen(reference, topic, listName) {
    //add an item to list when a child is added to the database
    reference.on('child_added', function(childSnapshot, prevChildKey) {
        if (prevChildKey == null)
            prevChildKey = "0";
        
        var id = -1;
        
        firebase.database().ref().child("D").child(parseInt(childSnapshot.key)).child("n").once("value", function(snapshot) {
        	if (snapshot.exists())
        		id = parseInt(snapshot.val());
        	
            addChild(topic + '/' + childSnapshot.val(), id, listName);
        });
    });

    //change an item's text when the value of the corresponding child is changed in the database
    reference.on('child_changed', function(childSnapshot, prevChildKey) {
        if (prevChildKey == null)
            prevChildKey = "0";
        
        var id = -1;
        
        firebase.database().ref().child("D").child(parseInt(childSnapshot.key)).child("n").once("value", function(snapshot) {
        	if (snapshot.exists())
        		id = parseInt(snapshot.key);
        	
            changeChild(topic + '/' + childSnapshot.val(), id, listName);
        });
    });
}

function init() {
    var currentCommittee = "null";
    
    //hide the debateMsg
    document.getElementById("debateMsg").style.visibility = "hidden";
    
    //reset the upload elements
    document.getElementById("fileChooser").value = "";
    document.getElementById("resName").value = "";
    document.getElementById("topicView").selectedIndex = 0;
    document.getElementById("resList").selectedIndex = 0;
    document.getElementById("resList2").selectedIndex = 0;
    
    //set the title and subtitle of the site
    //TODO: set studen officers and remove this variable
    var studentOfficer = "[tbd] - Student officer";
    
    //add listener to the logout button
    document.getElementById("logout_link").onclick = function () {
    	firebase.auth().signOut();
    	document.location.href = "index.html";
    	
    	//make sure the default link behaviour isn't followed
    	return false;
    };
    
    var fired = false;
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if (!fired) {
            fired = true;

            var email = firebaseUser.email;

            if (email == "political@dsamun.com") {
                //TODO: set student officer
                document.getElementById("studentOfficer_text").innerHTML = studentOfficer;
                document.getElementById("committee_text").innerHTML = "Special Political and Decolonization Committee";
                currentCommittee = "political";
            } else if (email == "disarmament@dsamun.com") {
                //TODO: set student officer
                document.getElementById("studentOfficer_text").innerHTML = studentOfficer;
                document.getElementById("committee_text").innerHTML = "Disarmament and International Security Commitee";
                currentCommittee = "disarmament";
            } else if (email == "humanitarian@dsamun.com") {
                //TODO: set student officer
                document.getElementById("studentOfficer_text").innerHTML = studentOfficer;
                document.getElementById("committee_text").innerHTML = "Social, Humanitarian and Cultural Committee";
                currentCommittee = "humanitarian";
            } else if (email == "environmental@dsamun.com") {
                //TODO: set student officer
                document.getElementById("studentOfficer_text").innerHTML = studentOfficer;
                document.getElementById("committee_text").innerHTML = "Environmental Committee";
                currentCommittee = "environmental";
            }
        }
        
        const resolutionRef = firebase.database().ref().child('resolutions').child(currentCommittee);
    
        listen(resolutionRef.child("topic 1"), "topic 1", "resList");
        listen(resolutionRef.child("topic 2"), "topic 2", "resList");
        listen(resolutionRef.child("topic 3"), "topic 3", "resList");
        listen(resolutionRef.child("topic 4"), "topic 4", "resList");
        
        listen(resolutionRef.child("topic 1"), "topic 1", "resList2");
        listen(resolutionRef.child("topic 2"), "topic 2", "resList2");
        listen(resolutionRef.child("topic 3"), "topic 3", "resList2");
        listen(resolutionRef.child("topic 4"), "topic 4", "resList2");
    });
    
    //hide the msg_text message
    document.getElementById("msg_text").style.visibility = "hidden";
    
    var fileChooser = document.getElementById("fileChooser");
    var resName = document.getElementById("resName");
    var topicView = document.getElementById("topicView");

    var file = null;
    
    //set listener on the filechooser
    fileChooser.addEventListener('change', function(e) {
        //get file
        file = e.target.files[0];
    });
                                 
    //add listener to the "upload" button
    var upload_link = document.getElementById("upload_link");
    upload_link.onclick = function() {
        if (currentCommittee != "null") {
            //hide the successfule_text message
            document.getElementById("msg_text").style.visibility = "hidden";

            if (resName.value == "") {
                alert("You must choose a name for the resolution");
            } else if (file == null) {
                alert("You must choose a file to upload");
            } else if (topicView.selectedIndex == -1 || topicView.options[topicView.selectedIndex].text == "- Topic -") {
                alert("You must choose a topic");
            } else {
                //Get the selected topic
                var topic = topicView.options[topicView.selectedIndex].text;

                var storageRef = firebase.storage().ref("resolutions/" + currentCommittee + "/" + topic + "/" + resName.value);

                //upload file
                var uploadTask = storageRef.put(file);

                //handle the file upload
                uploadTask.on('state_changed',

                    function progress(snapshot) {},

                    function error(err) {
                        alert("An error occurred while uploading the file");
                    },

                    function complete() {
                        //make the msg_text message visible
                        document.getElementById("msg_text").style.visibility = "visible";

                        //add the resolution to the realtime database
                        var rootRef = firebase.database().ref();
                        var counterRef = rootRef.child('counter');

                        var counter = 1;

                        //boolean to make sure the code doesn't execute every time the counter changes
                        var read = false;

                        //get the value of the counter
                        counterRef.on('value', function(snapshot) {
                            if (!read) {
                                read = true;

                                firebase.database().ref().child("counter").once("value", function(snapshot) {
                                    if (snapshot.exists())
                                        counter = parseInt(snapshot.val()) + 1;

                                    //create the new resolution-reference
                                    var databaseRef = firebase.database().ref().child('resolutions').child(currentCommittee).child(topic).child(counter.toString());

                                    //set the name of the new resolution
                                    databaseRef.set(resName.value);
                                    
                                    //add the resolution metadata to the realtime database
                                    uploadDateAndTime(counter, "uploaded");

                                    //update the counter
                                    counterRef.set(counter.toString());
                                });
                            }
                        });
                    }
                );
            }
        } else {
            alert("An error occurred while uploading resolution");
        }
        
        //make sure the default link behaviour doesn't happen
        return false;
    }
    
    //add listener to the "check" button
    document.getElementById("check_link").onclick = function() {
    	document.getElementById("uploaded_txt").innerHTML = "";
    	document.getElementById("archived_txt").innerHTML = "";
		document.getElementById("approoval_txt").innerHTML = "";
		document.getElementById("aNumber_txt").innerHTML = "";
		document.getElementById("debate_txt").innerHTML = "";
    	
        var resList = document.getElementById("resList");

        if (resList.selectedIndex != -1) {
        	var id = getId(resList.options[resList.selectedIndex].text);
        	
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
            alert("You must choose a resolution to check");
        }
        
        return false;
    };
    
    //add listener to the "submit" button
    document.getElementById("debateSubmit_link").onclick = function () {
        //hide the debateMsg
        document.getElementById("debateMsg").style.visibility = "hidden";
        
    	var debatePassed_radio= document.getElementById("debatePassed_radio");
    	var resList2 = document.getElementById("resList2");
    	
    	//make sure an item is selected
    	if (resList2.selectedIndex != -1) {
	        var metaReference = firebase.database().ref().child("metadata").child(getId(resList2.options[resList2.selectedIndex].text));
	        //check if the resolution already has a debate status
	        metaReference.once('value', function(snapshot) {
	        	if (snapshot.hasChild("debate")) {
	        	    //make the dabteMsg visible
	        	    document.getElementById("debateMsg").style.visibility = "visible";
	        	} else {
	        		var debateReference = metaReference.child("debate");
	        		
	    	        if (debatePassed_radio.checked == true) {
	    	    		debateReference.set("passed");
	    	    	} else {
	    	    		debateReference.set("failed");
	    	    	}
	        	}
	        });
	    	
    	} else {
    		alert("You must choose a resolution to update its debate status");
    	}
    	
    	return false;
    };
}

window.onload = init;
