//global variables
var prevID = 0;
var ParaList = [];
var checked = false;
var currentCommittee;

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
		
		firebase.database().ref().child("committees").child(id.toString()).once("value", function(snapshot2) {
			if (snapshot2.val() == currentCommittee) {
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
			}
		});
	});
	
	firebase.database().ref().child("order").on("child_changed", function(snapshot) {
		var id = parseInt(snapshot.key);
		
		firebase.database().ref().child("committees").child(id.toString()).once("value", function(snapshot2) {
			if (snapshot2.val() == currentCommittee) {
				if (snapshot.val() <= 2) {
					changeChild("D" + formatNum(id), id, "resList");
				} else {
					changeChild("A" + formatNum(id), id, "resList");
				}
			}
		});
	});
}

function init() {
    var fired = false;
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if (!fired) {
            fired = true;
            
            var studentOfficer = "Student officer";
            var email = firebaseUser.email;
            
            if (email == "political@dsamun.com") {
                document.getElementById("studentOfficer_text").innerHTML = studentOfficer;
                document.getElementById("committee_text").innerHTML = "Special Political and Decolonization Committee";
                currentCommittee = "Special Political and Decolonization Committee";
            } else if (email == "disarmament@dsamun.com") {
                document.getElementById("studentOfficer_text").innerHTML = studentOfficer;
                document.getElementById("committee_text").innerHTML = "Disarmament and International Security Commitee";
                currentCommittee = "Disarmament and International Security Commitee";
            } else if (email == "humanitarian@dsamun.com") {
                document.getElementById("studentOfficer_text").innerHTML = studentOfficer;
                document.getElementById("committee_text").innerHTML = "Social, Humanitarian and Cultural Committee";
                currentCommittee = "Social, Humanitarian and Cultural Committee";
            } else if (email == "environmental@dsamun.com") {
                document.getElementById("studentOfficer_text").innerHTML = studentOfficer;
                document.getElementById("committee_text").innerHTML = "Environmental Committee";
                currentCommittee = "Environmental Committee";
            }

            //listen for resolution uploads
           	listen();
        }
    });
    
    //logout
    document.getElementById("logout_link").onclick = function() {
    	firebase.auth().signOut();
    	document.location.href = "index.html";
    	
    	//make sure the default link behaviour isn't followed
    	return false;
    };
}

window.onload = init;
