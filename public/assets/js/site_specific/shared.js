//global variables
var poliTopics = ["Eliminating the funding of ISIL via anti-money laundering strategies", "The question of the alleged Tamile genocide in Sri Lanka", "Achieving border security and provision of quotas to political asylum seekers and refugees within the premises of the European Union (EU)"];
var disaTopics = ["Reestablishing the criteria under which a country engages into war (jus ad bellum) and the Laws of War (jus in bello)", "The issue of the denuclearization of the Korean peninsula", "Strengthening international cooperation to counteract terrorist action of ISIS"];
var humaTopics = ["Combating social conflicts and the growing far right ideology in refugee - hosting countries", "Establishing global minimum working condition standards", "Tackling the issue of child marriage and child grooming"];
var enviTopics = ["Bio application of nanomaterials and their consequences on human health and the environment", "Preventing the degradation of maritime environment due to off shore oil mining", "Finding long term solutions for waste management in LEDCs"];

var allTopics = [poliTopics, disaTopics, humaTopics, enviTopics];

var committee_array = ["political", "disarmament", "humanitarian", "environmental"];

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

function formatNum(n) {
	var result = "";
	
	if (n > 999) {
		alert("The given number is too large to format");
	} else {
		var nDigits = n.toString().length;
		
		for (i = 0; i < (3 - nDigits); i++)
			result += "0";
		
		result += n.toString();
	}
	
	return result;
}
