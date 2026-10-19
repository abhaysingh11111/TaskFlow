const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('635858125459-amq2e8gd72t8cicrc7lm6oq76uce43ik.apps.googleusercontent.com');

const google_middleware =async(token) =>{
  try{
    // here first we verify the token is it genrated from our clien id side
    const isVerified = await client.verifyIdToken({
         token ,
         audience:'635858125459-amq2e8gd72t8cicrc7lm6oq76uce43ik.apps.googleusercontent.com'
    });
   // if token is verifed than aange badhenge agar fake than catch block me hoga
   const payload = token.getPayload() ; // yha pe user ki saare info aa gyi like usernam and email

   if(req.flow === "google_login"){
       // now check first ki kya ye gmail already system me hai toh nhi

       req.data={ // email , username
           email: payload.email ,
           name: payload.given_name ,
           provider:payload.provider ,
           photo:payload.photo,
           googleId: payload.googleId
       }
   }
   if(req.flow === "google_signup"){
       req.data={ // email , username
           email: payload.email ,
           name: payload.given_name ,
           provider:payload.provider ,
           photo:payload.photo,
           googleId: payload.googleId
       }
   }
  }
  catch(err){

  }
}