var forms = require('fh-forms');
var _ = require('underscore');

/**
 * Search For Submissions. Used For Advanced Search
 * @param req
 * @param res
 * @param next
 */
module.exports = function search(req, res, next) {
  var queryParams = req.body;

  forms.core.submissionSearch({
    uri: req.mongoUrl
  }, _.extend(queryParams, {
    paginate: {
      //Populated by express-paginate middleware
      page: req.query.page,
      limit: req.query.limit
    }
  }), function(err, submissions){
    if(err){
      return next(err);
    }

    res.json(submissions || {});
  });
};
