//global variables
var prevID = 0;
var ParaList = [];
var checked = false;

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

function check() {
	var list = document.getElementById("resList");
	
	var selectedIndex = list.selectedIndex;
	
	if (selectedIndex != -1) {
		if (prevID != 0)
			firebase.database().ref().child("metadata").child(prevID).off();
		
		var registered_txt = document.getElementById("archived_txt");
		var approval_txt = document.getElementById("approval_txt");
		var correction_txt = document.getElementById("advisor_txt");
		var ANumber_txt = document.getElementById("aNumber_txt");
		var debate_txt = document.getElementById("debate_txt");
		var amendments_txt = document.getElementById("amnd_txt");
		var name_txt = document.getElementById("name_txt");
		var committee_txt = document.getElementById("committee_txt");
		var topic_txt = document.getElementById("topic_txt");
		
		registered_txt.innerHTML = "pending";
		approval_txt.innerHTML = "pending";
		correction_txt.innerHTML = "pending";
		ANumber_txt.innerHTML = "pending";
		debate_txt.innerHTML = "pending";
		amendments_txt.innerHTML = "pending";
		
		var id = getId(list.options[selectedIndex].text);
		prevID = id;
		
		firebase.database().ref().child("metadata").child(id.toString()).on("child_added", function(snapshot) {
			if (snapshot.key == "D") {
				registered_txt.innerHTML = snapshot.val();
			} else if (snapshot.key == "A_Panel") {
				approval_txt.innerHTML = snapshot.val();
			} else if (snapshot.key == "correction") {
				correction_txt.innerHTML = snapshot.val();
			} else if (snapshot.key == "A_Number") {
				ANumber_txt.innerHTML = snapshot.val();
			} else if (snapshot.key == "dstatus") {
				debate_txt.innerHTML = snapshot.val();
				
				if (snapshot.val() == "failed")
					amendments_txt.innerHTML = "";
			} else if (snapshot.key == "amendments") {
				amendments_txt.innerHTML = snapshot.val();
			} else if (snapshot.key == "name") {
				name_txt.innerHTML = snapshot.val();
			}
		});
		
		firebase.database().ref().child("committees").child(id.toString()).once("value", function (snapshot) {
			committee_txt.innerHTML = snapshot.val();
		});
		
		firebase.database().ref().child("topics").child(id.toString()).once("value", function (snapshot) {
			topic_txt.innerHTML = snapshot.val();
		});
	} else {
		//alert("An error occurred while checking for the status of a resolution");
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
    
    list.add(item, locateLowerIndex(id, ParaList) +1);
	ParaList.splice(locateLowerIndex(id, ParaList) +1, 0, id);
}

function changeChild(name, id, listName) {
	var list = document.getElementById(listName);
	var item = document.createElement("option");
	
	item.text = name;
	
	list.remove(locateLowerIndex(id, ParaList) +1);
	list.add(item, locateLowerIndex(id, ParaList) +1);
}

function removeChild(id, listName) {
	var list = document.getElementById(listName);
	
	list.remove(locateLowerIndex(id, ParaList) +1);
	ParaList.splice(locateLowerIndex(id, ParaList) +1, 1);
}

function listen() {
	firebase.database().ref().child("order").on("child_added", function(snapshot) {
		var id = parseInt(snapshot.key);

		if (snapshot.val() <= 2) {
			addChild("D" + formatNum(id), id, "resList");
		} else {
			addChild("A" + formatNum(id), id, "resList");
		}
		
		if (!checked) {
			var resList = document.getElementById("resList");
			resList.selectedIndex = 0;
			check();
		}
	});
	
	firebase.database().ref().child("order").on("child_changed", function(snapshot) {
		var id = parseInt(snapshot.key);

		if (snapshot.val() <= 2) {
			changeChild("D" + formatNum(id), id, "resList");
		} else {
			changeChild("A" + formatNum(id), id, "resList");
		}
	});
}

function draftDownload() {
	var list = document.getElementById("resList");
	var selectedIndex = list.selectedIndex;
	
	if (selectedIndex != -1) {
		var item = list.options[selectedIndex].text;
		var id = getId(item);
		
		firebase.database().ref().child("committees").child(id.toString()).once("value", function(snapshot) {
			if (snapshot.exists()) {
				var committee = snapshot.val();
				
				firebase.database().ref().child("topics").child(id.toString()).once("value", function(snapshot2) {
					if (snapshot2.exists()) {
						var topic = snapshot2.val();
						
				        //set up the firebase reference
				        var storageRef = firebase.storage().ref();

				        //download file
				        storageRef.child("D").child(committee).child(topic).child(formatNum(id)).getDownloadURL().then(function(url) {
				            document.location.href = url;
				        }).catch(function(error) {
				            alert("An error occurred while downloading the file");
				            console.log("Error during download");
				        });
					} else {
						alert("An error occurred while downloading the resolution");
			            console.log("Resolution not registered in topics");
			            console.log("ID: " + id);
					}
				});
			} else {
				alert("An error occurred while downloading the resolution");
	            console.log("Resolution not registered in committees");
	            console.log("ID: " + id);
			}
		});
	} else {
		alert("You must choose a resolution to download");
	}
}

function aNumberDownload() {
	var list = document.getElementById("resList");
	var selectedIndex = list.selectedIndex;
	
	if (selectedIndex != -1) {
		var item = list.options[selectedIndex].text;
		var id = getId(item);
		
		firebase.database().ref().child("order").child(id.toString()).once("value", function (snapshot3) {
			if (snapshot3.exists()) {
				var order = snapshot3.val();
				
				if (order >= 3) {
					firebase.database().ref().child("committees").child(id.toString()).once("value", function(snapshot) {
						if (snapshot.exists()) {
							var committee = snapshot.val();
							
							firebase.database().ref().child("topics").child(id.toString()).once("value", function(snapshot2) {
								if (snapshot2.exists()) {
									var topic = snapshot2.val();
									
							        //set up the firebase reference
							        var storageRef = firebase.storage().ref();

							        //download file
							        storageRef.child("A").child(committee).child(topic).child(formatNum(id)).getDownloadURL().then(function(url) {
							            document.location.href = url;
							        }).catch(function(error) {
							            alert("An error occurred while downloading file");
							            console.log("Error during download");
							        });
								} else {
									alert("An error occurred while downloading the resolution");
						            console.log("Resolution not registered in topics");
						            console.log("ID: " + id);
								}
							});
						} else {
							alert("An error occurred while downloading the resolution");
				            console.log("Resolution not registered in committees");
				            console.log("ID: " + id);
						}
					});
				} else {
					alert("The resolution doesn't have an A-Number yet");
				}
			} else {
				alert("An error occurred while downloading the resolution");
				console.log("Resolution not registered in order");
				console.log("ID: " + id);
			}
		});
	} else {
		alert("You must choose a resolution to download");
	}
}

function gaDownload() {
	var list = document.getElementById("resList");
	var selectedIndex = list.selectedIndex;
	
	if (selectedIndex != -1) {
		var item = list.options[selectedIndex].text;
		var id = getId(item);
		
		firebase.database().ref().child("order").child(id.toString()).once("value", function (snapshot3) {
			if (snapshot3.exists()) {
				var order = snapshot3.val();
				
				if (order == 4) {
					firebase.database().ref().child("committees").child(id.toString()).once("value", function(snapshot) {
						if (snapshot.exists()) {
							var committee = snapshot.val();
							
							firebase.database().ref().child("topics").child(id.toString()).once("value", function(snapshot2) {
								if (snapshot2.exists()) {
									var topic = snapshot2.val();
									
							        //set up the firebase reference
							        var storageRef = firebase.storage().ref();

							        //download file
							        storageRef.child("Debate").child(committee).child(topic).child(formatNum(id)).getDownloadURL().then(function(url) {
							            document.location.href = url;
							        }).catch(function(error) {
							            alert("An error occurred while downloading file");
							            console.log("Error during download");
							        });
								} else {
									alert("An error occurred while downloading the resolution");
						            console.log("Resolution not registered in topics");
						            console.log("ID: " + id);
								}
							});
						} else {
							alert("An error occurred while downloading the resolution");
				            console.log("Resolution not registered in committees");
				            console.log("ID: " + id);
						}
					});
				} else {
					alert("The resolution doesn't have an Debate-status yet");
				}
			} else {
				alert("An error occurred while downloading the resolution");
				console.log("Resolution not registered in order");
				console.log("ID: " + id);
			}
		});
	} else {
		alert("You must choose a resolution to download");
	}
}

function init() {
	listen();
    
    //logout
    document.getElementById("logout_link").onclick = function() {
    	firebase.auth().signOut();
    	document.location.href = "index.html";
    	
    	//make sure the default link behaviour isn't followed
    	return false;
    };
    
    //draft download
    document.getElementById("Draft_link").onclick = function() {
    	draftDownload();
    	
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
