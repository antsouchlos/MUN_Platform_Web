function isValidEmail(email) {
	var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    if (filter.test(email))
    	return true;
    else
    	return false;
}

function send() {
	var name_elem = document.getElementById("name_elem");
	var email_elem = document.getElementById("email_elem");
	var topic_elem = document.getElementById("topic_elem");
	var message_elem = document.getElementById("message_elem");
	
	if (name_elem.value != "") {
		if (isValidEmail(email_elem.value)) {
			var selectedIndex = topic_elem.selectedIndex;
			
			if (selectedIndex > 0) {
				if (message_elem.value != "") {
					firebase.database().ref().child("messages_counter").once("value", function(snapshot) {
						var counter = 0;
						
						if (snapshot.exists())
							counter = snapshot.val();
						
						firebase.database().ref().child("messages").child(counter.toString()).child("d_t").set(getDateAndTime());
						firebase.database().ref().child("messages").child(counter.toString()).child("name").set(name_elem.value);
						firebase.database().ref().child("messages").child(counter.toString()).child("email").set(email_elem.value);
						firebase.database().ref().child("messages").child(counter.toString()).child("message").set(message_elem.value);
						
						firebase.database().ref().child("messages_counter").set(counter + 1);
						
						showFeedback("sent_msg2");
						reset();
					});
				} else {
					alert("You must enter a message");
				}
			} else {
				alert("You must choose a topic");
			}
		} else {
			alert("Not a valid email");
		}
	} else {
		alert("You must enter a name");
	}
}

function reset() {
	document.getElementById("name_elem").value = "";
	document.getElementById("email_elem").value = "";
	document.getElementById("topic_elem").selectedIndex = 0;
	document.getElementById("message_elem").value = "";
}

function hideUI() {
	document.getElementById("sent_msg2").style.visibility = "hidden";
}

function init() {
	reset();
	hideUI();
	
	document.getElementById("send_btn").onclick = function() {
		send();
		
		return false;
	};
	
	document.getElementById("reset_btn").onclick = function() {
		reset();
		
		return false;
	};
}

window.onload = init;
