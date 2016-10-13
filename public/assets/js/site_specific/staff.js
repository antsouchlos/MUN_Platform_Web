//global variables
var APanelParaList = [];
var correctionParaList = [];
var ANumberParaList = [];
var DebateParaList = [];

//returns the id from the string of tue form "[Letter][id]"
function getId(str) {
	var result_str = "";
	
	var writing = false;
	
	for (i = 1; i < str.length; i++) {
		
		if (!writing) {
			if (str.charAt(i) != '0') {
				writing = true;
				result_str += str.charAt(i);
			}
		} else {
			result_str += str.charAt(i);
		}
	}
	
	return parseInt(result_str);
}

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
	
	document.getElementById("resName").value = "";
	document.getElementById("amendmentsNum").value = "";
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
			
			if (resName.value != "") {
				if (file != null) {
					//get the current value of the counter
					firebase.database().ref().child("counter").once("value", function(snapshot) {
						var n = 1;
						
						if (snapshot.exists())
							n = snapshot.val();
						
						//upload file
			            var storageRef = firebase.storage().ref("D/" + committee + "/" + topic + "/" + formatNum(n));
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
		                        firebase.database().ref().child("topics").child(n.toString()).set(topic);
		    					firebase.database().ref().child("D").child(n.toString()).set(n);
		    					firebase.database().ref().child("order").child(n.toString()).set(0);
		                        
		    					//update the counter
		    					firebase.database().ref().child("counter").set(n+1);
		    					
		    					//show the 'Resolution successfully uploaded' message
			                    document.getElementById("resRegistration_msg2").style.visibility = "visible";
			                }
			            );
					});
				} else {
					alert("You must choose a file to upload");
				}
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
	document.getElementById("resAPanel_msg").style.visibility = "hidden";
	document.getElementById("resAPanel_msg2").style.visibility = "hidden";
	
	var list = document.getElementById("resList_aPanel");
	var selectedIndex = list.selectedIndex;
	
	if (selectedIndex != -1) {
		var item = list.options[selectedIndex].text;
		var id = getId(item);
		
		firebase.database().ref().child("order").child(id.toString()).once("value", function(snapshot) {
			if (snapshot.val() == 0) {
				firebase.database().ref().child("D").child(id.toString()).remove();
				firebase.database().ref().child("A_Panel").child(id.toString()).set(id);
				firebase.database().ref().child("order").child(id.toString()).set(1);
                firebase.database().ref().child("metadata").child(id.toString()).child("A_Panel").set(getDateAndTime());
				
				document.getElementById("resAPanel_msg2").style.visibility = "visible";
			} else {
				document.getElementById("resAPanel_msg").style.visibility = "visible";
			}
		});
	} else {
		alert("You must choose a resolution to register to the A-Panel");
	}
}

function submit_correction() {
	document.getElementById("resCorrection_msg").style.visibility = "hidden";
	document.getElementById("resCorrection_msg2").style.visibility = "hidden";
	
	var list = document.getElementById("resList_correction");
	var selectedIndex = list.selectedIndex;
	
	if (selectedIndex != -1) {
		var item = list.options[selectedIndex].text;
		var id = getId(item);
		
		firebase.database().ref().child("order").child(id.toString()).once("value", function(snapshot) {
			if (snapshot.val() == 1) {
				firebase.database().ref().child("A_Panel").child(id.toString()).remove();
				firebase.database().ref().child("correction").child(id.toString()).set(id);
				firebase.database().ref().child("order").child(id.toString()).set(2);
                firebase.database().ref().child("metadata").child(id.toString()).child("correction").set(getDateAndTime());
				
				document.getElementById("resCorrection_msg2").style.visibility = "visible";
			} else {
				document.getElementById("resCorrection_msg").style.visibility = "visible";
			}
		});
	} else {
		alert("You must choose a resolution to register to the Correction - list");
	}
}

function submit_ANumber(file) {
	document.getElementById("resANumber_msg").style.visibility = "hidden";
	document.getElementById("resANumber_msg2").style.visibility = "hidden";
	
	var list = document.getElementById("resList_aNumber");
	var selectedIndex = list.selectedIndex;
	
	if (selectedIndex != -1) {
		if (file != null) {
			var item = list.options[selectedIndex].text;
			var id = getId(item);
			
			firebase.database().ref().child("order").child(id.toString()).once("value", function (snapshot) {
				if (snapshot.val() == 2) {
					firebase.database().ref().child("committees").child(id.toString()).once("value", function(snapshot2) {
						if (snapshot2.exists()) {
							firebase.database().ref().child("topics").child(id.toString()).once("value", function(snapshot3) {
								if (snapshot3.exists()) {
									var committee = snapshot2.val();
									var topic = snapshot3.val();
									
									//upload file
						            var storageRef = firebase.storage().ref("A/" + committee + "/" + topic + "/" + formatNum(id));
						            storageRef.put(file).on('state_changed',
						                function progress(snapshot) {},
						            	
						                function error(err) { alert("An error occurred during the upload of the file"); },

						                function complete() {
						                    //add the new resolution to the database
						                    firebase.database().ref().child("metadata").child(id.toString()).child("A_Number").set(getDateAndTime());
											firebase.database().ref().child("A_Number").child(id.toString()).set(id);
											firebase.database().ref().child("order").child(id.toString()).set(3);
											firebase.database().ref().child("correction").child(id.toString()).remove();
						                    
											//show the 'Resolution successfully uploaded' message
						                    document.getElementById("resANumber_msg2").style.visibility = "visible";
						                }
						            );
								} else {
									alert("An error occurred during the registration of this resolution");
								}
							});
						} else {
							alert("An error occurred during the registration of this resolution");
						}
					});
				} else {
					document.getElementById("resANumber_msg").style.visibility = "visible";
				}
			});
		} else {
			alert("You must choose a file to upload");
		}
	} else {
		alert("You must choose a resolutionto register to give an A-Number to");
	}
}

function submit_debate(file) {
	document.getElementById("resDebate_msg").style.visibility = "hidden";
	document.getElementById("resDebate_msg2").style.visibility = "hidden";
	
	var list = document.getElementById("resList_debate");
	var selectedIndex = list.selectedIndex;
	
	var amendmentNum_str = document.getElementById("amendmentsNum").value;
	
	var passed = false;
	
	if (document.getElementById("debatePassed_radio").checked == true)
		passed = true;
	
	if (selectedIndex != -1) {
		var item = list.options[selectedIndex].text;
		var id = getId(item);
		
		if (passed) {
			if (!isNaN(amendmentNum_str) && amendmentNum_str != "") {
				var amendmentNum = parseInt(amendmentNum_str);
				
				if (file != null) {
					firebase.database().ref().child("order").child(id.toString()).once("value", function (snapshot) {
						if (snapshot.val() == 3) {
							firebase.database().ref().child("committees").child(id.toString()).once("value", function(snapshot2) {
								if (snapshot2.exists()) {
									firebase.database().ref().child("topics").child(id.toString()).once("value", function(snapshot3) {
										if (snapshot3.exists()) {
											var committee = snapshot2.val();
											var topic = snapshot3.val();
											
											//upload file
								            var storageRef = firebase.storage().ref("Debate/" + committee + "/" + topic + "/" + formatNum(id));
								            storageRef.put(file).on('state_changed',
								                function progress(snapshot) {},
								            	
								                function error(err) { alert("An error occurred during the upload of the file"); },

								                function complete() {
								                    //add the new resolution to the database
								                    firebase.database().ref().child("metadata").child(id.toString()).child("debate").set(getDateAndTime());
													firebase.database().ref().child("debate").child(id.toString()).set("passed");
													firebase.database().ref().child("order").child(id.toString()).set(4);
													firebase.database().ref().child("amendments").child(id.toString()).set(amendmentNum);
													firebase.database().ref().child("A_Number").child(id.toString()).remove();
													//show the 'Resolution successfully uploaded' message
								                    document.getElementById("resDebate_msg2").style.visibility = "visible";
								                }
								            );
										} else {
											alert("An error occurred during the registration of this resolution");
										}
									});
								} else {
									alert("An error occurred during the registration of this resolution");
								}
							});
						} else {
							document.getElementById("resDebate_msg").style.visibility = "visible";
						}
					});
				} else {
					alert("You must choose a file to upload");
				}
			} else {
				alert("Not a valid number of amendments");
			}
		} else {
            //add the new resolution to the database
            firebase.database().ref().child("metadata").child(id.toString()).child("debate").set(getDateAndTime());
			firebase.database().ref().child("debate").child(id.toString()).set("failed");
			firebase.database().ref().child("order").child(id.toString()).set(4);
			firebase.database().ref().child("A_Number").child(id.toString()).remove();
			//show the 'Resolution successfully uploaded' message
            document.getElementById("resDebate_msg2").style.visibility = "visible";
		}
	} else {
		alert("You must choose a resolutionto register to give a debate-status to");
	}
}

function locateLowerIndex(id, list) {
	var result = -1;
	
	var running = true;
	
	for (i = id-1; i > 0 && running; i--) {
		for (i2 = 0; i2 < list.length; i2++) {
			if (list[i2] == i) {
				result = i2;
				running = false;
				break;
			}
		}
	}

	return result;
}

function addChild(name, id, listName) {
    var list = document.getElementById(listName);
    var item = document.createElement("option");
    
    item.text = name;
    
    if (listName == "resList_aPanel") {
        list.add(item, locateLowerIndex(id, APanelParaList) +1);
    	APanelParaList.splice(locateLowerIndex(id, APanelParaList) +1, 0, id);
    } else if (listName == "resList_correction") {
        list.add(item, locateLowerIndex(id, correctionParaList) +1);
    	correctionParaList.splice(locateLowerIndex(id, correctionParaList) +1, 0, id);
    } else if (listName == "resList_aNumber") {
        list.add(item, locateLowerIndex(id, ANumberParaList) +1);
    	ANumberParaList.splice(locateLowerIndex(id, ANumberParaList) +1, 0, id);
    } else if (listName == "resList_debate") {
        list.add(item, locateLowerIndex(id, DebateParaList) +1);
    	DebateParaList.splice(locateLowerIndex(id, DebateParaList) +1, 0, id);
    }
}

function removeChild(id, listName) {
	var list = document.getElementById(listName);
	
    if (listName == "resList_aPanel") {
    	list.remove(locateLowerIndex(id, APanelParaList) +1);
    	APanelParaList.splice(locateLowerIndex(id, APanelParaList) +1, 1);
    } else if (listName == "resList_correction") {
    	list.remove(locateLowerIndex(id, correctionParaList) +1);
    	correctionParaList.splice(locateLowerIndex(id, correctionParaList) +1, 1);
    } else if (listName == "resList_aNumber") {
    	list.remove(locateLowerIndex(id, ANumberParaList) +1);
    	ANumberParaList.splice(locateLowerIndex(id, ANumberParaList) +1, 1);
    } else if (listName == "resList_debate") {
    	list.remove(locateLowerIndex(id, DebateParaList) +1);
    	DebateParaList.splice(locateLowerIndex(id, DebateParaList) +1, 1);
    }
}

function listenAPanel(listName) {
	firebase.database().ref().child("D").on("child_added", function(snapshot, prevChildKey) {
			addChild("D" + formatNum(snapshot.val()), snapshot.val(), listName);
	});
	
	firebase.database().ref().child("D").on("child_removed", function(snapshot) {
		removeChild(snapshot.val(), listName);
	});
}

function listenCorrection(listName) {
	firebase.database().ref().child("A_Panel").on("child_added", function(snapshot, prevChildKey) {
		addChild("D" + formatNum(snapshot.val()), snapshot.val(), listName);
	});
	
	firebase.database().ref().child("A_Panel").on("child_removed", function(snapshot) {
		removeChild(snapshot.val(), listName);
	});
}

function listenANumber(listName) {
	firebase.database().ref().child("correction").on("child_added", function(snapshot, prevChildKey) {
		addChild("D" + formatNum(snapshot.val()), snapshot.val(), listName);
	});
	
	firebase.database().ref().child("correction").on("child_removed", function(snapshot) {
		removeChild(snapshot.val(), listName);
	});
}

function listenDebate(listName) {
	firebase.database().ref().child("A_Number").on("child_added", function(snapshot, prevChildKey) {
		addChild("A" + formatNum(snapshot.val()), snapshot.val(), listName);
	});
	
	firebase.database().ref().child("A_Number").on("child_removed", function(snapshot) {
		removeChild(snapshot.val(), listName);
	});
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
        submit_ANumber(aNumberFile);
        
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
