
const otpExpiryTime = async(timeInMints) => {

    var forwardTime = new Date(Date.now() + (timeInMints * 60 * 1000));
    return forwardTime;
    }

 module.exports=otpExpiryTime;