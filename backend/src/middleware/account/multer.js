import multer from "multer";

// temporary RAM storage

const storage = multer.memoryStorage();

const upload = multer({
   storage
});

export default upload;