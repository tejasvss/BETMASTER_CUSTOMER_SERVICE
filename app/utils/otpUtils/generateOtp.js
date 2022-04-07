const generateOtp = async(otp_length) => {
    
    var digits = "0123456789112";
    let ID = "";
    for (let i = 0; i < otp_length; i++) {
     ID += digits[Math.floor(Math.random() * 10)];
    }
    const id =ID
    return id;
  
  };

module.exports=generateOtp;  

  