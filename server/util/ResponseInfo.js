class ResponseInfo {
  constructor(success, data) {
    this.success = success;
    this.data = data;
  }

  success() {
    return this.success;
  }

  data() {
    return this.data;
  }
}
module.exports = ResponseInfo;
