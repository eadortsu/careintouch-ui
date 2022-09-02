var _id = '';
var cnt = 3;
var isVerified = false;
var baseurl = "https://botest.junipayments.com";

$.ajax({
    url: baseurl + "/profile",
    type: "GET",
    crossDomain: true,
    xhrFields: { withCredentials: true },
    success: function(result) {
        if (result.code == 401) {
            window.location.href = '/login.html';
            console.log(JSON.stringify(result))
        } else if (result.code == 200) {
            var url = window.location.pathname;
            var user = result.user;
            _id = user._id;
            $("#induserid").val(_id);
            console.log(_id, ' url ', url, " id ");
            if (user.isVerified) {
                isVerified = true
            }
            if (url == "/dashboard/apikey.html" || url == "/dashboard/getting-started.html") {
                $("#testSecret").val(user.token);
                $("#testPublic").val(user.pub_key);
                if (user.isVerified) {
                    $("#infoi").hide();
                    $("#livePublic").val(user.prod_pub_key);
                    $("#liveSecret").val(user.prod_token);
                }
            } else if (url == "/dashboard/bankdetails.html") {

                if (user.acc_number != undefined) {
                    $("#acc_name").val(user.acc_name).prop('readonly', true);;
                    $("#bank_name").val(user.bank_name).prop('readonly', true);;
                    $("#acc_number").val(user.acc_number).prop('readonly', true);
                    $("#bankFormBtn").hide();
                }
            } else if (url == "/dashboard/business_details.html") {
                if (user.acc_type == "individual1") {
                    $("#acc_type").val(user.acc_type);
                    $("#business").hide();
                    var director = user.directors[0];
                    $("#id_type").val(director.id_type);
                    $("#id_number").val(director.id_number);
                    $("#fullname").val(director.name);
                } else if (user.acc_type == "individual") {
                    $("#individual").hide();
                    $("#bAcc_type").val(user.acc_type);
                    $("#bus_type").val(user.business.bus_type);
                    $("#tin_number").val(user.business.tin_number);
                    $("#company_name").val(user.business.company_name);
                    $("#reg_number").val(user.business.reg_number);
                    var dirs = user.directors;
                    var cnt = 1;
                    for (director in dirs) {
                        var newLne = ' <hr class="my-3"><p>Director ' + cnt + ' info </p><div class="row"><div class="col-12 col-md-4"><div class="form-group">' +
                            '<label class="form-label">ID Type</label>' +
                            '<input type="text" class="form-control" value="' + dirs[director].id_type + '" readonly></div></div>' +
                            '<div class="col-12 col-md-4"><div class="form-group">' +
                            '<label class="form-label">Name</label>' +
                            '<input type="text" class="form-control" value="' + dirs[director].name + '" readonly></div> </div>' +
                            '<div class="col-12 col-md-4"><div class="form-group">' +
                            '<label class="form-label"> ID Number</label>' +
                            '<input type="text" class="form-control" value="' + dirs[director].id_number + '" readonly></div> </div></div>'
                        $("#business").append(newLne);
                        cnt++;
                    }
                } else {
                    $("#individual").hide();
                    $("#business").hide();
                }
            } else if (url == "/dashboard/customers.html") {
                showUserCustomers(user._id);
            }

            $("#userID").val(user._id);
            $("#induserid").val(user._id);
            if (user.isVerified) {
                // document.getElementById("liveCheckDefault").checked;

            } else {
                if (user.business == undefined) {

                } else if (user.business.bus_type == 'Sole Proprietorship') {

                }
            }
        }
    }
});

function showUserCustomers(userID) {
    $.post(baseurl + "/customersByUser", { 'userID': userID })
        .done(function(data) {
            //  console.log(data[0].email, "cus ")
            for (cus in data) {
                //  console.log(data[cus], "cus " + cus)
                var newLine = '<tr><td class="goal-project">' + data[cus].email + '</td>' +
                    '<td class="goal-status">' + data[cus].first_name + " " + data[cus].last_name + '</td>';
                if (data[cus].phoneNumber != undefined) {
                    newLine += '<td class="goal-progress">Phone Number</td>'
                } else {
                    newLine += '<td class="goal-progress">Bank</td>'
                }

                newLine += ' <td class="goal-date"><time datetime="2018-10-24">' + data[cus].date + '</time></td>' +
                    '<td class="text-right"></td></tr>'
                $("#custList").append(newLine)
            }
        })
}

function logout() {
    document.cookie = "id=; path=/; max-age=" + 0;
    document.session = "id1=2w; max-age=" + 0;
    $.ajax({
        url: baseurl + "/signout",
        type: "POST",
        data: {},
        crossDomain: true,
        xhrFields: {
            withCredentials: true
        },
        success: function(data) {
            if (data.code == 200) {
                //  document.cookie = "name=Peter; max-age=" + 30 * 24 * 60 * 60;
                window.location.href = './../../../login.html';
            }
        }
    })
}

function includeHTML() {
    var z, i, elmnt, file, xhttp;
    /* Loop through a collection of all HTML elements: */
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        /*search for elements with a certain atrribute:*/
        file = elmnt.getAttribute("w3-include-html");
        if (file) {
            /* Make an HTTP request using the attribute value as the file name: */
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        elmnt.innerHTML = this.responseText;
                    }
                    if (this.status == 404) {
                        elmnt.innerHTML = "Page not found.";
                    }
                    /* Remove the attribute, and call this function once more: */
                    elmnt.removeAttribute("w3-include-html");
                    includeHTML();
                }
            }
            xhttp.open("GET", file, true);
            xhttp.send();
            /* Exit the function: */
            return;
        }
    }
    if (isVerified == true) {
        //  $("#start").hide();
        $("#acct_details").html('<i class="fe fe-file"></i>Account Details');
        // document.getElementById("liveCheckDefault").checked = true;
    }
}

function verifyTin() {
    console.log(_id, " tin ", $("#tinNumber").val());
    $.post(baseurl + "/verifyTin", { '_id': _id, 'acc_type': 'business', 'tinNumber': $("#tinNumber").val(), 'bus_type': $("#bus_type").val() })
        .done(function(data) {
            if (data.tin == undefined) {
                alert(data.error);
            } else {
                $("#tinDetails").show();
                $("#busName").val(data.tradingAs[0].tradingasName);
                $("#busNumber").val(data.rgdno);
                if ($("#bus_type").val() == "Sole Proprietorship") {
                    $("#dir2_row").hide();
                    $("#more_row").hide();
                }
                $("#wizardStepTwodiv").show();
            }
            console.log('success ', JSON.stringify(data))

        });
}

function verifyIndividual() {
    var idOption = $("#indID").val();
    var idNumber = $("#indIdNumber").val();
    $.post(baseurl + "/verifyPerson", { 'id_type': idOption, 'personID': idNumber })
        .done(function(data) {
            if (data.message != undefined) {
                alert(data.message);
            } else {
                $("#individualDetails").show();
                if (idOption == "Passport") {
                    $("#indfullName").val(data.first_name + " " + data.last_name);
                } else {
                    $("#indfullName").val(data.full_name);
                }
            }
            console.log('success ', JSON.stringify(data))

        });
}

function verifyDirectors() {
    //e.preventDefault();
    var idOption = $("#personalID").val();

    var formData = new FormData();
    var files = $('#dirDocument')[0].files[0];
    formData.append('file', files);

    $.ajax({
        url: baseurl + '/verifyPerson',
        type: 'POST',
        data: formData,
        success: function(data) {
            alert(data)
        },
        error: function(error) {

        },
        cache: false,
        crossDomain: true,
        xhrFields: { withCredentials: true }
    });
    $("#directorDetails").show();
    $("#fullName").val("John Doe");
    $("#idNumber").val("G23342");
    $("#idNumber").val("G23342");
    $("#dob").val("1996-02-21");

}

function togglePassword(id) {
    var x = document.getElementById(id);
    if (x.type === "password") {
        x.type = "text";
        document.getElementById("testSecretEye").className = "fe fe-eye-off";
    } else {
        x.type = "password";
        document.getElementById("testSecretEye").className = "fe fe-eye";
    }
}

function checkLiveStatus() {
    var state = document.getElementById("liveCheckDefault").checked;
    console.log("wowwe")
    if (state == true) {
        console.log("state ", state);
        $('#modalMembers').modal('show');
    }
}

function checkLiveStatus1() {
    console.log("wowwe")
    $('#modalMembers').modal('show');
}

function showTab(id) {
    //console.log(id, " id");
    $('.nav-tabs a[href="' + id + '"]').tab('show');
    //$("#wizardStepTwo").tab('show');
    if (id == "#wizardStepFour") {
        alert("woro")
    }
}

function addMore() {
    var newLine = ' <div class="row pt-3"><div class="col-4"><label class="form-label">Director ' + cnt + ' ID</label>' +
        '<select class="form-select" name="id_type" id="personalID' + cnt + '"><option selected>Select ID Type</option><option value="Driver License">Driver License</option><option value="Passport">Passport</option><option value="SSNIT">SSNIT</option> <option value="Voter Card">Voter Card</option></select></div>' +

        '<div class="col-4"><label class="form-label">ID Number</label><input type="text" class="form-control" name="idNumber" id="idNumber' + cnt + '"></div>' +
        '<div class="col-4"><div class="fallback pt-2"><div class="custom-file"><label class="form-label" for="busDocs">Upload ID</label><input type="file" class="custom-file-input" name="dirDocument" id="dirDocument' + cnt + '" /></div></div></div></div>'
    $("#directorsForm").append(newLine);
    cnt += 1;
}

function saveBankDetails() {
    let bankForm = document.getElementById('bankForm');
    let formData = $("#bankForm").serialize();
    console.log("bank ", formData);
    $.ajax({
        url: baseurl + '/bankDetails',
        data: formData,
        cache: false,
        //  contentType: false,
        //  processData: false,
        crossDomain: true,
        xhrFields: { withCredentials: true },
        type: 'POST',
        success: function(data, textStatus, jqXHR) {

            alert(data.message)
        }
    })
}

function topupBalance() {
    console.log("topup");
    let formData = $("#momoForm").serialize();
    formData += "&userID=" + $("#induserid").val();
    $.post(baseurl + "/topupBalance", formData)
        .done(function(data) {
            if (data.code == 200) {
                alert("Payment is being processed");
            };
        })
}

function saveDirectors() {

    let myForm = document.getElementById('directorsForm');
    let formData = new FormData(myForm);
    formData.append('userID', _id);
    formData.append('bus_type', $("#bus_type").val());
    var files = formData.getAll('dirDocument');
    var idTypes = formData.get('id_type');
    console.log(files.length, " ")
    for (let i = 0; i < files.length; i++) {
        if (files[i].name != "") {

            console.log(files[i].name, " file ", i);
            let curform = new FormData();
            curform.set("dirDocument", files[i]);
            curform.set("acc_type", 'business');
            curform.set('bus_type', $("#bus_type").val());
            curform.set('userID', _id);
            curform.set("id_type", idTypes[i])
            $.ajax({
                url: baseurl + '/verifyPerson',
                data: curform,
                cache: false,
                crossDomain: true,
                xhrFields: { withCredentials: true },
                contentType: false,
                processData: false,
                type: 'POST',
                success: function(data, textStatus, jqXHR) {
                    var newLine = ' <p>Director ' + i + ' Info</p><div class="col-5"><div class="form-group"><label for="fullName"> Full name</label>' +
                        '<input type="text" value="' + data.name + '" class="form-control" readonly></div></div>' +
                        '<div class="col-4"><label for="idNumber1"> ID Number</label><input type="text" class="form-control" value="' + dir.idNumber + '" readonly> </div>' +
                        '<div class="col-3"><label for="dob">Date of Birth</label><input type="text" class="form-control" value="' + dir.dob + '" readonly></div>'
                    cnt++;
                    $("#directorDetails1").append(newLine);
                }
            })
        }
    }

    return false;
}

function saveInd() {
    let myForm = document.getElementById('indForm');
    let formData = new FormData(myForm);
    formData.append('userID', _id); //$("#induserid").val());
    console.log("new id is ", _id)
    $.ajax({
        url: baseurl + '/verifyPerson',
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        crossDomain: true,
        xhrFields: { withCredentials: true },
        type: 'POST',
        success: function(data, textStatus, jqXHR) {
            // Callback code
            if (data.code == 200) {
                alert("Verification Successful")
                $("#indStepThreeBtn").show();
                document.getElementById("liveCheckDefault").checked;
            } else {
                alert(data.message);
            }
        }
    });
    return false;
}
$('#indForm1').on('sumbit', function() {
    console.log('in here')
    var form = $(this);
    var formdata = false;
    if (window.FormData) {
        formdata = new FormData(form[0]);
    }

    var formAction = form.attr('action');
    $.ajax({
        url: baseurl + '/verifyPerson',
        data: formdata ? formdata : form.serialize(),
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function(data, textStatus, jqXHR) {
            if (data.is_first_name_match == true && data.is_last_name_match == true) {

            }
        }
    });
});