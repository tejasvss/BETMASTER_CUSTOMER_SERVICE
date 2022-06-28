const mongoose=require('mongoose');
Schema = mongoose.Schema;

const movieSchema=new mongoose.Schema({

   movieName:{
      type:String
   },
   heroId:{
       type:Schema.Types.ObjectId,
       ref:"heros"
   }
},{timestamps:true,versionKey:false});

const Movie=new mongoose.model("movies",movieSchema);

module.exports=Movie;