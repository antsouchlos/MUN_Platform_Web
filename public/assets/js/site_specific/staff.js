function initUI() {
	document.getElementById("resRegistration_msg").style.visibility = "hidden";
	document.getElementById("resRegistration_msg2").style.visibility = "hidden";
	document.getElementById("resAPanel_msg").style.visibility = "hidden";
	document.getElementById("resAPanel_msg2").style.visibility = "hidden";
	document.getElementById("resCorrection_msg").style.visibility = "hidden";
	document.getElementById("resCorrection_msg2").style.visibility = "hidden";
	document.getElementById("resANumber_msg").style.visibility = "hidden";
	document.getElementById("resANumber_msg2").style.visibility = "hidden";
	document.getElementById("resDebate_msg").style.visibility = "hidden";
	document.getElementById("resDebate_msg2").style.visibility = "hidden";
	
	document.getElementById("registrationFileChooser").value = "";
	document.getElementById("fileChooser_aNumber").value = "";
	document.getElementById("debateFileChooser").value = "";
}

//chnage the topics according to the newly selected committee
function changeCommittee() {
	var committee_select = document.getElementById("committeeView");
	var topic_select = document.getElementById("topicView");
	var selectedIndex = committee_select.selectedIndex;
	
	if (selectedIndex != -1) {
		
		topic_select.options.length = 0;
		
		//add new items depending on the selected commmittee
		var committee_txt = committee_select[selectedIndex].text;
		
		if (committee_txt == "Special Political and Decolonization Committee") {
            for (i = 0; i < poliTopics.length; i++) {
            	var option = document.createElement("option");
            	option.text = poliTopics[i];
            	topic_select.add(option);
            }
		} else if (committee_txt == "Disarmament and International Security Commitee") {
            for (i = 0; i < disaTopics.length; i++) {
            	var option = document.createElement("option");
            	option.text = disaTopics[i];
            	topic_select.add(option);
            }
		} else if (committee_txt == "Social, Humanitarian and Cultural Committee") {
            for (i = 0; i < humaTopics.length; i++) {
            	var option = document.createElement("option");
            	option.text = humaTopics[i];
            	topic_select.add(option);
            }
		} else if (committee_txt == "Environmental Committee") {
            for (i = 0; i < enviTopics.length; i++) {
            	var option = document.createElement("option");
            	option.text = enviTopics[i];
            	topic_select.add(option);
            }
		}
	} else {
		//possibly show error message
	}
}

function register(file, committee, topic) {
	document.getElementById("resRegistration_msg").style.visibility = "hidden";
	document.getElementById("resRegistration_msg2").style.visibility = "hidden";
	
	var committee_select = document.getElementById("committeeView");
	var topic_select = document.getElementById("topicView");
	var resName = document.getElementById("resName");
	
	if (committee_select.selectedIndex != -1) {
		if (topic_select.selectedIndex != -1) {
			var committee = committee_select.options[committee_select.selectedIndex].text;
			var topic = topic_select.options[topic_select.selectedIndex].text;
			
			if (resName != "") {
				//get the current value of the counter
				firebase.database().ref().child("counter").once("value", function(snapshot) {
					var n = 1;
					
					if (snapshot.exists())
						n = snapshot.val();
					
					//upload file
		            var storageRef = firebase.storage().ref("D/" + committee + "/" + topic + "/" + resName);
		            storageRef.put(file).on('state_changed',
		                function progress(snapshot) {},
		            	
		                function error(err) { alert("An error occurred during the upload of the file"); },

		                function complete() {
		                    //add the new resolution to the database
	                        if (snapshot.exists())
	                            counter = snapshot.val() + 1;

	                        //add the new resolution to the database
	                        firebase.database().ref().child("resolutions").child(committee).child(topic).child(n.toString()).set(resName.value);
	                        firebase.database().ref().child("metadata").child(n.toString()).child("D").set(getDateAndTime());
	                        firebase.database().ref().child("committees").child(n.toString()).set(committee);
	    					firebase.database().ref().child("D").child(n.toString()).set(n);
	                        
	    					//update the counter
	    					firebase.database().ref().child("counter").set(n+1);
	    					
	    					//show the 'Resolution successfully uploaded' message
		                    document.getElementById("resRegistration_msg2").style.visibility = "visible";
		                }
		            );
				});
			} else {
				alert("You must choose a name for the resolution");
			}
		} else {
			alert("You must choose a topic for the resolution");
		}
	} else {
		alert("You must choose a committe for the resolution");
	}
}

function submit_APanel() {
	
}

function submit_correction() {
	
}

function submit_ANumber(file) {
	
}

function submit_debate(file) {
	
}

function listenAPanel(listName) {
	var list = document.getElementById(listName);
	firebase.database().ref().child("D").on("child_added", function(snapshot, prevChildKey) {
		var option = document.createElement("option");
		option.text = "D " + formatNum(snapshot.val());
		list.add(option);
	});
}

function listenCorrection(listName) {
	
}

function listenANumber(listName) {
	
}

function listenDebate(listName) {
	
}

function startListeners() {
	listenAPanel("resList_aPanel");
	listenCorrection("resList_correction");
	listenANumber("resList_aNumber");
	listenDebate("resList_debate");
}

function init() {
	initUI();
	
	var committee_select = document.getElementById("committeeView");
	
	//populate the committee_select list with the committees
	for (i = 0; i < committee_array.length; i++) {
		var option = document.createElement("option");
		
		var committee = committee_array[i];
		
		if (committee == "political") {
			option.text = "Special Political and Decolonization Committee";
		} else if (committee == "disarmament"){
			option.text = "Disarmament and International Security Commitee";
		} else if (committee == "humanitarian") {
			option.text = "Social, Humanitarian and Cultural Committee";
		} else if (committee == "environmental") {
			option.text = "Environmental Committee";
		}
		
		committee_select.add(option);
	}
	
	startListeners();
	
	//set a default selection, so the topic_select list is not empty
	committee_select.selectedIndex = 0;
	changeCommittee();
	
	//get the selected file for the registration
    var registrationFile = null;
    document.getElementById("registrationFileChooser").addEventListener('change', function(e) {
        registrationFile = e.target.files[0];
    });
	
    //get the selected file for the ANumber upload
    var aNumberFile = null;
    document.getElementById("fileChooser_aNumber").addEventListener('change', function(e) {
        aNumberFile = e.target.files[0];
    });
	
    //get the selected file for the debate
    var debateFile = null;
    document.getElementById("debateFileChooser").addEventListener('change', function(e) {
        debateFile = e.target.files[0];
    });
    
    //register
    document.getElementById("register_link").onclick = function() {
        register(registrationFile);
        
        //make sure the default link behaviour isn't followed
        return false;
    }
    
    //aPanel
    document.getElementById("aPanel_link").onclick = function() {
    	submit_APanel();
        
        //make sure the default link behaviour isn't followed
        return false;
    }
    
    //correction
    document.getElementById("correction_link").onclick = function() {
    	submit_correction();
        
        //make sure the default link behaviour isn't followed
        return false;
    }
    
    //aNumber
    document.getElementById("aNumber_link").onclick = function() {
        submit_ANumber(ANumberFile);
        
        //make sure the default link behaviour isn't followed
        return false;
    }
    
    //debate
    document.getElementById("debateRegistration_link").onclick = function() {
    	submit_debate(debateFile);
    	
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
