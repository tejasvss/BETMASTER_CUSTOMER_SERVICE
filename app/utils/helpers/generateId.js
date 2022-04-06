const generateId = async (id_name,id_length) => {
    
    var digits = "0123456789112";
    let ID = "";
    for (let i = 0; i < id_length; i++) {
     ID += digits[Math.floor(Math.random() * 10)];
    }
    const id =  id_name +"_"+ID
    return id;
  
  };

module.exports=generateId;  

  
