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

function addChild(name, id, listName) {
    var list = document.getElementById(listName);
    var item = document.createElement("option");
    item.text = "Resolution " + id + ": " + name;
    
    list.add(item);
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

function gaUpload(file) {
	document.getElementById("GaResRegistered_msg").style.visibility = "hidden";
	document.getElementById("GaResRegistered_msg4").style.visibility = "hidden";
	
	if (file != null) {
		var list = document.getElementById("resList_GaRegistration");
		
		if (list.selectedIndex != -1) {
			var id = getId(list.options[list.selectedIndex].text);
			
			firebase.database().ref().child("GA").child(id).once("value", function(snapshot) {
				if (!snapshot.exists()) {
		        	var storageRef = firebase.storage().ref().child("GA").child(id.toString());
		        	var uploadTask = storageRef.put(file);

		        	uploadTask.on('state_changed',
		                    function progress(snapshot) {},
		        			
		                    function error(err) {
		    					alert("An error occurred");
		                    },
	
		                    function complete() {
		                        //register the resolution as 'ready to download'
		                    	firebase.database().ref().child("GA_Ready").child(id).set("");
		                    	
		                    	document.getElementById("GaResRegistered_msg4").style.visibility = "visible";
		                    }
		            );

				} else {
					document.getElementById("GaResRegistered_msg").style.visibility = "visible";
				}
			});
		} else {
			alert("You must choose an ID to upload the file to");
		}
	} else {
		alert("You must choose a file to upload");
	}
}

function register() {
	document.getElementById("resRegistered_msg").style.visibility = "hidden";
	document.getElementById("resRegistered_msg4").style.visibility = "hidden";
	
	var list = document.getElementById("resList_registration");
	
	//make sure a resolution is selected
	if (list.selectedIndex != -1) {
		var option_text = list[list.selectedIndex].text;
		
		var dRef = firebase.database().ref().child('D');
		
		firebase.database().ref().child("metadata").child(getId(option_text)).child("id").once("value", function (snapshot) {
			if (!snapshot.exists()) {
				var counter = 1;
				
				dRef.child("counter").once("value", function (snapshot) {
					if (snapshot.exists()) {
						counter = snapshot.val();
					}
					
					var resRef = dRef.child(counter);

					//set the new id
					resRef.set(getId(option_text));
					
					firebase.database().ref().child("metadata").child(getId(option_text).toString()).child("registered").set(getDateAndTime());
					firebase.database().ref().child("metadata").child(getId(option_text).toString()).child("id").set(counter);
					
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
				firebase.database().ref().child("D").child(id).once("value", function(innerSnapshot) {
					var originalId = innerSnapshot.val();
					
					firebase.database().ref().child("A_Panel").child(id).set(originalId);
					firebase.database().ref().child("metadata").child(id).child("aPanel").set(getDateAndTime());
					
					document.getElementById("resRegistered_msg5").style.visibility = "visible";
				});
			} else {
				document.getElementById("resRegistered_msg2").style.visibility = "visible";
			}
		});
	} else {
		alert("You must select a resolution to register to the A-Panel");
	}
}

function submit_aNumber(file) {
	document.getElementById("resRegistered_msg3").style.visibility = "hidden";
	document.getElementById("resRegistered_msg6").style.visibility = "hidden";
	
	var list = document.getElementById("resList_aNumber");
	
	//make sure a resolution is selected
	if (list.selectedIndex != -1) {
		if (file != null) {
			var id = parseInt(getRelevant(list[list.selectedIndex].text));
			
			firebase.database().ref().child("A_Number").child(id).once("value", function(snapshot) {
				if (!snapshot.exists()) {
			        var storageRef = firebase.storage().ref("A/" + id);
			        
			        //upload file
			        storageRef.put(file).on('state_changed',
			            function progress(middleSnapshot) {},
			            function error(err) {},

			            function complete() {
			            	firebase.database().ref().child("D").child(id).once("value", function(innerSnapshot) {
								var originalId = innerSnapshot.val();
								
								firebase.database().ref().child("A_Number").child(id).set(originalId);
								firebase.database().ref().child("metadata").child(parseInt(id)).child("aNumber").set(getDateAndTime());
								
								document.getElementById("resRegistered_msg6").style.visibility = "visible";
							});
			            }
			        );
				} else {
					document.getElementById("resRegistered_msg3").style.visibility = "visible";
				}
			});
		} else {
			alert("You must choose a file to upload to register a resolution for an A-Number");
		}
	} else {
		alert("You must select a resolution to give an A-Number to");
	}
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

function listenAPanel() {
	var list = document.getElementById("resList_aPanel");
	
	firebase.database().ref().child('D').on("child_added", function(snapshot, prevChildKey) {
		if (snapshot.key.toString() != "counter") {
			var item = document.createElement("option");
			item.text = "ID: " + snapshot.key;
			
			list.add(item, parseInt(snapshot.key)-1);
		}
	});
}

function listenANumber() {
	var list = document.getElementById("resList_aNumber");
	
	firebase.database().ref().child("A_Panel").on("child_added", function(snapshot, prevChildKey) {
		if (snapshot.key.toString() != "counter") {
			var item = document.createElement("option");
			item.text = "ID: " + snapshot.key;
			
			list.add(item, parseInt(snapshot.key) -1);
		}
	});
}

function listenGaUpload() {
	var list = document.getElementById("resList_GaRegistration");
	
	firebase.database().ref().child("ga").on("child_added", function(snapshot) {
		firebase.database().ref().child("metadata").child(snapshot.val()).child("ga").once("value", function(innerSnapshot) {
			if (innerSnapshot.val() == "approved") {
				var item = document.createElement("option");
				item.text = "ID " + snapshot.key;
				
				list.add(item, parseInt(snapshot.key) -1)
			}
		});
	});
}

function init() {
	
	document.getElementById("resRegistered_msg").style.visibility = "hidden";
	document.getElementById("resRegistered_msg2").style.visibility = "hidden";
	document.getElementById("resRegistered_msg3").style.visibility = "hidden";
	document.getElementById("resRegistered_msg4").style.visibility = "hidden";
	document.getElementById("resRegistered_msg5").style.visibility = "hidden";
	document.getElementById("resRegistered_msg6").style.visibility = "hidden";
	document.getElementById("GaResRegistered_msg").style.visibility = "hidden";
	document.getElementById("GaResRegistered_msg4").style.visibility = "hidden";

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
    listenGaUpload();
    
    //get the selected file
    var file = null;
    document.getElementById("fileChooser_aNumber").addEventListener('change', function(e) {
        file = e.target.files[0];
    });
    
    //get the selected file for the GA
    var GaFile = null;
    document.getElementById("GaFileChooser").addEventListener('change', function(e) {
        GaFile = e.target.files[0];
    });
    
    //set the 'Next ID' label
    firebase.database().ref().child('D').child("counter").on("value", function(snapshot) {
    	var counter = 1;
    	
    	if (snapshot.exists())
    		counter = snapshot.val();
    	
    	document.getElementById("next_id_txt").innerHTML = counter.toString();
    	
    });
    
    //-------- Button/Link - listeners --------
    
    //register
    document.getElementById("register_link").onclick = function() {
        register();
        
        //make sure the default link behaviour isn't followed
        return false;
    }
    
    //aPanel
    document.getElementById("aPanel_link").onclick = function() {
    	submit_aPanel();
        
        //make sure the default link behaviour isn't followed
        return false;
    }
    
    //aNumber
    document.getElementById("aNumber_link").onclick = function() {
        submit_aNumber(file);
        
        //make sure the default link behaviour isn't followed
        return false;
    }
    
    //GA - upload
    document.getElementById("GaRegistration_link").onclick = function() {
    	gaUpload(GaFile);
    	
    	//make sure the default link behaviour isn't followed
    	return false;
    };
}

window.onload = init;
