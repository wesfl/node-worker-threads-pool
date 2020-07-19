class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = "TimeoutError";
  }
}

/**
 * @param {Error} err
 */
function isTimeoutError(err) {
  return err instanceof TimeoutError;
}

class PromiseWithTimer {
  /**
   * @param {Promise} p
   * @param {number} timeout
   */
  constructor(p, timeout) {
    this._p = p;
    this._timeout = timeout;
    this._timerID = null;
  }

  _timer() {
    return new Promise((resolve) => {
      this._timerID = setTimeout(resolve, this._timeout, this._timer);
    });
  }

  async startRace() {
    if (this._timeout <= 0) {
      return await this._p;
    }
    const res = await Promise.race([this._p, this._timer()]);
    if (res === this._timer) {
      // timeout.
      throw new TimeoutError("timeout");
    }
    clearTimeout(this._timerID);
    return res;
  }
}

module.exports.PromiseWithTimer = PromiseWithTimer;
module.exports.isTimeoutError = isTimeoutError;
