/* eslint-disable no-underscore-dangle */
/* eslint-disable no-use-before-define */

const repository = require('../repositories/httpLog.repository');
const ResponseInfor = require('../util/ResponseInfo');


exports.list = async (req, res) => {
  try {
    let result = [];
    result = await repository.selectByFilter({}, req.query);
    res.status(200).json(new ResponseInfor(true, result));
  } catch (error) {
    res.status(400).json(new ResponseInfor(false, error));
  }
};
