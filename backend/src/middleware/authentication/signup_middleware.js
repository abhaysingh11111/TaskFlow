const Sign_up_middleware = async(req,res,next) =>{

    let {
      userName,
      passWord,
      fullName,
      email,
      confirm_Password
    } = req.body;

    // trim inputs
    userName = userName?.trim();
    fullName = fullName?.trim();
    email = email?.trim().toLowerCase();

    const userNameRegex =
    /^[A-Za-z][A-Za-z0-9_]{2,19}$/;

    const passWordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|]).{8,64}$/;

    const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const fullNameRegex =
    /^[\p{L}][\p{L} .'-]{1,48}[\p{L}]$/u;


    // missing fields
    if(
      !userName ||
      !passWord ||
      !confirm_Password ||
      !fullName ||
      !email
    ){
      return res.status(400).json({
         status:false,
         message:"All fields are required"
      });
    }


    // password match
    if(passWord !== confirm_Password){

      return res.status(400).json({
          status:false,
          message:"Enter same password in both fields"
      });
    }


    // username validation
    if(!userNameRegex.test(userName)){

      return res.status(400).json({
          status:false,
          message:"Invalid username"
      });
    }


    // password validation
    if(!passWordRegex.test(passWord)){

      return res.status(400).json({
          status:false,
          message:"Invalid password"
      });
    }


    // email validation
    if(!emailRegex.test(email)){

      return res.status(400).json({
          status:false,
          message:"Enter valid email"
      });
    }


    // fullname validation
    if(!fullNameRegex.test(fullName)){

      return res.status(400).json({
          status:false,
          message:"Invalid fullname"
      });
    }

    console.log("signup validation passed");

    return next();
}

export default Sign_up_middleware;