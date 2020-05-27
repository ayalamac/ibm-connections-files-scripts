/**
 *
 *********************** IBM COPYRIGHT START  *********************************
// @copyright(disclaimer)
//
// Licensed Materials - Property of IBM
// 5724-L31
// (C) Copyright IBM Corp. 2016. All Rights Reserved.
//
// US Government Users Restricted Rights
// Use, duplication or disclosure restricted by GSA ADP Schedule
// Contract with IBM Corp.
//
// DISCLAIMER OF WARRANTIES :
//
// Permission is granted to copy and modify this Sample code, and to
// distribute modified versions provided that both the copyright
// notice, and this permission notice and warranty disclaimer appear
// in all copies and modified versions.
//
// THIS SAMPLE CODE IS LICENSED TO YOU "AS-IS".
// IBM  AND ITS SUPPLIERS AND LICENSORS  DISCLAIM
// ALL WARRANTIES, EITHER EXPRESS OR IMPLIED, IN SUCH SAMPLE CODE,
// INCLUDING THE WARRANTY OF NON-INFRINGEMENT AND THE IMPLIED WARRANTIES
// OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. IN NO EVENT
// WILL IBM OR ITS LICENSORS OR SUPPLIERS BE LIABLE FOR ANY DAMAGES ARISING
// OUT OF THE USE OF  OR INABILITY TO USE THE SAMPLE CODE, DISTRIBUTION OF
// THE SAMPLE CODE, OR COMBINATION OF THE SAMPLE CODE WITH ANY OTHER CODE.
// IN NO EVENT SHALL IBM OR ITS LICENSORS AND SUPPLIERS BE LIABLE FOR ANY
// LOST REVENUE, LOST PROFITS OR DATA, OR FOR DIRECT, INDIRECT, SPECIAL,
// CONSEQUENTIAL,INCIDENTAL OR PUNITIVE DAMAGES, HOWEVER CAUSED AND REGARDLESS
// OF THE THEORY OF LIABILITY, EVEN IF IBM OR ITS LICENSORS OR SUPPLIERS
// HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
//
// @endCopyright
//*********************** IBM COPYRIGHT END  ***********************************
 *
 */

function getIcon__SPNS__(fileName) {
	var extension = fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);
	var icon = "";
	switch(extension) {
		case "":
			icon = "";
			break;
		case "pdf":
			icon = "images/AdobeAcrobatPDF.gif";
			break;
		case "xls":
			icon = "images/MicrosoftExcelDocument.gif";
			break;
		case "doc":
			icon = "images/MicrosoftWordDocument.gif";
			break;
		case "docx":
			icon = "images/MicrosoftWordDocument.gif";
			break;
		case "pptx":
			icon = "images/ppt.gif";
			break;
		case "ppt":
			icon = "images/ppt.gif";
			break;
		default:
			icon = "images/unknown.gif";
	}
	return icon;

}

/**
* getFolders__SPNS__ returns just the folders shared with the user
*/
function getFolders__SPNS__() {
	// var resourceURL__SPNS__ = "/wps/proxy/https/" + connectionsHost__SPNS__ + "/files/basic/api/communitycollection/" + communityUuid + "/feed?sK=updated&sO=dsc&category=collection&type=all";
	// resourceURL__SPNS__ = "/wps/proxy/https/" + connectionsHost__SPNS__ + "/files/basic/api/documents/shared/feed?direction=inbound&Remove%20sharePermission=Edit";
	var resourceURL__SPNS__ = "/wps/proxy/https/" + connectionsHost__SPNS__ + "/files/basic/api/collections/feed?sK=updated&sO=dsc&sharedWithMe=true";
	// console.log('in getFolders with url ', resourceURL__SPNS__);
	// https://tsc.ibmcollabcloud.com/files/basic/api/collections/feed?sK=updated&sO=dsc&sharedWithMe=true
	// console.log('getting Files from ', resourceURL__SPNS__);
	$.ajax({
		method: "GET",
		url: resourceURL__SPNS__,
		async: false,
		dataType: "xml"
	})
		.done(function( data ) {
			processFolders__SPNS__(data);
	})
		.fail(function( data ) {
			console.log('failed!! ', data);
			$('#filesTree__SPNS__').html("Error retrieving data from Connections");
	});
}

/**
* processFolders__SPNS__(data) goes through the result of getFolders__SPNS__ and puts data from each folder into filesTreeData__SPNS__.
* It then calls getContentsOfFolder__SPNS__ for that folder
*/
function processFolders__SPNS__(data) {
	$(data).find('entry').each(function(index,item){
		var title = $(this).find('title').text();
		var updated = $(this).find('updated').text();
		var uuid = $(this).find("td\\:uuid, uuid").text();
		var category = $(this).find("category").attr("term");
		filesTreeData__SPNS__.push({ "id" : uuid, "parent" : "#", "text" : title, "icon" : getIcon__SPNS__(title) });
		getContentsOfFolder__SPNS__(uuid);
	});
}

/**
* getContentsOfFolder__SPNS__(uuid) calls Connections to get the list of files/folders within a folder
* it then calls processContentsOfFolder__SPNS__, passing it the results of the call
* uuid = the uuid of a folder
*/
function getContentsOfFolder__SPNS__(uuid) {
	var resourceURL__SPNS__ = "/wps/proxy/https/" + connectionsHost__SPNS__ + "/files/basic/api/collection/" + uuid + "/feed?sK=modified&sO=dsc&sC=all&acls=true&collectionAcls=true&includeNotification=true&includePolicy=true&category=all&includeAncestors=true&pageSize=50";
	$.ajax({
		method: "GET",
		url: resourceURL__SPNS__,
		async: false,
		dataType: "xml"
	})
		.done(function( data ) {
			processContentsOfFolder__SPNS__(data, uuid);
	})
		.fail(function( data ) {
			console.log('get files failed!! ', data);
			$('#filesTree__SPNS__').html("Error retrieving data from Connections");
	});
}

/**
* getFiles__SPNS__ calls Connections to get the files (not the folders) shared with the user
* it then calls processContentsOfFolder__SPNS__ with the result of the call
*/
function getFiles__SPNS__() {
	// var resourceURL__SPNS__ = "/wps/proxy/https/" + connectionsHost__SPNS__ + "/files/basic/api/communitycollection/" + communityUuid + "/feed?sK=modified&sO=dsc&sC=document&acls=true&collectionAcls=true&pageSize=50";
	var resourceURL__SPNS__ = "/wps/proxy/https/" + connectionsHost__SPNS__ + "/files/basic/api/documents/shared/feed?sK=created&sO=dsc&sC=docshare&direction=inbound&pageSize=50";
	$.ajax({
		method: "GET",
		url: resourceURL__SPNS__,
		async: false,
		dataType: "xml"
	})
		.done(function( data ) {
			processContentsOfFolder__SPNS__(data, "#");
	})
		.fail(function( data ) {
			console.log('get files failed!! ', data);
			$('#filesTree__SPNS__').html("Error retrieving data from Connections");
	});
}

/**
* processContentsOfFolder__SPNS__(data, parent) parses the result of a call to Connections and puts the right values into the
* filesTreeData__SPNS__ array.
* If it finds a folder, it calls getContentsOfSubfolder__SPNS__
* data = the result of the call to Connections
* parent = the uuid of the parent folder (necessary for the jsTree function to know where to put each file/folder)
*/
function processContentsOfFolder__SPNS__(data, parent) {

	$(data).find('entry').each(function(index,item) {
		var title = $(this).find('title').text();
		var updated = $(this).find('updated').text();
		var author = $(this).find('author').find('name').text();
		var uuid = $(this).find("td\\:uuid, uuid").first().text(); // there are a couple so get the first
		var id = $(this).find('id').text();
		var xmlItem = $.parseXML(item);
		var $xml = $(xmlItem);
		var category = $(this).find('category').attr('term');
		if ( category === 'collection' ) { // a folder
			getContentsOfSubfolder__SPNS__(uuid);
		}
		var link = $(this).find('link[rel="enclosure"]').attr('href'); // link to the file itself

		// Connections will list in its root folder all the files which are also in every subfolder
		// so if a file is already in our array, don't add it again
		// this works because we process the subfolders first, and the root folder last
		var foundMatch = false;
		for (var idx in filesTreeData__SPNS__) {
			if ( uuid === filesTreeData__SPNS__[idx].id ) {
				foundMatch = true;
				break;
			}
		}
		if ( !foundMatch) {
			// console.log('no match; title is ', title);
			var entry = { "id" : uuid, "parent" : parent, "text" : formatDetailsLink__SPNS__(item) , "icon" : getIcon__SPNS__(title), "li_attr": {"openlink":link}, "openlink": link };
			// console.log('entry is ', entry);
			filesTreeData__SPNS__.push(entry);
		}
	});
}

function formatDetailsLink__SPNS__(item) {
	// console.log('in formatDetailsLink__SPNS__ and item is ', item);
	var category = $(item).find("category").attr("term");
	var uuid = $(item).find("td\\:uuid, uuid").first().text(); // there are a couple so get the first
	var title = $(item).find('title').text();
	var author = $(item).find('author').find('name').text();
	var updated = $(item).find('updated').text();
	// console.log('title is ', title, ' and category is ', category);
	var result = "";
	if ( category === "collection") { // folder, so just use the folder name
		result += title;
	} else { // it's a file, so provide some details
		result += title + "&nbsp;<span onclick=\"toggleDetails__SPNS__('" + uuid + "');return false;\"><span id='" + uuid + "_moreLinkText' class='moreLinkText'>more...</span></span>";
		result += "<div class=\"more\" style='display:none;' id=" + uuid + "_more>updated " + c5dateFromISODate__SPNS__(updated) + " by " + author + "</div>";
	}
	return result;
}

/**
* toggleDetails__SPNS__(uuid) shows or hides the details of a file when you click the link.
* uuid - the uuid of the file
* the height of a jsTree entry is set to 24px in its stylesheet, so we just double that
* when we show the details.
*/
function toggleDetails__SPNS__( uuid) {
	var moreLinkText = $("#" + uuid + "_moreLinkText").html();
	if ( moreLinkText === "more...") {
		$("#" + uuid + "_moreLinkText").html("less...");
		// $("#" + uuid).css("line-height", "48px"); // this is 2x the 24px that jsTree uses
		$("#" + uuid).animate({"line-height":"48px"});
	} else {
		$("#" + uuid + "_moreLinkText").html("more...");
		$("#" + uuid).animate({"line-height":"24px"}); // back to 24px when we hide the detail
	}
	$("#" + uuid + "_more").toggle(200);
}

/**
* getContentsOfSubfolder__SPNS__(uuid) gets all the files/folders in a subfolder.
* This API is slightly different than a top-level folder, so it has its own function
* uuid - the uuid of the parent folder
*/
function getContentsOfSubfolder__SPNS__(uuid) {
	var resourceURL__SPNS__ = "/wps/proxy/https/" + connectionsHost__SPNS__ + "/files/basic/api/collection/" + uuid + "/feed?sK=modified&sO=dsc&sC=all&acls=true&collectionAcls=true&includeNotification=true&includePolicy=true&category=all&includeAncestors=true&pageSize=50";
	$.ajax({
		method: "GET",
		url: resourceURL__SPNS__,
		async: false,
		dataType: "xml"
	})
		.done(function( data ) {
		processContentsOfFolder__SPNS__(data, uuid);
	})
		.fail(function( data ) {
			console.log('get files failed!! ', data);
			$('#filesTree__SPNS__').html("Error retrieving data from Connections");
	});
}

/**
* c5dateFromISODate__SPNS__(isoDate) formats the Connections date to something more humanly readable
* isoDate - the date value returned by Connections, in UTC
*/
function c5dateFromISODate__SPNS__ (isoDate) {
	var dateIso = isoDate.split('T');
	var time = dateIso[1].split("."); // we don't care about 10ths of a second
	var splitIso = dateIso[0].split("-");
	var uYear = splitIso[0];
	var uMonth = splitIso[1];
	var uDay = splitIso[2];
	var uDate = uMonth + '-' + uDay + '-' + uYear + ' ' + time[0] + ' UTC';
	return uDate;
}


$( document ).ready(function() {

	filesTreeData__SPNS__ = []; // holds the result of all the Connections calls
	getFolders__SPNS__();  // get the contents of all the folders and subfolders
	getFiles__SPNS__(); // get the files in the parent folder

	// console.log('filesTreeData__SPNS__ ', filesTreeData__SPNS__);
	// display the results in a jsTree
	$('#filesTree__SPNS__').jstree({ 'core' : {
		'data' : filesTreeData__SPNS__
	}});

	// bind a double click event to a file so that it links to the actual file for downloading
	$('#filesTree__SPNS__').bind("dblclick.jstree", function (event) {
		var node = $(event.target).closest("li");
	 	var data = node[0];
	 	var openlink = $(data).attr("openlink");
	 	if ( typeof openlink != 'undefined') {
			window.open($(data).attr("openlink"));
	 	}
	});
});
