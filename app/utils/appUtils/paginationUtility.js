const paginationUtility = async (req, res) => {

    var page = parseInt(req.body.page);
    var size = parseInt(req.body.size);

    var query = {};

    if (!page ) {
        page = 1
    }

    if (!size) {
        size = 5
    }

    query.skip = size * (page - 1);
    query.limit = size;
    query.page = page;
    
    return query;
}

module.exports=paginationUtility;