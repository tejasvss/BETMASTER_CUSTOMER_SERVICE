const Hero=require('../../models/customer/heros');
const Movie=require('../../models/customer/movies');


exports.createHero=async(req,res)=>{


    const heroData=await Hero.create({heroName:req.body.heroName});
    res.status(200).send({status:200,Data:heroData})
}

exports.createMovie=async(req,res)=>{


    const movieData=await Movie.create({movieName:req.body.movieName,heroId:req.body.heroId});
    res.status(200).send({status:200,Data:movieData})
}

exports.deleteHero=async(req,res)=>{

    await Hero.find({_id:req.body._id}).remove();
    res.status(200).send({status:200,Message:"Hero deleted"})
}