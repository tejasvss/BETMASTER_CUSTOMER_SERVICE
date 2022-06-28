const mongoose=require('mongoose');
Schema = mongoose.Schema;
const Movie=require('./movies')

const heroSchema=new mongoose.Schema({

   heroName:{
      type:String
   }
},{timestamps:true,versionKey:false});


heroSchema.pre('remove',async function(next){
   const hero=this;
   await Movie.deleteMany({heroId:hero._id}).exec();
   next();
});


const Heros=new mongoose.model("heros",heroSchema);

module.exports=Heros;