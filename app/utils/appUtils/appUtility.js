
const getTransactionImageUtility=async(type)=>{

    let image;

    if(type == "banktransfer")
    {
        return image="https://d5v1obtgnjpce.cloudfront.net/bankTransfer.png"
    }
    else if(type == "neteller")
    {
        return image="https://d5v1obtgnjpce.cloudfront.net/neteller.png"
    }
    else if(type =="ecopayz")
    {
        return image="https://d5v1obtgnjpce.cloudfront.net/ecoPayz.png"
    }
}

module.exports=getTransactionImageUtility;