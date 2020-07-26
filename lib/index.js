const mongoose = require('mongoose');
const ShortId = require('./shortid');

const defaultSave = mongoose.Model.prototype.save;
mongoose.Model.prototype.save = function(cb) {
  for (let key in this.schema.tree) {
      const fieldName = key;
      if (this.isNew && this[fieldName] === undefined) {
        const idType = this.schema.tree[fieldName];

        if (idType === ShortId || idType.type === ShortId) {
            const idInfo = this.schema.path(fieldName);
            let retries = idInfo.retries;
            const self = this;

            function attemptSave() {
                idInfo.generator(idInfo.generatorOptions, function(err, id) {
                    if (err) {
                        if (cb) {
                            cb(err);
                        }
                        return;
                    }
                    self[fieldName] = id;
                    defaultSave.call(self, function(err, obj) {
                        if (err &&
                            err.code*1 === 11000 &&
                            err.err.indexOf(fieldName) !== -1 &&
                            retries > 0
                        ) {
                            --retries;
                            attemptSave();
                        } else {
                            // TODO check these args
                            if (cb) {
                                cb(err, obj);
                            }
                        }
                    });
                });
            }
            attemptSave();
            return;
        }
    }
  }
  defaultSave.call(this, cb);
};

module.exports = exports = ShortId;
