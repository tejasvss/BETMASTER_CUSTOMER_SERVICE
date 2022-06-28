var email = "Segu.VemaSivasaiTeja@cognizant.com";
// var name   = email.substring(0, email.lastIndexOf("@"));
var domain = email.substring(email.lastIndexOf("@") +1);

// console.log( name );   // john.doe
console.log( domain ); // email.com