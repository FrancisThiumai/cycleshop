exports.pageNotFound =(req, res, next)=>{
    res.status(404).json({message: "Page not found"});
};

exports.handleError = (err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Internal server error" });
};