import mongoose from "mongoose";

const Connect_Db = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("connected to database");
  } catch (err) {
    console.log("not connected due to this error", err);
  }
};

export default Connect_Db;
