const errorHandler = (error, req, res, next) => {

    console.error(error.message);

    if (error.name === 'CastError') {
        return res.status(400).send({
            error: "Invalid request"
        })
    }
    if (error) {
        return res.status(500).send({
            error
        })
    }

    next(error);
}

module.exports = {errorHandler}