var errorString = function(errorCode){
  var error = {
    // common
    "0": "Success",
    "1": "Invalide call param",
    "2": "Operation Error",

    // thai success message
    "50" : "ระบบได้ทำการลงทะเบียนให้ท่านเรียบร้อยแล้ว",

    // UserAccountController
    "100": "Invalid user or password",
    "101": "Duplicate user",
    "102": "Cannot find the user",
    "103": "Line Id นี้ได้เคยลงทะเบียนแล้ว",
    "104": "หมายเลขบัตรประชาชนนี้ได้เคยลงทะเบียนแล้ว",
    "105": "ไม่สามารถลงทะเบียนได้เนื่องจากระบบขัดข้อง",
    "106": "ไม่สามารถลงทะเบียนได้เนื่องจากระบบทำงานไม่ถูกต้อง",
    // PollController
    "200": "Cannot find the question",
  }

  //console.log("Initialize Error");
  //var errorObj = JSON.parse(errorJson);
  //cosole.log(errorObj);
  //console.log(errorJson);
  //console.log("End Error");

  // var getError = function(errorCode){
  //     console.log(errorJson);
  //     return errorJson[errCode];
  // }

  //console.log(error);

  return error[errorCode];
}

module.exports = errorString;
