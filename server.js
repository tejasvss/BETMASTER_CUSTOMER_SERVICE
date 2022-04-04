const express=require('express');
const app=new express();
const config=require('./app/constants/appConstants.json');
const cors=require('cors');


app.use(cors());

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));


//Port Number definitions
const port=config.PORT || 8081;

app.get('/',(req,res)=>{

    res.send("*******************WELCOME_TO_THE_BETMASTER_BACKEND_CUSTOMER_SERVICE_APPLICATION*******************")
});

//PAGE NOT FOUND URL
app.use('*', (req, res) => {
    res.status(404).send({
        status:400,
        Message: 'URL_NOT_FOUND'
    })
  })

//Setting the application on the user listed port
app.listen(port,()=>{
    console.log("*******************************************")
    console.log(`Server started successfully on ${port}`);

})

