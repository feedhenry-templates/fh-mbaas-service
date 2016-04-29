var forms = require('fh-forms');
/**
 * Handler for listing All Submissions
 * @param req
 * @param res
 * @param next
 */
module.exports = function list(req, res, next) {
  var listParams = {
    paginate: {
      //Populated by express-paginate middleware
      page: req.query.page,
      limit: req.query.limit,
      filter: req.query.filter
    }
  };

  forms.core.getSubmissions({
    uri: req.mongoUrl
  }, listParams, function(err, submissionsResult){
    if(err){
      return next(err);
    }

    res.json(submissionsResult || {});
  });
};
