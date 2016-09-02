var currentCommittee = "null";

function getStudentOfficer(committee) {
    if (committee == "political") {
        return "Special Political and Decolonization Committee";
    } else if (committee == "disarmament") {
        return "Disarmament and International Security Committee";
    } else if (committee == "humanitarian") {
        return "Social, Humanitarian and Cultural Committee";
    } else if (committee == "ernvironmental") {
        return "Environmental Committee";
    } else {
        return "An error occurred";
    }
}

function getFullCommitteeName(committee) {
    if (committee == "political") {
        return "[tbd] - political";
    } else if (committee == "disarmament") {
        return "[tbd] - disarmament";
    } else if (committee == "humanitarian") {
        return "[tbd] - humanitarian";
    } else if (committee == "ernvironmental") {
        return "[tbd] - environmental";
    } else {
        return "An error occurred";
    }
}